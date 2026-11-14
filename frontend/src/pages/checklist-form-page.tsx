import { FileQuestionIcon } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { ChecklistForm } from '@/features/checklists/components/checklist-form'
import { useChecklist, useSalvarChecklist } from '@/features/checklists/hooks'
import { paraFormulario, paraRequisicao } from '@/features/checklists/schemas'
import { ApiError } from '@/lib/api'

const LISTA = '/manutencao/checklists'

export function ChecklistFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const checklist = useChecklist(id)
  const salvar = useSalvarChecklist(id)

  const titulo = id ? 'Editar checklist' : 'Novo checklist'

  if (id && checklist.isPending) {
    return (
      <>
        <PageHeader title={titulo} />
        <Skeleton className="h-64 w-full max-w-6xl" />
      </>
    )
  }

  if (id && checklist.isError) {
    const naoEncontrado = checklist.error instanceof ApiError && checklist.error.status === 404
    return (
      <>
        <PageHeader title={titulo} />
        {naoEncontrado ? (
          <EmptyState title="Checklist não encontrado." icon={FileQuestionIcon} />
        ) : (
          <ErrorState onRetry={() => checklist.refetch()} />
        )}
      </>
    )
  }

  const erro = salvar.error instanceof ApiError ? salvar.error.message : salvar.error ? 'Não foi possível salvar.' : undefined

  return (
    <>
      <PageHeader title={titulo} />
      <ChecklistForm
        key={checklist.data?.id ?? 'novo'}
        defaultValues={paraFormulario(checklist.data)}
        salvando={salvar.isPending}
        erro={erro}
        onCancel={() => navigate(LISTA)}
        onSubmit={async (dados) => {
          try {
            return paraFormulario(await salvar.mutateAsync(paraRequisicao(dados)))
          } catch {
            return undefined // o erro aparece no formulário via salvar.error
          }
        }}
        onSalvo={() => {
          toast.success('Checklist salvo.')
          // Permanece na tela. Um cadastro novo passa a ser edição do registro criado,
          // para que o próximo Salvar atualize em vez de duplicar.
          if (!id && salvar.data) navigate(`${LISTA}/${salvar.data.id}`, { replace: true })
        }}
      />
    </>
  )
}
