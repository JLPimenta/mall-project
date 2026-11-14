import { Logo } from '@/components/layout/logo'

/** Círculos concêntricos decorativos no canto do painel. */
function Circulos() {
  return (
    <svg aria-hidden viewBox="0 0 400 400" className="pointer-events-none absolute -right-24 -bottom-24 size-[28rem] text-marca-ciano/25">
      {[190, 150, 110].map((r) => (
        <circle key={r} cx="200" cy="200" r={r} fill="none" stroke="currentColor" strokeWidth="1" />
      ))}
    </svg>
  )
}

/** Painel da marca no login (só em telas largas): logo, frase e aviso de ambiente. */
export function ApresentacaoLogin() {
  return (
    <aside className="relative hidden flex-col justify-between overflow-hidden bg-painel-marca p-12 text-white lg:flex">
      <Logo tom="claro" className="max-w-52" />
      <div className="relative grid max-w-xl gap-5">
        <p className="text-xs font-semibold tracking-[0.2em] text-marca-ciano uppercase">Operação conectada</p>
        <p className="text-5xl leading-[1.05] font-bold tracking-tight text-balance">
          Decisões operacionais mais claras, <span className="text-marca-ciano">em tempo real.</span>
        </p>
        <p className="max-w-md text-base text-white/85">Centralize ocorrências, equipes, ativos e alertas em uma única visão operacional.</p>
      </div>
      <p className="relative text-xs text-white/70">Ambiente local de demonstração · Dados sintéticos</p>
      <Circulos />
    </aside>
  )
}
