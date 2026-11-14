import { api, type Page } from '@/lib/api'
import type { MapaPiso, MarcadorRequest, Marcadores, Piso, PisoRequest, Planta, PontoMarcavel } from './types'

export const pisosApi = {
  listar: () => api.get<Page<Piso>>('/piso', { sort: 'ordem', size: 50 }).then((page) => page.content),
  buscar: (id: string) => api.get<Piso>(`/piso/${id}`),
  criar: (dados: PisoRequest) => api.post<Piso>('/piso', dados),
  atualizar: (id: string, dados: PisoRequest) => api.put<Piso>(`/piso/${id}`, dados),
  excluir: (id: string) => api.delete(`/piso/${id}`),

  /** null quando o piso ainda não tem planta (404). */
  planta: (id: string) =>
    api.get<Planta>(`/piso/${id}/planta`).catch((e: { status?: number }) => {
      if (e?.status === 404) return null
      throw e
    }),
  salvarPlanta: (id: string, pdf: File, imagem: Blob, dados: { pagina: number; largura: number; altura: number }) => {
    const formulario = new FormData()
    formulario.append('dados', new Blob([JSON.stringify(dados)], { type: 'application/json' }))
    formulario.append('pdf', pdf, pdf.name)
    formulario.append('imagem', imagem, 'planta.webp')
    return api.put<Planta>(`/piso/${id}/planta`, formulario)
  },
  removerPlanta: (id: string) => api.delete(`/piso/${id}/planta`),
  marcadores: (id: string) => api.get<Marcadores>(`/piso/${id}/marcadores`),
  salvarMarcadores: (id: string, marcadores: MarcadorRequest[]) => api.put<Marcadores>(`/piso/${id}/marcadores`, { marcadores }),
  criarLocal: (id: string, nome: string) => api.post<PontoMarcavel>(`/piso/${id}/locais`, { nome }),
  mapa: (id: string) => api.get<MapaPiso>(`/piso/${id}/mapa`),
}

/** Mesma origem: o cookie de sessão vai junto. A versão evita a imagem antiga em cache depois de trocar a planta. */
export function urlImagemPlanta(pisoId: string, versao?: string | null) {
  return `/api/piso/${pisoId}/planta/imagem${versao ? `?v=${encodeURIComponent(versao)}` : ''}`
}

export function urlPdfPlanta(pisoId: string) {
  return `/api/piso/${pisoId}/planta/pdf`
}
