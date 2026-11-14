import {
  ChartColumnIcon,
  ClipboardCheckIcon,
  MapIcon,
  PackageIcon,
  RepeatIcon,
  SparklesIcon,
  UsersIcon,
  type LucideIcon,
} from 'lucide-react'

type Item = { icone: LucideIcon; texto: string }

/** Módulos já em funcionamento. */
const MODULOS: Item[] = [
  { icone: ClipboardCheckIcon, texto: 'Tarefas e manutenções programadas, do agendamento à aprovação' },
  { icone: MapIcon, texto: 'Central de Controle com a visão geral da operação' },
  { icone: UsersIcon, texto: 'Equipes, disponibilidade e ausências' },
  { icone: PackageIcon, texto: 'Estoque com entradas, retiradas e rastreabilidade' },
  { icone: ChartColumnIcon, texto: 'Relatórios por período, equipe e equipamento' },
]

/**
 * Análises com IA como idealizadas na documentação (RF04, RF12 e relatórios de gastos). Ainda não implementadas:
 * ficam marcadas como "Em desenvolvimento" para não serem apresentadas como prontas (CLAUDE.md, RNF07).
 */
const IA: Item[] = [
  { icone: SparklesIcon, texto: 'Triagem de ocorrências: categoria, prioridade e equipe sugeridas, sempre revisadas por um supervisor' },
  { icone: RepeatIcon, texto: 'Análise de recorrência: falhas repetidas e inspeções atrasadas sinalizadas' },
  { icone: ChartColumnIcon, texto: 'Comparação de gastos por equipamento e manutenção, com sugestão de intervenção à gerência' },
]

function Lista({ itens, rotulo, apagada }: { itens: Item[]; rotulo: string; apagada?: boolean }) {
  return (
    <ul aria-label={rotulo} className="grid gap-2.5">
      {itens.map(({ icone: Icone, texto }) => (
        <li key={texto} className={apagada ? 'flex gap-3 text-sidebar-foreground/70' : 'flex gap-3'}>
          <Icone className="mt-0.5 size-4 shrink-0 text-sidebar-primary" aria-hidden />
          <span>{texto}</span>
        </li>
      ))}
    </ul>
  )
}

/** Painel de apresentação do login (só em telas largas). */
export function ApresentacaoLogin() {
  return (
    <div className="grid max-w-md gap-6 text-sm">
      <p className="text-xl font-semibold text-sidebar-foreground">Gestão operacional do Capim Dourado Shopping</p>
      <Lista itens={MODULOS} rotulo="Módulos do sistema" />
      <div className="grid gap-3">
        <p className="flex items-center gap-2 font-medium">
          Análises com IA
          <span className="rounded-full border border-sidebar-primary/40 px-2 py-0.5 text-xs font-normal text-sidebar-primary">Em desenvolvimento</span>
        </p>
        <Lista itens={IA} rotulo="Análises com IA em desenvolvimento" apagada />
      </div>
    </div>
  )
}
