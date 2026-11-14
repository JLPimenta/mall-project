import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { pisosApi } from './api'
import type { MarcadorRequest, Marcadores, PisoRequest } from './types'

export const pisoKeys = {
  all: ['pisos'] as const,
  detalhe: (id: string) => ['pisos', id] as const,
  planta: (id: string) => ['pisos', id, 'planta'] as const,
  marcadores: (id: string) => ['pisos', id, 'marcadores'] as const,
  mapa: (id: string) => ['pisos', id, 'mapa'] as const,
}

export function usePisos() {
  return useQuery({ queryKey: pisoKeys.all, queryFn: pisosApi.listar })
}

export function usePiso(id: string | undefined) {
  return useQuery({ queryKey: pisoKeys.detalhe(id ?? ''), queryFn: () => pisosApi.buscar(id!), enabled: !!id })
}

export function useSalvarPiso(id: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dados: PisoRequest) => (id ? pisosApi.atualizar(id, dados) : pisosApi.criar(dados)),
    onSuccess: (salvo) => {
      queryClient.setQueryData(pisoKeys.detalhe(salvo.id), salvo)
      return queryClient.invalidateQueries({ queryKey: pisoKeys.all, exact: true })
    },
  })
}

export function useExcluirPiso() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: pisosApi.excluir, onSuccess: () => queryClient.invalidateQueries({ queryKey: pisoKeys.all }) })
}

export function usePlanta(pisoId: string) {
  return useQuery({ queryKey: pisoKeys.planta(pisoId), queryFn: () => pisosApi.planta(pisoId) })
}

/** Planta e marcadores mudam a visão do piso na Central: recarrega os três. */
function useInvalidarPiso(pisoId: string) {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: pisoKeys.planta(pisoId) }),
      queryClient.invalidateQueries({ queryKey: pisoKeys.marcadores(pisoId) }),
      queryClient.invalidateQueries({ queryKey: pisoKeys.mapa(pisoId) }),
    ])
}

export function useSalvarPlanta(pisoId: string) {
  const invalidar = useInvalidarPiso(pisoId)
  return useMutation({
    mutationFn: ({ pdf, imagem, dados }: { pdf: File; imagem: Blob; dados: { pagina: number; largura: number; altura: number } }) =>
      pisosApi.salvarPlanta(pisoId, pdf, imagem, dados),
    onSuccess: invalidar,
  })
}

export function useRemoverPlanta(pisoId: string) {
  const invalidar = useInvalidarPiso(pisoId)
  return useMutation({ mutationFn: () => pisosApi.removerPlanta(pisoId), onSuccess: invalidar })
}

export function useMarcadores(pisoId: string) {
  return useQuery({ queryKey: pisoKeys.marcadores(pisoId), queryFn: () => pisosApi.marcadores(pisoId) })
}

export function useSalvarMarcadores(pisoId: string) {
  const queryClient = useQueryClient()
  const invalidar = useInvalidarPiso(pisoId)
  return useMutation({
    mutationFn: (marcadores: MarcadorRequest[]) => pisosApi.salvarMarcadores(pisoId, marcadores),
    onSuccess: (salvos) => {
      queryClient.setQueryData(pisoKeys.marcadores(pisoId), salvos)
      return invalidar()
    },
  })
}

export function useMapaPiso(pisoId: string | undefined) {
  return useQuery({ queryKey: pisoKeys.mapa(pisoId ?? ''), queryFn: () => pisosApi.mapa(pisoId!), enabled: !!pisoId, refetchInterval: 60_000 })
}

/** Novo local de QR Code no piso: entra na lista do editor (ainda sem posição). */
export function useCriarLocal(pisoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (nome: string) => pisosApi.criarLocal(pisoId, nome),
    onSuccess: (local) =>
      queryClient.setQueryData<Marcadores>(pisoKeys.marcadores(pisoId), (atual) => (atual ? { ...atual, locais: [...atual.locais, local] } : atual)),
  })
}
