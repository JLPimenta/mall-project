import { StatusBadge } from '@/components/shared/status-badge'
import { formatar } from '@/lib/datas'
import { cn } from '@/lib/utils'
import { faixaHorario } from '../formatos'
import { situacaoDe, situacaoInfo, type Situacao, type Tarefa } from '../types'
import { TarefaAcoes } from './tarefa-acoes'
import { TarefaOrigem } from './tarefa-origem'

type KanbanTarefasProps = {
  tarefas: Tarefa[]
  /** Com filtro de situação, só a coluna correspondente aparece. */
  situacao?: Situacao
  podeGerenciar: boolean
}

/** Atrasadas primeiro: são as que pedem ação. */
const COLUNAS: Situacao[] = ['ATRASADA', 'AGENDADA', 'CANCELADA']

/** Tarefas do período agrupadas por situação. As mudanças de situação continuam nas ações do cartão. */
export function KanbanTarefas({ tarefas, situacao, podeGerenciar }: KanbanTarefasProps) {
  const colunas = situacao ? [situacao] : COLUNAS
  const ordenadas = [...tarefas].sort((a, b) => a.dataHoraPrevista.localeCompare(b.dataHoraPrevista))

  return (
    <div className={cn('grid items-start gap-4', colunas.length > 1 && 'md:grid-cols-3')}>
      {colunas.map((coluna) => {
        const info = situacaoInfo[coluna]
        const itens = ordenadas.filter((t) => situacaoDe(t) === coluna)
        const tituloId = `kanban-${coluna.toLowerCase()}`
        return (
          <section key={coluna} aria-labelledby={tituloId} className="grid content-start gap-2 rounded-lg border bg-muted/30 p-3">
            <h3 id={tituloId} className="flex items-center justify-between gap-2 text-sm font-semibold">
              <StatusBadge tom={info.tom}>{info.rotulo}</StatusBadge>
              <span className="text-xs font-normal text-muted-foreground tabular-nums">
                {itens.length}
                <span className="sr-only"> tarefa{itens.length === 1 ? '' : 's'}</span>
              </span>
            </h3>
            {itens.length === 0 ? (
              <p className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">Nenhuma tarefa</p>
            ) : (
              <ul className="grid gap-2" aria-label={`Tarefas: ${info.rotulo}`}>
                {itens.map((t) => (
                  <CartaoTarefa key={t.id} tarefa={t} podeGerenciar={podeGerenciar} />
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}

function CartaoTarefa({ tarefa: t, podeGerenciar }: { tarefa: Tarefa; podeGerenciar: boolean }) {
  const cancelada = t.status === 'CANCELADA'
  return (
    <li className={cn('flex items-start gap-2 rounded-md border bg-background p-3 shadow-xs', cancelada && 'text-muted-foreground')}>
      <div className="grid min-w-0 flex-1 gap-0.5">
        <span className="text-xs font-medium tabular-nums">
          <span className="capitalize">{formatar.diaCurto(t.dataHoraPrevista)}</span> · <span className="whitespace-nowrap">{faixaHorario(t.dataHoraPrevista, t.duracaoMinutos)}</span>
        </span>
        <span className={cn('line-clamp-2 text-sm font-medium', cancelada && 'line-through')}>
          {t.equipamento.codigo} · {t.equipamento.nome}
        </span>
        <span className="line-clamp-2 text-xs text-muted-foreground">
          {t.piso} · {t.localizacao} · {t.equipe.nome}
        </span>
        <TarefaOrigem tarefa={t} podeGerenciar={podeGerenciar} />
      </div>
      {podeGerenciar && <TarefaAcoes tarefa={t} />}
    </li>
  )
}
