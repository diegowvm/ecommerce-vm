import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Ruler,
  User,
  Users,
  Baby,
  Info,
  AlertCircle,
  CheckCircle,
  Download,
  Shirt,
  Footprints
} from "lucide-react";

export default function SizeGuide() {
  const shoeSizesMen = [
    { br: "39", us: "7", eu: "39", cm: "25.0" },
    { br: "40", us: "7.5", eu: "40", cm: "25.5" },
    { br: "41", us: "8", eu: "41", cm: "26.0" },
    { br: "42", us: "8.5", eu: "42", cm: "26.5" },
    { br: "43", us: "9", eu: "43", cm: "27.0" },
    { br: "44", us: "9.5", eu: "44", cm: "27.5" },
    { br: "45", us: "10", eu: "45", cm: "28.0" },
    { br: "46", us: "10.5", eu: "46", cm: "28.5" },
    { br: "47", us: "11", eu: "47", cm: "29.0" }
  ];

  const shoeSizesWomen = [
    { br: "34", us: "5", eu: "34", cm: "22.0" },
    { br: "35", us: "5.5", eu: "35", cm: "22.5" },
    { br: "36", us: "6", eu: "36", cm: "23.0" },
    { br: "37", us: "6.5", eu: "37", cm: "23.5" },
    { br: "38", us: "7", eu: "38", cm: "24.0" },
    { br: "39", us: "7.5", eu: "39", cm: "24.5" },
    { br: "40", us: "8", eu: "40", cm: "25.0" },
    { br: "41", us: "8.5", eu: "41", cm: "25.5" },
    { br: "42", us: "9", eu: "42", cm: "26.0" }
  ];

  const clothingSizesMen = [
    { size: "PP", chest: "86-91", waist: "76-81", hip: "91-96" },
    { size: "P", chest: "91-96", waist: "81-86", hip: "96-101" },
    { size: "M", chest: "96-101", waist: "86-91", hip: "101-106" },
    { size: "G", chest: "101-106", waist: "91-96", hip: "106-111" },
    { size: "GG", chest: "106-111", waist: "96-101", hip: "111-116" },
    { size: "XGG", chest: "111-116", waist: "101-106", hip: "116-121" }
  ];

  const clothingSizesWomen = [
    { size: "PP", bust: "81-86", waist: "66-71", hip: "91-96" },
    { size: "P", bust: "86-91", waist: "71-76", hip: "96-101" },
    { size: "M", bust: "91-96", waist: "76-81", hip: "101-106" },
    { size: "G", bust: "96-101", waist: "81-86", hip: "106-111" },
    { size: "GG", bust: "101-106", waist: "86-91", hip: "111-116" },
    { size: "XGG", bust: "106-111", waist: "91-96", hip: "116-121" }
  ];

  const measurementTips = [
    {
      icon: Ruler,
      title: "Use uma Fita Métrica",
      description: "Sempre use uma fita métrica flexível para medições mais precisas."
    },
    {
      icon: User,
      title: "Vista Roupas Íntimas",
      description: "Meça usando apenas roupas íntimas para obter medidas exatas."
    },
    {
      icon: CheckCircle,
      title: "Postura Ereta",
      description: "Mantenha uma postura natural e ereta durante as medições."
    },
    {
      icon: Info,
      title: "Ajuda de Terceiros",
      description: "Peça ajuda para medir áreas difíceis de alcançar."
    }
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
                Guia de Tamanhos
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold gradient-text">
                Encontre seu Tamanho Ideal
              </h1>
              <p className="text-xl text-muted-foreground">
                Use nosso guia completo para descobrir o tamanho perfeito e garantir 
                que suas compras tenham o caimento ideal.
              </p>
              <Button size="lg" className="btn-gradient">
                <Download className="h-5 w-5 mr-2" />
                Baixar Guia PDF
              </Button>
            </div>
          </div>
        </section>

        {/* Measurement Tips */}
        <section className="py-20 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Como Medir Corretamente</h2>
              <p className="text-muted-foreground text-lg">
                Siga estas dicas para obter medidas precisas
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {measurementTips.map((tip, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <tip.icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{tip.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      {tip.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Size Tables */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Tabelas de Tamanhos</h2>
              <p className="text-muted-foreground text-lg">
                Consulte as tabelas abaixo para encontrar seu tamanho ideal
              </p>
            </div>
            
            <Tabs defaultValue="shoes" className="max-w-6xl mx-auto">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="shoes" className="flex items-center gap-2">
                  <Footprints className="h-4 w-4" />
                  Calçados
                </TabsTrigger>
                <TabsTrigger value="clothing" className="flex items-center gap-2">
                  <Shirt className="h-4 w-4" />
                  Roupas
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="shoes" className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Men's Shoes */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Calçados Masculinos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2">BR</th>
                              <th className="text-left py-2">US</th>
                              <th className="text-left py-2">EU</th>
                              <th className="text-left py-2">CM</th>
                            </tr>
                          </thead>
                          <tbody>
                            {shoeSizesMen.map((size, index) => (
                              <tr key={index} className="border-b last:border-0">
                                <td className="py-2 font-medium">{size.br}</td>
                                <td className="py-2">{size.us}</td>
                                <td className="py-2">{size.eu}</td>
                                <td className="py-2">{size.cm}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Women's Shoes */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Calçados Femininos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2">BR</th>
                              <th className="text-left py-2">US</th>
                              <th className="text-left py-2">EU</th>
                              <th className="text-left py-2">CM</th>
                            </tr>
                          </thead>
                          <tbody>
                            {shoeSizesWomen.map((size, index) => (
                              <tr key={index} className="border-b last:border-0">
                                <td className="py-2 font-medium">{size.br}</td>
                                <td className="py-2">{size.us}</td>
                                <td className="py-2">{size.eu}</td>
                                <td className="py-2">{size.cm}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="clothing" className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Men's Clothing */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Roupas Masculinas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2">Tamanho</th>
                              <th className="text-left py-2">Peito (cm)</th>
                              <th className="text-left py-2">Cintura (cm)</th>
                              <th className="text-left py-2">Quadril (cm)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {clothingSizesMen.map((size, index) => (
                              <tr key={index} className="border-b last:border-0">
                                <td className="py-2 font-medium">{size.size}</td>
                                <td className="py-2">{size.chest}</td>
                                <td className="py-2">{size.waist}</td>
                                <td className="py-2">{size.hip}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Women's Clothing */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Roupas Femininas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2">Tamanho</th>
                              <th className="text-left py-2">Busto (cm)</th>
                              <th className="text-left py-2">Cintura (cm)</th>
                              <th className="text-left py-2">Quadril (cm)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {clothingSizesWomen.map((size, index) => (
                              <tr key={index} className="border-b last:border-0">
                                <td className="py-2 font-medium">{size.size}</td>
                                <td className="py-2">{size.bust}</td>
                                <td className="py-2">{size.waist}</td>
                                <td className="py-2">{size.hip}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Important Notes */}
        <section className="py-20 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Informações Importantes</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="border-orange-200 bg-orange-50/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-600">
                      <AlertCircle className="h-5 w-5" />
                      Atenção
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• Os tamanhos podem variar entre marcas</li>
                      <li>• Sempre consulte a tabela específica do produto</li>
                      <li>• Em caso de dúvida, entre em contato conosco</li>
                      <li>• Medidas em centímetros são mais precisas</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      Garantia de Troca
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• Troca gratuita em até 7 dias</li>
                      <li>• Produto deve estar em perfeito estado</li>
                      <li>• Etiquetas e embalagem originais</li>
                      <li>• Facilidade total para trocar</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Help Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl font-bold">
                Ainda com dúvidas sobre tamanhos?
              </h2>
              <p className="text-muted-foreground text-lg">
                Nossa equipe está pronta para ajudar você a encontrar o tamanho perfeito
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="btn-gradient">
                  Falar com Especialista
                </Button>
                <Button size="lg" variant="outline">
                  <Download className="h-5 w-5 mr-2" />
                  Baixar Guia Completo
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