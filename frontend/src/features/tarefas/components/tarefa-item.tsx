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
import { localTarefa, origemLabel, rotaOrigemTarefa, situacaoDe, situacaoInfo, tituloTarefa, type Tarefa } from '../types'

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
  const titulo = tituloTarefa(t)
  const rotaOrigem = rotaOrigemTarefa(t)
  const quando = `${formatar.data(t.dataHoraPrevista)}, ${faixaHorario(t.dataHoraPrevista, t.duracaoMinutos)}`

  const executar = (acao: typeof cancelar, sucesso: string) =>
    acao.mutate(t.id, {
      onSuccess: () => toast.success(sucesso),
      onError: (e) => toast.error(mensagemDeErro(e, 'Não foi possível concluir.')),
    })

  return (
    // A área inteira (horário e dados) abre a tarefa: o ::after do link cobre o item; os demais
    // links e botões ficam acima dele (relative z-10) e mantêm a própria ação.
    <li
      className={cn(
        'group/tarefa relative -mx-2 flex items-start gap-3 rounded-md px-2 py-3 hover:bg-muted/60 has-[a[data-abrir]:focus-visible]:ring-2 has-[a[data-abrir]:focus-visible]:ring-ring',
        t.status === 'CANCELADA' && 'text-muted-foreground',
      )}
    >
      <div className="w-24 shrink-0 text-sm tabular-nums">
        {mostrarData && <div className="font-medium capitalize">{formatar.diaCurto(t.dataHoraPrevista)}</div>}
        <div className={cn(!mostrarData && 'font-medium')}>{faixaHorario(t.dataHoraPrevista, t.duracaoMinutos)}</div>
      </div>
      <div className="grid min-w-0 flex-1 gap-0.5">
        <Link
          to={`/tarefas/${t.id}`}
          state={origem}
          data-abrir
          className={cn(
            'truncate text-sm font-medium underline-offset-4 outline-none group-hover/tarefa:underline after:absolute after:inset-0 after:content-[""]',
            t.status === 'CANCELADA' && 'line-through',
          )}
          aria-label={`Abrir tarefa de ${titulo}, ${quando}`}
        >
          <span className={cn(compacto && 'sr-only')}>{titulo}</span>
        </Link>
        {!compacto && (
          <span className="truncate text-xs text-muted-foreground">
            {localTarefa(t)} · {t.equipe.nome}
            {t.responsavel && ` · ${t.responsavel.nome}`}
          </span>
        )}
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <StatusBadge tom={situacao.tom}>{situacao.rotulo}</StatusBadge>
          {!compacto &&
            (podeGerenciar && rotaOrigem ? (
              <Link
                to={rotaOrigem}
                state={origem}
                className="relative z-10 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                aria-label={`Abrir ${t.origem === 'CHAMADO' ? 'o chamado' : 'a manutenção programada'} de ${titulo}`}
              >
                {origemLabel[t.origem]}
              </Link>
            ) : (
              <span className="text-xs text-muted-foreground">{origemLabel[t.origem]}</span>
            ))}
        </span>
      </div>
      {podeGerenciar && t.status === 'AGENDADA' && (
        <Button variant="ghost" size="icon-sm" className="relative z-10" aria-label={`Cancelar tarefa de ${formatar.data(t.dataHoraPrevista)}`} onClick={() => setConfirmando(true)}>
          <BanIcon aria-hidden />
        </Button>
      )}
      {podeGerenciar && t.status === 'CANCELADA' && futura && (
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative z-10"
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
        description={`${titulo} — ${quando}. O cancelamento afeta apenas esta tarefa.`}
        confirmLabel="Cancelar tarefa"
        destructive
        onConfirm={() => executar(cancelar, 'Tarefa cancelada.')}
      />
    </li>
  )
}
