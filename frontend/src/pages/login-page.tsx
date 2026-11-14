import { Building2Icon } from 'lucide-react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { LoginForm } from '@/features/auth/components/login-form'
import { perfisDaRota } from '@/components/layout/navigation'
import { useSessao } from '@/features/auth/hooks'
import { temPerfil } from '@/features/auth/permissoes'
import type { Perfil } from '@/features/auth/types'

type LocationState = { from?: string } | null

export function LoginPage() {
  const { data: usuario } = useSessao()
  const navigate = useNavigate()
  const destino = (useLocation().state as LocationState)?.from ?? '/'

  // Volta à rota de origem só se o perfil puder acessá-la.
  const destinoPara = (perfil: Perfil) => (temPerfil(perfil, perfisDaRota(destino)) ? destino : '/')

  if (usuario) return <Navigate to={destinoPara(usuario.perfil)} replace />

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <Marca />
        <p className="text-sm text-sidebar-foreground/70">Capim Dourado Shopping</p>
      </aside>
      <main className="flex items-center justify-center p-6">
        <div className="grid w-full max-w-sm gap-6">
          <div className="lg:hidden">
            <Marca />
          </div>
          <h1 id="login-titulo" className="text-2xl font-semibold tracking-tight">
            Entrar
          </h1>
          <LoginForm onSuccess={(logado) => navigate(destinoPara(logado.perfil), { replace: true })} />
        </div>
      </main>
    </div>
  )
}

function Marca() {
  return (
    <div className="flex items-center gap-2 font-semibold">
      <Building2Icon className="size-6 text-sidebar-primary" aria-hidden />
      SmartMall Ops AI
    </div>
  )
}
