import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Users, BarChart3, Download, Calendar, FileText } from "lucide-react";

const Investors = () => {
  const financialHighlights = [
    { metric: "R$ 45M", label: "Receita Anual", growth: "+125%" },
    { metric: "850K", label: "Clientes Ativos", growth: "+78%" },
    { metric: "R$ 12M", label: "EBITDA", growth: "+156%" },
    { metric: "42%", label: "Margem Bruta", growth: "+8pp" }
  ];

  const recentNews = [
    {
      date: "15 Jan 2025",
      title: "Resultados Q4 2024 superam expectativas",
      type: "Earnings",
      description: "Crescimento de 125% na receita anual com expansão para novos mercados"
    },
    {
      date: "8 Jan 2025", 
      title: "Série A: Captação de R$ 25M para expansão",
      type: "Funding",
      description: "Rodada liderada pelo fundo XYZ Ventures para acelerar crescimento"
    },
    {
      date: "22 Dez 2024",
      title: "Lançamento da plataforma de marketplace",
      type: "Product",
      description: "Nova funcionalidade conecta vendedores externos à plataforma"
    }
  ];

  const documents = [
    { title: "Relatório Anual 2024", type: "PDF", size: "2.3 MB", date: "Jan 2025" },
    { title: "Apresentação Corporativa", type: "PDF", size: "5.1 MB", date: "Jan 2025" },
    { title: "Demonstrações Financeiras Q4", type: "PDF", size: "1.8 MB", date: "Jan 2025" },
    { title: "Política de ESG", type: "PDF", size: "950 KB", date: "Dez 2024" }
  ];

  const milestones = [
    { year: "2024", event: "Série A - R$ 25M", description: "Expansão nacional e novos produtos" },
    { year: "2023", event: "Seed Round - R$ 5M", description: "Desenvolvimento da plataforma" },
    { year: "2022", event: "Fundação", description: "Início das operações em Maringá" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
                Relações com Investidores
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Informações financeiras, estratégia de crescimento e oportunidades de investimento 
                na líder em e-commerce de moda e lifestyle
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="btn-gradient">
                  <Download className="mr-2 h-5 w-5" />
                  Relatório Anual
                </Button>
                <Button size="lg" variant="outline">
                  <Calendar className="mr-2 h-5 w-5" />
                  Próximos Eventos
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Financial Highlights */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Destaques Financeiros</h2>
              <p className="text-muted-foreground">Resultados do último período fiscal</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {financialHighlights.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-primary mb-2">{item.metric}</div>
                    <div className="text-muted-foreground mb-3">{item.label}</div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      {item.growth}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Investment Thesis */}
        <section className="py-16 bg-surface/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Por que Investir na Xegai</h2>
                <p className="text-muted-foreground">Oportunidades únicas em um mercado em crescimento</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card>
                  <CardContent className="p-6 text-center">
                    <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-3">Mercado em Expansão</h3>
                    <p className="text-muted-foreground text-sm">
                      E-commerce brasileiro cresce 20% ao ano com penetração ainda baixa
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-3">Base de Clientes Leal</h3>
                    <p className="text-muted-foreground text-sm">
                      Taxa de retenção de 85% e NPS de 72 demonstram satisfação do cliente
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <DollarSign className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-3">Margens Saudáveis</h3>
                    <p className="text-muted-foreground text-sm">
                      Margem bruta de 42% com path para 50% através de eficiências operacionais
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Recent News */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">Notícias Recentes</h2>
              
              <div className="space-y-6">
                {recentNews.map((news, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline">{news.type}</Badge>
                            <span className="text-sm text-muted-foreground">{news.date}</span>
                          </div>
                          <h3 className="text-lg font-semibold mb-2">{news.title}</h3>
                          <p className="text-muted-foreground">{news.description}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <FileText className="mr-2 h-4 w-4" />
                          Ler Mais
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Documents */}
        <section className="py-16 bg-surface/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">Documentos Financeiros</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {documents.map((doc, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{doc.title}</h3>
                            <div className="text-sm text-muted-foreground">
                              {doc.type} • {doc.size} • {doc.date}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center">Nossa Jornada</h2>
              
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                        {milestone.year}
                      </div>
                      {index < milestones.length - 1 && (
                        <div className="w-px h-16 bg-border mt-4"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <h3 className="text-lg font-semibold mb-2">{milestone.event}</h3>
                      <p className="text-muted-foreground">{milestone.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-16 bg-surface/50">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Contato Investidores</h2>
              <div className="space-y-4 mb-8">
                <div>
                  <h3 className="font-semibold">Relações com Investidores</h3>
                  <p className="text-muted-foreground">investors@xegaishop.com.br</p>
                </div>
                <div>
                  <h3 className="font-semibold">Maria Santos - Head of IR</h3>
                  <p className="text-muted-foreground">(44) 99151-2466</p>
                </div>
              </div>
              <Button size="lg" className="btn-gradient">
                Agendar Reunião
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Investors;