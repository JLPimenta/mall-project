import { ShieldXIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { EmptyState } from '@/components/shared/empty-state'
import { useSessao } from '../hooks'
import { temPerfil } from '../permissoes'
import type { Perfil } from '../types'

type RequirePerfilProps = {
  perfis: readonly Perfil[]
  children: ReactNode
}

/** Bloqueio de interface. A autorização efetiva é feita no backend. */
export function RequirePerfil({ perfis, children }: RequirePerfilProps) {
  const { data: usuario } = useSessao()

  if (!temPerfil(usuario?.perfil, perfis)) {
    return <EmptyState title="Acesso não permitido para o seu perfil." icon={ShieldXIcon} />
  }

  return children
}
