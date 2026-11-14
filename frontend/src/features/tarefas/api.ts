import { api } from '@/lib/api'
import type { FiltroTarefas, ResumoTarefas, Tarefa } from './types'

export const tarefasApi = {
  listar: (filtro: FiltroTarefas) => api.get<Tarefa[]>('/tarefa', filtro),
  resumo: () => api.get<ResumoTarefas>('/tarefa/resumo'),
  cancelar: (id: string) => api.post<Tarefa>(`/tarefa/${id}/cancelar`),
  restaurar: (id: string) => api.post<Tarefa>(`/tarefa/${id}/restaurar`),
}
