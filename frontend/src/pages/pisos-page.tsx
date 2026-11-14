import { LayersIcon } from 'lucide-react'
import { useState } from 'react'
import { BotaoNovo } from '@/components/shared/botao-novo'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { ExcluirDialog } from '@/components/shared/excluir-dialog'
import { BarraFiltros, FiltroTexto } from '@/components/shared/filtros'
import { PageHeader } from '@/components/shared/page-header'
import { SemResultado } from '@/components/shared/sem-resultado'
import { Skeleton } from '@/components/ui/skeleton'
import { PisoTable } from '@/features/pisos/components/piso-table'
import { useExcluirPiso, usePisos } from '@/features/pisos/hooks'
import type { Piso } from '@/features/pisos/types'
import { contem, useFiltrosUrl } from '@/lib/filtros'

const FILTROS = ['nome'] as const

export function PisosPage() {
  const { data: pisos, isPending, isError, refetch } = usePisos()
  const excluir = useExcluirPiso()
  const [excluindo, setExcluindo] = useState<Piso | null>(null)
  const filtros = useFiltrosUrl(FILTROS)
  const visiveis = (pisos ?? []).filter((p) => contem(`${p.codigo} ${p.nome}`, filtros.valores.nome))
  const novo = <BotaoNovo para="novo">Novo piso</BotaoNovo>
  const temCadastro = !!pisos && pisos.length > 0

  return (
    <>
      <PageHeader voltar="/" title="Pisos" actions={temCadastro && novo} />
      {temCadastro && (
        <BarraFiltros ativos={filtros.ativos} onLimpar={() => filtros.limpar()}>
          <FiltroTexto id="filtro-nome" label="Código ou nome" valor={filtros.valores.nome} onChange={(v) => filtros.definir('nome', v)} />
        </BarraFiltros>
      )}
      {isPending && <Skeleton className="h-48 w-full max-w-6xl" />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {pisos?.length === 0 && <EmptyState title="Nenhum piso cadastrado" icon={LayersIcon} action={novo} />}
      {temCadastro && visiveis.length === 0 && <SemResultado onLimpar={() => filtros.limpar()} />}
      {visiveis.length > 0 && (
        <div className="max-w-6xl">
          <PisoTable pisos={visiveis} onExcluir={setExcluindo} />
        </div>
      )}
      <ExcluirDialog registro={excluindo} titulo="Excluir piso?" mensagemSucesso="Piso excluído." mutacao={excluir} onClose={() => setExcluindo(null)} />
    </>
  )
}
