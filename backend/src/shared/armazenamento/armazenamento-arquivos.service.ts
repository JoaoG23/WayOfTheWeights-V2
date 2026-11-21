import { Injectable } from '@nestjs/common';
import { access, mkdir, rm, writeFile } from 'fs/promises';
import { basename, join } from 'path';

// Guarda arquivos enviados pelos usuários no disco do servidor, numa pasta por
// assunto (ex.: "fotos"). A raiz vem de UPLOADS_DIR (padrão: ./uploads) e
// precisa ser um disco persistente em produção.
@Injectable()
export class ArmazenamentoArquivosService {
  async salvar(
    subpasta: string,
    nomeArquivo: string,
    conteudo: Buffer,
  ): Promise<void> {
    await mkdir(this.pasta(subpasta), { recursive: true });
    await writeFile(this.caminho(subpasta, nomeArquivo), conteudo);
  }

  async existe(subpasta: string, nomeArquivo: string): Promise<boolean> {
    try {
      await access(this.caminho(subpasta, nomeArquivo));
      return true;
    } catch {
      return false;
    }
  }

  async remover(subpasta: string, nomeArquivo: string): Promise<void> {
    await rm(this.caminho(subpasta, nomeArquivo), { force: true });
  }

  // basename impede que um nome de arquivo saia da pasta (../).
  caminho(subpasta: string, nomeArquivo: string): string {
    return join(this.pasta(subpasta), basename(nomeArquivo));
  }

  private pasta(subpasta: string): string {
    const raiz = process.env.UPLOADS_DIR ?? join(process.cwd(), 'uploads');
    return join(raiz, subpasta);
  }
}
