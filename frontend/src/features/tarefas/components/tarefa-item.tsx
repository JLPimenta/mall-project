import { StatusBadge } from '@/components/shared/status-badge'
import { formatar } from '@/lib/datas'
import { cn } from '@/lib/utils'
import { faixaHorario } from '../formatos'
import { situacaoDe, situacaoInfo, type Tarefa } from '../types'
import { TarefaAcoes } from './tarefa-acoes'
import { TarefaOrigem } from './tarefa-origem'

type TarefaItemProps = {
  tarefa: Tarefa
  /** Administrador e Supervisor podem cancelar, restaurar e abrir a origem. */
  podeGerenciar: boolean
  /** Mostrar a data (listas com dias diferentes) ou só o horário (painel de um dia). */
  mostrarData?: boolean
  /** Equipamento e origem já são conhecidos (ex.: tela da manutenção programada). */
  compacto?: boolean
}

export function TarefaItem({ tarefa: t, podeGerenciar, mostrarData, compacto }: TarefaItemProps) {
  const situacao = situacaoInfo[situacaoDe(t)]

  return (
    <li className={cn('flex items-start gap-3 py-3', t.status === 'CANCELADA' && 'text-muted-foreground')}>
      <div className="w-24 shrink-0 text-sm tabular-nums">
        {mostrarData && <div className="font-medium capitalize">{formatar.diaCurto(t.dataHoraPrevista)}</div>}
        <div className={cn(!mostrarData && 'font-medium')}>{faixaHorario(t.dataHoraPrevista, t.duracaoMinutos)}</div>
      </div>
      <div className="grid min-w-0 flex-1 gap-0.5">
        {!compacto && (
          <span className={cn('truncate text-sm font-medium', t.status === 'CANCELADA' && 'line-through')}>
            {t.equipamento.codigo} · {t.equipamento.nome}
          </span>
        )}
        {!compacto && (
          <span className="truncate text-xs text-muted-foreground">
            {t.piso} · {t.localizacao} · {t.equipe.nome}
          </span>
        )}
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <StatusBadge tom={situacao.tom}>{situacao.rotulo}</StatusBadge>
          {!compacto && <TarefaOrigem tarefa={t} podeGerenciar={podeGerenciar} />}
        </span>
      </div>
      {podeGerenciar && <TarefaAcoes tarefa={t} />}
    </li>
  )
}
