import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";

export function Footer() {
  const footerLinks = {
    produtos: [
      "Novos Lançamentos",
      "Masculino",
      "Feminino",
      "Infantil",
      "Outlet",
      "Marcas"
    ],
    ajuda: [
      "Central de Ajuda",
      "Meus Pedidos",
      "Trocas e Devoluções",
      "Guia de Tamanhos",
      "Formas de Pagamento",
      "Frete e Entrega"
    ],
    empresa: [
      "Sobre Nós",
      "Carreiras",
      "Imprensa",
      "Sustentabilidade",
      "Investidores",
      "Termos de Uso"
    ]
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
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Seu melhor e-mail"
                className="flex-1 bg-background/50 border-border/30 focus:border-primary/50"
              />
              <Button className="btn-gradient px-8">
                Inscrever-se
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Ao se inscrever, você concorda com nossa Política de Privacidade
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
                KICKZONE
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                A sua loja online de calçados esportivos premium. 
                Oferecemos os melhores produtos das marcas mais conceituadas 
                do mundo com a melhor experiência de compra.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Phone className="h-5 w-5 text-primary" />
                <span>(11) 4000-0000</span>
              </div>
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Mail className="h-5 w-5 text-primary" />
                <span>contato@kickzone.com.br</span>
              </div>
              <div className="flex items-center space-x-3 text-muted-foreground">
                <MapPin className="h-5 w-5 text-primary" />
                <span>São Paulo, SP - Brasil</span>
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
                <li key={link}>
                  <a 
                    href="#" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-semibold text-lg">Ajuda</h4>
            <ul className="space-y-3">
              {footerLinks.ajuda.map((link) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-semibold text-lg">Empresa</h4>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link}
                  </a>
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
              © 2024 KickZone. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Política de Privacidade
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Termos de Serviço
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}