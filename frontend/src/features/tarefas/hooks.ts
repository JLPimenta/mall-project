import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tarefasApi } from './api'
import { invalidarTarefasEProgramadas, tarefaKeys } from './keys'
import type { FiltroTarefas } from './types'

export function useTarefas(filtro: FiltroTarefas, habilitado = true) {
  return useQuery({
    queryKey: tarefaKeys.filtro(filtro),
    queryFn: () => tarefasApi.listar(filtro),
    enabled: habilitado,
    placeholderData: (anterior) => anterior,
  })
}

export function useResumoTarefas() {
  return useQuery({ queryKey: tarefaKeys.resumo, queryFn: tarefasApi.resumo })
}

export function useCancelarTarefa() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: tarefasApi.cancelar, onSuccess: () => invalidarTarefasEProgramadas(queryClient) })
}

export function useRestaurarTarefa() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: tarefasApi.restaurar, onSuccess: () => invalidarTarefasEProgramadas(queryClient) })
}
