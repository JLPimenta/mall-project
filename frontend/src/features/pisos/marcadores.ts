import type { TipoMarcador } from './types'

/** Chave única de um marcador no editor: tipo + id do registro. */
export const chave = (tipo: TipoMarcador, id: string) => `${tipo}:${id}`
