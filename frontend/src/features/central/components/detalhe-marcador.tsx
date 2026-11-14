import { Link } from 'react-router'
import { StatusBadge } from '@/components/shared/status-badge'
import { prioridadeChamadoLabel, statusChamadoInfo, tomPrioridade } from '@/features/chamados/types'
import { condicaoInfo } from '@/features/equipamentos/types'
import type { ChamadoNoMapa, EquipamentoNoMapa } from '@/features/pisos/types'
import { situacaoDe, situacaoInfo } from '@/features/tarefas/types'
import { formatar, hojeIso } from '@/lib/datas'
import { useOrigemAtual } from '@/lib/navegacao'

export type Selecao = { tipo: 'equipamento'; item: EquipamentoNoMapa } | { tipo: 'chamado'; item: ChamadoNoMapa }

/** Painel do marcador selecionado na planta: o essencial e o caminho para o registro. */
export function DetalheMarcador({ selecao }: { selecao: Selecao | null }) {
  const origem = useOrigemAtual()
  if (!selecao) {
    return <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">Selecione um marcador na planta.</p>
  }

  if (selecao.tipo === 'chamado') {
    const c = selecao.item
    const status = statusChamadoInfo[c.status]
    return (
      <article aria-label={`Chamado ${c.protocolo}`} className="grid gap-2 rounded-lg border p-4 text-sm">
        <h3 className="font-semibold">Chamado {c.protocolo}</h3>
        <div className="flex flex-wrap gap-2">
          <StatusBadge tom={status.tom}>{status.rotulo}</StatusBadge>
          <StatusBadge tom={tomPrioridade[c.prioridade]}>{`Prioridade ${prioridadeChamadoLabel[c.prioridade].toLowerCase()}`}</StatusBadge>
        </div>
        <p className="text-muted-foreground">
          {c.local} · {formatar.data(c.criadoEm)} {formatar.hora(c.criadoEm)}
        </p>
        <p className="break-words">{c.resumo}</p>
        <Link to={`/chamados/${c.id}`} state={origem} className="font-medium text-primary underline-offset-4 hover:underline">
          Abrir chamado
        </Link>
      </article>
    )
  }

  const e = selecao.item
  const condicao = condicaoInfo[e.condicao]
  return (
    <article aria-label={`${e.codigo} · ${e.nome}`} className="grid gap-2 rounded-lg border p-4 text-sm">
      <h3 className="font-semibold">
        <span className="font-mono text-xs">{e.codigo}</span> · {e.nome}
      </h3>
      <div className="flex flex-wrap gap-2">
        <StatusBadge tom={condicao.tom}>{condicao.rotulo}</StatusBadge>
        {e.atrasadas > 0 && <StatusBadge tom="perigo">{`${e.atrasadas} atrasada${e.atrasadas > 1 ? 's' : ''}`}</StatusBadge>}
      </div>
      <h4 className="mt-1 text-xs font-medium text-muted-foreground">Tarefas de hoje</h4>
      {e.tarefasHoje.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma.</p>
      ) : (
        <ul className="grid gap-1.5">
          {e.tarefasHoje.map((t) => {
            const situacao = situacaoInfo[situacaoDe(t)]
            return (
              <li key={t.id} className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <Link to={`/tarefas/${t.id}`} state={origem} className="font-medium tabular-nums text-primary underline-offset-4 hover:underline">
                  {formatar.hora(t.dataHoraPrevista)}
                </Link>
                <StatusBadge tom={situacao.tom}>{situacao.rotulo}</StatusBadge>
                <span className="text-muted-foreground">{t.responsavel ?? t.equipe ?? ''}</span>
              </li>
            )
          })}
        </ul>
      )}
      <Link to={`/tarefas?visao=calendario&dia=${hojeIso()}`} state={origem} className="font-medium text-primary underline-offset-4 hover:underline">
        Ver em Tarefas
      </Link>
    </article>
  )
}
