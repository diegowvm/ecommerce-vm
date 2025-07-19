import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageCircle,
  Send,
  Calendar,
  User,
  HelpCircle,
  Building,
  Globe
} from "lucide-react";

export default function Contact() {
  const contactMethods = [
    {
      icon: Phone,
      title: "Telefone",
      description: "Fale diretamente conosco",
      contact: "(44) 99151-2466",
      availability: "Seg-Sex: 8h às 18h | Sáb: 8h às 14h",
      color: "bg-green-500/10 text-green-600",
      action: "Ligar Agora"
    },
    {
      icon: Mail,
      title: "E-mail",
      description: "Envie sua mensagem",
      contact: "contato@xegaishop.com.br",
      availability: "Resposta em até 24 horas",
      color: "bg-blue-500/10 text-blue-600",
      action: "Enviar E-mail"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      description: "Chat direto pelo WhatsApp",
      contact: "(44) 99151-2466",
      availability: "Seg-Sex: 8h às 18h",
      color: "bg-green-500/10 text-green-600",
      action: "Abrir WhatsApp"
    }
  ];

  const departments = [
    {
      icon: HelpCircle,
      title: "Suporte Geral",
      description: "Dúvidas gerais, pedidos e produtos",
      email: "suporte@xegaioutlet.com"
    },
    {
      icon: Building,
      title: "Parcerias Comerciais",
      description: "Fornecedores e oportunidades de negócio",
      email: "comercial@xegaioutlet.com"
    },
    {
      icon: User,
      title: "Recursos Humanos",
      description: "Carreiras e oportunidades de trabalho",
      email: "rh@xegaishop.com.br"
    },
    {
      icon: Globe,
      title: "Imprensa",
      description: "Assessoria de imprensa e mídia",
      email: "imprensa@xegaishop.com.br"
    }
  ];

  const businessHours = [
    { day: "Segunda a Sexta", hours: "8:00 - 18:00" },
    { day: "Sábado", hours: "8:00 - 14:00" },
    { day: "Domingo", hours: "Fechado" },
    { day: "Feriados", hours: "Fechado" }
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
                Fale Conosco
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold gradient-text">
                Entre em Contato
              </h1>
              <p className="text-xl text-muted-foreground">
                Estamos aqui para ajudar! Entre em contato conosco através dos canais abaixo 
                ou envie uma mensagem direta.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Como Falar Conosco</h2>
              <p className="text-muted-foreground text-lg">
                Escolha o canal que melhor se adequa à sua necessidade
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {contactMethods.map((method, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${method.color}`}>
                      <method.icon className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-xl">{method.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      {method.description}
                    </p>
                    <div className="space-y-2">
                      <p className="font-semibold text-lg">
                        {method.contact}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {method.availability}
                      </p>
                    </div>
                    <Button className="w-full">
                      {method.action}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-20 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Contact Form */}
              <div>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold mb-4">Envie sua Mensagem</h2>
                  <p className="text-muted-foreground text-lg">
                    Preencha o formulário abaixo e entraremos em contato em breve
                  </p>
                </div>
                
                <Card>
                  <CardContent className="p-8">
                    <form className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Nome Completo *
                          </label>
                          <Input placeholder="Seu nome completo" />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            E-mail *
                          </label>
                          <Input type="email" placeholder="seu@email.com" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Telefone
                          </label>
                          <Input placeholder="(00) 00000-0000" />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Departamento
                          </label>
                          <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                            <option>Suporte Geral</option>
                            <option>Parcerias Comerciais</option>
                            <option>Recursos Humanos</option>
                            <option>Imprensa</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Assunto *
                        </label>
                        <Input placeholder="Sobre o que você gostaria de falar?" />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Mensagem *
                        </label>
                        <Textarea 
                          placeholder="Descreva sua dúvida, sugestão ou necessidade..."
                          rows={5}
                        />
                      </div>
                      
                      <Button className="w-full btn-gradient" size="lg">
                        <Send className="h-5 w-5 mr-2" />
                        Enviar Mensagem
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Company Info */}
              <div className="space-y-8">
                {/* Business Hours */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-primary" />
                      Horário de Atendimento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {businessHours.map((schedule, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                          <span className="text-muted-foreground">{schedule.day}</span>
                          <span className="font-medium">{schedule.hours}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Company Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      Nossa Localização
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Xegai Shop</h4>
                        <p className="text-muted-foreground">
                          Maringá, Paraná<br />
                          Brasil<br />
                          CEP: 87000-000
                        </p>
                      </div>
                      <Button variant="outline" className="w-full">
                        <MapPin className="h-4 w-4 mr-2" />
                        Ver no Mapa
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Departments */}
                <Card>
                  <CardHeader>
                    <CardTitle>Departamentos Específicos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {departments.map((dept, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                          <div className="p-2 bg-background rounded-lg">
                            <dept.icon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{dept.title}</h4>
                            <p className="text-sm text-muted-foreground mb-1">
                              {dept.description}
                            </p>
                            <p className="text-sm font-medium text-primary">
                              {dept.email}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Quick Links */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl font-bold">
                Precisa de ajuda imediata?
              </h2>
              <p className="text-muted-foreground text-lg">
                Consulte nossa central de ajuda para respostas rápidas às perguntas mais comuns
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="outline">
                  <HelpCircle className="h-5 w-5 mr-2" />
                  Central de Ajuda
                </Button>
                <Button size="lg" variant="outline">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  FAQ
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