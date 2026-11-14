import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { ApiError } from '@/lib/api'
import { useExcluirChecklist } from '../hooks'
import type { Checklist } from '../types'

type ExcluirChecklistDialogProps = {
  checklist: Checklist | null
  onClose: () => void
}

export function ExcluirChecklistDialog({ checklist, onClose }: ExcluirChecklistDialogProps) {
  const excluir = useExcluirChecklist()

  const confirmar = () => {
    if (!checklist) return
    excluir.mutate(checklist.id, {
      onSuccess: () => toast.success('Checklist excluído.'),
      onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Não foi possível excluir.'),
    })
    onClose()
  }

  return (
    <ConfirmDialog
      open={!!checklist}
      onOpenChange={(open) => !open && onClose()}
      title="Excluir checklist?"
      description={checklist?.nome}
      confirmLabel="Excluir"
      destructive
      onConfirm={confirmar}
    />
  )
}
