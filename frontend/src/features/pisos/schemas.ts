import { z } from 'zod'
import { LIMITE } from './limites'
import type { Piso, PisoRequest } from './types'

export const pisoSchema = z.object({
  codigo: z.string().trim().min(1, 'Informe o código.').max(LIMITE.codigo, `Use até ${LIMITE.codigo} caracteres.`),
  nome: z.string().trim().min(1, 'Informe o nome.').max(LIMITE.nome, `Use até ${LIMITE.nome} caracteres.`),
  ordem: z
    .number({ error: 'Informe a ordem.' })
    .int('Use um número inteiro.')
    .min(LIMITE.ordem.min, `Use de ${LIMITE.ordem.min} a ${LIMITE.ordem.max}.`)
    .max(LIMITE.ordem.max, `Use de ${LIMITE.ordem.min} a ${LIMITE.ordem.max}.`),
})

export type PisoForm = z.infer<typeof pisoSchema>

export function paraFormulario(p?: Piso): PisoForm {
  return { codigo: p?.codigo ?? '', nome: p?.nome ?? '', ordem: p?.ordem ?? 0 }
}

export function paraRequisicao(form: PisoForm): PisoRequest {
  return { ...form, codigo: form.codigo.toUpperCase() }
}
