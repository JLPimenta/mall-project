import { BanIcon, RotateCcwIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { mensagemDeErro } from '@/lib/cadastro'
import { formatar } from '@/lib/datas'
import { useOrigemAtual } from '@/lib/navegacao'
import { useAgora } from '@/lib/use-agora'
import { cn } from '@/lib/utils'
import { faixaHorario } from '../formatos'
import { useCancelarTarefa, useRestaurarTarefa } from '../hooks'
import { origemLabel, situacaoDe, situacaoInfo, type Tarefa } from '../types'

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
  const [confirmando, setConfirmando] = useState(false)
  const cancelar = useCancelarTarefa()
  const restaurar = useRestaurarTarefa()
  const situacao = situacaoInfo[situacaoDe(t)]
  const agora = useAgora()
  const origem = useOrigemAtual()
  const futura = new Date(t.dataHoraPrevista) > agora
  const titulo = `${t.equipamento.codigo} · ${t.equipamento.nome}`
  const quando = `${formatar.data(t.dataHoraPrevista)}, ${faixaHorario(t.dataHoraPrevista, t.duracaoMinutos)}`

  const executar = (acao: typeof cancelar, sucesso: string) =>
    acao.mutate(t.id, {
      onSuccess: () => toast.success(sucesso),
      onError: (e) => toast.error(mensagemDeErro(e, 'Não foi possível concluir.')),
    })

  return (
    <li className={cn('flex items-start gap-3 py-3', t.status === 'CANCELADA' && 'text-muted-foreground')}>
      <div className="w-24 shrink-0 text-sm tabular-nums">
        {mostrarData && <div className="font-medium capitalize">{formatar.diaCurto(t.dataHoraPrevista)}</div>}
        <div className={cn(!mostrarData && 'font-medium')}>{faixaHorario(t.dataHoraPrevista, t.duracaoMinutos)}</div>
      </div>
      <div className="grid min-w-0 flex-1 gap-0.5">
        {!compacto && <span className={cn('truncate text-sm font-medium', t.status === 'CANCELADA' && 'line-through')}>{titulo}</span>}
        {!compacto && (
          <span className="truncate text-xs text-muted-foreground">
            {t.piso} · {t.localizacao} · {t.equipe.nome}
          </span>
        )}
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <StatusBadge tom={situacao.tom}>{situacao.rotulo}</StatusBadge>
          {/* Origem: hoje só manutenção programada; com chamados, o plano de ação também gera tarefas. */}
          {!compacto &&
            (podeGerenciar ? (
              <Link
                to={`/planejamento/manutencoes-programadas/${t.manutencaoProgramadaId}`}
                state={origem}
                className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                aria-label={`Abrir a manutenção programada de ${titulo}`}
              >
                {origemLabel[t.origem]}
              </Link>
            ) : (
              <span className="text-xs text-muted-foreground">{origemLabel[t.origem]}</span>
            ))}
        </span>
      </div>
      {podeGerenciar && t.status === 'AGENDADA' && (
        <Button variant="ghost" size="icon-sm" aria-label={`Cancelar tarefa de ${formatar.data(t.dataHoraPrevista)}`} onClick={() => setConfirmando(true)}>
          <BanIcon aria-hidden />
        </Button>
      )}
      {podeGerenciar && t.status === 'CANCELADA' && futura && (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Restaurar tarefa de ${formatar.data(t.dataHoraPrevista)}`}
          disabled={restaurar.isPending}
          onClick={() => executar(restaurar, 'Tarefa restaurada.')}
        >
          <RotateCcwIcon aria-hidden />
        </Button>
      )}
      <ConfirmDialog
        open={confirmando}
        onOpenChange={setConfirmando}
        title="Cancelar esta tarefa?"
        description={`${titulo} — ${quando}. As demais tarefas da manutenção programada não mudam.`}
        confirmLabel="Cancelar tarefa"
        destructive
        onConfirm={() => executar(cancelar, 'Tarefa cancelada.')}
      />
    </li>
  )
}
