import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Search, Download, Eye } from "lucide-react";
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

export function SyncLogsTable() {
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SyncLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [marketplaceFilter, setMarketplaceFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, statusFilter, marketplaceFilter]);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      const data = await productSyncService.getSyncLogs(undefined, 100);
      setLogs(data);
    } catch (error) {
      console.error('Error loading logs:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar logs de sincronização",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.marketplace_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.operation_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(log => log.status === statusFilter);
    }

    if (marketplaceFilter && marketplaceFilter !== 'all') {
      filtered = filtered.filter(log => log.marketplace_name === marketplaceFilter);
    }

    setFilteredLogs(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">Concluído</Badge>;
      case 'running':
        return <Badge variant="secondary">Executando</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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

  const exportLogs = () => {
    const headers = [
      'Timestamp',
      'Marketplace',
      'Operação',
      'Status',
      'Processados',
      'Importados',
      'Atualizados',
      'Erros',
      'Duração'
    ];

    const csvData = filteredLogs.map(log => [
      new Date(log.started_at).toLocaleString(),
      log.marketplace_name,
      log.operation_type,
      log.status,
      log.products_processed.toString(),
      log.products_imported.toString(),
      log.products_updated.toString(),
      log.errors.length.toString(),
      formatDuration(log.started_at, log.completed_at)
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sync-logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: "Exportação Concluída",
      description: "Logs exportados como CSV",
    });
  };

  const marketplaces = Array.from(new Set(logs.map(log => log.marketplace_name)));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logs de Sincronização</CardTitle>
        <CardDescription>
          Histórico detalhado de todas as operações de sincronização
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por marketplace ou operação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={marketplaceFilter} onValueChange={setMarketplaceFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todos marketplaces" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {marketplaces.map((marketplace) => (
                <SelectItem key={marketplace} value={marketplace}>
                  {marketplace}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
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

          <Button variant="outline" onClick={exportLogs}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>

          <Button variant="outline" onClick={loadLogs} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Logs Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Marketplace</TableHead>
                <TableHead>Operação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Processados</TableHead>
                <TableHead>Importados</TableHead>
                <TableHead>Atualizados</TableHead>
                <TableHead>Erros</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead className="w-20">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                    Carregando logs...
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                    Nenhum log encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      {formatDistanceToNow(new Date(log.started_at), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {log.marketplace_name}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize text-sm">
                      {log.operation_type.replace('_', ' ')}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(log.status)}
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
                    <TableCell className="text-sm">
                      {formatDuration(log.started_at, log.completed_at)}
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
              <p className="text-xs text-muted-foreground">Produtos Importados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">
                {logs.reduce((sum, log) => sum + log.products_updated, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Produtos Atualizados</p>
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
  );
}