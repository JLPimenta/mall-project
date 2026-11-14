import { CameraIcon, ImagesIcon, XIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { erroDaMidia } from '../midia'
import { CapturaCamera } from './captura-camera'

type CampoMidiaProps = {
  id: string
  midia: File | null
  erro: string | null
  /** Arquivo válido (ou null ao remover) e a mensagem de erro, se o arquivo foi recusado. */
  onChange: (midia: File | null, erro: string | null) => void
}

/** "Foto ou vídeo (opcional)" do chamado: câmera ou arquivo. Usado no relato público e no "Abrir chamado" interno. */
export function CampoMidia({ id, midia, erro, onChange }: CampoMidiaProps) {
  const galeria = useRef<HTMLInputElement>(null)
  const [cameraAberta, setCameraAberta] = useState(false)

  const selecionar = (arquivo: File | null) => {
    if (galeria.current) galeria.current.value = ''
    if (!arquivo) return onChange(null, null)
    const problema = erroDaMidia(arquivo)
    onChange(problema ? null : arquivo, problema)
  }

  return (
    // min-w-0: item de grade não encolhe por padrão; sem isso, um nome de arquivo longo estica o formulário.
    <Field data-invalid={!!erro} className="min-w-0">
      <FieldLabel htmlFor={id}>Foto ou vídeo (opcional)</FieldLabel>
      <input ref={galeria} id={id} type="file" accept="image/*,video/*" className="sr-only" onChange={(e) => selecionar(e.target.files?.[0] ?? null)} />
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => setCameraAberta(true)}>
          <CameraIcon aria-hidden /> Abrir câmera
        </Button>
        <Button type="button" variant="outline" onClick={() => galeria.current?.click()}>
          <ImagesIcon aria-hidden /> Escolher arquivo
        </Button>
      </div>
      {midia && (
        <div className="flex min-w-0 items-center justify-between gap-2 rounded-md bg-muted px-3 py-2 text-sm">
          <span className="min-w-0 truncate" title={midia.name}>{midia.name}</span>
          <Button type="button" size="icon-sm" variant="ghost" aria-label="Remover mídia" onClick={() => selecionar(null)}>
            <XIcon aria-hidden />
          </Button>
        </div>
      )}
      {erro && (
        <p className="text-sm text-destructive" role="alert">
          {erro}
        </p>
      )}
      {cameraAberta && <CapturaCamera onFechar={() => setCameraAberta(false)} onCapturar={selecionar} />}
    </Field>
  )
}
