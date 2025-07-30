import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Download, ExternalLink, Image, FileText } from "lucide-react";

const Press = () => {
  const pressReleases = [
    {
      id: 1,
      title: "Xegai Shop Anuncia Expansão Nacional com Nova Plataforma de E-commerce",
      date: "15 de Janeiro, 2025",
      category: "Expansão",
      excerpt: "A empresa anuncia investimento de R$ 10 milhões para expandir operações para todo o Brasil com nova tecnologia proprietária."
    },
    {
      id: 2,
      title: "Parceria Estratégica com Marcas Internacionais Premium",
      date: "8 de Janeiro, 2025",
      category: "Parcerias",
      excerpt: "Acordo exclusivo traz marcas europeias e americanas premium para o mercado brasileiro através da plataforma."
    },
    {
      id: 3,
      title: "Programa de Sustentabilidade: Embalagens 100% Recicláveis",
      date: "22 de Dezembro, 2024",
      category: "Sustentabilidade",
      excerpt: "Iniciativa pioneira no setor visa reduzir impacto ambiental com embalagens biodegradáveis e programa de logística reversa."
    }
  ];

  const mediaAssets = [
    {
      title: "Logo Kit Completo",
      type: "ZIP",
      size: "2.4 MB",
      description: "Logos em alta resolução, versões coloridas e monocromáticas"
    },
    {
      title: "Fotos da Equipe",
      type: "ZIP", 
      size: "15.8 MB",
      description: "Fotos profissionais da equipe executiva e ambiente de trabalho"
    },
    {
      title: "Produtos em Alta Resolução",
      type: "ZIP",
      size: "45.2 MB", 
      description: "Catálogo de produtos com imagens profissionais para uso editorial"
    }
  ];

  const executiveTeam = [
    {
      name: "João Silva",
      position: "CEO & Fundador",
      bio: "Empreendedor serial com 15 anos de experiência em e-commerce e tecnologia.",
      photo: "/placeholder.png"
    },
    {
      name: "Maria Santos",
      position: "Diretora de Marketing",
      bio: "Especialista em marketing digital com passagem por grandes marcas do varejo.",
      photo: "/placeholder.png"
    },
    {
      name: "Carlos Oliveira", 
      position: "CTO",
      bio: "Engenheiro de software com expertise em arquitetura de sistemas escaláveis.",
      photo: "/placeholder.png"
    }
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
                Sala de Imprensa
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Últimas notícias, comunicados e recursos para a imprensa sobre a Xegai Shop
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="btn-gradient">
                  <Download className="mr-2 h-5 w-5" />
                  Kit de Imprensa
                </Button>
                <Button size="lg" variant="outline">
                  Contato para Imprensa
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Press Releases */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">Comunicados à Imprensa</h2>
              
              <div className="space-y-6">
                {pressReleases.map((release) => (
                  <Card key={release.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Badge variant="secondary">{release.category}</Badge>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="mr-1 h-4 w-4" />
                              {release.date}
                            </div>
                          </div>
                          
                          <h3 className="text-xl font-semibold mb-3">{release.title}</h3>
                          <p className="text-muted-foreground mb-4">{release.excerpt}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <FileText className="mr-2 h-4 w-4" />
                            Ler Mais
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Media Assets */}
        <section className="py-16 bg-surface/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">Recursos de Mídia</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mediaAssets.map((asset, index) => (
                  <Card key={index}>
                    <CardContent className="p-6 text-center">
                      <div className="h-16 w-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Image className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">{asset.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{asset.description}</p>
                      <div className="flex justify-between items-center text-xs text-muted-foreground mb-4">
                        <span>{asset.type}</span>
                        <span>{asset.size}</span>
                      </div>
                      <Button size="sm" className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Executive Team */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">Equipe Executiva</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {executiveTeam.map((executive, index) => (
                  <Card key={index} className="text-center">
                    <CardContent className="p-6">
                      <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-muted">
                        <img 
                          src={executive.photo} 
                          alt={executive.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-lg font-semibold mb-1">{executive.name}</h3>
                      <p className="text-primary font-medium mb-3">{executive.position}</p>
                      <p className="text-sm text-muted-foreground">{executive.bio}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="py-16 bg-surface/50">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Contato para Imprensa</h2>
              <div className="space-y-4 mb-8">
                <div>
                  <h3 className="font-semibold">Assessoria de Imprensa</h3>
                  <p className="text-muted-foreground">imprensa@xegaishop.com.br</p>
                  <p className="text-muted-foreground">(44) 99151-2466</p>
                </div>
                <div>
                  <h3 className="font-semibold">Parcerias e Colaborações</h3>
                  <p className="text-muted-foreground">parcerias@xegaishop.com.br</p>
                </div>
              </div>
              <Button size="lg" className="btn-gradient">
                <ExternalLink className="mr-2 h-5 w-5" />
                Entrar em Contato
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Press;