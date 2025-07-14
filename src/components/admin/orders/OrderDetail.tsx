import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle,
  Filter,
  Package,
  User,
  MapPin,
  Calendar
} from 'lucide-react';

interface OrderDetailProps {
  order: any;
  onBack: () => void;
  onUpdateStatus: (orderId: string, status: string) => void;
}

const statusConfig = {
  pending: { label: 'Pendente', color: 'orange', icon: Clock },
  processing: { label: 'Processando', color: 'blue', icon: Filter },
  shipped: { label: 'Enviado', color: 'purple', icon: Truck },
  delivered: { label: 'Entregue', color: 'green', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'red', icon: XCircle }
};

const statusOptions = [
  { value: 'pending', label: 'Pendente' },
  { value: 'processing', label: 'Processando' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'cancelled', label: 'Cancelado' }
];

export function OrderDetail({ order, onBack, onUpdateStatus }: OrderDetailProps) {
  const [newStatus, setNewStatus] = useState(order.status);

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

  const handleStatusUpdate = () => {
    if (newStatus !== order.status) {
      onUpdateStatus(order.id, newStatus);
    }
  };

  const totalItems = order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight">
            Pedido #{order.id.slice(0, 8)}
          </h2>
          <p className="text-muted-foreground">
            Detalhes completos do pedido
          </p>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(order.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Resumo do Pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">ID do Pedido</p>
                <p className="font-medium">{order.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Itens</p>
                <p className="font-medium">{totalItems}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="font-bold text-lg">{formatCurrency(order.total)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data do Pedido</p>
                <p className="font-medium">{formatDate(order.created_at)}</p>
              </div>
            </div>

            <Separator />

            {/* Order Items */}
            <div>
              <h4 className="font-semibold mb-3">Itens do Pedido</h4>
              <div className="space-y-3">
                {order.order_items?.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-muted/20 rounded-lg">
                    <div className="w-16 h-16 rounded-lg bg-muted/20 flex items-center justify-center overflow-hidden">
                      {item.products?.image_url ? (
                        <img 
                          src={item.products.image_url} 
                          alt={item.products.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium">{item.products?.name || 'Produto não encontrado'}</h5>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Qtd: {item.quantity}</span>
                        <span>Preço: {formatCurrency(item.price)}</span>
                        {item.size && <span>Tam: {item.size}</span>}
                        {item.color && <span>Cor: {item.color}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Actions and Info */}
        <div className="space-y-6">
          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Status do Pedido
            </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Status Atual</label>
                <div className="mt-1">
                  {getStatusBadge(order.status)}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Alterar Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <Button 
                onClick={handleStatusUpdate}
                disabled={newStatus === order.status}
                className="w-full"
              >
                Atualizar Status
              </Button>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">ID do Cliente</p>
                <p className="font-medium">{order.user_id}</p>
              </div>
              
              {order.shipping_address && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4" />
                    <p className="text-sm text-muted-foreground">Endereço de Entrega</p>
                  </div>
                  <div className="text-sm">
                    {typeof order.shipping_address === 'string' 
                      ? order.shipping_address 
                      : JSON.stringify(order.shipping_address)
                    }
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Histórico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Pedido criado</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                </div>
                {order.updated_at !== order.created_at && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-muted rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Última atualização</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.updated_at)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}