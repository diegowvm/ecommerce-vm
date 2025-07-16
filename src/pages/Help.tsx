import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, MessageCircle, Mail, Phone, Clock, Package, CreditCard, Truck } from "lucide-react";
import { useState } from "react";

const Help = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const faqCategories = [
    {
      icon: Package,
      title: "Pedidos",
      description: "Como fazer pedidos, acompanhar status e cancelamentos",
      questions: [
        "Como faço um pedido?",
        "Como acompanho meu pedido?",
        "Posso cancelar meu pedido?",
        "Como alterar dados do pedido?"
      ]
    },
    {
      icon: CreditCard,
      title: "Pagamentos",
      description: "Formas de pagamento, parcelamento e problemas com cobrança",
      questions: [
        "Quais formas de pagamento aceitas?",
        "Posso parcelar minha compra?",
        "Meu pagamento foi recusado",
        "Como recebo a nota fiscal?"
      ]
    },
    {
      icon: Truck,
      title: "Entrega",
      description: "Prazos, frete, endereços e problemas na entrega",
      questions: [
        "Qual o prazo de entrega?",
        "Como calcular o frete?",
        "Posso alterar o endereço?",
        "Não recebi meu pedido"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-transparent py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Central de <span className="gradient-text">Ajuda</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Encontre respostas rápidas para suas dúvidas ou entre em contato conosco
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="search"
                placeholder="Buscar ajuda..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-3 text-lg"
              />
            </div>
          </div>
        </section>

        {/* FAQ Categories */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Perguntas Frequentes</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {faqCategories.map((category, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <category.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{category.title}</CardTitle>
                    </div>
                    <CardDescription className="text-base">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.questions.map((question, qIndex) => (
                        <li key={qIndex}>
                          <Button 
                            variant="ghost" 
                            className="justify-start h-auto p-2 text-sm text-left w-full"
                          >
                            {question}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-surface/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Ainda precisa de ajuda?</h2>
                <p className="text-lg text-muted-foreground">
                  Nossa equipe está pronta para ajudar você
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Contact Info */}
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-full bg-primary/10">
                          <Phone className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Telefone</h3>
                          <p className="text-muted-foreground">(44) 99151-2466</p>
                          <p className="text-sm text-muted-foreground">Seg-Sex: 8h às 18h</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-full bg-primary/10">
                          <Mail className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">E-mail</h3>
                          <p className="text-muted-foreground">contato.xegaientregas@gmail.com</p>
                          <p className="text-sm text-muted-foreground">Resposta em até 24h</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-full bg-primary/10">
                          <Clock className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Horário de Atendimento</h3>
                          <p className="text-muted-foreground">Segunda a Sexta: 8h às 18h</p>
                          <p className="text-sm text-muted-foreground">Sábados: 8h às 12h</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Contact Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MessageCircle className="h-6 w-6" />
                      <span>Envie sua Mensagem</span>
                    </CardTitle>
                    <CardDescription>
                      Descreva sua dúvida e entraremos em contato rapidamente
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Input placeholder="Seu nome" />
                    </div>
                    <div>
                      <Input type="email" placeholder="Seu e-mail" />
                    </div>
                    <div>
                      <Input placeholder="Assunto" />
                    </div>
                    <div>
                      <Textarea 
                        placeholder="Descreva sua dúvida..." 
                        rows={4}
                      />
                    </div>
                    <Button className="w-full btn-gradient">
                      Enviar Mensagem
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Help;