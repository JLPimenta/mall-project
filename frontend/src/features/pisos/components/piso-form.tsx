import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { CadastroForm } from '@/components/shared/cadastro-form'
import { LimitedInput } from '@/components/shared/limited-input'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { LIMITE } from '../limites'
import { pisoSchema, type PisoForm as Valores } from '../schemas'

type PisoFormProps = {
  defaultValues: Valores
  salvando: boolean
  erro?: string
  onSubmit: (dados: Valores) => Promise<Valores | undefined>
  onSalvo: () => void
  onCancel: () => void
}

export function PisoForm({ defaultValues, ...acoes }: PisoFormProps) {
  const form = useForm<Valores>({ resolver: zodResolver(pisoSchema), defaultValues })
  const { errors } = form.formState
  const [codigo, nome] = useWatch({ control: form.control, name: ['codigo', 'nome'] })

  return (
    <CadastroForm form={form} rotulo="Piso" className="max-w-3xl" {...acoes}>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)_minmax(0,8rem)]">
        <Field data-invalid={!!errors.codigo} className="gap-1.5">
          <FieldLabel htmlFor="piso-codigo">Código</FieldLabel>
          <LimitedInput
            id="piso-codigo"
            required
            maxLength={LIMITE.codigo}
            length={codigo?.length ?? 0}
            className="uppercase"
            autoCapitalize="characters"
            aria-invalid={!!errors.codigo}
            {...form.register('codigo')}
          />
          <FieldError errors={[errors.codigo]} />
        </Field>
        <Field data-invalid={!!errors.nome} className="gap-1.5">
          <FieldLabel htmlFor="piso-nome">Nome</FieldLabel>
          <LimitedInput id="piso-nome" required maxLength={LIMITE.nome} length={nome?.length ?? 0} counter="always" aria-invalid={!!errors.nome} {...form.register('nome')} />
          <FieldError errors={[errors.nome]} />
        </Field>
        <Field data-invalid={!!errors.ordem} className="gap-1.5">
          <FieldLabel htmlFor="piso-ordem">Ordem</FieldLabel>
          <Input
            id="piso-ordem"
            type="number"
            inputMode="numeric"
            required
            min={LIMITE.ordem.min}
            max={LIMITE.ordem.max}
            className="tabular-nums"
            aria-invalid={!!errors.ordem}
            {...form.register('ordem', { valueAsNumber: true })}
          />
          <FieldError errors={[errors.ordem]} />
        </Field>
      </div>
    </CadastroForm>
  )
}
