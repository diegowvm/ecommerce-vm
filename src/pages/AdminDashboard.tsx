import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default function AdminDashboardPage() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center py-16">
              <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
              <p className="text-muted-foreground">
                Você não tem permissão para acessar esta área.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        {/* Header */}
        <header className="h-16 flex items-center border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="flex items-center gap-4 px-6 w-full">
            <SidebarTrigger className="shrink-0" />
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">K</span>
                  </div>
                  <div>
                    <h1 className="font-bold text-lg">Xegai Admin</h1>
                    <p className="text-xs text-muted-foreground">Sistema de Gestão</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  Bem-vindo, Administrador
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex min-h-[calc(100vh-4rem)] w-full">
          <AdminSidebar />
          
          <main className="flex-1 p-6 bg-gradient-to-br from-background via-background/95 to-surface/30">
            <AdminDashboard />
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}