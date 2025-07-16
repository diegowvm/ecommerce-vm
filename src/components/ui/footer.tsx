import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./button";
import { Input } from "./input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { toast } = useToast();

  const footerLinks = {
    produtos: [
      { name: "Novos Lançamentos", path: "/products?featured=true" },
      { name: "Masculino", path: "/products?category=masculino" },
      { name: "Feminino", path: "/products?category=feminino" },
      { name: "Infantil", path: "/products?category=infantil" },
      { name: "Outlet", path: "/products?outlet=true" }
    ],
    ajuda: [
      { name: "Central de Ajuda", path: "/help" },
      { name: "Meus Pedidos", path: "/profile", requireAuth: true },
      { name: "Trocas e Devoluções", path: "/return-policy" },
      { name: "Guia de Tamanhos", path: "/size-guide" },
      { name: "Formas de Pagamento", path: "/payment-methods" },
      { name: "Frete e Entrega", path: "/shipping-info" }
    ],
    empresa: [
      { name: "Sobre Nós", path: "/about" },
      { name: "Carreiras", path: "/careers" },
      { name: "Como Funciona", path: "/how-it-works" },
      { name: "Contato", path: "/contact" }
    ]
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubscribing(true);
    
    // Simular call para newsletter
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Inscrição realizada!",
        description: "Você receberá nossas novidades no e-mail informado.",
      });
      setEmail("");
    } catch (error) {
      toast({
        title: "Erro na inscrição",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="bg-surface border-t border-border/20">
      {/* Newsletter Section */}
      <div className="border-b border-border/20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl font-bold gradient-text">
                Fique por Dentro das Novidades
              </h3>
              <p className="text-muted-foreground text-lg">
                Receba em primeira mão os lançamentos, ofertas exclusivas e conteúdo especial
              </p>
            </div>
            
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Seu melhor e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-background/50 border-border/30 focus:border-primary/50"
              />
              <Button 
                type="submit" 
                disabled={isSubscribing}
                className="btn-gradient px-8"
              >
                {isSubscribing ? "Inscrevendo..." : "Inscrever-se"}
              </Button>
            </form>
            
            <p className="text-sm text-muted-foreground">
              Ao se inscrever, você concorda com nossa <Link to="/privacy-policy" className="text-primary hover:underline">Política de Privacidade</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-3xl font-bold gradient-text mb-4">
                XEGAI OUTLET
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Seu destino de moda online: os melhores calçados, roupas e acessórios premium em um só lugar, com qualidade e confiança.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Phone className="h-5 w-5 text-primary" />
                <span>(44 99151-2466)</span>
              </div>
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Mail className="h-5 w-5 text-primary" />
                <span>contato.xegaientregas@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3 text-muted-foreground">
                <MapPin className="h-5 w-5 text-primary" />
                <span>Maringá, PR - Brasil</span>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="hover-glow">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover-glow">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover-glow">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover-glow">
                <Youtube className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Links Sections */}
          <div className="space-y-6">
            <h4 className="font-semibold text-lg">Produtos</h4>
            <ul className="space-y-3">
              {footerLinks.produtos.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-semibold text-lg">Ajuda</h4>
            <ul className="space-y-3">
              {footerLinks.ajuda.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-semibold text-lg">Empresa</h4>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-border/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-muted-foreground text-sm">
              © 2025 Xegai Outlet. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">
                Política de Privacidade
              </Link>
              <Link to="/terms-of-service" className="text-muted-foreground hover:text-primary transition-colors">
                Termos de Serviço
              </Link>
              <Link to="/return-policy" className="text-muted-foreground hover:text-primary transition-colors">
                Política de Devoluções
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}