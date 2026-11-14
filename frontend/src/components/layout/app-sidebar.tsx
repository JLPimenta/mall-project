import { Building2Icon } from 'lucide-react'
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
import { gruposPermitidos } from './navigation'

export function AppSidebar() {
  const { pathname } = useLocation()
  const { data: usuario } = useSessao()
  const { isMobile, setOpenMobile } = useSidebar()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Building2Icon className="size-5 shrink-0 text-sidebar-primary" aria-hidden />
          <span className="truncate font-semibold group-data-[collapsible=icon]:hidden">SmartMall Ops</span>
        </div>
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
