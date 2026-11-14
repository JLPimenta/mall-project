import { ClipboardListIcon, FileUpIcon, MessageSquareWarningIcon, WrenchIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { FiltroAlternar } from '@/components/shared/filtros'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { prioridadeChamadoLabel, tomPrioridade } from '@/features/chamados/types'
import { condicaoInfo } from '@/features/equipamentos/types'
import { MarcadorSvg, PlantaSvg } from '@/features/pisos/components/planta-svg'
import { useMapaPiso } from '@/features/pisos/hooks'
import type { EquipamentoNoMapa } from '@/features/pisos/types'
import { useOrigemAtual } from '@/lib/navegacao'
import { preenchimentoDoTom, type Tom } from '@/lib/tons'
import { DetalheMarcador, type Selecao } from './detalhe-marcador'
import { LegendaMapa } from './legenda-mapa'

/** Equipamento: atrasada pesa mais que a condição. */
function tomDoEquipamento(e: EquipamentoNoMapa): Tom {
  return e.atrasadas > 0 ? 'perigo' : condicaoInfo[e.condicao].tom
}

function rotuloEquipamento(e: EquipamentoNoMapa) {
  const partes = [`${e.codigo} · ${e.nome}`, condicaoInfo[e.condicao].rotulo.toLowerCase()]
  if (e.atrasadas) partes.push(`${e.atrasadas} atrasada${e.atrasadas > 1 ? 's' : ''}`)
  if (e.tarefasHoje.length) partes.push(`${e.tarefasHoje.length} tarefa${e.tarefasHoje.length > 1 ? 's' : ''} hoje`)
  return partes.join(', ')
}

type Camadas = { equipamentos: boolean; chamados: boolean; tarefas: boolean }

/**
 * Visão do piso: planta com equipamentos (cor pela condição; vermelho se há tarefa atrasada), chamados abertos
 * no ponto do QR Code (losango, cor pela prioridade) e o número de tarefas de hoje em cada equipamento.
 */
export function MapaCentral({ pisoId }: { pisoId: string }) {
  const { data: mapa, isPending, isError, refetch } = useMapaPiso(pisoId)
  const origem = useOrigemAtual()
  const [camadas, setCamadas] = useState<Camadas>({ equipamentos: true, chamados: true, tarefas: true })
  const [selecao, setSelecao] = useState<Selecao | null>(null)

  if (isPending) return <Skeleton className="aspect-[3/2] w-full" />
  if (isError) return <ErrorState onRetry={() => refetch()} />
  if (!mapa.planta) {
    return (
      <EmptyState
        title="Piso sem planta"
        icon={FileUpIcon}
        action={
          <Button asChild variant="outline">
            <Link to={`/cadastros/pisos/${pisoId}`} state={origem}>
              Enviar planta
            </Link>
          </Button>
        }
      />
    )
  }

  const planta = mapa.planta
  // Com só "Tarefas do dia", aparecem os equipamentos que têm tarefa hoje.
  const equipamentos = mapa.equipamentos.filter((e) => camadas.equipamentos || (camadas.tarefas && e.tarefasHoje.length > 0))
  const chamados = camadas.chamados ? mapa.chamados : []
  const alternar = (camada: keyof Camadas) => (ativo: boolean) => setCamadas((c) => ({ ...c, [camada]: ativo }))

  return (
    <div className="grid gap-3">
      <div role="group" aria-label="Camadas da planta" className="flex flex-wrap items-center gap-2">
        <FiltroAlternar label="Equipamentos" icone={<WrenchIcon aria-hidden />} ativo={camadas.equipamentos} onChange={alternar('equipamentos')} />
        <FiltroAlternar label="Chamados abertos" icone={<MessageSquareWarningIcon aria-hidden />} ativo={camadas.chamados} onChange={alternar('chamados')} />
        <FiltroAlternar label="Tarefas do dia" icone={<ClipboardListIcon aria-hidden />} ativo={camadas.tarefas} onChange={alternar('tarefas')} />
        {mapa.semPosicao > 0 && (
          <Link to={`/cadastros/pisos/${pisoId}`} state={origem} className="ml-auto text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            {mapa.semPosicao} sem posição na planta
          </Link>
        )}
      </div>
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="grid gap-2">
          <PlantaSvg pisoId={pisoId} planta={planta} rotulo={`Planta do ${mapa.pisoNome}`}>
            {equipamentos.map((e) => (
              <MarcadorSvg
                key={e.id}
                planta={planta}
                posicao={e}
                rotulo={rotuloEquipamento(e)}
                preenchimento={preenchimentoDoTom[tomDoEquipamento(e)]}
                contador={camadas.tarefas ? e.tarefasHoje.length : 0}
                texto={e.codigo}
                selecionado={selecao?.tipo === 'equipamento' && selecao.item.id === e.id}
                onSelecionar={() => setSelecao({ tipo: 'equipamento', item: e })}
              />
            ))}
            {chamados.map((c) => (
              <MarcadorSvg
                key={c.id}
                planta={planta}
                posicao={c}
                forma="losango"
                rotulo={`Chamado ${c.protocolo}, prioridade ${prioridadeChamadoLabel[c.prioridade].toLowerCase()}, ${c.local}`}
                preenchimento={preenchimentoDoTom[tomPrioridade[c.prioridade]]}
                selecionado={selecao?.tipo === 'chamado' && selecao.item.id === c.id}
                onSelecionar={() => setSelecao({ tipo: 'chamado', item: c })}
              />
            ))}
          </PlantaSvg>
          <LegendaMapa />
        </div>
        <DetalheMarcador selecao={selecao} />
      </div>
      {mapa.equipamentos.length === 0 && mapa.chamados.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhum marcador posicionado neste piso.</p>
      )}
    </div>
  )
}
