import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  UserCheck,
  BarChart3,
  Settings,
  FileBarChart,
  CreditCard,
  MessageSquare,
  Bell,
  ShieldCheck,
  Database,
  Activity,
  TrendingUp,
  PieChart,
  Calendar,
  Mail,
  Phone,
  Building2,
  Truck,
  Star,
  Tags,
  Layers,
  Filter
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
  { title: "Vendas", url: "/admin/sales", icon: TrendingUp },
]

const crmItems = [
  { title: "Clientes", url: "/admin/customers", icon: Users },
  { title: "Leads", url: "/admin/leads", icon: UserCheck },
  { title: "Comunicação", url: "/admin/communication", icon: MessageSquare },
  { title: "Campanhas", url: "/admin/campaigns", icon: Mail },
  { title: "Tickets", url: "/admin/tickets", icon: Phone },
]

const erpItems = [
  { title: "Produtos", url: "/admin/products", icon: Package },
  { title: "Categorias", url: "/admin/categories", icon: Layers },
  { title: "Estoque", url: "/admin/inventory", icon: Database },
  { title: "Pedidos", url: "/admin/orders", icon: ShoppingCart },
  { title: "Fornecedores", url: "/admin/suppliers", icon: Building2 },
  { title: "Entregas", url: "/admin/deliveries", icon: Truck },
]

const reportsItems = [
  { title: "Relatórios", url: "/admin/reports", icon: FileBarChart },
  { title: "Financeiro", url: "/admin/financial", icon: CreditCard },
  { title: "Performance", url: "/admin/performance", icon: Activity },
  { title: "Insights", url: "/admin/insights", icon: PieChart },
]

const systemItems = [
  { title: "Usuários", url: "/admin/users", icon: UserCheck },
  { title: "Permissões", url: "/admin/permissions", icon: ShieldCheck },
  { title: "Configurações", url: "/admin/settings", icon: Settings },
  { title: "Notificações", url: "/admin/notifications", icon: Bell },
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

        {/* CRM Section */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            CRM
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {crmItems.map((item) => (
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

        {/* ERP Section */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            ERP
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {erpItems.map((item) => (
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

        {/* Reports Section */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Relatórios
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {reportsItems.map((item) => (
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