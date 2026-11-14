import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type ConfirmarSaidaDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function ConfirmarSaidaDialog({ open, onOpenChange, onConfirm }: ConfirmarSaidaDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {/* Sem descrição: o título basta. aria-describedby vazio evita o aviso do Radix. */}
      <AlertDialogContent size="sm" aria-describedby={undefined}>
        <AlertDialogHeader>
          <AlertDialogTitle>Sair do sistema?</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Sair</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
