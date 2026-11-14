import type { Condicao } from '@/features/equipamentos/types'
import type { PrioridadeChamado, StatusChamado } from '@/features/chamados/types'
import type { StatusTarefa } from '@/features/tarefas/types'

/** Espelha PisoResponse. */
export type Piso = {
  id: string
  codigo: string
  nome: string
  ordem: number
}

/** Espelha PisoRequest. */
export type PisoRequest = Pick<Piso, 'codigo' | 'nome' | 'ordem'>

/** Espelha PlantaResponse. A imagem e o PDF vêm de URLs próprias (urlImagem, urlPdf). */
export type Planta = {
  nomeArquivo: string
  pagina: number
  largura: number
  altura: number
  atualizadaEm: string | null
}

export type TipoMarcador = 'EQUIPAMENTO' | 'LOCAL_QR'

/** Posição relativa na planta: frações (0 a 1) da largura e da altura. */
export type Posicao = { x: number; y: number }

/** Espelha MarcadoresResponse.Ponto: x/y nulos = ainda sem posição. */
export type PontoMarcavel = { id: string; codigo: string; nome: string; x: number | null; y: number | null }

export type Marcadores = { equipamentos: PontoMarcavel[]; locais: PontoMarcavel[] }

export type MarcadorRequest = { tipo: TipoMarcador; referenciaId: string; x: number; y: number }

/** Espelha MapaPisoResponse. */
export type MapaPiso = {
  pisoId: string
  pisoNome: string
  planta: Planta | null
  equipamentos: EquipamentoNoMapa[]
  chamados: ChamadoNoMapa[]
  semPosicao: number
}

export type TarefaDoDia = {
  id: string
  dataHoraPrevista: string
  status: StatusTarefa
  atrasada: boolean
  equipe: string | null
  responsavel: string | null
}

export type EquipamentoNoMapa = Posicao & {
  id: string
  codigo: string
  nome: string
  condicao: Condicao
  atrasadas: number
  tarefasHoje: TarefaDoDia[]
}

export type ChamadoNoMapa = Posicao & {
  id: string
  protocolo: string
  status: StatusChamado
  prioridade: PrioridadeChamado
  resumo: string
  local: string
  criadoEm: string
}
