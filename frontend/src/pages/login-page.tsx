import { Navigate, useLocation, useNavigate } from 'react-router'
import { Logo } from '@/components/layout/logo'
import { podeAcessar } from '@/components/layout/navigation'
import { ApresentacaoLogin } from '@/features/auth/components/apresentacao-login'
import { LoginForm } from '@/features/auth/components/login-form'
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
    <div className="grid min-h-svh lg:grid-cols-[1.1fr_1fr]">
      <ApresentacaoLogin />
      <main className="flex items-center justify-center bg-background p-4 sm:p-6">
        <div className="grid w-full max-w-md gap-6 rounded-2xl border bg-card p-6 shadow-xl shadow-marca-navy/5 sm:p-8">
          <Logo className="max-w-48 lg:hidden" />
          <div className="grid gap-2">
            <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">Acesso restrito</p>
            <h1 id="login-titulo" className="text-3xl font-bold tracking-tight">
              Entrar no sistema
            </h1>
            <p className="text-sm text-muted-foreground">Use um perfil de demonstração para visualizar as permissões de cada papel.</p>
          </div>
          <LoginForm onSuccess={(logado) => navigate(destinoPara(logado.perfil), { replace: true })} />
        </div>
      </main>
    </div>
  )
}
