import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search,
  ShoppingCart,
  CreditCard,
  Truck,
  Package,
  CheckCircle,
  ArrowRight,
  Shield,
  RefreshCw,
  Clock,
  Star,
  Gift,
  Percent
} from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: "1. Explore e Descubra",
      description: "Navegue por nosso catálogo com milhares de produtos de marcas renomadas. Use filtros para encontrar exatamente o que procura.",
      details: [
        "Mais de 10.000 produtos disponíveis",
        "Filtros inteligentes por categoria, marca, preço",
        "Busca avançada com sugestões",
        "Avaliações e fotos reais de clientes"
      ],
      color: "bg-blue-500/10 text-blue-600"
    },
    {
      icon: ShoppingCart,
      title: "2. Adicione ao Carrinho",
      description: "Selecione tamanho, cor e quantidade. Seus itens ficam salvos para finalizar a compra quando quiser.",
      details: [
        "Carrinho persistente entre sessões",
        "Cálculo automático de frete",
        "Sugestões de produtos relacionados",
        "Lista de desejos integrada"
      ],
      color: "bg-orange-500/10 text-orange-600"
    },
    {
      icon: CreditCard,
      title: "3. Finalize o Pagamento",
      description: "Escolha sua forma de pagamento preferida e complete a compra com total segurança em poucos cliques.",
      details: [
        "PIX, cartão, boleto e mais opções",
        "Pagamento 100% seguro e criptografado",
        "Parcelamento em até 12x sem juros",
        "Salvamento de dados para próximas compras"
      ],
      color: "bg-green-500/10 text-green-600"
    },
    {
      icon: Truck,
      title: "4. Acompanhe a Entrega",
      description: "Receba atualizações em tempo real sobre seu pedido até a entrega na sua porta.",
      details: [
        "Código de rastreamento enviado por email",
        "Atualizações por WhatsApp",
        "Previsão precisa de entrega",
        "Entrega rápida em todo o Brasil"
      ],
      color: "bg-purple-500/10 text-purple-600"
    }
  ];

  const features = [
    {
      icon: Shield,
      title: "Compra 100% Segura",
      description: "Seus dados protegidos com criptografia de ponta e certificados de segurança."
    },
    {
      icon: RefreshCw,
      title: "Troca Garantida",
      description: "Não ficou satisfeito? Troca grátis em até 7 dias, sem complicação."
    },
    {
      icon: Clock,
      title: "Entrega Rápida",
      description: "Receba seus produtos rapidamente com nossos parceiros de logística confiáveis."
    },
    {
      icon: Star,
      title: "Atendimento Premium",
      description: "Suporte especializado pronto para ajudar antes, durante e depois da compra."
    },
    {
      icon: Gift,
      title: "Programa de Fidelidade",
      description: "Acumule pontos a cada compra e troque por descontos especiais."
    },
    {
      icon: Percent,
      title: "Ofertas Exclusivas",
      description: "Promoções e descontos especiais para nossos clientes cadastrados."
    }
  ];

  const benefits = [
    {
      title: "Frete Grátis",
      description: "Em compras acima de R$ 199",
      icon: "🚚"
    },
    {
      title: "Até 12x sem Juros",
      description: "No cartão de crédito",
      icon: "💳"
    },
    {
      title: "Troca Garantida",
      description: "7 dias para trocar",
      icon: "🔄"
    },
    {
      title: "Suporte 24/7",
      description: "Atendimento sempre disponível",
      icon: "💬"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-background to-muted/20 py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <Badge variant="outline" className="mb-4">
                Como Funciona
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold gradient-text">
                Como Comprar na Xegai Outlet
              </h1>
              <p className="text-xl text-muted-foreground">
                Descubra como é fácil, rápido e seguro fazer suas compras conosco. 
                Do primeiro clique até a entrega na sua casa.
              </p>
              <Button size="lg" className="btn-gradient">
                Começar a Comprar
              </Button>
            </div>
          </div>
        </section>

        {/* Benefits Bar */}
        <section className="py-8 bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl mb-2">{benefit.icon}</div>
                  <div className="text-sm font-medium">{benefit.title}</div>
                  <div className="text-xs text-muted-foreground">{benefit.description}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Steps Process */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Processo de Compra Simples</h2>
              <p className="text-muted-foreground text-lg">
                Em apenas 4 passos você recebe seus produtos favoritos
              </p>
            </div>
            
            <div className="space-y-16">
              {steps.map((step, index) => (
                <div key={index} className={`flex flex-col lg:flex-row items-center gap-12 ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}>
                  {/* Content */}
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`p-4 rounded-2xl ${step.color}`}>
                        <step.icon className="h-8 w-8" />
                      </div>
                      <h3 className="text-2xl font-bold">{step.title}</h3>
                    </div>
                    
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {step.description}
                    </p>
                    
                    <div className="space-y-3">
                      {step.details.map((detail, detailIndex) => (
                        <div key={detailIndex} className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="text-sm">{detail}</span>
                        </div>
                      ))}
                    </div>
                    
                    {index < steps.length - 1 && (
                      <div className="flex items-center gap-2 pt-4">
                        <span className="text-sm text-muted-foreground">Próximo passo</span>
                        <ArrowRight className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </div>

                  {/* Visual */}
                  <div className="flex-1">
                    <Card className="p-8 bg-gradient-to-br from-muted/20 to-muted/40">
                      <CardContent className="p-0 text-center">
                        <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6 ${step.color}`}>
                          <step.icon className="h-12 w-12" />
                        </div>
                        <div className="text-6xl font-bold text-muted-foreground/20 mb-4">
                          {index + 1}
                        </div>
                        <div className="text-lg font-semibold">
                          {step.title.replace(/^\d+\.\s/, '')}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Por que Escolher a Xegai Outlet?</h2>
              <p className="text-muted-foreground text-lg">
                Oferecemos muito mais que produtos de qualidade
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Payment Methods */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Formas de Pagamento</h2>
              <p className="text-muted-foreground text-lg">
                Escolha a opção que melhor se adequa a você
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="text-center">
                  <CardHeader>
                    <div className="text-4xl mb-4">💳</div>
                    <CardTitle>Cartão de Crédito</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Parcelamento em até 12x sem juros
                    </p>
                    <div className="text-sm space-y-1">
                      <div>Visa, Mastercard, Elo</div>
                      <div>Aprovação imediata</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="text-center border-primary/20 bg-primary/5">
                  <CardHeader>
                    <Badge className="mb-2">Mais Popular</Badge>
                    <div className="text-4xl mb-4">🔗</div>
                    <CardTitle>PIX</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Pagamento instantâneo e seguro
                    </p>
                    <div className="text-sm space-y-1">
                      <div>Disponível 24/7</div>
                      <div>Confirmação imediata</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardHeader>
                    <div className="text-4xl mb-4">🧾</div>
                    <CardTitle>Boleto Bancário</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Pagamento tradicional e confiável
                    </p>
                    <div className="text-sm space-y-1">
                      <div>Vencimento em 3 dias úteis</div>
                      <div>Todos os bancos</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Dúvidas Frequentes</h2>
              <p className="text-muted-foreground text-lg">
                Respostas rápidas para as perguntas mais comuns
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto space-y-6">
              {[
                {
                  question: "Quanto tempo demora para receber meu pedido?",
                  answer: "O prazo varia de 2 a 7 dias úteis, dependendo da sua região. Você receberá o código de rastreamento assim que o pedido for despachado."
                },
                {
                  question: "Posso trocar se não gostar do produto?",
                  answer: "Sim! Você tem até 7 dias corridos após o recebimento para solicitar a troca. O produto deve estar em perfeito estado com etiquetas originais."
                },
                {
                  question: "Como funciona o frete grátis?",
                  answer: "O frete é gratuito para compras acima de R$ 199,00 para todo o Brasil. Para valores menores, calculamos o frete com base no CEP de entrega."
                },
                {
                  question: "Meus dados estão seguros?",
                  answer: "Absolutamente! Usamos criptografia de ponta e certificados de segurança para proteger todas as suas informações pessoais e de pagamento."
                }
              ].map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl font-bold">
                Pronto para Começar?
              </h2>
              <p className="text-muted-foreground text-lg">
                Explore nosso catálogo e descubra milhares de produtos incríveis 
                com preços especiais e qualidade garantida.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="btn-gradient">
                  Explorar Produtos
                </Button>
                <Button size="lg" variant="outline">
                  Criar Minha Conta
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}