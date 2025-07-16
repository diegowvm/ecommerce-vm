import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Zap, Settings } from "lucide-react";

export function NoApisConfigured() {
  return (
    <Card className="text-center py-12">
      <CardHeader>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Plus className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Nenhuma API Configurada</CardTitle>
        <CardDescription>
          Configure sua primeira integração com marketplace para começar a sincronizar produtos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground space-y-2">
          <p>• Conecte-se com MercadoLivre, Amazon ou AliExpress</p>
          <p>• Sincronize produtos automaticamente</p>
          <p>• Gerencie pedidos de forma centralizada</p>
        </div>
        <Button size="lg" className="mt-6">
          <Settings className="w-4 h-4 mr-2" />
          Configurar Primeira API
        </Button>
      </CardContent>
    </Card>
  );
}

export function NoProductsSync({ apisCount }: { apisCount: number }) {
  return (
    <Card className="text-center py-12">
      <CardHeader>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
          <Zap className="h-6 w-6 text-secondary" />
        </div>
        <CardTitle>APIs Conectadas, Produtos Não Sincronizados</CardTitle>
        <CardDescription>
          Você tem {apisCount} API{apisCount > 1 ? 's' : ''} configurada{apisCount > 1 ? 's' : ''}, mas ainda não sincronizou nenhum produto
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground space-y-2">
          <p>• Inicie sua primeira sincronização</p>
          <p>• Importe produtos dos marketplaces</p>
          <p>• Configure mapeamentos de categorias</p>
        </div>
        <Button size="lg" className="mt-6">
          <Zap className="w-4 h-4 mr-2" />
          Iniciar Sincronização
        </Button>
      </CardContent>
    </Card>
  );
}