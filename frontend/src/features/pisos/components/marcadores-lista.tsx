import { CheckIcon, CircleDashedIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { chave } from '../marcadores'
import type { Posicao, PontoMarcavel, TipoMarcador } from '../types'

type MarcadoresListaProps = {
  titulo: string
  tipo: TipoMarcador
  itens: PontoMarcavel[]
  posicoes: Map<string, Posicao>
  selecionado: string | null
  onSelecionar: (chave: string) => void
}

/** Lista de um tipo de marcador: escolher o item e clicar na planta para posicioná-lo. */
export function MarcadoresLista({ titulo, tipo, itens, posicoes, selecionado, onSelecionar }: MarcadoresListaProps) {
  const posicionados = itens.filter((i) => posicoes.has(chave(tipo, i.id))).length
  return (
    <section aria-label={titulo} className="grid gap-1.5">
      <h3 className="text-sm font-medium">
        {titulo}{' '}
        <span className="text-xs font-normal text-muted-foreground tabular-nums">
          {posicionados}/{itens.length}
        </span>
      </h3>
      {itens.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nenhum neste piso.</p>
      ) : (
        <ul className="grid gap-1">
          {itens.map((item) => {
            const k = chave(tipo, item.id)
            const marcado = posicoes.has(k)
            return (
              <li key={item.id}>
                <button
                  type="button"
                  aria-pressed={selecionado === k}
                  onClick={() => onSelecionar(k)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md border px-2 py-1.5 text-left text-sm hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                    selecionado === k && 'border-primary bg-primary/10',
                  )}
                >
                  {marcado ? (
                    <CheckIcon className="size-4 shrink-0 text-success" aria-hidden />
                  ) : (
                    <CircleDashedIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  )}
                  <span className="min-w-0 flex-1 truncate">
                    <span className="font-mono text-xs">{item.codigo}</span> · {item.nome}
                  </span>
                  <span className="sr-only">{marcado ? ', posicionado' : ', sem posição'}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
