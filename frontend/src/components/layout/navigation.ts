import { ClipboardListIcon, ListChecksIcon, MapIcon, RepeatIcon, UsersIcon, WrenchIcon, type LucideIcon } from 'lucide-react'
import { temPerfil } from '@/features/auth/permissoes'
import type { Perfil } from '@/features/auth/types'

export type NavItem = {
  title: string
  to: string
  icon: LucideIcon
  /** Ausente: todos os perfis. */
  perfis?: readonly Perfil[]
}

export type NavGrupo = { titulo: string; itens: readonly NavItem[] }

const GESTAO = ['ADMINISTRADOR', 'SUPERVISOR'] as const satisfies readonly Perfil[]

/**
 * Só entram aqui módulos já implementados. Perfis iguais aos do backend (SecurityConfiguration).
 * A ordem define o destino inicial: cada perfil cai no primeiro item permitido.
 *
 * Fluxo (docs/modulo-manutencao.md, Glossário): Operação é o dia a dia (Tarefas é onde chegam os dois
 * fluxos: manutenção programada e, no futuro, chamado). Planejamento define o que vira tarefa.
 */
export const navGrupos: readonly NavGrupo[] = [
  {
    titulo: 'Operação',
    itens: [
      { title: 'Central de Controle', to: '/central', icon: MapIcon, perfis: GESTAO },
      { title: 'Tarefas', to: '/tarefas', icon: ListChecksIcon },
    ],
  },
  {
    titulo: 'Planejamento',
    itens: [
      { title: 'Manutenções programadas', to: '/planejamento/manutencoes-programadas', icon: RepeatIcon, perfis: GESTAO },
      { title: 'Modelos de checklist', to: '/planejamento/modelos-checklist', icon: ClipboardListIcon, perfis: GESTAO },
    ],
  },
  {
    titulo: 'Cadastros',
    itens: [
      { title: 'Equipamentos', to: '/cadastros/equipamentos', icon: WrenchIcon, perfis: GESTAO },
      { title: 'Equipes', to: '/cadastros/equipes', icon: UsersIcon, perfis: GESTAO },
    ],
  },
]

const todosItens = navGrupos.flatMap((g) => g.itens)

/** Grupos visíveis ao perfil (grupos sem itens permitidos somem). */
export function gruposPermitidos(perfil: Perfil | undefined): NavGrupo[] {
  return navGrupos
    .map((g) => ({ ...g, itens: g.itens.filter((i) => temPerfil(perfil, i.perfis)) }))
    .filter((g) => g.itens.length > 0)
}

export function itensPermitidos(perfil: Perfil | undefined): readonly NavItem[] {
  return todosItens.filter((item) => temPerfil(perfil, item.perfis))
}

/** Item de menu que cobre a rota (inclui subrotas, ex.: /planejamento/modelos-checklist/novo). */
export function itemDaRota(to: string): NavItem | undefined {
  return todosItens.find((item) => to === item.to || to.startsWith(`${item.to}/`))
}

/**
 * Pode o perfil acessar a rota? Rota fora do menu: negado por padrão.
 * Item sem `perfis`: liberado a todos os perfis autenticados.
 */
export function podeAcessar(perfil: Perfil | undefined, to: string): boolean {
  const item = itemDaRota(to)
  return !!item && temPerfil(perfil, item.perfis)
}
