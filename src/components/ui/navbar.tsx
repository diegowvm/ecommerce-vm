import { useState } from "react";
import { Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { name: "Novos Lançamentos", href: "#" },
    { name: "Masculino", href: "#" },
    { name: "Feminino", href: "#" },
    { name: "Infantil", href: "#" },
    { name: "Marcas", href: "#" },
    { name: "Outlet", href: "#" },
  ];

  return (
    <nav className="glass fixed top-0 left-0 right-0 z-50 border-b border-border/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold gradient-text">
              KICKZONE
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-foreground/80 hover:text-foreground transition-colors duration-200 hover:gradient-text"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex relative">
            <Input
              type="search"
              placeholder="Buscar produtos..."
              className="w-64 pr-10 bg-surface/50 border-border/30 focus:border-primary/50"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Mobile Search */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
            </Button>
            
            {/* User Account */}
            <Button variant="ghost" size="icon" className="hover-glow">
              <User className="h-5 w-5" />
            </Button>
            
            {/* Shopping Bag */}
            <Button variant="ghost" size="icon" className="hover-glow relative">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-xs flex items-center justify-center text-primary-foreground">
                2
              </span>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 animate-slide-up">
            <div className="relative mb-4">
              <Input
                type="search"
                placeholder="Buscar produtos..."
                className="w-full pr-10 bg-surface/50 border-border/30"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            {navigationItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block text-foreground/80 hover:text-primary transition-colors duration-200 py-2"
              >
                {item.name}
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}