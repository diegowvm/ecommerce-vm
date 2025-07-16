import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { MarketplacesManager } from "@/components/admin/marketplaces/MarketplacesManager";

export default function AdminMarketplaces() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar esta área.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        {/* Header */}
        <header className="h-16 flex items-center border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="flex items-center gap-4 px-6 w-full">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-bold text-sm">K</span>
              </div>
              <div>
                <h1 className="font-bold text-lg">Integração com Marketplaces</h1>
                <p className="text-xs text-muted-foreground">Gerenciar sincronização de produtos</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex min-h-[calc(100vh-4rem)] w-full">
          <AdminSidebar />
          
          <main className="flex-1 p-6 bg-gradient-to-br from-background via-background/95 to-surface/30">
            <MarketplacesManager />
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}