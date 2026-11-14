import { LayersIcon } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { IndicadoresCentral } from '@/features/central/components/indicadores-central'
import { MapaCentral } from '@/features/central/components/mapa-central'
import { SaudacaoCentral } from '@/features/central/components/saudacao-central'
import { PisoSelect } from '@/features/pisos/components/piso-select'
import { usePisos } from '@/features/pisos/hooks'
import { useFiltrosUrl } from '@/lib/filtros'

const PARAMETROS = ['piso'] as const

/** Central de Controle: saudação, visão geral da operação e a visão do piso sobre a planta. */
export function CentralPage() {
  const { data: pisos, isPending, isError, refetch } = usePisos()
  // O piso escolhido fica na URL: voltar de uma tarefa ou chamado reabre o mesmo piso.
  const parametros = useFiltrosUrl(PARAMETROS)
  const pisoId = pisos?.some((p) => p.id === parametros.valores.piso) ? parametros.valores.piso : pisos?.[0]?.id

  return (
    <>
      <PageHeader title="Central de Controle" />
      <SaudacaoCentral />

      <IndicadoresCentral />

      <section aria-labelledby="mapa-titulo" className="grid gap-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="mapa-titulo" className="text-lg font-semibold">
            Visão do piso
          </h2>
          {pisos && pisos.length > 0 && <PisoSelect pisos={pisos} value={pisoId} onChange={(id) => parametros.definir('piso', id)} />}
        </div>
        {isPending && <Skeleton className="aspect-[3/2] w-full" />}
        {isError && <ErrorState onRetry={() => refetch()} />}
        {pisos?.length === 0 && <EmptyState title="Nenhum piso cadastrado" icon={LayersIcon} />}
        {pisoId && <MapaCentral key={pisoId} pisoId={pisoId} />}
      </section>
    </>
  )
}
