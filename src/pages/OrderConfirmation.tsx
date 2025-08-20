import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Package, MapPin, Calendar, ArrowRight } from "lucide-react";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  size: string | null;
  color: string | null;
  products: {
    id: string;
    name: string;
    image_url: string | null;
  };
}

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
  shipping_address: any;
  order_items: OrderItem[];
}

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (!orderId) {
      navigate('/');
      return;
    }

    fetchOrder();
  }, [user, orderId, navigate]);

  const fetchOrder = async () => {
    if (!user || !orderId) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              id,
              name,
              image_url
            )
          )
        `)
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setOrder(data as any);
    } catch (error) {
      console.error('Error fetching order:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDeliveryEstimate = () => {
    const orderDate = new Date(order!.created_at);
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + 7); // 7 dias úteis
    
    return deliveryDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando confirmação do pedido...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Pedido não encontrado</h2>
          <Button onClick={() => navigate('/')}>
            Voltar à página inicial
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
            Pedido Confirmado!
          </h1>
          <p className="text-lg text-muted-foreground">
            Obrigado pela sua compra. Seu pedido foi processado com sucesso.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Detalhes do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Número do Pedido</p>
                    <p className="font-semibold text-lg">#{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data do Pedido</p>
                    <p className="font-semibold">{formatDate(order.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      Pago
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Previsão de Entrega</p>
                    <p className="font-semibold flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      {getDeliveryEstimate()}
                    </p>
                  </div>
                </div>

                <Separator className="mb-6" />

                {/* Order Items */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Itens do Pedido</h3>
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
                      {item.products.image_url && (
                        <img
                          src={item.products.image_url}
                          alt={item.products.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium">{item.products.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.size && `Tamanho: ${item.size}`}
                          {item.size && item.color && ' • '}
                          {item.color && `Cor: ${item.color}`}
                        </p>
                        <p className="text-sm">Quantidade: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          R$ {item.price.toFixed(2)} cada
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            {order.shipping_address && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    Endereço de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="font-medium">{order.shipping_address.fullName}</p>
                    <p>{order.shipping_address.address}, {order.shipping_address.number}</p>
                    {order.shipping_address.complement && (
                      <p>{order.shipping_address.complement}</p>
                    )}
                    <p>{order.shipping_address.neighborhood}</p>
                    <p>
                      {order.shipping_address.city} - {order.shipping_address.state}
                    </p>
                    <p>{order.shipping_address.cep}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Resumo do Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>R$ {(order.total - 15.90).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frete</span>
                    <span>R$ 15,90</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Pago</span>
                    <span>R$ {order.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Button onClick={() => navigate('/products')} className="w-full">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Continuar Comprando
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/')} 
                    className="w-full"
                  >
                    Voltar à Página Inicial
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Next Steps */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Próximos Passos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Preparação</h3>
                <p className="text-sm text-muted-foreground">
                  Estamos preparando seu pedido com muito cuidado.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Envio</h3>
                <p className="text-sm text-muted-foreground">
                  Você receberá um código de rastreamento por email.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Entrega</h3>
                <p className="text-sm text-muted-foreground">
                  Prevista para {getDeliveryEstimate()}.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}