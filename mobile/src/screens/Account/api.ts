import api from "../../services/api";
import { PerfilUsuario } from "../../contexts/AuthContext";

export interface MinhaConta {
  id: number;
  contaId: number;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  proprietario: boolean;
  // Versão da foto de perfil (nome do arquivo); nulo se não tem foto.
  fotoVersao: string | null;
}

// Dados que o próprio usuário pode alterar no app.
export interface DadosMinhaConta {
  nome: string;
}

export interface PlanoConta {
  contaId: number;
  plano: "BASICO" | "BETA";
  limites: Record<PerfilUsuario, number>;
  usuariosPorPerfil: Record<PerfilUsuario, number>;
}

export const buscarMinhaConta = async (): Promise<MinhaConta> => {
  const response = await api.get<MinhaConta>("/conta");
  return response.data;
};

export const atualizarMinhaConta = async (
  dadosConta: DadosMinhaConta
): Promise<MinhaConta> => {
  const response = await api.put<MinhaConta>("/conta", dadosConta);
  return response.data;
};

// Imagem escolhida na galeria/câmera, pronta para o upload.
export interface FotoSelecionada {
  uri: string;
  nome: string;
  tipo: string;
}

// Baixa a foto pelo axios (que envia o cookie de sessão; o <Image> do React
// Native nem sempre envia) e devolve como data URI para exibir no <Image>.
export const buscarFotoUsuario = async (fotoVersao: string): Promise<string> => {
  const response = await api.get<Blob>("/conta/foto", {
    params: { v: fotoVersao },
    responseType: "blob",
  });
  return new Promise<string>((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onloadend = () => resolve(leitor.result as string);
    leitor.onerror = () => reject(leitor.error);
    leitor.readAsDataURL(response.data);
  });
};

export const enviarFotoUsuario = async (
  foto: FotoSelecionada
): Promise<{ fotoVersao: string }> => {
  const formulario = new FormData();
  // Formato de arquivo do React Native para FormData.
  formulario.append("foto", {
    uri: foto.uri,
    name: foto.nome,
    type: foto.tipo,
  } as unknown as Blob);

  const response = await api.put<{ fotoVersao: string }>(
    "/conta/foto",
    formulario,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
};

export const removerFotoUsuario = async (): Promise<void> => {
  await api.delete("/conta/foto");
};

export const buscarPlanoConta = async (): Promise<PlanoConta> => {
  const response = await api.get<PlanoConta>("/conta/plano");
  return response.data;
};

// Perfis que ainda têm vaga no plano atual da conta.
export const obterPerfisComVaga = (plano: PlanoConta): PerfilUsuario[] =>
  (Object.keys(plano.limites) as PerfilUsuario[]).filter(
    (perfil) => plano.usuariosPorPerfil[perfil] < plano.limites[perfil]
  );
