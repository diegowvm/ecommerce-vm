import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Briefcase, Users, Heart, Zap } from "lucide-react";

const Careers = () => {
  const jobOpenings = [
    {
      id: 1,
      title: "Desenvolvedor Frontend React",
      department: "Tecnologia",
      location: "Maringá, PR",
      type: "CLT",
      level: "Pleno",
      description: "Buscamos desenvolvedor frontend para trabalhar com React, TypeScript e tecnologias modernas."
    },
    {
      id: 2,
      title: "Especialista em E-commerce",
      department: "Marketing Digital",
      location: "Remoto",
      type: "CLT",
      level: "Senior",
      description: "Profissional para otimizar conversões e melhorar a experiência de compra online."
    },
    {
      id: 3,
      title: "Analista de Customer Success",
      department: "Atendimento",
      location: "Maringá, PR",
      type: "CLT",
      level: "Junior",
      description: "Responsável por garantir a satisfação e sucesso dos nossos clientes."
    }
  ];

  const benefits = [
    { icon: Heart, title: "Plano de Saúde", description: "Cobertura completa para você e sua família" },
    { icon: Zap, title: "Vale Alimentação", description: "Auxílio para suas refeições diárias" },
    { icon: Users, title: "Ambiente Colaborativo", description: "Time unido e cultura de crescimento" },
    { icon: Briefcase, title: "Home Office", description: "Flexibilidade para trabalhar de casa" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
              Faça Parte da Nossa Equipe
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Na Xegai Shop, acreditamos que grandes produtos vêm de grandes pessoas. 
              Junte-se a nós para construir o futuro do e-commerce brasileiro.
            </p>
            <Button size="lg" className="btn-gradient">
              Ver Vagas Abertas
            </Button>
          </div>
        </section>

        {/* Our Culture */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Nossa Cultura</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Valorizamos a inovação, colaboração e crescimento mútuo em um ambiente inclusivo e diverso.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <benefit.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Job Openings */}
        <section className="py-16 bg-surface/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Vagas Abertas</h2>
              <p className="text-muted-foreground">
                Encontre a oportunidade perfeita para sua carreira
              </p>
            </div>

            <div className="space-y-6 max-w-4xl mx-auto">
              {jobOpenings.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <h3 className="text-xl font-semibold">{job.title}</h3>
                          <Badge variant="secondary">{job.level}</Badge>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            <span>{job.department}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{job.type}</span>
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground">{job.description}</p>
                      </div>
                      
                      <div className="lg:ml-4">
                        <Button className="w-full lg:w-auto">
                          Candidatar-se
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {jobOpenings.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">Nenhuma vaga aberta no momento</h3>
                <p className="text-muted-foreground mb-6">
                  Mas fique atento! Novas oportunidades surgem constantemente.
                </p>
                <Button variant="outline">
                  Cadastrar Currículo
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Não Encontrou a Vaga Ideal?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Envie seu currículo para nós! Estamos sempre em busca de talentos excepcionais 
              para fazer parte do nosso time.
            </p>
            <Button size="lg" variant="outline">
              Enviar Currículo
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Careers;