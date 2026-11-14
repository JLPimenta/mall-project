import { createBrowserRouter } from 'react-router'
import { AppShell } from '@/components/layout/app-shell'
import { perfisDaRota } from '@/components/layout/navigation'
import { RequireAuth } from '@/features/auth/components/require-auth'
import { RequirePerfil } from '@/features/auth/components/require-perfil'
import { CentralPage } from '@/pages/central-page'
import { HomeRedirect } from '@/pages/home-redirect'
import { LoginPage } from '@/pages/login-page'
import { NotFoundPage } from '@/pages/not-found-page'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <HomeRedirect /> },
      {
        path: 'central',
        element: (
          <RequirePerfil perfis={perfisDaRota('/central') ?? []}>
            <CentralPage />
          </RequirePerfil>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
