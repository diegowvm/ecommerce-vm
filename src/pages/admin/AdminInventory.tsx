import { AdminLayout } from '@/layouts/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';

export default function AdminInventory() {
  return (
    <AdminLayout 
      title="Gestão de Estoque" 
      description="Controle de inventário e movimentações"
    >
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
    </AdminLayout>
  );
}