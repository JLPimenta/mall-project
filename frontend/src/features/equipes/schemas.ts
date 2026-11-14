import { z } from 'zod'
import { LIMITE } from './limites'
import type { Equipe, EquipeRequest } from './types'

export const equipeSchema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome.').max(LIMITE.nome, `Use até ${LIMITE.nome} caracteres.`),
  membrosIds: z.array(z.string()).max(LIMITE.membros, `Use até ${LIMITE.membros} membros.`),
})

export type EquipeForm = z.infer<typeof equipeSchema>

export function paraFormulario(e?: Equipe): EquipeForm {
  // Ordenado para que a ordem de marcação não conte como alteração.
  return { nome: e?.nome ?? '', membrosIds: (e?.membros ?? []).map((m) => m.id).sort() }
}

export function paraRequisicao(form: EquipeForm): EquipeRequest {
  return { nome: form.nome, membrosIds: form.membrosIds }
}
