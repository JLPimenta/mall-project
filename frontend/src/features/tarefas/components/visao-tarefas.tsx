import { CalendarDaysIcon, SquareKanbanIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type Visao = 'calendario' | 'kanban'

const OPCOES = [
  { valor: 'calendario', rotulo: 'Calendário', icone: CalendarDaysIcon },
  { valor: 'kanban', rotulo: 'Kanban', icone: SquareKanbanIcon },
] as const

/** Alterna a visualização das tarefas. Só a área abaixo dos filtros muda. */
export function VisaoTarefas({ valor, onChange }: { valor: Visao; onChange: (v: Visao) => void }) {
  return (
    <div role="group" aria-label="Visualização" className="flex rounded-lg border p-0.5">
      {OPCOES.map(({ valor: opcao, rotulo, icone: Icone }) => (
        <Button
          key={opcao}
          type="button"
          size="sm"
          variant={valor === opcao ? 'secondary' : 'ghost'}
          aria-pressed={valor === opcao}
          onClick={() => onChange(opcao)}
        >
          <Icone aria-hidden data-icon="inline-start" />
          {rotulo}
        </Button>
      ))}
    </div>
  )
}
