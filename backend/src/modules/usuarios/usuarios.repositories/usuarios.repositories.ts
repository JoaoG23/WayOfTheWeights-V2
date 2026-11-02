import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PerfilUsuario, PlanoConta } from '../../../generated/prisma/enums';

export type DadosCriarUsuario = {
  contaId: number;
  nome: string;
  email: string;
  senhaHash: string;
  perfil: PerfilUsuario;
  proprietario: boolean;
};

export type DadosAtualizarUsuario = Partial<{
  nome: string;
  email: string;
  senhaHash: string;
  perfil: PerfilUsuario;
  ativo: boolean;
}>;

@Injectable()
export class UsuariosRepositories {
  constructor(private readonly prisma: PrismaService) {}

  // Global (não filtra por conta): email é único no sistema todo.
  async buscarPorEmail(email: string) {
    return this.prisma.usuario.findUnique({ where: { email } });
  }

  async buscarPorIdNaConta(contaId: number, id: number) {
    return this.prisma.usuario.findFirst({ where: { id, contaId } });
  }

  async listarTodosDaConta(contaId: number, pular: number, pegar: number) {
    const [total, usuarios] = await this.prisma.$transaction([
      this.prisma.usuario.count({ where: { contaId } }),
      this.prisma.usuario.findMany({
        where: { contaId },
        skip: pular,
        take: pegar,
        orderBy: { criadoEm: 'desc' },
      }),
    ]);
    return { total, usuarios };
  }

  async criar(dados: DadosCriarUsuario) {
    return this.prisma.usuario.create({ data: dados });
  }

  // Conta e seu primeiro usuário são gravados juntos (nested write atômico).
  async criarComNovaConta(
    dados: Omit<DadosCriarUsuario, 'contaId'>,
    plano: PlanoConta,
  ) {
    return this.prisma.usuario.create({
      data: { ...dados, conta: { create: { plano } } },
    });
  }

  async atualizar(id: number, dados: DadosAtualizarUsuario) {
    return this.prisma.usuario.update({ where: { id }, data: dados });
  }

  // Treinos, exercícios e histórico de cargas do usuário são removidos em
  // cascata pelo banco (onDelete: Cascade no schema).
  async remover(id: number) {
    return this.prisma.usuario.delete({ where: { id } });
  }
}
