import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cookie, Shield, Settings, Info } from "lucide-react";

const CookiesPolicy = () => {
  const cookieTypes = [
    {
      type: "Essenciais",
      icon: Shield,
      color: "bg-red-100 text-red-800",
      description: "Necessários para o funcionamento básico do site",
      examples: ["Sessão do usuário", "Carrinho de compras", "Preferências de idioma"],
      canDisable: false
    },
    {
      type: "Funcionais", 
      icon: Settings,
      color: "bg-blue-100 text-blue-800",
      description: "Melhoram a funcionalidade e personalização",
      examples: ["Lembrar login", "Preferências de layout", "Histórico de navegação"],
      canDisable: true
    },
    {
      type: "Analíticos",
      icon: Info,
      color: "bg-green-100 text-green-800", 
      description: "Ajudam a entender como você usa nosso site",
      examples: ["Google Analytics", "Hotjar", "Métricas de performance"],
      canDisable: true
    },
    {
      type: "Marketing",
      icon: Cookie,
      color: "bg-purple-100 text-purple-800",
      description: "Usados para personalizar anúncios e campanhas",
      examples: ["Facebook Pixel", "Google Ads", "Remarketing"],
      canDisable: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Cookie className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold gradient-text mb-4">
              Política de Cookies
            </h1>
            <p className="text-muted-foreground text-lg">
              Como usamos cookies para melhorar sua experiência de navegação
            </p>
            <div className="text-sm text-muted-foreground mt-4">
              Última atualização: 30 de janeiro de 2025
            </div>
          </div>

          {/* Introduction */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">O que são Cookies?</h2>
              <p className="text-muted-foreground mb-4">
                Cookies são pequenos arquivos de texto que são armazenados no seu dispositivo quando você visita nosso site. 
                Eles nos ajudam a fornecer uma experiência personalizada e melhorar nossos serviços.
              </p>
              <p className="text-muted-foreground">
                Na Xegai Shop, usamos cookies para diferentes finalidades, sempre respeitando sua privacidade e 
                oferecendo controle sobre suas preferências.
              </p>
            </CardContent>
          </Card>

          {/* Cookie Types */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">Tipos de Cookies que Usamos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cookieTypes.map((cookie, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <cookie.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{cookie.type}</h3>
                          <Badge className={cookie.color}>
                            {cookie.canDisable ? "Opcional" : "Obrigatório"}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mb-3">
                          {cookie.description}
                        </p>
                        <div>
                          <h4 className="font-medium text-sm mb-2">Exemplos:</h4>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {cookie.examples.map((example, idx) => (
                              <li key={idx}>• {example}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* How We Use Cookies */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Como Usamos os Cookies</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Melhoria da Experiência</h3>
                  <p className="text-muted-foreground text-sm">
                    Lembramos suas preferências e personalizamos o conteúdo para tornar sua navegação mais eficiente.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Funcionalidade do Site</h3>
                  <p className="text-muted-foreground text-sm">
                    Mantemos itens no seu carrinho, preferências de login e outras funcionalidades essenciais.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Análise e Melhorias</h3>
                  <p className="text-muted-foreground text-sm">
                    Analisamos como você usa nosso site para identificar oportunidades de melhoria.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Marketing Personalizado</h3>
                  <p className="text-muted-foreground text-sm">
                    Exibimos anúncios relevantes baseados nos seus interesses e comportamento de navegação.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cookie Management */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Gerenciamento de Cookies</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Controle Suas Preferências</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    Você tem controle total sobre os cookies não essenciais. Pode aceitar, recusar ou 
                    personalizar suas preferências a qualquer momento.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Configurações do Navegador</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    A maioria dos navegadores permite que você:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Visualize e delete cookies existentes</li>
                    <li>• Bloqueie todos os cookies</li>
                    <li>• Bloqueie cookies de sites específicos</li>
                    <li>• Bloqueie cookies de terceiros</li>
                    <li>• Seja notificado quando um cookie for definido</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Impacto da Recusa</h3>
                  <p className="text-muted-foreground text-sm">
                    Ao recusar cookies opcionais, algumas funcionalidades podem ser limitadas, como 
                    personalização de conteúdo e lembrar suas preferências entre sessões.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Third Party Cookies */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Cookies de Terceiros</h2>
              <p className="text-muted-foreground mb-4">
                Nosso site pode conter cookies de parceiros e serviços de terceiros:
              </p>
              <div className="space-y-3">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold">Google Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    Para análise de tráfego e comportamento dos usuários
                  </p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold">Facebook Pixel</h3>
                  <p className="text-sm text-muted-foreground">
                    Para otimização de campanhas publicitárias
                  </p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-semibold">Hotjar</h3>
                  <p className="text-sm text-muted-foreground">
                    Para análise de experiência do usuário
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Tempo de Retenção</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Cookies de Sessão</span>
                  <Badge variant="outline">Até o fechamento do navegador</Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Cookies Funcionais</span>
                  <Badge variant="outline">Até 1 ano</Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Cookies Analíticos</span>
                  <Badge variant="outline">Até 2 anos</Badge>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium">Cookies de Marketing</span>
                  <Badge variant="outline">Até 90 dias</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Dúvidas sobre Cookies?</h2>
              <p className="text-muted-foreground mb-4">
                Se você tiver dúvidas sobre nossa Política de Cookies ou desejar exercer seus direitos 
                de privacidade, entre em contato conosco:
              </p>
              <div className="space-y-2">
                <p><strong>E-mail:</strong> privacidade@xegaishop.com.br</p>
                <p><strong>Telefone:</strong> (44) 99151-2466</p>
                <p><strong>Endereço:</strong> Maringá, PR - Brasil</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CookiesPolicy;