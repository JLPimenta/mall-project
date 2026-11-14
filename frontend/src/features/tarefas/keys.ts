import type { QueryClient } from '@tanstack/react-query'
import type { FiltroTarefas } from './types'

export const tarefaKeys = {
  all: ['tarefas'] as const,
  filtro: (filtro: FiltroTarefas) => ['tarefas', filtro] as const,
  resumo: ['tarefas-resumo'] as const,
}

export const programadaKeys = {
  all: ['manutencoes-programadas'] as const,
  detalhe: (id: string) => ['manutencoes-programadas', id] as const,
}

/**
 * Manutenções programadas geram tarefas: mudar uma afeta a outra (próxima data, agenda, indicadores).
 * Toda mutação de qualquer das duas recarrega ambas.
 */
export function invalidarTarefasEProgramadas(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: programadaKeys.all, exact: true }),
    queryClient.invalidateQueries({ queryKey: tarefaKeys.all }),
    queryClient.invalidateQueries({ queryKey: tarefaKeys.resumo }),
  ])
}
