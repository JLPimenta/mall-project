import { ClipboardListIcon, MapIcon, type LucideIcon } from 'lucide-react'
import { temPerfil } from '@/features/auth/permissoes'
import type { Perfil } from '@/features/auth/types'

export type NavItem = {
  title: string
  to: string
  icon: LucideIcon
  /** Ausente: todos os perfis. */
  perfis?: readonly Perfil[]
}

const GESTAO = ['ADMINISTRADOR', 'SUPERVISOR'] as const satisfies readonly Perfil[]

/** Só entram aqui módulos já implementados. Perfis conforme o protótipo e o backend. */
export const navItems = [
  { title: 'Central de Controle', to: '/central', icon: MapIcon, perfis: GESTAO },
  { title: 'Checklists', to: '/manutencao/checklists', icon: ClipboardListIcon, perfis: GESTAO },
] as const satisfies readonly NavItem[]

export function itensPermitidos(perfil: Perfil | undefined): readonly NavItem[] {
  return navItems.filter((item: NavItem) => temPerfil(perfil, item.perfis))
}

/** Perfis do item de menu que cobre a rota (inclui subrotas, ex.: /manutencao/checklists/novo). */
export function perfisDaRota(to: string): readonly Perfil[] | undefined {
  return (navItems as readonly NavItem[]).find((item) => to === item.to || to.startsWith(`${item.to}/`))?.perfis
}
