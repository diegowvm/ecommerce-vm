import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CreditCard, MapPin, Package, CheckCircle } from "lucide-react";

interface CartItem {
  id: string;
  quantity: number;
  size: string | null;
  color: string | null;
  product_id: string;
  products: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
  };
}

interface ShippingInfo {
  fullName: string;
  cep: string;
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

interface PaymentInfo {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
}

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: '',
    cep: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchCartItems();
    loadUserProfile();
  }, [user, navigate]);

  const fetchCartItems = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (
            id,
            name,
            price,
            image_url
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os itens do carrinho.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();

      if (data && data.full_name) {
        setShippingInfo(prev => ({
          ...prev,
          fullName: data.full_name,
        }));
      }
    } catch (error) {
      console.log('No profile found or error loading profile');
    }
  };

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.products.price * item.quantity);
  }, 0);

  const shipping = 15.90;
  const total = subtotal + shipping;

  const validateShipping = () => {
    const required = ['fullName', 'cep', 'address', 'number', 'neighborhood', 'city', 'state'];
    return required.every(field => shippingInfo[field as keyof ShippingInfo].trim() !== '');
  };

  const validatePayment = () => {
    const { cardNumber, cardName, expiryDate, cvv } = paymentInfo;
    
    // Validações básicas
    const cardNumberValid = cardNumber.replace(/\s/g, '').length === 16;
    const cardNameValid = cardName.trim().length > 0;
    const expiryValid = /^\d{2}\/\d{2}$/.test(expiryDate);
    const cvvValid = /^\d{3,4}$/.test(cvv);

    return cardNumberValid && cardNameValid && expiryValid && cvvValid;
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const nextStep = () => {
    if (currentStep === 1 && !validateShipping()) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos obrigatórios de entrega.",
        variant: "destructive",
      });
      return;
    }
    
    if (currentStep === 2 && !validatePayment()) {
      toast({
        title: "Dados de pagamento inválidos",
        description: "Por favor, verifique os dados do cartão.",
        variant: "destructive",
      });
      return;
    }

    setCurrentStep(prev => prev + 1);
  };

  const processOrder = async () => {
    if (!user || cartItems.length === 0) return;

    setProcessing(true);
    try {
      // Simular processamento de pagamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Criar pedido no banco de dados
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total: total,
          status: 'paid',
          shipping_address: shippingInfo as any,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Criar itens do pedido
      const orderItems = cartItems.map(item => ({
        order_id: orderData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.products.price,
        size: item.size,
        color: item.color,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Limpar carrinho
      const { error: clearCartError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (clearCartError) throw clearCartError;

      // Redirecionar para confirmação
      navigate(`/order-confirmation/${orderData.id}`);

    } catch (error) {
      console.error('Error processing order:', error);
      toast({
        title: "Erro no processamento",
        description: "Ocorreu um erro ao processar seu pedido. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Carrinho vazio</h2>
          <p className="text-muted-foreground mb-4">Adicione produtos ao carrinho para continuar.</p>
          <Button onClick={() => navigate('/products')}>
            Continuar Comprando
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/cart')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao Carrinho
        </Button>
        
        <h1 className="text-3xl font-bold">Finalizar Compra</h1>
        
        {/* Progress Indicator */}
        <div className="flex items-center mt-4 space-x-4">
          <div className={`flex items-center ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 1 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>
              1
            </div>
            <span className="ml-2 font-medium">Entrega</span>
          </div>
          <div className="flex-1 border-t border-muted-foreground"></div>
          <div className={`flex items-center ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 2 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>
              2
            </div>
            <span className="ml-2 font-medium">Pagamento</span>
          </div>
          <div className="flex-1 border-t border-muted-foreground"></div>
          <div className={`flex items-center ${currentStep >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 3 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>
              3
            </div>
            <span className="ml-2 font-medium">Confirmação</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Summary - Always visible */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Resumo do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
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
                      <p className="text-sm">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        R$ {(item.products.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>R$ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frete</span>
                    <span>R$ {shipping.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          {/* Step 1: Shipping Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  Informações de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="fullName">Nome Completo *</Label>
                    <Input
                      id="fullName"
                      value={shippingInfo.fullName}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Seu nome completo"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cep">CEP *</Label>
                    <Input
                      id="cep"
                      value={shippingInfo.cep}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, cep: e.target.value }))}
                      placeholder="00000-000"
                      maxLength={9}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Endereço *</Label>
                    <Input
                      id="address"
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Rua, avenida, etc."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="number">Número *</Label>
                    <Input
                      id="number"
                      value={shippingInfo.number}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, number: e.target.value }))}
                      placeholder="123"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="complement">Complemento</Label>
                    <Input
                      id="complement"
                      value={shippingInfo.complement}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, complement: e.target.value }))}
                      placeholder="Apto, bloco, etc."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="neighborhood">Bairro *</Label>
                    <Input
                      id="neighborhood"
                      value={shippingInfo.neighborhood}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, neighborhood: e.target.value }))}
                      placeholder="Seu bairro"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="city">Cidade *</Label>
                    <Input
                      id="city"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Sua cidade"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="state">Estado *</Label>
                    <Input
                      id="state"
                      value={shippingInfo.state}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="SP"
                      maxLength={2}
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button onClick={nextStep} className="w-full">
                    Continuar para Pagamento
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Payment Information */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Informações de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Número do Cartão *</Label>
                    <Input
                      id="cardNumber"
                      value={paymentInfo.cardNumber}
                      onChange={(e) => setPaymentInfo(prev => ({ 
                        ...prev, 
                        cardNumber: formatCardNumber(e.target.value)
                      }))}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cardName">Nome no Cartão *</Label>
                    <Input
                      id="cardName"
                      value={paymentInfo.cardName}
                      onChange={(e) => setPaymentInfo(prev => ({ ...prev, cardName: e.target.value.toUpperCase() }))}
                      placeholder="NOME COMO NO CARTÃO"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">Validade *</Label>
                      <Input
                        id="expiryDate"
                        value={paymentInfo.expiryDate}
                        onChange={(e) => setPaymentInfo(prev => ({ 
                          ...prev, 
                          expiryDate: formatExpiryDate(e.target.value)
                        }))}
                        placeholder="MM/AA"
                        maxLength={5}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="cvv">CVV *</Label>
                      <Input
                        id="cvv"
                        value={paymentInfo.cvv}
                        onChange={(e) => setPaymentInfo(prev => ({ 
                          ...prev, 
                          cvv: e.target.value.replace(/\D/g, '')
                        }))}
                        placeholder="123"
                        maxLength={4}
                        type="password"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 space-y-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="w-full"
                  >
                    Voltar para Entrega
                  </Button>
                  <Button onClick={nextStep} className="w-full">
                    Revisar Pedido
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Order Confirmation */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Confirmar Pedido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Shipping Summary */}
                  <div>
                    <h3 className="font-semibold mb-2">Endereço de Entrega</h3>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="font-medium">{shippingInfo.fullName}</p>
                      <p>{shippingInfo.address}, {shippingInfo.number}</p>
                      {shippingInfo.complement && <p>{shippingInfo.complement}</p>}
                      <p>{shippingInfo.neighborhood}</p>
                      <p>{shippingInfo.city} - {shippingInfo.state}</p>
                      <p>{shippingInfo.cep}</p>
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div>
                    <h3 className="font-semibold mb-2">Forma de Pagamento</h3>
                    <div className="p-4 bg-muted rounded-lg">
                      <p>Cartão de Crédito</p>
                      <p>**** **** **** {paymentInfo.cardNumber.slice(-4)}</p>
                      <p>{paymentInfo.cardName}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                      className="w-full"
                    >
                      Voltar para Pagamento
                    </Button>
                    <Button
                      onClick={processOrder}
                      disabled={processing}
                      className="w-full"
                    >
                      {processing ? "Processando..." : "Finalizar Pedido"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}