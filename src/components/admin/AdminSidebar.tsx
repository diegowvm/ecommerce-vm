import { NavLink, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Database,
  Store,
  Zap,
  Activity,
  RotateCcw,
  Layers,
  ShieldCheck
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

const mainItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
]

const catalogItems = [
  { title: "Produtos", url: "/admin/products", icon: Package },
  { title: "Categorias", url: "/admin/categories", icon: Layers },
  { title: "Estoque", url: "/admin/inventory", icon: Database },
]

const operationsItems = [
  { title: "Pedidos", url: "/admin/orders", icon: ShoppingCart },
  { title: "Devoluções", url: "/admin/returns", icon: RotateCcw },
  { title: "Usuários", url: "/admin/users", icon: Users },
]

const integrationsItems = [
  { title: "Marketplaces", url: "/admin/marketplaces", icon: Store },
  { title: "Integrações API", url: "/admin/api-integrations", icon: Zap },
  { title: "Monitoramento", url: "/admin/api-monitoring", icon: Activity },
]

const systemItems = [
  { title: "Configurações", url: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
  const { state } = useSidebar()
  const collapsed = state === "collapsed"
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => {
    if (path === "/admin") {
      return currentPath === "/admin"
    }
    return currentPath.startsWith(path)
  }

  const getNavCls = (path: string) => {
    const baseClasses = "w-full justify-start transition-all duration-200"
    if (isActive(path)) {
      return `${baseClasses} bg-primary/15 text-primary font-medium border-r-2 border-primary`
    }
    return `${baseClasses} hover:bg-muted/50 hover:text-foreground`
  }

  const isGroupActive = (items: { url: string }[]) => {
    return items.some(item => isActive(item.url))
  }

  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-72"} border-r border-border/40 bg-gradient-to-b from-card to-card/80 backdrop-blur-sm transition-all duration-300`}
      collapsible="icon"
    >
      <div className="p-4 border-b border-border/40">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Admin Panel</h3>
              <p className="text-xs text-muted-foreground">Sistema de Gestão</p>
            </div>
          </div>
        )}
      </div>

      <SidebarContent className="px-2 py-4">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className={`${collapsed ? "w-5 h-5" : "w-4 h-4 mr-3"}`} />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Catálogo Section */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Catálogo
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {catalogItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className={`${collapsed ? "w-5 h-5" : "w-4 h-4 mr-3"}`} />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Operações Section */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Operações
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {operationsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className={`${collapsed ? "w-5 h-5" : "w-4 h-4 mr-3"}`} />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Integrações Section */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Integrações
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {integrationsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className={`${collapsed ? "w-5 h-5" : "w-4 h-4 mr-3"}`} />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System Section */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Sistema
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className={`${collapsed ? "w-5 h-5" : "w-4 h-4 mr-3"}`} />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}