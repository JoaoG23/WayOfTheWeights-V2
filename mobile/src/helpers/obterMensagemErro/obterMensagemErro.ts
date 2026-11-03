import { isAxiosError } from "axios";

// O backend (NestJS) responde { message: string } ou, em erros de validação,
// { message: string[] }.
export const obterMensagemErro = (
  erro: unknown,
  mensagemPadrao: string
): string => {
  if (!isAxiosError(erro)) return mensagemPadrao;

  const mensagem = erro.response?.data?.message;
  if (Array.isArray(mensagem)) return mensagem.join("\n");
  return mensagem || mensagemPadrao;
};
