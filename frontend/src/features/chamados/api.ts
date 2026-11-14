import { api, type Page } from '@/lib/api'
import type { AbrirChamadoRequest, AprovarChamadoRequest, ArquivarChamadoRequest, Chamado, ChamadoAberto, StatusChamado } from './types'

export const chamadosApi = {
  listar: (page: number, status?: StatusChamado) => api.get<Page<Chamado>>('/chamado', { page, size: 20, ...(status ? { status } : {}) }),
  buscar: (id: string) => api.get<Chamado>(`/chamado/${id}`),
  abrir: (dados: AbrirChamadoRequest, midia: File | null) => {
    const formulario = new FormData()
    formulario.append('dados', new Blob([JSON.stringify(dados)], { type: 'application/json' }))
    if (midia) formulario.append('midia', midia, midia.name)
    return api.upload<ChamadoAberto>('/chamado', formulario)
  },
  aprovar: (id: string, dados: AprovarChamadoRequest) => api.post<Chamado>(`/chamado/${id}/aprovar`, dados),
  arquivar: (id: string, dados: ArquivarChamadoRequest) => api.post<Chamado>(`/chamado/${id}/arquivar`, dados),
}
