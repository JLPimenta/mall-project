import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { equipesApi } from './api'
import type { EquipeRequest } from './types'

export const equipeKeys = {
  all: ['equipes'] as const,
  detalhe: (id: string) => ['equipes', id] as const,
  funcionarios: ['funcionarios'] as const,
}

export function useEquipes(habilitado = true) {
  return useQuery({ queryKey: equipeKeys.all, queryFn: equipesApi.listar, enabled: habilitado })
}

export function useEquipe(id: string | undefined) {
  return useQuery({ queryKey: equipeKeys.detalhe(id ?? ''), queryFn: () => equipesApi.buscar(id!), enabled: !!id })
}

export function useFuncionarios() {
  return useQuery({ queryKey: equipeKeys.funcionarios, queryFn: equipesApi.funcionarios })
}

export function useSalvarEquipe(id: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dados: EquipeRequest) => (id ? equipesApi.atualizar(id, dados) : equipesApi.criar(dados)),
    onSuccess: (salva) => {
      queryClient.setQueryData(equipeKeys.detalhe(salva.id), salva)
      return queryClient.invalidateQueries({ queryKey: equipeKeys.all, exact: true })
    },
  })
}

export function useExcluirEquipe() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: equipesApi.excluir,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: equipeKeys.all }),
  })
}
