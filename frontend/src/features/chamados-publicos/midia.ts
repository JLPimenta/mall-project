import { LIMITE_CHAMADO_PUBLICO as LIMITE } from './limites'

const FORMATOS = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime']

/** Mesmas regras do backend (ChamadoService.validarMidia): foto até 5 MB, vídeo até 20 MB. */
export function erroDaMidia(arquivo: File): string | null {
  if (arquivo.type && !FORMATOS.includes(arquivo.type)) return 'Use foto JPG, PNG ou WebP, ou vídeo MP4 ou MOV.'
  const video = arquivo.type.startsWith('video/') || /\.(mp4|mov)$/i.test(arquivo.name)
  if (arquivo.size > (video ? LIMITE.videoBytes : LIMITE.imagemBytes)) {
    return video ? 'O vídeo deve ter no máximo 20 MB.' : 'A foto deve ter no máximo 5 MB.'
  }
  return null
}
