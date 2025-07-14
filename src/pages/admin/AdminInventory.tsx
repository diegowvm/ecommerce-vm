import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Package, TrendingDown, TrendingUp } from 'lucide-react';

export default function AdminInventory() {
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
        <header className="h-16 flex items-center border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="flex items-center gap-4 px-6 w-full">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-bold text-sm">K</span>
              </div>
              <div>
                <h1 className="font-bold text-lg">Gestão de Estoque</h1>
                <p className="text-xs text-muted-foreground">Controle de inventário e movimentações</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex min-h-[calc(100vh-4rem)] w-full">
          <AdminSidebar />
          
          <main className="flex-1 p-6 bg-gradient-to-br from-background via-background/95 to-surface/30">
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Gestão de Estoque</h2>
                <p className="text-muted-foreground">
                  Controle seu inventário e monitore movimentações
                </p>
              </div>

              {/* Em Desenvolvimento */}
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="mx-auto w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mb-4">
                    <Package className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Módulo em Desenvolvimento</h3>
                  <p className="text-muted-foreground">
                    O módulo de gestão de estoque está sendo desenvolvido e estará disponível em breve.
                  </p>
                  <Badge variant="outline" className="mt-4">
                    Em Breve
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}