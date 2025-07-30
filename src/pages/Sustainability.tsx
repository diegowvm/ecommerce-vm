import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Leaf, Recycle, Truck, Heart, Target, Users } from "lucide-react";

const Sustainability = () => {
  const initiatives = [
    {
      icon: Recycle,
      title: "Embalagens Sustentáveis",
      description: "100% das nossas embalagens são feitas de materiais recicláveis ou biodegradáveis",
      progress: 100,
      status: "Concluído"
    },
    {
      icon: Truck,
      title: "Logística Verde",
      description: "Otimização de rotas e consolidação de entregas para reduzir emissões de CO₂",
      progress: 75,
      status: "Em Progresso"
    },
    {
      icon: Leaf,
      title: "Compensação de Carbono",
      description: "Programa de plantio de árvores para neutralizar nossa pegada de carbono",
      progress: 60,
      status: "Em Progresso"
    },
    {
      icon: Heart,
      title: "Fornecedores Responsáveis",
      description: "Parceria apenas com fornecedores que seguem práticas sustentáveis",
      progress: 85,
      status: "Em Progresso"
    }
  ];

  const goals = [
    {
      title: "Neutralidade de Carbono",
      target: "2026",
      description: "Atingir neutralidade total de carbono em todas as operações"
    },
    {
      title: "Zero Desperdício",
      target: "2025",
      description: "Implementar programa de zero desperdício em todos os centros de distribuição"
    },
    {
      title: "Energia Renovável",
      target: "2024",
      description: "100% da energia dos nossos escritórios e CDs vindos de fontes renováveis"
    }
  ];

  const impact = [
    { metric: "15,000", label: "Árvores Plantadas", icon: Leaf },
    { metric: "2.3 ton", label: "CO₂ Compensado", icon: Recycle },
    { metric: "85%", label: "Redução em Embalagens", icon: Target },
    { metric: "500+", label: "Parceiros Sustentáveis", icon: Users }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-green-50/50 to-blue-50/50 dark:from-green-900/10 dark:to-blue-900/10">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <Leaf className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
                Nosso Compromisso com a Sustentabilidade
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Construindo um futuro mais verde através de práticas responsáveis 
                e inovação sustentável em cada aspecto do nosso negócio
              </p>
            </div>
          </div>
        </section>

        {/* Impact Metrics */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Nosso Impacto</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Números que refletem nosso compromisso com um planeta mais sustentável
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {impact.map((item, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <item.icon className="h-8 w-8 text-green-600 mx-auto mb-4" />
                    <div className="text-3xl font-bold text-green-600 mb-2">{item.metric}</div>
                    <div className="text-muted-foreground">{item.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Initiatives */}
        <section className="py-16 bg-surface/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Nossas Iniciativas</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Projetos em andamento para reduzir nosso impacto ambiental
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {initiatives.map((initiative, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <initiative.icon className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{initiative.title}</h3>
                          <Badge 
                            variant={initiative.status === "Concluído" ? "default" : "secondary"}
                            className={initiative.status === "Concluído" ? "bg-green-100 text-green-800" : ""}
                          >
                            {initiative.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-4">{initiative.description}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progresso</span>
                            <span>{initiative.progress}%</span>
                          </div>
                          <Progress value={initiative.progress} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Goals */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Metas para o Futuro</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Nossos objetivos ambiciosos para os próximos anos
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {goals.map((goal, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="text-3xl font-bold text-primary mb-2">{goal.target}</div>
                    <h3 className="text-lg font-semibold mb-3">{goal.title}</h3>
                    <p className="text-muted-foreground text-sm">{goal.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-br from-green-50/50 to-blue-50/50 dark:from-green-900/10 dark:to-blue-900/10">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">Junte-se ao Movimento</h2>
              <p className="text-muted-foreground mb-8">
                Cada compra que você faz é uma escolha pelo futuro do planeta. 
                Juntos, podemos fazer a diferença.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/products" 
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  <Leaf className="mr-2 h-5 w-5" />
                  Comprar Sustentável
                </a>
                <a 
                  href="/about" 
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                >
                  Saiba Mais
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Sustainability;