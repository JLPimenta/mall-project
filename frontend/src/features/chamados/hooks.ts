import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { chamadosApi } from './api'
import type { AbrirChamadoRequest, AprovarChamadoRequest, ArquivarChamadoRequest, StatusChamado } from './types'

export const chamadoKeys = {
  all: ['chamados'] as const,
  lista: (page: number, status?: StatusChamado) => ['chamados', 'lista', page, status ?? 'todos'] as const,
  detalhe: (id: string) => ['chamados', 'detalhe', id] as const,
}

export function useChamados(page: number, status?: StatusChamado) {
  return useQuery({ queryKey: chamadoKeys.lista(page, status), queryFn: () => chamadosApi.listar(page, status) })
}

export function useChamado(id: string | undefined) {
  return useQuery({ queryKey: chamadoKeys.detalhe(id ?? ''), queryFn: () => chamadosApi.buscar(id!), enabled: !!id })
}

export function useAprovarChamado(id: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (dados: AprovarChamadoRequest) => chamadosApi.aprovar(id, dados),
    onSuccess: (chamado) => {
      client.setQueryData(chamadoKeys.detalhe(id), chamado)
      return client.invalidateQueries({ queryKey: chamadoKeys.all })
    },
  })
}

export function useArquivarChamado(id: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (dados: ArquivarChamadoRequest) => chamadosApi.arquivar(id, dados),
    onSuccess: (chamado) => {
      client.setQueryData(chamadoKeys.detalhe(id), chamado)
      return client.invalidateQueries({ queryKey: chamadoKeys.all })
    },
  })
}

/** Qualquer perfil abre chamado; ele entra na fila de triagem (Chamados). */
export function useAbrirChamado() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ dados, midia }: { dados: AbrirChamadoRequest; midia: File | null }) => chamadosApi.abrir(dados, midia),
    onSuccess: () => client.invalidateQueries({ queryKey: chamadoKeys.all }),
  })
}
