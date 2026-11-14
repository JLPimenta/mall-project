import { MapIcon, type LucideIcon } from 'lucide-react'
import { temPerfil } from '@/features/auth/permissoes'
import type { Perfil } from '@/features/auth/types'

export type NavItem = {
  title: string
  to: string
  icon: LucideIcon
  /** Ausente: todos os perfis. */
  perfis?: readonly Perfil[]
}

/** Só entram aqui módulos já implementados. Perfis conforme o protótipo. */
export const navItems = [
  { title: 'Central de Controle', to: '/central', icon: MapIcon, perfis: ['ADMINISTRADOR', 'SUPERVISOR'] },
] as const satisfies readonly NavItem[]

export function itensPermitidos(perfil: Perfil | undefined): readonly NavItem[] {
  return navItems.filter((item: NavItem) => temPerfil(perfil, item.perfis))
}

export function perfisDaRota(to: string): readonly Perfil[] | undefined {
  return (navItems as readonly NavItem[]).find((item) => item.to === to)?.perfis
}
