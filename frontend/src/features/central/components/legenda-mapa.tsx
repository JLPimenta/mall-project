import { pontoDoTom } from '@/lib/tons'
import { cn } from '@/lib/utils'

const EQUIPAMENTO = [
  { tom: 'sucesso', rotulo: 'Operando' },
  { tom: 'atencao', rotulo: 'Atenção' },
  { tom: 'perigo', rotulo: 'Inoperante ou atrasada' },
] as const

const CHAMADO = [
  { tom: 'perigo', rotulo: 'Crítica' },
  { tom: 'atencao', rotulo: 'Alta' },
  { tom: 'info', rotulo: 'Média' },
  { tom: 'neutro', rotulo: 'Baixa' },
] as const

/** Cores e formas dos marcadores da planta. */
export function LegendaMapa() {
  return (
    <div aria-label="Legenda da planta" role="group" className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
      <ul aria-label="Equipamentos" className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <li className="font-medium text-foreground">Equipamentos (círculo):</li>
        {EQUIPAMENTO.map((i) => (
          <li key={i.rotulo} className="flex items-center gap-1.5">
            <span className={cn('size-2.5 rounded-full', pontoDoTom[i.tom])} aria-hidden />
            {i.rotulo}
          </li>
        ))}
      </ul>
      <ul aria-label="Chamados" className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <li className="font-medium text-foreground">Chamados (losango):</li>
        {CHAMADO.map((i) => (
          <li key={i.rotulo} className="flex items-center gap-1.5">
            <span className={cn('size-2.5 rotate-45', pontoDoTom[i.tom])} aria-hidden />
            {i.rotulo}
          </li>
        ))}
      </ul>
      <p className="flex items-center gap-1.5">
        <span className="flex size-3.5 items-center justify-center rounded-full bg-andamento text-[9px] font-bold text-white" aria-hidden>
          2
        </span>
        Tarefas de hoje no equipamento
      </p>
    </div>
  )
}
