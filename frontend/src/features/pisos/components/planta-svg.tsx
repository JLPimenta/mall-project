import type { KeyboardEvent, MouseEvent, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { urlImagemPlanta } from '../api'
import type { Planta, Posicao } from '../types'

type PlantaSvgProps = {
  pisoId: string
  planta: Planta
  /** Nome acessível do grupo (ex.: "Planta do Piso L2"). */
  rotulo: string
  /** Clique em ponto vazio da planta (editor): posição relativa (0 a 1). */
  onClicar?: (posicao: Posicao) => void
  className?: string
  children: ReactNode
}

/**
 * Planta do piso em SVG inline: a imagem gerada do PDF ao fundo e os marcadores por cima.
 * O viewBox usa o tamanho da imagem, então posições relativas (x, y de 0 a 1) viram x * largura, y * altura.
 */
export function PlantaSvg({ pisoId, planta, rotulo, onClicar, className, children }: PlantaSvgProps) {
  const clicar = (e: MouseEvent<SVGSVGElement>) => {
    if (!onClicar || (e.target as Element).closest('[data-marcador]')) return
    const caixa = e.currentTarget.getBoundingClientRect()
    onClicar({
      x: Math.min(1, Math.max(0, (e.clientX - caixa.left) / caixa.width)),
      y: Math.min(1, Math.max(0, (e.clientY - caixa.top) / caixa.height)),
    })
  }

  return (
    <svg
      viewBox={`0 0 ${planta.largura} ${planta.altura}`}
      role="group"
      aria-label={rotulo}
      className={cn('block h-auto w-full rounded-md border bg-white', onClicar && 'cursor-crosshair', className)}
      onClick={clicar}
    >
      <image href={urlImagemPlanta(pisoId, planta.atualizadaEm)} width={planta.largura} height={planta.altura} aria-hidden />
      {children}
    </svg>
  )
}

type MarcadorSvgProps = {
  planta: Planta
  posicao: Posicao
  /** Nome acessível: o que é e o estado (ex.: "ELV-E1 · Elevador E1, atenção, 1 tarefa hoje"). */
  rotulo: string
  /** Classe de preenchimento (preenchimentoDoTom). */
  preenchimento: string
  forma?: 'circulo' | 'losango'
  selecionado?: boolean
  /** Número pequeno no canto (ex.: tarefas do dia). */
  contador?: number
  texto?: string
  onSelecionar?: () => void
  onTeclado?: (e: KeyboardEvent<SVGGElement>) => void
}

/** Marcador focável e operável pelo teclado (Enter/Espaço selecionam), com tamanho relativo à planta. */
export function MarcadorSvg({ planta, posicao, rotulo, preenchimento, forma = 'circulo', selecionado, contador, texto, onSelecionar, onTeclado }: MarcadorSvgProps) {
  const r = Math.max(planta.largura, planta.altura) * 0.011
  const cx = posicao.x * planta.largura
  const cy = posicao.y * planta.altura

  const teclar = (e: KeyboardEvent<SVGGElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelecionar?.()
      return
    }
    onTeclado?.(e)
  }

  return (
    <g
      data-marcador
      role="button"
      tabIndex={0}
      aria-label={rotulo}
      aria-pressed={selecionado}
      className="cursor-pointer outline-none [&:focus-visible>.foco]:opacity-100"
      onClick={(e) => {
        e.stopPropagation()
        onSelecionar?.()
      }}
      onKeyDown={teclar}
    >
      <title>{rotulo}</title>
      <circle className={cn('foco fill-none stroke-ring opacity-0', selecionado && 'opacity-100')} cx={cx} cy={cy} r={r * 1.7} strokeWidth={r * 0.35} />
      {forma === 'losango' ? (
        <rect
          x={cx - r}
          y={cy - r}
          width={r * 2}
          height={r * 2}
          transform={`rotate(45 ${cx} ${cy})`}
          className={cn(preenchimento, 'stroke-background')}
          strokeWidth={r * 0.25}
        />
      ) : (
        <circle cx={cx} cy={cy} r={r} className={cn(preenchimento, 'stroke-background')} strokeWidth={r * 0.25} />
      )}
      {texto && (
        <text x={cx} y={cy + r * 2.4} textAnchor="middle" fontSize={r * 1.1} className="fill-foreground font-semibold [paint-order:stroke] stroke-background" strokeWidth={r * 0.3}>
          {texto}
        </text>
      )}
      {!!contador && (
        <g aria-hidden>
          <circle cx={cx + r * 0.9} cy={cy - r * 0.9} r={r * 0.75} className="fill-andamento stroke-background" strokeWidth={r * 0.15} />
          <text x={cx + r * 0.9} y={cy - r * 0.9} dy="0.35em" textAnchor="middle" fontSize={r * 0.95} className="fill-white font-bold">
            {contador}
          </text>
        </g>
      )}
    </g>
  )
}
