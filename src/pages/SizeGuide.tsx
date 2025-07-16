import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ruler, User, Shirt, Activity } from "lucide-react";

const SizeGuide = () => {
  const shoeSizes = {
    men: [
      { br: "37", us: "6", cm: "24.0" },
      { br: "38", us: "6.5", cm: "24.5" },
      { br: "39", us: "7", cm: "25.0" },
      { br: "40", us: "7.5", cm: "25.5" },
      { br: "41", us: "8", cm: "26.0" },
      { br: "42", us: "8.5", cm: "26.5" },
      { br: "43", us: "9", cm: "27.0" },
      { br: "44", us: "9.5", cm: "27.5" },
      { br: "45", us: "10", cm: "28.0" },
      { br: "46", us: "10.5", cm: "28.5" }
    ],
    women: [
      { br: "33", us: "4", cm: "21.0" },
      { br: "34", us: "4.5", cm: "21.5" },
      { br: "35", us: "5", cm: "22.0" },
      { br: "36", us: "5.5", cm: "22.5" },
      { br: "37", us: "6", cm: "23.0" },
      { br: "38", us: "6.5", cm: "23.5" },
      { br: "39", us: "7", cm: "24.0" },
      { br: "40", us: "7.5", cm: "24.5" },
      { br: "41", us: "8", cm: "25.0" },
      { br: "42", us: "8.5", cm: "25.5" }
    ]
  };

  const clothingSizes = {
    men: [
      { size: "P", chest: "88-96", waist: "78-86", hip: "88-96" },
      { size: "M", chest: "96-104", waist: "86-94", hip: "96-104" },
      { size: "G", chest: "104-112", waist: "94-102", hip: "104-112" },
      { size: "GG", chest: "112-120", waist: "102-110", hip: "112-120" },
      { size: "XGG", chest: "120-128", waist: "110-118", hip: "120-128" }
    ],
    women: [
      { size: "PP", chest: "80-84", waist: "60-64", hip: "86-90" },
      { size: "P", chest: "84-88", waist: "64-68", hip: "90-94" },
      { size: "M", chest: "88-92", waist: "68-72", hip: "94-98" },
      { size: "G", chest: "92-96", waist: "72-76", hip: "98-102" },
      { size: "GG", chest: "96-100", waist: "76-80", hip: "102-106" },
      { size: "XGG", chest: "100-104", waist: "80-84", hip: "106-110" }
    ]
  };

  const measurementTips = [
    {
      icon: Ruler,
      title: "Use uma Fita Métrica",
      description: "Utilize uma fita métrica flexível para medições mais precisas. Evite usar réguas rígidas."
    },
    {
      icon: User,
      title: "Peça Ajuda",
      description: "Para medições mais precisas, especialmente das costas, peça para alguém ajudar com as medidas."
    },
    {
      icon: Shirt,
      title: "Use Roupas Justas",
      description: "Faça as medições usando apenas roupas íntimas ou roupas bem justas ao corpo."
    },
    {
      icon: Activity,
      title: "Mantenha-se Relaxado",
      description: "Fique em posição natural, sem contrair músculos ou prender a respiração."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="outline" className="mb-6 px-4 py-2">
              <Ruler className="h-4 w-4 mr-2" />
              Guia Completo
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Guia de <span className="gradient-text">Tamanhos</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Encontre o tamanho perfeito com nossas tabelas detalhadas e dicas de medição. 
              Garantimos que você faça a escolha certa!
            </p>
          </div>
        </section>

        {/* Measurement Tips */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Como <span className="gradient-text">Medir Corretamente</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Siga essas dicas para medições precisas
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {measurementTips.map((tip, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="mx-auto p-4 rounded-full bg-primary/10 w-fit mb-4">
                      <tip.icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{tip.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {tip.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Size Tables */}
        <section className="py-20 bg-surface/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Tabelas de <span className="gradient-text">Tamanhos</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Consulte nossas tabelas completas por categoria
              </p>
            </div>

            <Tabs defaultValue="shoes" className="max-w-6xl mx-auto">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="shoes" className="text-lg py-3">Calçados</TabsTrigger>
                <TabsTrigger value="clothing" className="text-lg py-3">Roupas</TabsTrigger>
              </TabsList>

              <TabsContent value="shoes" className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Men's Shoes */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">👨 Calçados Masculinos</CardTitle>
                      <CardDescription>Tabela de conversão de tamanhos</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 font-semibold">Brasil</th>
                              <th className="text-left py-2 font-semibold">EUA</th>
                              <th className="text-left py-2 font-semibold">CM</th>
                            </tr>
                          </thead>
                          <tbody>
                            {shoeSizes.men.map((size, index) => (
                              <tr key={index} className="border-b border-border/50">
                                <td className="py-2">{size.br}</td>
                                <td className="py-2">{size.us}</td>
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
                      <CardTitle className="text-xl">👩 Calçados Femininos</CardTitle>
                      <CardDescription>Tabela de conversão de tamanhos</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 font-semibold">Brasil</th>
                              <th className="text-left py-2 font-semibold">EUA</th>
                              <th className="text-left py-2 font-semibold">CM</th>
                            </tr>
                          </thead>
                          <tbody>
                            {shoeSizes.women.map((size, index) => (
                              <tr key={index} className="border-b border-border/50">
                                <td className="py-2">{size.br}</td>
                                <td className="py-2">{size.us}</td>
                                <td className="py-2">{size.cm}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Shoe Measurement Guide */}
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle>📏 Como Medir o Pé</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2">Passo a Passo:</h4>
                        <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                          <li>Coloque uma folha de papel no chão, encostada na parede</li>
                          <li>Pise sobre a folha com o calcanhar encostado na parede</li>
                          <li>Marque o ponto mais longo do seu pé</li>
                          <li>Meça a distância da parede até a marca</li>
                          <li>Compare com nossa tabela em centímetros</li>
                        </ol>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Dicas Importantes:</h4>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                          <li>Meça os dois pés e use a maior medida</li>
                          <li>Faça a medição no final do dia</li>
                          <li>Use meias do tipo que usará com o calçado</li>
                          <li>Em caso de dúvida, prefira o tamanho maior</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="clothing" className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Men's Clothing */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">👨 Roupas Masculinas</CardTitle>
                      <CardDescription>Medidas em centímetros</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 font-semibold">Tamanho</th>
                              <th className="text-left py-2 font-semibold">Peito</th>
                              <th className="text-left py-2 font-semibold">Cintura</th>
                              <th className="text-left py-2 font-semibold">Quadril</th>
                            </tr>
                          </thead>
                          <tbody>
                            {clothingSizes.men.map((size, index) => (
                              <tr key={index} className="border-b border-border/50">
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
                      <CardTitle className="text-xl">👩 Roupas Femininas</CardTitle>
                      <CardDescription>Medidas em centímetros</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 font-semibold">Tamanho</th>
                              <th className="text-left py-2 font-semibold">Busto</th>
                              <th className="text-left py-2 font-semibold">Cintura</th>
                              <th className="text-left py-2 font-semibold">Quadril</th>
                            </tr>
                          </thead>
                          <tbody>
                            {clothingSizes.women.map((size, index) => (
                              <tr key={index} className="border-b border-border/50">
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
                </div>

                {/* Body Measurement Guide */}
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle>📐 Como Tirar Medidas do Corpo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2">Busto/Peito:</h4>
                        <p className="text-muted-foreground text-sm">
                          Passe a fita métrica ao redor da parte mais larga do peito, 
                          mantendo-a paralela ao chão.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Cintura:</h4>
                        <p className="text-muted-foreground text-sm">
                          Meça na parte mais estreita do tronco, geralmente 
                          acima do umbigo e abaixo das costelas.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Quadril:</h4>
                        <p className="text-muted-foreground text-sm">
                          Passe a fita métrica na parte mais larga dos quadris, 
                          cerca de 20cm abaixo da cintura.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Help Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary/5 to-accent/5">
              <CardContent className="p-8 text-center space-y-6">
                <div className="text-6xl mb-4">🤔</div>
                <h3 className="text-3xl font-bold">Ainda tem Dúvidas?</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Nossa equipe de atendimento está pronta para ajudar você a encontrar 
                  o tamanho perfeito. Entre em contato conosco!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Badge variant="outline" className="px-4 py-2 text-base">
                    📞 (44) 99151-2466
                  </Badge>
                  <Badge variant="outline" className="px-4 py-2 text-base">
                    ✉️ contato.xegaientregas@gmail.com
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SizeGuide;