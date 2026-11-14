/** Iguais aos limites de AprovarChamadoRequest, ArquivarChamadoRequest e AbrirChamadoRequest (colunas de CHAMADO). */
export const LIMITE_CHAMADO = {
  duracao: { min: 1, max: 1440 },
  motivoArquivamento: 500,
  localInformado: 150,
  descricao: 1000,
} as const
