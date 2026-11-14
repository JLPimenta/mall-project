import { Navigate, useLocation, useNavigate } from 'react-router'
import { Logo } from '@/components/layout/logo'
import { LoginForm } from '@/features/auth/components/login-form'
import { podeAcessar } from '@/components/layout/navigation'
import { useSessao } from '@/features/auth/hooks'
import type { Perfil } from '@/features/auth/types'

type LocationState = { from?: string } | null

export function LoginPage() {
  const { data: usuario } = useSessao()
  const navigate = useNavigate()
  const destino = (useLocation().state as LocationState)?.from ?? '/'

  // Volta à rota de origem só se o perfil puder acessá-la.
  const destinoPara = (perfil: Perfil) => (podeAcessar(perfil, destino) ? destino : '/')

  if (usuario) return <Navigate to={destinoPara(usuario.perfil)} replace />

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <div className="w-fit rounded-xl bg-white px-5 py-4">
          <Logo className="max-w-72" />
        </div>
        <p className="text-sm text-sidebar-foreground/70">Capim Dourado Shopping</p>
      </aside>
      <main className="flex items-center justify-center p-6">
        <div className="grid w-full max-w-sm gap-6">
          <Logo className="max-w-56 lg:hidden" />
          <h1 id="login-titulo" className="text-2xl font-semibold tracking-tight">
            Entrar
          </h1>
          <LoginForm onSuccess={(logado) => navigate(destinoPara(logado.perfil), { replace: true })} />
        </div>
      </main>
    </div>
  )
}
