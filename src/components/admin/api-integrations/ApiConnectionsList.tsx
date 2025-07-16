import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, TestTube, Settings, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface ApiConnection {
  id: string;
  name: string;
  platform: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  totalProducts: number;
  successRate: number;
}

interface ApiConnectionsListProps {
  connections: ApiConnection[];
  onDelete: (id: string) => void;
  onTest: (id: string) => void;
}

export function ApiConnectionsList({ connections, onDelete, onTest }: ApiConnectionsListProps) {
  const [testingId, setTestingId] = useState<string | null>(null);

  const getStatusIcon = (status: ApiConnection['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'disconnected':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: ApiConnection['status']) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-100 text-green-800">Conectado</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      case 'disconnected':
        return <Badge variant="secondary">Desconectado</Badge>;
    }
  };

  const getPlatformBadge = (platform: string) => {
    const colors: Record<string, string> = {
      'MercadoLivre': 'bg-yellow-100 text-yellow-800',
      'Amazon': 'bg-orange-100 text-orange-800',
      'AliExpress': 'bg-red-100 text-red-800'
    };

    return (
      <Badge variant="outline" className={colors[platform] || 'bg-gray-100 text-gray-800'}>
        {platform}
      </Badge>
    );
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    await onTest(id);
    setTestingId(null);
  };

  if (connections.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Settings className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma API Configurada</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Adicione sua primeira integração de API para começar a sincronizar produtos de marketplaces.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conexões de API Configuradas</CardTitle>
        <CardDescription>
          Gerencie suas integrações com marketplaces e fornecedores
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Plataforma</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Última Sync</TableHead>
                <TableHead>Produtos</TableHead>
                <TableHead>Taxa de Sucesso</TableHead>
                <TableHead className="w-32">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {connections.map((connection) => (
                <TableRow key={connection.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(connection.status)}
                      <span className="font-medium">{connection.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getPlatformBadge(connection.platform)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(connection.status)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {connection.lastSync}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{connection.totalProducts.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{connection.successRate.toFixed(1)}%</span>
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            connection.successRate >= 95 ? 'bg-green-500' :
                            connection.successRate >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${connection.successRate}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTest(connection.id)}
                        disabled={testingId === connection.id}
                      >
                        <TestTube className="w-4 h-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover API</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover a conexão "{connection.name}"? 
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => onDelete(connection.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}