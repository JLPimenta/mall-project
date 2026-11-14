import { ClipboardListIcon, PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChecklistTable } from '@/features/checklists/components/checklist-table'
import { ExcluirChecklistDialog } from '@/features/checklists/components/excluir-checklist-dialog'
import { useChecklists } from '@/features/checklists/hooks'
import type { Checklist } from '@/features/checklists/types'

export function ChecklistsPage() {
  const { data: checklists, isPending, isError, refetch } = useChecklists()
  const [excluindo, setExcluindo] = useState<Checklist | null>(null)

  const novo = (
    <Button asChild>
      <Link to="novo">
        <PlusIcon aria-hidden />
        Novo checklist
      </Link>
    </Button>
  )

  return (
    <>
      <PageHeader title="Checklists" actions={checklists && checklists.length > 0 && novo} />

      {isPending && <Skeleton className="h-48 w-full" />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {checklists?.length === 0 && <EmptyState title="Nenhum checklist cadastrado" icon={ClipboardListIcon} action={novo} />}
      {checklists && checklists.length > 0 && <ChecklistTable checklists={checklists} onExcluir={setExcluindo} />}

      <ExcluirChecklistDialog checklist={excluindo} onClose={() => setExcluindo(null)} />
    </>
  )
}
