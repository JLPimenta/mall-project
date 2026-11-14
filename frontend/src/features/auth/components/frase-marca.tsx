import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import elefante from '@/assets/elefante.gif'
import { cn } from '@/lib/utils'

/** Tempo para o elefante atravessar o texto (a queda de cada letra acompanha a passagem). */
const TRAVESSIA_MS = 3600
/** Depois da travessia, quanto tempo as letras ficam "no chão" antes de voltar. */
const PAUSA_MS = 1800
const LARGURA_ELEFANTE = 140

const TITULO = 'Decisões operacionais mais claras,'
const DESTAQUE = 'em tempo real.'
const SUBTITULO = 'Acompanhe chamados, tarefas, equipes e estoque do Capim Dourado Shopping.'

/** Texto quebrado em letras (aria-hidden); a frase inteira fica para leitores de tela em `sr-only`. */
function Letras({ texto }: { texto: string }) {
  const palavras = texto.split(' ')
  return (
    <span aria-hidden>
      {palavras.map((palavra, i) => (
        <span key={i}>
          <span className="inline-block whitespace-nowrap">
            {[...palavra].map((letra, j) => (
              <span key={j} data-letra className="letra-marca inline-block">
                {letra}
              </span>
            ))}
          </span>
          {i < palavras.length - 1 && ' '}
        </span>
      ))}
    </span>
  )
}

/**
 * Frase da marca no login. Easter egg: `rodada` > 0 faz o elefante atravessar o texto derrubando as letras,
 * que voltam ao lugar logo depois. Com "reduzir movimento" ativo, as letras não caem (ver index.css).
 */
export function FraseMarca({ rodada, onFim }: { rodada: number; onFim: () => void }) {
  const bloco = useRef<HTMLDivElement>(null)
  const [voltando, setVoltando] = useState(false)
  const ativo = rodada > 0

  // Cada letra cai quando a tromba do elefante passa por ela: atraso proporcional à posição horizontal.
  useLayoutEffect(() => {
    const el = bloco.current
    if (!ativo || !el) return
    const largura = el.clientWidth
    const percurso = largura + 2 * LARGURA_ELEFANTE
    el.querySelectorAll<HTMLElement>('[data-letra]').forEach((letra) => {
      const x = letra.offsetLeft + letra.offsetWidth / 2
      letra.style.setProperty('--atraso', `${Math.round(((x + LARGURA_ELEFANTE) / percurso) * TRAVESSIA_MS)}ms`)
      letra.style.setProperty('--giro', `${Math.round((Math.random() - 0.5) * 220)}deg`)
      letra.style.setProperty('--deriva', `${Math.round((Math.random() - 0.3) * 60)}px`)
    })
    el.style.setProperty('--travessia', `${TRAVESSIA_MS}ms`)
    el.style.setProperty('--percurso', `${percurso}px`)
  }, [ativo, rodada])

  useEffect(() => {
    if (!ativo) return
    const fim = setTimeout(() => {
      setVoltando(true)
      onFim()
    }, TRAVESSIA_MS + PAUSA_MS)
    return () => clearTimeout(fim)
  }, [ativo, rodada, onFim])

  useEffect(() => {
    if (!voltando) return
    const t = setTimeout(() => setVoltando(false), 800)
    return () => clearTimeout(t)
  }, [voltando])

  return (
    <div ref={bloco} data-derrubando={ativo || undefined} className={cn('relative grid max-w-xl gap-5', voltando && 'animate-in duration-700 fade-in')}>
      <p className="text-5xl leading-[1.05] font-bold tracking-tight">
        <span className="sr-only">
          {TITULO} {DESTAQUE}
        </span>
        <Letras texto={TITULO} />{' '}
        <span className="text-marca-ciano">
          <Letras texto={DESTAQUE} />
        </span>
      </p>
      <p className="max-w-md text-base text-white/85">
        <span className="sr-only">{SUBTITULO}</span>
        <Letras texto={SUBTITULO} />
      </p>
      {ativo && (
        <img
          key={rodada}
          src={elefante}
          alt="Elefante"
          width={LARGURA_ELEFANTE}
          className="elefante-marca pointer-events-none absolute top-full left-0 mt-2"
          style={{ width: LARGURA_ELEFANTE }}
        />
      )}
    </div>
  )
}
