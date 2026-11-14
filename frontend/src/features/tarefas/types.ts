import type { Tom } from '@/components/shared/status-badge'
import type { TipoResposta } from '@/features/checklists/types'
import type { Frequencia, Resumo } from '@/features/manutencao-programada/types'

/** AGENDADA → EM_EXECUCAO (assumida) → EM_ANALISE (enviada) → CONCLUIDA; reprovada volta para EM_EXECUCAO. */
export type StatusTarefa = 'AGENDADA' | 'EM_EXECUCAO' | 'EM_ANALISE' | 'CONCLUIDA' | 'CANCELADA'
export type Situacao = 'AGENDADA' | 'ATRASADA' | 'EM_EXECUCAO' | 'EM_ANALISE' | 'CONCLUIDA' | 'CANCELADA'
/** De onde a tarefa veio. Chamados (plano de ação) entram depois. */
export type OrigemTarefa = 'MANUTENCAO_PROGRAMADA'

export const situacoes: { valor: Situacao; rotulo: string; tom: Tom }[] = [
  { valor: 'AGENDADA', rotulo: 'Agendada', tom: 'info' },
  { valor: 'ATRASADA', rotulo: 'Atrasada', tom: 'perigo' },
  { valor: 'EM_EXECUCAO', rotulo: 'Em execução', tom: 'andamento' },
  { valor: 'EM_ANALISE', rotulo: 'Em análise', tom: 'atencao' },
  { valor: 'CONCLUIDA', rotulo: 'Concluída', tom: 'sucesso' },
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
  /** Membro da equipe que assumiu a tarefa. */
  responsavel: Resumo | null
  envios: number
  ultimoEnvio: string | null
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
  if (t.status === 'AGENDADA' && t.atrasada) return 'ATRASADA'
  return t.status
}

export const situacaoInfo = Object.fromEntries(situacoes.map((s) => [s.valor, s])) as Record<Situacao, (typeof situacoes)[number]>

// ---- execução e validação (espelha TarefaDetalheResponse)

export type AcaoTarefa = 'ASSUMIDA' | 'ENVIADA' | 'APROVADA' | 'REPROVADA' | 'CANCELADA' | 'RESTAURADA'

export const acaoLabel: Record<AcaoTarefa, string> = {
  ASSUMIDA: 'Assumida',
  ENVIADA: 'Enviada para análise',
  APROVADA: 'Aprovada',
  REPROVADA: 'Reprovada',
  CANCELADA: 'Cancelada',
  RESTAURADA: 'Restaurada',
}

export type ItemTarefa = {
  id: string
  ordem: number
  pergunta: string
  tipoResposta: TipoResposta
  obrigatorio: boolean
  maxCaracteres: number | null
  /** SIM_NAO: "SIM"/"NAO"; NUMERO: número com ponto; TEXTO: texto. */
  resposta: string | null
}

export type Evidencia = {
  id: string
  nomeArquivo: string
  tipoConteudo: string
  tamanhoBytes: number
  /** null = ainda não enviada (pode ser removida). */
  envio: number | null
  enviadaPor: Resumo
  dataCriacao: string
}

export type RegistroHistorico = {
  id: string
  acao: AcaoTarefa
  usuario: Resumo
  dataHora: string
  statusResultante: StatusTarefa
  observacao: string | null
  envio: number | null
}

export type TarefaDetalhe = {
  tarefa: Tarefa
  observacao: string | null
  itens: ItemTarefa[]
  evidencias: Evidencia[]
  historico: RegistroHistorico[]
  /** O que o usuário atual pode fazer (o servidor valida de novo). */
  acoes: { assumir: boolean; executar: boolean; avaliar: boolean }
}

/** Espelha ExecucaoTarefaRequest. */
export type ExecucaoRequest = {
  observacao: string
  respostas: { itemId: string; resposta: string }[]
}
