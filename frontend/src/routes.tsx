import type { ReactNode } from 'react'
import { createBrowserRouter } from 'react-router'
import { AppShell } from '@/components/layout/app-shell'
import { perfisDaRota } from '@/components/layout/navigation'
import { RequireAuth } from '@/features/auth/components/require-auth'
import { RequirePerfil } from '@/features/auth/components/require-perfil'
import { CentralPage } from '@/pages/central-page'
import { ChecklistFormPage } from '@/pages/checklist-form-page'
import { ChecklistsPage } from '@/pages/checklists-page'
import { HomeRedirect } from '@/pages/home-redirect'
import { LoginPage } from '@/pages/login-page'
import { NotFoundPage } from '@/pages/not-found-page'

/** Aplica os perfis do item de menu correspondente à rota. */
function protegida(rota: string, pagina: ReactNode) {
  return <RequirePerfil perfis={perfisDaRota(rota) ?? []}>{pagina}</RequirePerfil>
}

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
      { path: 'central', element: protegida('/central', <CentralPage />) },
      {
        path: 'manutencao/checklists',
        children: [
          { index: true, element: protegida('/manutencao/checklists', <ChecklistsPage />) },
          { path: 'novo', element: protegida('/manutencao/checklists', <ChecklistFormPage />) },
          { path: ':id', element: protegida('/manutencao/checklists', <ChecklistFormPage />) },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
