import { AdminLayout } from '@/layouts/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cog } from 'lucide-react';

export default function AdminSettings() {
  return (
    <AdminLayout 
      title="Configurações" 
      description="Configurações gerais do sistema"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
          <p className="text-muted-foreground">
            Configure as preferências do sistema
          </p>
        </div>

        {/* Em Desenvolvimento */}
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mb-4">
              <Cog className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Módulo em Desenvolvimento</h3>
            <p className="text-muted-foreground">
              O módulo de configurações está sendo desenvolvido e estará disponível em breve.
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