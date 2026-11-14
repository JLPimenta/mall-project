import type { PDFDocumentProxy } from 'pdfjs-dist'
import { ChevronRightIcon, DownloadIcon, FileUpIcon, Loader2Icon, Trash2Icon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { mensagemDeErro } from '@/lib/cadastro'
import { formatar } from '@/lib/datas'
import { urlImagemPlanta, urlPdfPlanta } from '../api'
import { usePlanta, useRemoverPlanta, useSalvarPlanta } from '../hooks'
import { LIMITE } from '../limites'
import { abrirPdf, PlantaInvalida, renderizarPagina, type PaginaRenderizada } from '../pdf'

type Rascunho = { arquivo: File; pdf: PDFDocumentProxy; pagina: number; previa: (PaginaRenderizada & { url: string }) | null }

/**
 * Planta do piso a partir de um PDF: o navegador lê o arquivo (pdf.js), mostra a página escolhida e,
 * ao salvar, envia o PDF original e a imagem da página. O PDF pode ser baixado depois.
 */
export function PlantaPiso({ pisoId, pisoNome }: { pisoId: string; pisoNome: string }) {
  const planta = usePlanta(pisoId)
  const salvar = useSalvarPlanta(pisoId)
  const remover = useRemoverPlanta(pisoId)
  const entrada = useRef<HTMLInputElement>(null)
  const [rascunho, setRascunho] = useState<Rascunho | null>(null)
  const [gerando, setGerando] = useState(false)
  const [erro, setErro] = useState<string>()
  const [removendo, setRemovendo] = useState(false)

  // Libera a imagem de prévia (object URL) ao trocar de página ou sair.
  const previaUrl = rascunho?.previa?.url
  useEffect(() => () => {
    if (previaUrl) URL.revokeObjectURL(previaUrl)
  }, [previaUrl])

  const gerarPrevia = async (base: Omit<Rascunho, 'previa'>) => {
    setGerando(true)
    setErro(undefined)
    try {
      const pagina = await renderizarPagina(base.pdf, base.pagina)
      setRascunho({ ...base, previa: { ...pagina, url: URL.createObjectURL(pagina.imagem) } })
    } catch (e) {
      setRascunho({ ...base, previa: null })
      setErro(e instanceof PlantaInvalida ? e.message : 'Não foi possível gerar a planta.')
    } finally {
      setGerando(false)
    }
  }

  const escolherArquivo = async (arquivo: File | undefined) => {
    if (entrada.current) entrada.current.value = ''
    if (!arquivo) return
    setErro(undefined)
    try {
      const pdf = await abrirPdf(arquivo)
      await gerarPrevia({ arquivo, pdf, pagina: 1 })
    } catch (e) {
      setErro(e instanceof PlantaInvalida ? e.message : 'Não foi possível ler o PDF.')
    }
  }

  const salvarRascunho = () => {
    if (!rascunho?.previa) return
    const { imagem, largura, altura } = rascunho.previa
    salvar.mutate(
      { pdf: rascunho.arquivo, imagem, dados: { pagina: rascunho.pagina, largura, altura } },
      {
        onSuccess: () => {
          setRascunho(null)
          toast.success('Planta salva.')
        },
        onError: (e) => setErro(mensagemDeErro(e, 'Não foi possível salvar a planta.')),
      },
    )
  }

  const atual = planta.data
  const paginas = rascunho ? Math.min(rascunho.pdf.numPages, LIMITE.paginas) : 0

  return (
    <section aria-labelledby="planta-titulo" className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="planta-titulo" className="text-lg font-semibold">
          Planta
        </h2>
        <div className="flex flex-wrap gap-2">
          {atual && !rascunho && (
            <>
              <Button asChild variant="outline" size="sm">
                <a href={urlPdfPlanta(pisoId)} download={atual.nomeArquivo}>
                  <DownloadIcon aria-hidden /> Baixar PDF
                </a>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setRemovendo(true)}>
                <Trash2Icon aria-hidden /> Remover
              </Button>
            </>
          )}
          {!rascunho && (
            <Button variant={atual ? 'outline' : 'default'} size="sm" onClick={() => entrada.current?.click()}>
              <FileUpIcon aria-hidden /> {atual ? 'Trocar planta' : 'Enviar planta (PDF)'}
            </Button>
          )}
          <input
            ref={entrada}
            type="file"
            accept="application/pdf"
            className="sr-only"
            tabIndex={-1}
            aria-label="Arquivo PDF da planta"
            onChange={(e) => escolherArquivo(e.target.files?.[0])}
          />
        </div>
      </div>

      {erro && (
        <p className="text-sm text-destructive" role="alert">
          {erro}
        </p>
      )}

      {rascunho ? (
        <div className="grid gap-3 rounded-lg border p-3">
          <div className="flex flex-wrap items-end gap-3">
            <p className="min-w-0 flex-1 truncate text-sm" title={rascunho.arquivo.name}>
              {rascunho.arquivo.name}
            </p>
            {paginas > 1 && (
              <div className="grid gap-1.5">
                <Label htmlFor="planta-pagina" className="text-xs text-muted-foreground">
                  Página
                </Label>
                <Select
                  value={String(rascunho.pagina)}
                  onValueChange={(v) => gerarPrevia({ arquivo: rascunho.arquivo, pdf: rascunho.pdf, pagina: Number(v) })}
                >
                  <SelectTrigger id="planta-pagina" className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: paginas }, (_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>
                        {i + 1} de {paginas}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button variant="outline" onClick={() => setRascunho(null)} disabled={salvar.isPending}>
              Cancelar
            </Button>
            <Button onClick={salvarRascunho} disabled={!rascunho.previa || gerando || salvar.isPending}>
              {salvar.isPending && <Loader2Icon className="animate-spin" aria-hidden />}
              Salvar planta
            </Button>
          </div>
          {gerando ? (
            <Skeleton className="aspect-[3/2] w-full" />
          ) : (
            rascunho.previa && <img src={rascunho.previa.url} alt={`Prévia da página ${rascunho.pagina} da planta`} className="w-full rounded-md border bg-white" />
          )}
        </div>
      ) : planta.isPending ? (
        <Skeleton className="aspect-[3/2] w-full" />
      ) : atual ? (
        // Recolhida por padrão: a planta já aparece no editor de posições logo abaixo.
        <details className="group rounded-lg border">
          <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-sm hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none [&::-webkit-details-marker]:hidden">
            <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" aria-hidden />
            <span className="font-medium">Ver planta</span>
            <span className="min-w-0 truncate text-xs text-muted-foreground" title={atual.nomeArquivo}>
              {atual.nomeArquivo} · página {atual.pagina}
              {atual.atualizadaEm && ` · ${formatar.data(atual.atualizadaEm)}`}
            </span>
          </summary>
          <div className="border-t p-3">
            <img src={urlImagemPlanta(pisoId, atual.atualizadaEm)} alt={`Planta do ${pisoNome}`} loading="lazy" className="w-full rounded-md border bg-white" />
          </div>
        </details>
      ) : (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">Sem planta. Envie o PDF da planta do piso.</p>
      )}

      <ConfirmDialog
        open={removendo}
        onOpenChange={setRemovendo}
        title="Remover a planta?"
        description="As posições dos marcadores ficam guardadas para a próxima planta."
        confirmLabel="Remover"
        destructive
        onConfirm={() =>
          remover.mutate(undefined, {
            onSuccess: () => toast.success('Planta removida.'),
            onError: (e) => toast.error(mensagemDeErro(e, 'Não foi possível remover a planta.')),
          })
        }
      />
    </section>
  )
}
