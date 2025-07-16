import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Download, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { productSyncService } from "@/services/ProductSyncService";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SyncLog {
  id: string;
  marketplace_name: string;
  operation_type: string;
  products_processed: number;
  products_imported: number;
  products_updated: number;
  errors: string[];
  started_at: string;
  completed_at: string | null;
  status: string;
}

export function SyncHistory() {
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SyncLog[]>([]);
  const [selectedMarketplace, setSelectedMarketplace] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSyncHistory();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, selectedMarketplace, selectedStatus]);

  const loadSyncHistory = async () => {
    try {
      setIsLoading(true);
      const data = await productSyncService.getSyncLogs();
      setLogs(data);
    } catch (error) {
      console.error('Error loading sync history:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar histórico de sincronização",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = logs;

    if (selectedMarketplace && selectedMarketplace !== 'all') {
      filtered = filtered.filter(log => log.marketplace_name === selectedMarketplace);
    }

    if (selectedStatus && selectedStatus !== 'all') {
      filtered = filtered.filter(log => log.status === selectedStatus);
    }

    setFilteredLogs(filtered);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'running':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'running':
        return 'Executando';
      case 'failed':
        return 'Falhou';
      default:
        return status;
    }
  };

  const formatDuration = (startedAt: string, completedAt: string | null) => {
    if (!completedAt) return 'Em andamento';
    
    const start = new Date(startedAt);
    const end = new Date(completedAt);
    const durationMs = end.getTime() - start.getTime();
    const durationSeconds = Math.round(durationMs / 1000);
    
    if (durationSeconds < 60) {
      return `${durationSeconds}s`;
    } else if (durationSeconds < 3600) {
      return `${Math.round(durationSeconds / 60)}m`;
    } else {
      return `${Math.round(durationSeconds / 3600)}h`;
    }
  };

  const exportHistory = () => {
    // Convert logs to CSV
    const headers = [
      'Marketplace',
      'Operação',
      'Status',
      'Iniciado',
      'Concluído',
      'Duração',
      'Processados',
      'Importados',
      'Atualizados',
      'Erros'
    ];

    const csvData = filteredLogs.map(log => [
      log.marketplace_name,
      log.operation_type,
      getStatusLabel(log.status),
      new Date(log.started_at).toLocaleString(),
      log.completed_at ? new Date(log.completed_at).toLocaleString() : 'Em andamento',
      formatDuration(log.started_at, log.completed_at),
      log.products_processed.toString(),
      log.products_imported.toString(),
      log.products_updated.toString(),
      log.errors.length.toString()
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sync-history-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: "Exportação Concluída",
      description: "Histórico exportado como CSV",
    });
  };

  if (isLoading) {
    return <div>Carregando histórico...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Sincronização</CardTitle>
          <CardDescription>
            Visualize todas as sincronizações realizadas com os marketplaces
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters and Actions */}
          <div className="flex items-center gap-4">
            <Select value={selectedMarketplace} onValueChange={setSelectedMarketplace}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todos marketplaces" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="MercadoLivre">MercadoLivre</SelectItem>
                <SelectItem value="Amazon">Amazon</SelectItem>
                <SelectItem value="AliExpress">AliExpress</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Todos status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="running">Executando</SelectItem>
                <SelectItem value="failed">Falhou</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex-1" />

            <Button variant="outline" onClick={exportHistory}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>

            <Button variant="outline" onClick={loadSyncHistory}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>

          {/* Sync Logs Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Marketplace</TableHead>
                  <TableHead>Operação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Iniciado</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Processados</TableHead>
                  <TableHead>Importados</TableHead>
                  <TableHead>Atualizados</TableHead>
                  <TableHead>Erros</TableHead>
                  <TableHead className="w-20">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                      Nenhum registro encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {log.marketplace_name}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">
                        {log.operation_type}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(log.status)}>
                          {getStatusLabel(log.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDistanceToNow(new Date(log.started_at), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDuration(log.started_at, log.completed_at)}
                      </TableCell>
                      <TableCell className="text-center">
                        {log.products_processed}
                      </TableCell>
                      <TableCell className="text-center text-green-600 font-medium">
                        {log.products_imported}
                      </TableCell>
                      <TableCell className="text-center text-blue-600 font-medium">
                        {log.products_updated}
                      </TableCell>
                      <TableCell className="text-center">
                        {log.errors.length > 0 ? (
                          <Badge variant="destructive">
                            {log.errors.length}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">
                  {logs.filter(log => log.status === 'completed').length}
                </div>
                <p className="text-xs text-muted-foreground">Sincronizações Concluídas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">
                  {logs.reduce((sum, log) => sum + log.products_imported, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Total de Produtos Importados</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">
                  {logs.reduce((sum, log) => sum + log.products_updated, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Total de Produtos Atualizados</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">
                  {logs.reduce((sum, log) => sum + log.errors.length, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Total de Erros</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}