import { GlobalWorkerOptions, getDocument, type PDFDocumentProxy } from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { LIMITE } from './limites'

GlobalWorkerOptions.workerSrc = workerUrl

export class PlantaInvalida extends Error {}

/** Abre o PDF da planta no navegador (pdf.js). Nada é enviado ao servidor até salvar. */
export async function abrirPdf(arquivo: File): Promise<PDFDocumentProxy> {
  if (arquivo.type && arquivo.type !== 'application/pdf') throw new PlantaInvalida('Envie a planta em PDF.')
  if (arquivo.size > LIMITE.pdfBytes) throw new PlantaInvalida('O PDF deve ter no máximo 15 MB.')
  try {
    return await getDocument({ data: new Uint8Array(await arquivo.arrayBuffer()) }).promise
  } catch {
    throw new PlantaInvalida('Não foi possível ler o PDF.')
  }
}

export type PaginaRenderizada = { imagem: Blob; largura: number; altura: number }

/**
 * Converte uma página em imagem WebP com o lado maior em LIMITE.ladoImagem px (fundo branco: plantas
 * costumam ter transparência). Se passar do limite do servidor, tenta de novo com qualidade menor.
 */
export async function renderizarPagina(pdf: PDFDocumentProxy, numero: number): Promise<PaginaRenderizada> {
  const pagina = await pdf.getPage(numero)
  const base = pagina.getViewport({ scale: 1 })
  const escala = LIMITE.ladoImagem / Math.max(base.width, base.height)
  const viewport = pagina.getViewport({ scale: escala })
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(viewport.width)
  canvas.height = Math.round(viewport.height)
  const contexto = canvas.getContext('2d')
  if (!contexto) throw new PlantaInvalida('O navegador não conseguiu desenhar a planta.')
  contexto.fillStyle = '#fff'
  contexto.fillRect(0, 0, canvas.width, canvas.height)
  // intent 'print': a renderização avança sem requestAnimationFrame, que para com a aba em segundo plano.
  await pagina.render({ canvasContext: contexto, viewport, intent: 'print' }).promise

  for (const qualidade of [0.9, 0.75, 0.6]) {
    const imagem = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, 'image/webp', qualidade))
    if (imagem && imagem.size <= LIMITE.imagemBytes) return { imagem, largura: canvas.width, altura: canvas.height }
  }
  throw new PlantaInvalida('A planta ficou grande demais. Use um PDF mais simples ou outra página.')
}
