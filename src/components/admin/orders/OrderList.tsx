import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Eye, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle,
  Filter
} from 'lucide-react';

interface Order {
  id: string;
  user_id: string;
  total: number;
  status: string;
  created_at: string;
  order_items?: any[];
}

interface OrderListProps {
  orders: Order[];
  loading: boolean;
  onOrderClick: (order: Order) => void;
  onUpdateStatus: (orderId: string, status: string) => void;
}

const statusConfig = {
  pending: { label: 'Pendente', color: 'orange', icon: Clock },
  processing: { label: 'Processando', color: 'blue', icon: Filter },
  shipped: { label: 'Enviado', color: 'purple', icon: Truck },
  delivered: { label: 'Entregue', color: 'green', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'red', icon: XCircle }
};

export function OrderList({ orders, loading, onOrderClick, onUpdateStatus }: OrderListProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || { label: status, color: 'gray', icon: Clock };
    const Icon = config.icon;
    
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getNextStatus = (currentStatus: string) => {
    const statusFlow = {
      pending: 'processing',
      processing: 'shipped',
      shipped: 'delivered'
    };
    return statusFlow[currentStatus];
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted/20 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="mx-auto w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mb-4">
            <Eye className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Nenhum pedido encontrado</h3>
          <p className="text-muted-foreground">
            Nenhum pedido corresponde aos critérios de busca.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell onClick={() => onOrderClick(order)}>
                    <div>
                      <p className="font-medium">#{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.id}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell onClick={() => onOrderClick(order)}>
                    <div>
                      <p className="font-medium">{order.user_id.slice(0, 8)}...</p>
                      <p className="text-sm text-muted-foreground">Cliente</p>
                    </div>
                  </TableCell>
                  <TableCell onClick={() => onOrderClick(order)}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {order.order_items?.length || 0}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {order.order_items?.length === 1 ? 'item' : 'itens'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell onClick={() => onOrderClick(order)}>
                    <p className="font-bold">{formatCurrency(order.total)}</p>
                  </TableCell>
                  <TableCell onClick={() => onOrderClick(order)}>
                    {getStatusBadge(order.status)}
                  </TableCell>
                  <TableCell onClick={() => onOrderClick(order)}>
                    {formatDate(order.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onOrderClick(order)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {getNextStatus(order.status) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateStatus(order.id, getNextStatus(order.status))}
                        >
                          {statusConfig[getNextStatus(order.status)]?.label}
                        </Button>
                      )}
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