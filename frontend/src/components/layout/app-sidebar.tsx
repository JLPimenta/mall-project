import { NavLink, useLocation } from 'react-router'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useSessao } from '@/features/auth/hooks'
import { Logo, LogoIcone } from './logo'
import { gruposPermitidos } from './navigation'

export function AppSidebar() {
  const { pathname } = useLocation()
  const { data: usuario } = useSessao()
  const { isMobile, setOpenMobile } = useSidebar()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        {/* Expandido: logo completo num cartão branco. Recolhido: só o ícone. */}
        <div className="rounded-lg bg-white px-3 py-2 group-data-[collapsible=icon]:hidden">
          <Logo className="mx-auto max-h-12 w-auto" />
        </div>
        <LogoIcone className="hidden group-data-[collapsible=icon]:block" />
      </SidebarHeader>
      <SidebarContent>
        <nav aria-label="Principal">
          {gruposPermitidos(usuario?.perfil).map((grupo) => (
            <SidebarGroup key={grupo.titulo} aria-labelledby={`grupo-${grupo.titulo}`}>
              <SidebarGroupLabel id={`grupo-${grupo.titulo}`}>{grupo.titulo}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {grupo.itens.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton asChild isActive={pathname.startsWith(item.to)} tooltip={item.title}>
                        {/* No celular o menu é uma gaveta; fecha ao navegar para não cobrir a página. */}
                        <NavLink to={item.to} onClick={() => isMobile && setOpenMobile(false)}>
                          <item.icon aria-hidden />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </nav>
      </SidebarContent>
    </Sidebar>
  )
}
