import type { Tom } from '@/components/shared/status-badge'
import type { Frequencia, Resumo } from '@/features/manutencao-programada/types'

export type StatusTarefa = 'AGENDADA' | 'CANCELADA'
export type Situacao = 'AGENDADA' | 'ATRASADA' | 'CANCELADA'
/** De onde a tarefa veio. Chamados (plano de ação) entram depois. */
export type OrigemTarefa = 'MANUTENCAO_PROGRAMADA'

export const situacoes: { valor: Situacao; rotulo: string; tom: Tom }[] = [
  { valor: 'AGENDADA', rotulo: 'Agendada', tom: 'info' },
  { valor: 'ATRASADA', rotulo: 'Atrasada', tom: 'perigo' },
  { valor: 'CANCELADA', rotulo: 'Cancelada', tom: 'neutro' },
]

export const origemLabel: Record<OrigemTarefa, string> = {
  MANUTENCAO_PROGRAMADA: 'Manutenção programada',
}

/** Espelha TarefaResponse. */
export type Tarefa = {
  id: string
  origem: OrigemTarefa
  manutencaoProgramadaId: string
  dataHoraPrevista: string
  duracaoMinutos: number
  status: StatusTarefa
  atrasada: boolean
  frequencia: Frequencia
  equipamento: Resumo
  piso: string
  localizacao: string
  checklist: Resumo
  equipe: Resumo
}

export type ResumoTarefas = { atrasadas: number; proximos7Dias: number; agendadasNoMes: number }

/** Espelha FiltroTarefas (query string de /api/tarefa). */
export type FiltroTarefas = {
  de: string
  ate: string
  manutencaoProgramadaId?: string
  equipeId?: string
  situacao?: Situacao
}

export function situacaoDe(t: Pick<Tarefa, 'status' | 'atrasada'>): Situacao {
  if (t.status === 'CANCELADA') return 'CANCELADA'
  return t.atrasada ? 'ATRASADA' : 'AGENDADA'
}

export const situacaoInfo = Object.fromEntries(situacoes.map((s) => [s.valor, s])) as Record<Situacao, (typeof situacoes)[number]>
