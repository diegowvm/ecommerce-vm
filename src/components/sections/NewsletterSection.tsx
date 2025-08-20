import { useState } from 'react';
import { Mail, Gift, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Por favor, insira seu email');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Por favor, insira um email válido');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Inscrição realizada com sucesso! Verifique seu email.');
      setEmail('');
    } catch (error) {
      toast.error('Erro ao realizar inscrição. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="section-padding bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="container-custom">
        <Card className="max-w-4xl mx-auto border-0 bg-background/80 backdrop-blur-sm shadow-xl">
          <CardContent className="p-8 md:p-12">
            <div className="text-center">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
                <Mail className="h-8 w-8 text-primary" />
              </div>

              {/* Title */}
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Fique por dentro das novidades
              </h2>

              {/* Description */}
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Seja o primeiro a saber sobre lançamentos, ofertas exclusivas e dicas de moda. 
                Além disso, ganhe <strong className="text-primary">10% de desconto</strong> na sua primeira compra!
              </p>

              {/* Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <Gift className="h-5 w-5 text-primary" />
                  <span>10% de desconto</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span>Ofertas exclusivas</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <Mail className="h-5 w-5 text-primary" />
                  <span>Novidades em primeira mão</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input
                    type="email"
                    placeholder="Seu melhor email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button 
                    type="submit" 
                    className="btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Inscrevendo...' : 'Inscrever-se'}
                  </Button>
                </div>
              </form>

              {/* Privacy Note */}
              <p className="text-xs text-muted-foreground mt-4">
                Ao se inscrever, você concorda com nossa{' '}
                <a href="/privacy-policy" className="text-primary hover:underline">
                  Política de Privacidade
                </a>
                . Você pode cancelar a inscrição a qualquer momento.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};