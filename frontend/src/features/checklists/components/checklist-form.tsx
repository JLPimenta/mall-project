import { zodResolver } from '@hookform/resolvers/zod'
import { CircleAlertIcon } from 'lucide-react'
import { useEffect, useEffectEvent, useState } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { FormActions } from '@/components/shared/form-actions'
import { LimitedInput } from '@/components/shared/limited-input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { LIMITE } from '../limites'
import { checklistSchema, type ChecklistForm as ChecklistFormValues } from '../schemas'
import { ChecklistItensEditor } from './checklist-itens-editor'

type ChecklistFormProps = {
  defaultValues: ChecklistFormValues
  salvando: boolean
  erro?: string
  /** Persiste e retorna os valores salvos; undefined se falhar (o erro vem em `erro`). */
  onSubmit: (dados: ChecklistFormValues) => Promise<ChecklistFormValues | undefined>
  /** Chamado depois que o formulário assumiu os valores salvos (mensagem de sucesso, troca de rota). */
  onSalvo: () => void
  onCancel: () => void
}

export function ChecklistForm({ defaultValues, salvando, erro, onSubmit, onSalvo, onCancel }: ChecklistFormProps) {
  const form = useForm<ChecklistFormValues>({ resolver: zodResolver(checklistSchema), defaultValues })
  const erroNome = form.formState.errors.nome
  const nome = useWatch({ control: form.control, name: 'nome' })

  const [salvos, setSalvos] = useState<ChecklistFormValues>()

  const enviar = form.handleSubmit(async (dados) => {
    const resultado = await onSubmit(dados)
    if (resultado) setSalvos(resultado)
  })

  // Permanece na tela: os valores salvos viram a nova base, e Cancelar não pede confirmação.
  // O reset fica fora do handleSubmit porque o RHF sobrescreve o estado ao concluir o envio.
  // A mensagem de sucesso só sai depois do reset, para nunca haver "salvo" com alteração pendente.
  const avisarSalvo = useEffectEvent(onSalvo)
  useEffect(() => {
    if (!salvos) return
    form.reset(salvos)
    avisarSalvo()
  }, [salvos, form])

  return (
    <FormProvider {...form}>
      {/* data-alterado: estado de alterações pendentes, usado pelos testes E2E para sincronizar. */}
      <form onSubmit={enviar} className="grid max-w-6xl gap-6" aria-label="Checklist" data-alterado={form.formState.isDirty}>
        {erro && (
          <Alert variant="destructive">
            <CircleAlertIcon aria-hidden />
            <AlertDescription>{erro}</AlertDescription>
          </Alert>
        )}

        <Field data-invalid={!!erroNome} className="max-w-xl">
          <FieldLabel htmlFor="checklist-nome">Nome</FieldLabel>
          <LimitedInput
            id="checklist-nome"
            required
            maxLength={LIMITE.nome}
            length={nome?.length ?? 0}
            counter="always"
            enterKeyHint="next"
            aria-invalid={!!erroNome}
            {...form.register('nome')}
            // Enter no nome leva à primeira pergunta em vez de enviar o formulário.
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                e.preventDefault()
                form.setFocus('itens.0.pergunta')
              }
            }}
          />
          <FieldError errors={[erroNome]} />
        </Field>

        <ChecklistItensEditor />

        <FormActions alterado={form.formState.isDirty} salvando={salvando} onCancel={onCancel} />
      </form>
    </FormProvider>
  )
}
