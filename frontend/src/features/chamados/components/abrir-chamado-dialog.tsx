import { Loader2Icon } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { LimitedInput } from '@/components/shared/limited-input'
import { LimitedTextarea } from '@/components/shared/limited-textarea'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { CampoMidia } from '@/features/chamados-publicos/components/campo-midia'
import { mensagemDeErro } from '@/lib/cadastro'
import { LIMITE_CHAMADO } from '../limites'

export type DadosAbertura = { localInformado: string; descricao: string; midia: File | null }

type AbrirChamadoDialogProps = {
  open: boolean
  onOpenChange: (aberto: boolean) => void
  /** Local fixo (vem da tarefa): mostrado, não editável. Ausente: o usuário informa. */
  localFixo?: string
  descricaoInicial?: string
  /** Mostra "Foto ou vídeo (opcional)", como no relato público. */
  comMidia?: boolean
  /** Abre o chamado; o erro aparece no diálogo, que continua aberto com o que foi preenchido. */
  onAbrir: (dados: DadosAbertura) => Promise<unknown>
}

/**
 * Abertura de chamado por usuário logado, com os campos do relato público (Local, O que aconteceu?,
 * Foto ou vídeo), sem o contato: quem abre já é identificado. Segue a triagem e a decisão da gestão.
 */
export function AbrirChamadoDialog({ open, onOpenChange, localFixo, descricaoInicial = '', comMidia, onAbrir }: AbrirChamadoDialogProps) {
  const [local, setLocal] = useState('')
  const [descricao, setDescricao] = useState(descricaoInicial)
  const [midia, setMidia] = useState<File | null>(null)
  const [erroMidia, setErroMidia] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string>()

  const mudarAberto = (aberto: boolean) => {
    if (aberto) {
      setLocal('')
      setDescricao(descricaoInicial)
      setMidia(null)
      setErroMidia(null)
      setErro(undefined)
    }
    onOpenChange(aberto)
  }

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    if (erroMidia) return
    setEnviando(true)
    setErro(undefined)
    try {
      await onAbrir({ localInformado: (localFixo ?? local).trim(), descricao: descricao.trim(), midia })
      onOpenChange(false)
    } catch (falha) {
      setErro(mensagemDeErro(falha, 'Não foi possível abrir o chamado.'))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={mudarAberto}>
      <AlertDialogContent className="sm:max-w-lg">
        <form onSubmit={enviar} className="grid grid-cols-1 gap-4" aria-label="Abrir chamado" aria-busy={enviando}>
          <AlertDialogHeader>
            <AlertDialogTitle>Abrir chamado</AlertDialogTitle>
            <AlertDialogDescription>O chamado vai para a triagem da supervisão.</AlertDialogDescription>
          </AlertDialogHeader>
          {localFixo ? (
            <p className="text-sm">
              <span className="text-muted-foreground">Local: </span>
              {localFixo}
            </p>
          ) : (
            <Field className="gap-1.5">
              <FieldLabel htmlFor="chamado-local">Local</FieldLabel>
              <LimitedInput
                id="chamado-local"
                required
                maxLength={LIMITE_CHAMADO.localInformado}
                length={local.length}
                value={local}
                onChange={(e) => setLocal(e.target.value)}
              />
            </Field>
          )}
          <Field className="gap-1.5">
            <FieldLabel htmlFor="chamado-descricao">O que aconteceu?</FieldLabel>
            <LimitedTextarea
              id="chamado-descricao"
              required
              rows={4}
              maxLength={LIMITE_CHAMADO.descricao}
              length={descricao.length}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </Field>
          {comMidia && (
            <CampoMidia
              id="chamado-midia"
              midia={midia}
              erro={erroMidia}
              onChange={(arquivo, problema) => {
                setMidia(arquivo)
                setErroMidia(problema)
              }}
            />
          )}
          {erro && (
            <p className="text-sm text-destructive" role="alert">
              {erro}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancelar</AlertDialogCancel>
            <Button type="submit" disabled={enviando || !!erroMidia}>
              {enviando && <Loader2Icon className="animate-spin" aria-hidden />}
              Abrir chamado
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
