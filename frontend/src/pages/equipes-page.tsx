import { UsersIcon } from 'lucide-react'
import { useState } from 'react'
import { BotaoNovo } from '@/components/shared/botao-novo'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { ExcluirDialog } from '@/components/shared/excluir-dialog'
import { BarraFiltros, FiltroTexto } from '@/components/shared/filtros'
import { PageHeader } from '@/components/shared/page-header'
import { SemResultado } from '@/components/shared/sem-resultado'
import { Skeleton } from '@/components/ui/skeleton'
import { EquipeTable } from '@/features/equipes/components/equipe-table'
import { useEquipes, useExcluirEquipe } from '@/features/equipes/hooks'
import type { Equipe } from '@/features/equipes/types'
import { contem, useFiltrosUrl } from '@/lib/filtros'

const FILTROS = ['nome'] as const

export function EquipesPage() {
  const { data: equipes, isPending, isError, refetch } = useEquipes()
  const excluir = useExcluirEquipe()
  const [excluindo, setExcluindo] = useState<Equipe | null>(null)
  const filtros = useFiltrosUrl(FILTROS)

  const visiveis = (equipes ?? []).filter((e) => contem(e.nome, filtros.valores.nome))
  const nova = <BotaoNovo para="nova">Nova equipe</BotaoNovo>
  const temCadastro = !!equipes && equipes.length > 0

  return (
    <>
      <PageHeader title="Equipes" actions={temCadastro && nova} />
      {temCadastro && (
        <BarraFiltros ativos={filtros.ativos} onLimpar={() => filtros.limpar()}>
          <FiltroTexto id="filtro-nome" label="Nome" valor={filtros.valores.nome} onChange={(v) => filtros.definir('nome', v)} className="sm:w-64" />
        </BarraFiltros>
      )}
      {isPending && <Skeleton className="h-48 w-full" />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {equipes?.length === 0 && <EmptyState title="Nenhuma equipe cadastrada" icon={UsersIcon} action={nova} />}
      {temCadastro && visiveis.length === 0 && <SemResultado onLimpar={() => filtros.limpar()} />}
      {visiveis.length > 0 && <EquipeTable equipes={visiveis} onExcluir={setExcluindo} />}
      <ExcluirDialog
        registro={excluindo}
        titulo="Excluir equipe?"
        mensagemSucesso="Equipe excluída."
        mutacao={excluir}
        onClose={() => setExcluindo(null)}
      />
    </>
  )
}
