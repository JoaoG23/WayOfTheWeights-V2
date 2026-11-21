export class FotoUsuarioRespostaDto {
  // Identifica a versão atual da foto (nome do arquivo). Muda a cada troca,
  // então o app usa como parâmetro da URL para não exibir foto antiga em cache.
  fotoVersao: string;
}
