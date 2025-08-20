import { Truck, Shield, RotateCcw, Headphones, CreditCard, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const benefits = [
  {
    icon: Truck,
    title: 'Frete Grátis',
    description: 'Acima de R$ 199 para todo o Brasil',
    color: 'text-green-500'
  },
  {
    icon: Shield,
    title: 'Compra Segura',
    description: '100% protegida com certificado SSL',
    color: 'text-blue-500'
  },
  {
    icon: RotateCcw,
    title: 'Troca Garantida',
    description: '7 dias para trocar sem complicação',
    color: 'text-purple-500'
  },
  {
    icon: Headphones,
    title: 'Suporte 24/7',
    description: 'Atendimento especializado sempre',
    color: 'text-orange-500'
  },
  {
    icon: CreditCard,
    title: 'Parcelamento',
    description: 'Até 12x sem juros no cartão',
    color: 'text-pink-500'
  },
  {
    icon: Award,
    title: 'Qualidade Premium',
    description: 'Produtos de marcas renomadas',
    color: 'text-yellow-500'
  }
];

export const BenefitsSection = () => {
  return (
    <section className="section-padding bg-muted/30">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Por que escolher a Xegai Shop?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Oferecemos a melhor experiência de compra online com benefícios exclusivos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card key={index} className="card-hover border-0 bg-background/50 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Icon className={`h-6 w-6 ${benefit.color}`} />
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">50K+</div>
            <div className="text-sm text-muted-foreground">Clientes Satisfeitos</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">500+</div>
            <div className="text-sm text-muted-foreground">Marcas Parceiras</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">100K+</div>
            <div className="text-sm text-muted-foreground">Produtos Entregues</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">4.8</div>
            <div className="text-sm text-muted-foreground">Avaliação Média</div>
          </div>
        </div>
      </div>
    </section>
  );
};