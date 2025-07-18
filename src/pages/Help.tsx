import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock, 
  Search,
  ChevronRight,
  Package,
  CreditCard,
  Truck,
  RefreshCw,
  Shield,
  Users
} from "lucide-react";

export default function Help() {
  const helpCategories = [
    {
      icon: Package,
      title: "Pedidos e Compras",
      description: "Como fazer pedidos, acompanhar status e gerenciar compras",
      articles: 12,
      color: "bg-blue-500/10 text-blue-600"
    },
    {
      icon: CreditCard,
      title: "Pagamentos",
      description: "Formas de pagamento, PIX, cartões e financiamento",
      articles: 8,
      color: "bg-green-500/10 text-green-600"
    },
    {
      icon: Truck,
      title: "Entrega e Frete",
      description: "Prazos, custos de frete e rastreamento de pedidos",
      articles: 10,
      color: "bg-orange-500/10 text-orange-600"
    },
    {
      icon: RefreshCw,
      title: "Trocas e Devoluções",
      description: "Como solicitar trocas, devoluções e reembolsos",
      articles: 6,
      color: "bg-purple-500/10 text-purple-600"
    },
    {
      icon: Shield,
      title: "Segurança e Privacidade",
      description: "Proteção de dados, compra segura e políticas",
      articles: 5,
      color: "bg-red-500/10 text-red-600"
    },
    {
      icon: Users,
      title: "Minha Conta",
      description: "Perfil, endereços, lista de desejos e histórico",
      articles: 7,
      color: "bg-indigo-500/10 text-indigo-600"
    }
  ];

  const faqItems = [
    {
      question: "Como posso rastrear meu pedido?",
      answer: "Você pode rastrear seu pedido através da seção 'Meus Pedidos' no seu perfil ou usando o código de rastreamento enviado por email."
    },
    {
      question: "Qual o prazo para trocas e devoluções?",
      answer: "Você tem até 7 dias corridos após o recebimento do produto para solicitar troca ou devolução, conforme o Código de Defesa do Consumidor."
    },
    {
      question: "Quais são as formas de pagamento aceitas?",
      answer: "Aceitamos PIX, cartões de crédito (Visa, Mastercard, Elo), cartões de débito e boleto bancário."
    },
    {
      question: "O frete é grátis?",
      answer: "Sim! O frete é grátis para compras acima de R$ 199,00 para todo o Brasil."
    },
    {
      question: "Como funciona o programa de fidelidade?",
      answer: "A cada compra você acumula pontos que podem ser convertidos em desconto nas próximas compras. 1 real gasto = 1 ponto."
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
              <div className="space-y-4">
                <Badge variant="outline" className="mb-4">
                  Central de Ajuda
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold gradient-text">
                  Como podemos ajudar?
                </h1>
                <p className="text-xl text-muted-foreground">
                  Encontre respostas rápidas para suas dúvidas ou entre em contato conosco
                </p>
              </div>
              
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Buscar ajuda..."
                  className="pl-10 py-3 text-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Categorias de Ajuda</h2>
              <p className="text-muted-foreground text-lg">
                Explore nossa base de conhecimento organizada por temas
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {helpCategories.map((category, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-lg ${category.color}`}>
                        <category.icon className="h-6 w-6" />
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <CardTitle className="text-xl">{category.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {category.description}
                    </p>
                    <Badge variant="secondary">
                      {category.articles} artigos
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Perguntas Frequentes</h2>
              <p className="text-muted-foreground text-lg">
                Respostas para as dúvidas mais comuns
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto space-y-4">
              {faqItems.map((item, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-start gap-3">
                      <HelpCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      {item.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground ml-8">
                      {item.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Ainda precisa de ajuda?</h2>
              <p className="text-muted-foreground text-lg">
                Nossa equipe está pronta para ajudar você
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <MessageCircle className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>Chat Online</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Fale conosco em tempo real
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Seg-Sex: 8h às 18h
                  </p>
                  <Button className="w-full">Iniciar Chat</Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Phone className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>Telefone</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Atendimento por telefone
                  </p>
                  <p className="font-semibold mb-2">(44) 99151-2466</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Seg-Sex: 8h às 18h
                  </p>
                  <Button variant="outline" className="w-full">Ligar Agora</Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Mail className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>E-mail</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Envie sua dúvida por e-mail
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Resposta em até 24h
                  </p>
                  <Button variant="outline" className="w-full">Enviar E-mail</Button>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-center">Envie sua Mensagem</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Nome</label>
                    <Input placeholder="Seu nome completo" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">E-mail</label>
                    <Input type="email" placeholder="seu@email.com" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Assunto</label>
                  <Input placeholder="Sobre o que você precisa de ajuda?" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Mensagem</label>
                  <Textarea 
                    placeholder="Descreva sua dúvida ou problema..."
                    rows={4}
                  />
                </div>
                <Button className="w-full btn-gradient">
                  Enviar Mensagem
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}