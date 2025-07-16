import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Users, Zap, Shield, Heart, Globe } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Target,
      title: "Missão",
      description: "Democratizar o acesso à moda de qualidade, conectando pessoas aos melhores produtos com preços justos e experiência excepcional."
    },
    {
      icon: Users,
      title: "Compromisso",
      description: "Construir relacionamentos duradouros com nossos clientes, baseados na confiança, transparência e excelência no atendimento."
    },
    {
      icon: Zap,
      title: "Inovação",
      description: "Estar sempre à frente, utilizando tecnologia de ponta para oferecer a melhor experiência de compra online."
    },
    {
      icon: Shield,
      title: "Confiança",
      description: "Garantir segurança em todas as transações e transparência total no processo de compra e entrega."
    }
  ];

  const stats = [
    { number: "50K+", label: "Clientes Satisfeitos" },
    { number: "100K+", label: "Produtos Entregues" },
    { number: "500+", label: "Marcas Parceiras" },
    { number: "4.9★", label: "Avaliação Média" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="outline" className="mb-6 px-4 py-2">
                <Heart className="h-4 w-4 mr-2" />
                Nossa História
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Sobre o <span className="gradient-text">Xegai Outlet</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Nascemos da paixão por conectar pessoas aos melhores produtos de moda, 
                criando uma experiência de compra única que combina qualidade, 
                variedade e preços acessíveis.
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold">Nossa Jornada</h2>
                  <p className="text-lg text-muted-foreground">
                    O Xegai Outlet surgiu da identificação de uma necessidade real no mercado: 
                    oferecer produtos de qualidade premium com preços acessíveis, sem abrir 
                    mão da experiência de compra e do atendimento personalizado.
                  </p>
                  <p className="text-lg text-muted-foreground">
                    Desenvolvemos um modelo de negócio inovador que conecta diretamente 
                    consumidores e fornecedores, eliminando intermediários desnecessários 
                    e garantindo os melhores preços do mercado.
                  </p>
                  <p className="text-lg text-muted-foreground">
                    Hoje, somos referência em dropshipping inteligente, oferecendo uma 
                    curadoria cuidadosa de produtos e uma experiência de compra que 
                    supera expectativas.
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl transform rotate-3"></div>
                  <div className="relative bg-card p-8 rounded-2xl shadow-lg">
                    <div className="text-center space-y-4">
                      <Globe className="h-16 w-16 text-primary mx-auto" />
                      <h3 className="text-2xl font-bold">Conectando Mundos</h3>
                      <p className="text-muted-foreground">
                        Unimos fornecedores de qualidade com consumidores exigentes, 
                        criando uma ponte de confiança e excelência.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-surface/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Nossos <span className="gradient-text">Valores</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Os pilares que guiam cada decisão e ação do Xegai Outlet
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="mx-auto p-4 rounded-full bg-primary/10 w-fit mb-4">
                      <value.icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {value.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Resultados que <span className="gradient-text">Inspiram</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Números que refletem nosso compromisso com a excelência
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                    {stat.number}
                  </div>
                  <div className="text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-surface/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-8">
                Nossa <span className="gradient-text">Equipe</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-12">
                Um time apaixonado por tecnologia, moda e experiência do cliente, 
                trabalhando incansavelmente para superar suas expectativas.
              </p>
              
              <Card className="p-8">
                <CardContent className="text-center space-y-4">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-2xl font-bold">Time Dedicado</h3>
                  <p className="text-lg text-muted-foreground">
                    Nosso time multidisciplinar combina expertise em tecnologia, 
                    e-commerce, atendimento ao cliente e logística para entregar 
                    a melhor experiência possível.
                  </p>
                  <div className="pt-4">
                    <Badge variant="secondary" className="text-sm px-4 py-2">
                      Sempre em evolução
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Future Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-8">
                O <span className="gradient-text">Futuro</span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Continuaremos inovando e expandindo, sempre mantendo nosso foco na 
                qualidade, transparência e satisfação do cliente. Nosso objetivo é 
                ser a referência em e-commerce inteligente no Brasil, conectando 
                cada vez mais pessoas aos produtos dos seus sonhos.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;