// Esquema do JSON que o Gemini deve devolver (mesmo formato do
// SubtreinoImportacaoDto). Tipos em maiúsculas, como a API do Gemini espera.
export const ESQUEMA_RESPOSTA_OCR = {
  type: 'OBJECT',
  properties: {
    titulo: { type: 'STRING' },
    descricao: { type: 'STRING', nullable: true },
    exercicios: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          nome: { type: 'STRING' },
          cargaAtual: { type: 'INTEGER' },
          repeticoesPorSerie: { type: 'ARRAY', items: { type: 'INTEGER' } },
        },
        required: ['nome', 'cargaAtual', 'repeticoesPorSerie'],
      },
    },
  },
  required: ['titulo', 'exercicios'],
};

export const INSTRUCAO_LEITURA_SUBTREINO = `
Você lê fotos ou prints de uma ficha de treino de musculação e extrai UM subtreino (ex.: "Treino A - Peito").
Todas as imagens enviadas são partes do mesmo subtreino: junte-as em um único resultado, sem exercícios repetidos.

Regras:
- titulo: nome do treino/grupo muscular como está escrito (máx. 70 caracteres). Se não houver, resuma pelo grupo muscular.
- descricao: observações gerais do treino, se existirem; senão null.
- exercicios: um item por exercício, na ordem em que aparecem.
  - nome: como está escrito, sem numeração (máx. 70 caracteres).
  - cargaAtual: carga em kg, número inteiro. Arredonde decimais. Se houver faixa, use o maior valor. Se não houver carga, use 1.
  - repeticoesPorSerie: uma posição por série. "3x12" vira [12,12,12]; "12-10-8" vira [12,10,8]; "4 séries de 10" vira [10,10,10,10]. Se houver faixa (ex.: 8 a 12), use o maior valor. Se as séries não aparecerem, use [].
- Não invente exercícios nem valores que não estejam nas imagens.
`.trim();
