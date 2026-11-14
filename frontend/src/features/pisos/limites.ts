/** Iguais ao PisoRequest, PlantaDadosRequest e PlantaPisoService do backend. */
export const LIMITE = {
  codigo: 10,
  nome: 100,
  ordem: { min: 0, max: 999 },
  pdfBytes: 15 * 1024 * 1024,
  imagemBytes: 5 * 1024 * 1024,
  paginas: 500,
  /** Lado maior da imagem gerada do PDF: nítida na tela cheia, leve para guardar e carregar. */
  ladoImagem: 2400,
  marcadores: 500,
} as const
