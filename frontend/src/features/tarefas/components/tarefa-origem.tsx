import { Link } from 'react-router'
import { useOrigemAtual } from '@/lib/navegacao'
import { origemLabel, type Tarefa } from '../types'

/**
 * Origem da tarefa. Quem gerencia abre a manutenção programada; os demais só veem o rótulo.
 * Com chamados, o plano de ação também gera tarefas.
 */
export function TarefaOrigem({ tarefa: t, podeGerenciar }: { tarefa: Tarefa; podeGerenciar: boolean }) {
  const origem = useOrigemAtual()

  if (!podeGerenciar) return <span className="text-xs text-muted-foreground">{origemLabel[t.origem]}</span>

  return (
    <Link
      to={`/planejamento/manutencoes-programadas/${t.manutencaoProgramadaId}`}
      state={origem}
      className="relative z-10 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      aria-label={`Abrir a manutenção programada de ${t.equipamento.codigo} · ${t.equipamento.nome}`}
    >
      {origemLabel[t.origem]}
    </Link>
  )
}
