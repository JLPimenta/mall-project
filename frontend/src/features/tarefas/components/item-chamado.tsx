import { MessageSquareWarningIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { AbrirChamadoDialog } from '@/features/chamados/components/abrir-chamado-dialog'
import { useAbrirChamadoItem } from '../hooks'
import { localTarefa, tituloTarefa, type ItemTarefa, type Tarefa } from '../types'

const rotuloSimNao = (v: string) => (v === 'SIM' ? 'Sim' : 'Não')

/** Texto inicial do chamado: tarefa, pergunta e resposta, para a triagem entender sem abrir a tarefa. */
function descricaoInicial(tarefa: Tarefa, item: ItemTarefa, resposta: string, naoConforme: boolean) {
  const valor = !resposta ? '' : item.tipoResposta === 'SIM_NAO' ? rotuloSimNao(resposta) : resposta
  const base = naoConforme
    ? `Não conformidade no checklist da tarefa ${tituloTarefa(tarefa)}: "${item.pergunta}". Resposta: ${valor} (esperado: ${rotuloSimNao(item.respostaEsperada ?? '')}).`
    : `Problema no checklist da tarefa ${tituloTarefa(tarefa)}: "${item.pergunta}".${valor ? ` Resposta: ${valor}.` : ''}`
  return base.slice(0, 1000)
}

type ItemChamadoProps = {
  tarefa: Tarefa
  item: ItemTarefa
  /** Resposta atual no formulário (pode ainda não estar salva). */
  resposta: string
  /** Gestão abre o chamado em Chamados; Funcionário vê só o protocolo. */
  podeAbrirDetalhe: boolean
}

/**
 * Chamado de um item do checklist durante a execução.
 * Sim/Não fora do esperado é não conformidade: o chamado é exigido para enviar. Texto e número: opcional.
 */
export function ItemChamado({ tarefa, item, resposta, podeAbrirDetalhe }: ItemChamadoProps) {
  const [aberto, setAberto] = useState(false)
  const abrir = useAbrirChamadoItem(tarefa.id)
  const naoConforme = item.tipoResposta === 'SIM_NAO' && !!item.respostaEsperada && !!resposta && resposta !== item.respostaEsperada

  if (item.chamado) {
    const protocolo = `Chamado ${item.chamado.nome}`
    return podeAbrirDetalhe ? (
      <Link to={`/chamados/${item.chamado.id}`} className="text-xs text-primary underline-offset-4 hover:underline">
        {protocolo}
      </Link>
    ) : (
      <span className="text-xs text-muted-foreground">{protocolo}</span>
    )
  }
  // Sim/Não dentro do esperado (ou sem regra) não oferece chamado; texto e número sempre oferecem.
  if (item.tipoResposta === 'SIM_NAO' && !naoConforme) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {naoConforme && <span className="text-xs font-medium text-destructive">Não conforme</span>}
      <Button
        type="button"
        size="sm"
        variant={naoConforme ? 'destructive' : 'ghost'}
        aria-label={`Abrir chamado: ${item.pergunta}`}
        onClick={() => setAberto(true)}
      >
        <MessageSquareWarningIcon aria-hidden />
        Abrir chamado
      </Button>
      <AbrirChamadoDialog
        open={aberto}
        onOpenChange={setAberto}
        localFixo={localTarefa(tarefa)}
        descricaoInicial={descricaoInicial(tarefa, item, resposta, naoConforme)}
        onAbrir={async ({ descricao }) => {
          const detalhe = await abrir.mutateAsync({ itemId: item.id, descricao })
          const protocolo = detalhe.itens.find((i) => i.id === item.id)?.chamado?.nome
          toast.success(protocolo ? `Chamado ${protocolo} aberto.` : 'Chamado aberto.')
        }}
      />
    </div>
  )
}
