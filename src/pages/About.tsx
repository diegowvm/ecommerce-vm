import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Heart,
  Target,
  Users,
  Award,
  Shield,
  Truck,
  Clock,
  Star,
  MapPin,
  Calendar,
  TrendingUp,
  Globe
} from "lucide-react";

export default function About() {
  const values = [
    {
      icon: Heart,
      title: "Paixão por Moda",
      description: "Acreditamos que a moda é uma forma de expressão pessoal e nos dedicamos a oferecer produtos que inspirem confiança.",
      color: "bg-red-500/10 text-red-600"
    },
    {
      icon: Shield,
      title: "Qualidade Garantida",
      description: "Todos os nossos produtos passam por rigoroso controle de qualidade para garantir a melhor experiência.",
      color: "bg-blue-500/10 text-blue-600"
    },
    {
      icon: Users,
      title: "Foco no Cliente",
      description: "Nossos clientes são nossa prioridade. Trabalhamos incansavelmente para superar suas expectativas.",
      color: "bg-green-500/10 text-green-600"
    },
    {
      icon: Target,
      title: "Inovação Contínua",
      description: "Estamos sempre buscando novas tendências e tecnologias para melhorar sua experiência de compra.",
      color: "bg-purple-500/10 text-purple-600"
    }
  ];

  const stats = [
    { icon: Users, value: "50K+", label: "Clientes Satisfeitos" },
    { icon: Award, value: "500+", label: "Marcas Parceiras" },
    { icon: Truck, value: "100K+", label: "Produtos Entregues" },
    { icon: Star, value: "4.8", label: "Avaliação Média" }
  ];

  const timeline = [
    {
      year: "2020",
      title: "Fundação",
      description: "Início da jornada com o sonho de revolucionar o e-commerce de moda no Brasil."
    },
    {
      year: "2021",
      title: "Primeiras Parcerias",
      description: "Estabelecemos parcerias com marcas renomadas e expandimos nosso catálogo."
    },
    {
      year: "2022",
      title: "Crescimento Acelerado",
      description: "Atingimos a marca de 10.000 clientes e lançamos nosso programa de fidelidade."
    },
    {
      year: "2023",
      title: "Expansão Nacional",
      description: "Expandimos nossa operação para todo o Brasil com entrega rápida."
    },
    {
      year: "2024",
      title: "Inovação Tecnológica",
      description: "Lançamos nossa plataforma de dropshipping inteligente e IA para recomendações."
    },
    {
      year: "2025",
      title: "Futuro Sustentável",
      description: "Implementamos práticas sustentáveis e parcerias com marcas eco-friendly."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-background to-muted/20 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <Badge variant="outline" className="mb-4">
                Nossa História
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold gradient-text">
                Sobre a Xegai Shop
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Somos uma empresa apaixonada por moda e tecnologia, dedicada a conectar pessoas 
                aos melhores produtos de calçados, roupas e acessórios através de uma experiência 
                de compra excepcional e inovadora.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="btn-gradient">
                  Conheça Nossos Produtos
                </Button>
                <Button size="lg" variant="outline">
                  Fale Conosco
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <stat.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-3xl font-bold gradient-text mb-2">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div>
                  <Badge variant="outline" className="mb-4">
                    Nossa Missão
                  </Badge>
                  <h2 className="text-3xl font-bold mb-6">
                    Democratizar o acesso à moda de qualidade
                  </h2>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Nossa missão é tornar a moda premium acessível a todos, oferecendo 
                    produtos de alta qualidade com preços justos, através de uma plataforma 
                    tecnológica inovadora que conecta marcas e consumidores de forma inteligente.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Visão</h3>
                      <p className="text-muted-foreground">
                        Ser a principal plataforma de moda online do Brasil, reconhecida pela 
                        qualidade, inovação e excelência no atendimento.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Impacto</h3>
                      <p className="text-muted-foreground">
                        Transformar a experiência de compra online, criando conexões 
                        autênticas entre marcas e consumidores em todo o país.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center">
                  <img 
                    src="/placeholder.png" 
                    alt="Xegai Shop" 
                    className="h-80 w-auto" 
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-background border border-border rounded-lg p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Maringá, PR</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">
                Nossos Valores
              </Badge>
              <h2 className="text-3xl font-bold mb-4">
                O que nos move todos os dias
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Nossos valores fundamentais guiam cada decisão e ação que tomamos 
                para servir melhor nossos clientes e parceiros.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="p-6">
                  <CardContent className="p-0">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg flex-shrink-0 ${value.color}`}>
                        <value.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-3">
                          {value.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {value.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">
                Nossa Jornada
              </Badge>
              <h2 className="text-3xl font-bold mb-4">
                Linha do Tempo
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Acompanhe nossa evolução e os marcos importantes que nos 
                trouxeram até aqui.
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border transform md:-translate-x-0.5"></div>
                
                <div className="space-y-12">
                  {timeline.map((item, index) => (
                    <div key={index} className={`relative flex items-center ${
                      index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                    }`}>
                      {/* Timeline Dot */}
                      <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-primary rounded-full transform md:-translate-x-1.5 z-10"></div>
                      
                      {/* Content */}
                      <div className={`ml-12 md:ml-0 md:w-1/2 ${
                        index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'
                      }`}>
                        <Card className="p-6">
                          <CardContent className="p-0">
                            <div className="flex items-center gap-3 mb-3">
                              <Calendar className="h-5 w-5 text-primary" />
                              <Badge variant="outline">{item.year}</Badge>
                            </div>
                            <h3 className="text-xl font-semibold mb-3">
                              {item.title}
                            </h3>
                            <p className="text-muted-foreground">
                              {item.description}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl font-bold">
                Faça parte da nossa história
              </h2>
              <p className="text-muted-foreground text-lg">
                Junte-se a milhares de clientes satisfeitos e descubra por que 
                a Xegai Shop é a escolha certa para suas compras online.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="btn-gradient">
                  Explorar Produtos
                </Button>
                <Button size="lg" variant="outline">
                  Entrar em Contato
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