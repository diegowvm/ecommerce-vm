import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, ArrowLeft, Package, RefreshCw, Search, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { orderFulfillmentService } from "@/services/OrderFulfillmentService";

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  return_status: string | null;
  return_reason: string | null;
  return_requested_at: string | null;
  shipping_address: any;
  order_items: Array<{
    id: string;
    product_id: string;
    quantity: number;
    price: number;
    color: string | null;
    size: string | null;
    products: {
      name: string;
      image_url: string | null;
    } | null;
  }>;
}

interface OrderReturn {
  id: string;
  order_id: string;
  order_item_id: string | null;
  reason: string;
  status: string;
  refund_amount: number | null;
  created_at: string;
  updated_at: string;
}

export function ReturnsManager() {
  const [activeTab, setActiveTab] = useState('pending');
  const [orders, setOrders] = useState<Order[]>([]);
  const [returns, setReturns] = useState<OrderReturn[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [selectedOrderItem, setSelectedOrderItem] = useState<{ orderId: string; itemId: string; productName: string } | null>(null);
  const [returnReason, setReturnReason] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load orders with return requests or issues
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (name, image_url)
          )
        `)
        .or('return_status.not.is.null,status.eq.cancelled')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Load return records
      const { data: returnsData, error: returnsError } = await supabase
        .from('order_returns')
        .select('*')
        .order('created_at', { ascending: false });

      if (returnsError) throw returnsError;

      setOrders(ordersData || []);
      setReturns(returnsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados de devoluções",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitiateReturn = async () => {
    if (!selectedOrderItem || !returnReason.trim()) {
      toast({
        title: "Erro",
        description: "Selecione um item e forneça um motivo para a devolução",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await orderFulfillmentService.initiateReturn(
        selectedOrderItem.itemId,
        returnReason.trim()
      );

      if (result.success) {
        toast({
          title: "Devolução Iniciada",
          description: "O processo de devolução foi iniciado com sucesso",
        });
        
        setShowReturnDialog(false);
        setSelectedOrderItem(null);
        setReturnReason('');
        loadData(); // Reload data
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error initiating return:', error);
      toast({
        title: "Erro",
        description: "Falha ao iniciar processo de devolução",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'return_requested': { variant: 'secondary', label: 'Devolução Solicitada' },
      'processing': { variant: 'default', label: 'Processando' },
      'approved': { variant: 'default', label: 'Aprovada' },
      'rejected': { variant: 'destructive', label: 'Rejeitada' },
      'completed': { variant: 'default', label: 'Concluída' },
      'cancelled': { variant: 'destructive', label: 'Cancelado' }
    };

    const config = variants[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const pendingOrders = orders.filter(order => 
    order.return_status === 'return_requested' ||
    order.status === 'cancelled'
  );

  const processedReturns = returns.filter(ret => ret.status !== 'requested');

  const filteredPendingOrders = pendingOrders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_items.some(item => 
        item.products?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesStatus = statusFilter === '' || order.return_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Devoluções</h2>
          <p className="text-muted-foreground">
            Gerencie devoluções, disputas e reembolsos
          </p>
        </div>
        
        <Button variant="outline" onClick={loadData} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Devoluções Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders.length}</div>
            <p className="text-xs text-muted-foreground">aguardando análise</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="w-4 h-4" />
              Processadas Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {returns.filter(ret => 
                new Date(ret.updated_at).toDateString() === new Date().toDateString()
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">devoluções processadas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Devoluções</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{returns.length}</div>
            <p className="text-xs text-muted-foreground">desde o início</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valor em Devoluções</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {returns.reduce((sum, ret) => sum + (ret.refund_amount || 0), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">valor total reembolsado</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">Devoluções Pendentes</TabsTrigger>
          <TabsTrigger value="processed">Histórico Processado</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Devoluções Pendentes</CardTitle>
              <CardDescription>
                Pedidos que solicitaram devolução ou foram cancelados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar por ID do pedido ou produto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="return_requested">Devolução Solicitada</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Orders Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pedido</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Itens</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead className="w-32">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          Carregando devoluções...
                        </TableCell>
                      </TableRow>
                    ) : filteredPendingOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          Nenhuma devolução pendente encontrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPendingOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-sm">
                            #{order.id.slice(0, 8)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDistanceToNow(new Date(order.created_at), {
                              addSuffix: true,
                              locale: ptBR
                            })}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(order.return_status || order.status)}
                          </TableCell>
                          <TableCell className="font-medium">
                            R$ {order.total.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {order.order_items.length} {order.order_items.length === 1 ? 'item' : 'itens'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {order.order_items.slice(0, 2).map(item => item.products?.name).join(', ')}
                              {order.order_items.length > 2 && '...'}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {order.return_reason || 'Não especificado'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {order.order_items.map(item => (
                                <Button
                                  key={item.id}
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedOrderItem({
                                      orderId: order.id,
                                      itemId: item.id,
                                      productName: item.products?.name || 'Produto'
                                    });
                                    setShowReturnDialog(true);
                                  }}
                                  title={`Iniciar devolução: ${item.products?.name}`}
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </Button>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Devoluções Processadas</CardTitle>
              <CardDescription>
                Devoluções que já foram processadas e finalizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Histórico de devoluções processadas aparecerá aqui</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Return Dialog */}
      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Iniciar Processo de Devolução</DialogTitle>
            <DialogDescription>
              Iniciando devolução para: {selectedOrderItem?.productName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="return-reason">Motivo da Devolução</Label>
              <Textarea
                id="return-reason"
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="Descreva o motivo da devolução..."
                rows={4}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowReturnDialog(false);
                  setSelectedOrderItem(null);
                  setReturnReason('');
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleInitiateReturn}
                disabled={!returnReason.trim()}
                className="flex-1"
              >
                Confirmar Devolução
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}