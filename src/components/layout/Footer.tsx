import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { APP_CONFIG, ROUTES } from '@/lib/constants';
import { Logo } from '@/components/ui/logo';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Institucional',
      links: [
        { label: 'Sobre Nós', href: ROUTES.ABOUT },
        { label: 'Como Funciona', href: '/how-it-works' },
        { label: 'Carreiras', href: '/careers' },
        { label: 'Imprensa', href: '/press' },
        { label: 'Sustentabilidade', href: '/sustainability' },
      ]
    },
    {
      title: 'Atendimento',
      links: [
        { label: 'Central de Ajuda', href: ROUTES.HELP },
        { label: 'Fale Conosco', href: ROUTES.CONTACT },
        { label: 'Trocas e Devoluções', href: '/return-policy' },
        { label: 'Guia de Tamanhos', href: '/size-guide' },
        { label: 'Rastreamento', href: '/tracking' },
      ]
    },
    {
      title: 'Categorias',
      links: [
        { label: 'Calçados', href: '/products?category=calcados' },
        { label: 'Roupas', href: '/products?category=roupas' },
        { label: 'Acessórios', href: '/products?category=acessorios' },
        { label: 'Outlet', href: '/products/outlet' },
        { label: 'Lançamentos', href: '/products/new-releases' },
      ]
    },
    {
      title: 'Políticas',
      links: [
        { label: 'Termos de Uso', href: '/terms-of-service' },
        { label: 'Política de Privacidade', href: '/privacy-policy' },
        { label: 'Política de Cookies', href: '/cookies-policy' },
        { label: 'Política de Trocas', href: '/return-policy' },
      ]
    }
  ];

  return (
    <footer className="bg-muted/30 border-t">
      <div className="container-custom">
        {/* Newsletter Section */}
        <div className="py-12 border-b">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">
              Fique por dentro das novidades
            </h3>
            <p className="text-muted-foreground mb-6">
              Receba ofertas exclusivas, lançamentos e dicas de moda diretamente no seu email
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Seu melhor email"
                className="flex-1"
              />
              <Button type="submit" className="btn-primary">
                Inscrever-se
              </Button>
            </form>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <Logo size="sm" linkTo={ROUTES.HOME} className="mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                {APP_CONFIG.description}
              </p>
              
              {/* Contact Info */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>{APP_CONFIG.contact.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>{APP_CONFIG.contact.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Brasil</span>
                </div>
              </div>

              {/* Social Media */}
              <div className="flex space-x-2 mt-4">
                <Button variant="ghost" size="icon" asChild>
                  <a href={`https://instagram.com/${APP_CONFIG.social.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <a href={`https://facebook.com/${APP_CONFIG.social.facebook}`} target="_blank" rel="noopener noreferrer">
                    <Facebook className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <a href={`https://twitter.com/${APP_CONFIG.social.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                    <Twitter className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Footer Links */}
            {footerSections.map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        to={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Bottom Footer */}
        <div className="py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © {currentYear} {APP_CONFIG.name}. Todos os direitos reservados.
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span>🔒 Compra 100% Segura</span>
              <span>📦 Frete Grátis acima de R$ 199</span>
              <span>🔄 Troca Garantida</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};