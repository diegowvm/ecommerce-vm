import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ShoppingCart, CreditCard, Truck, Package, CheckCircle, Users, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const HowItWorks = () => {
  const steps = [
    {
      icon: Search,
      title: "1. Navegue e Escolha",
      description: "Explore nossa curadoria de produtos premium de fornecedores verificados. Use filtros para encontrar exatamente o que procura.",
      details: [
        "Catálogo com mais de 10.000 produtos",
        "Filtros avançados por categoria, preço e marca",
        "Descrições detalhadas e fotos reais",
        "Avaliações de outros compradores"
      ]
    },
    {
      icon: ShoppingCart,
      title: "2. Adicione ao Carrinho",
      description: "Selecione tamanho, cor e quantidade. Revise seu pedido e aproveite nossas ofertas especiais.",
      details: [
        "Carrinho inteligente com recomendações",
        "Cálculo automático de frete",
        "Cupons de desconto aplicáveis",
        "Simulação de parcelamento"
      ]
    },
    {
      icon: CreditCard,
      title: "3. Finalize com Segurança",
      description: "Checkout seguro com múltiplas formas de pagamento. Seus dados protegidos por criptografia avançada.",
      details: [
        "Cartão de crédito, débito, PIX e boleto",
        "Parcelamento em até 12x sem juros",
        "Certificado SSL de segurança",
        "Dados criptografados e protegidos"
      ]
    },
    {
      icon: Package,
      title: "4. Processamento Inteligente",
      description: "Seu pedido é automaticamente enviado para nosso fornecedor parceiro mais próximo e confiável.",
      details: [
        "Seleção automática do melhor fornecedor",
        "Verificação de estoque em tempo real",
        "Envio de confirmação por e-mail",
        "Código de rastreamento gerado"
      ]
    },
    {
      icon: Truck,
      title: "5. Entrega Direta",
      description: "O fornecedor prepara e envia seu produto diretamente para você, com rastreamento completo.",
      details: [
        "Embalagem cuidadosa e profissional",
        "Envio direto do fornecedor",
        "Rastreamento em tempo real",
        "Prazo de entrega otimizado"
      ]
    },
    {
      icon: CheckCircle,
      title: "6. Receba e Aproveite",
      description: "Receba seu produto e desfrute da qualidade. Nossa garantia e suporte continuam após a entrega.",
      details: [
        "Garantia de qualidade assegurada",
        "Suporte pós-venda completo",
        "Política de troca e devolução",
        "Atendimento personalizado"
      ]
    }
  ];

  const advantages = [
    {
      icon: Globe,
      title: "Rede Global de Fornecedores",
      description: "Parcerias com fornecedores verificados em todo o mundo, garantindo variedade e qualidade."
    },
    {
      icon: Package,
      title: "Estoque Virtual Inteligente",
      description: "Sem limitações de estoque físico, oferecemos milhares de produtos sempre disponíveis."
    },
    {
      icon: Truck,
      title: "Logística Otimizada",
      description: "Entrega direta do fornecedor reduz tempo de envio e mantém produtos em perfeito estado."
    },
    {
      icon: Users,
      title: "Curadoria Especializada",
      description: "Selecionamos apenas fornecedores confiáveis e produtos de alta qualidade para você."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="outline" className="mb-6 px-4 py-2">
              <Package className="h-4 w-4 mr-2" />
              Dropshipping Inteligente
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Como <span className="gradient-text">Funciona</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Descubra como revolucionamos o e-commerce conectando você diretamente 
              aos melhores fornecedores, garantindo qualidade, preço justo e entrega eficiente.
            </p>
          </div>
        </section>

        {/* Process Steps */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Processo <span className="gradient-text">Simples</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Seis passos para uma experiência de compra excepcional
              </p>
            </div>

            <div className="space-y-12">
              {steps.map((step, index) => (
                <div key={index} className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}>
                  <div className="flex-1">
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="p-3 rounded-full bg-primary/10">
                            <step.icon className="h-8 w-8 text-primary" />
                          </div>
                          <CardTitle className="text-2xl">{step.title}</CardTitle>
                        </div>
                        <CardDescription className="text-lg leading-relaxed">
                          {step.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {step.details.map((detail, dIndex) => (
                            <li key={dIndex} className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                              <span className="text-muted-foreground">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {index + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Advantages Section */}
        <section className="py-20 bg-surface/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Por que Escolher o <span className="gradient-text">Xegai Outlet</span>?
              </h2>
              <p className="text-xl text-muted-foreground">
                Vantagens exclusivas do nosso modelo de dropshipping inteligente
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {advantages.map((advantage, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="mx-auto p-4 rounded-full bg-primary/10 w-fit mb-4">
                      <advantage.icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{advantage.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {advantage.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="p-8 bg-gradient-to-r from-primary/5 to-accent/5">
                <CardContent className="text-center space-y-6">
                  <div className="text-6xl mb-4">🛡️</div>
                  <h3 className="text-3xl font-bold">Sua Segurança é Nossa Prioridade</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Trabalhamos apenas com fornecedores verificados e confiáveis. 
                    Todos os produtos passam por nossa curadoria de qualidade, 
                    e oferecemos garantia total em todas as compras.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">100%</div>
                      <div className="text-sm text-muted-foreground">Fornecedores Verificados</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">7 dias</div>
                      <div className="text-sm text-muted-foreground">Garantia de Troca</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">24/7</div>
                      <div className="text-sm text-muted-foreground">Suporte ao Cliente</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-surface/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Pronto para <span className="gradient-text">Começar</span>?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Explore nossa coleção curada de produtos premium e experimente 
              a diferença do dropshipping inteligente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="btn-gradient text-lg px-8">
                <Link to="/products">
                  Explorar Produtos
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link to="/help">
                  Falar com Suporte
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;