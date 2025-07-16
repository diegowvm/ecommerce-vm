import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Clock, MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simular envio
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Mensagem enviada!",
        description: "Entraremos em contato em breve. Obrigado!",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast({
        title: "Erro no envio",
        description: "Tente novamente ou use outro canal de contato.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const contactMethods = [
    {
      icon: Phone,
      title: "Telefone",
      description: "Fale diretamente conosco",
      contact: "(44) 99151-2466",
      availability: "Seg-Sex: 8h às 18h | Sáb: 8h às 12h",
      color: "text-blue-600"
    },
    {
      icon: Mail,
      title: "E-mail",
      description: "Envie sua mensagem",
      contact: "contato.xegaientregas@gmail.com",
      availability: "Resposta em até 24 horas",
      color: "text-green-600"
    },
    {
      icon: MapPin,
      title: "Localização",
      description: "Nossa sede",
      contact: "Maringá, PR - Brasil",
      availability: "Atendimento presencial com agendamento",
      color: "text-red-600"
    },
    {
      icon: MessageCircle,
      title: "Chat Online",
      description: "Suporte em tempo real",
      contact: "Chat disponível no site",
      availability: "Seg-Sex: 8h às 18h",
      color: "text-purple-600"
    }
  ];

  const faqTopics = [
    "Dúvidas sobre pedidos",
    "Problemas com pagamento",
    "Questões de entrega",
    "Trocas e devoluções",
    "Informações de produtos",
    "Suporte técnico",
    "Parcerias comerciais",
    "Outros assuntos"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="outline" className="mb-6 px-4 py-2">
              <MessageCircle className="h-4 w-4 mr-2" />
              Fale Conosco
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Entre em <span className="gradient-text">Contato</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Estamos aqui para ajudar! Nossa equipe está pronta para esclarecer 
              suas dúvidas, resolver problemas e ouvir suas sugestões.
            </p>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Escolha o <span className="gradient-text">Melhor Canal</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Múltiplas formas de entrar em contato conosco
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {contactMethods.map((method, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="mx-auto p-4 rounded-full bg-primary/10 w-fit mb-4">
                      <method.icon className={`h-8 w-8 ${method.color}`} />
                    </div>
                    <CardTitle className="text-xl">{method.title}</CardTitle>
                    <CardDescription className="text-base">
                      {method.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="font-semibold text-foreground">{method.contact}</p>
                    <p className="text-sm text-muted-foreground">{method.availability}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-20 bg-surface/30">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Form */}
                <Card className="p-8">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-2xl flex items-center space-x-2">
                      <Send className="h-6 w-6" />
                      <span>Envie sua Mensagem</span>
                    </CardTitle>
                    <CardDescription className="text-base">
                      Preencha o formulário abaixo e entraremos em contato rapidamente
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium mb-2">
                            Nome Completo *
                          </label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Seu nome completo"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium mb-2">
                            E-mail *
                          </label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="seu@email.com"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium mb-2">
                          Assunto
                        </label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="Resumo do assunto"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="message" className="block text-sm font-medium mb-2">
                          Mensagem *
                        </label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Descreva sua dúvida, sugestão ou problema..."
                          rows={6}
                          required
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full btn-gradient" 
                        size="lg"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Info & FAQ */}
                <div className="space-y-8">
                  {/* Quick Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Clock className="h-6 w-6" />
                        <span>Horários de Atendimento</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Segunda a Sexta</span>
                        <span className="text-muted-foreground">8h às 18h</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Sábados</span>
                        <span className="text-muted-foreground">8h às 12h</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Domingos e Feriados</span>
                        <span className="text-muted-foreground">Fechado</span>
                      </div>
                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          <strong>Tempo médio de resposta:</strong><br />
                          • Telefone: Imediato<br />
                          • E-mail: Até 24 horas<br />
                          • Chat: Até 5 minutos
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* FAQ Topics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Principais Assuntos</CardTitle>
                      <CardDescription>
                        Escolha o tópico que melhor descreve sua necessidade
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        {faqTopics.map((topic, index) => (
                          <Badge key={index} variant="outline" className="justify-center py-2">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Emergency Contact */}
                  <Card className="border-yellow-200 bg-yellow-50/50">
                    <CardHeader>
                      <CardTitle className="text-yellow-800">Precisa de Ajuda Urgente?</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-yellow-700 mb-4">
                        Para problemas urgentes com pedidos já realizados, 
                        utilize nosso WhatsApp:
                      </p>
                      <Button variant="outline" className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-100">
                        (44) 99151-2466
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;