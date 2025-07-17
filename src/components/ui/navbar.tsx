import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SearchCommand } from "@/components/ui/search-command";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { Menu, X, Search, User, ShoppingCart, LogOut, Settings, Command } from "lucide-react";

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSearchOpen: () => setShowSearch(true)
  });

  const navigationItems = [
    { name: "Produtos", href: "/products" },
    { name: "Sobre", href: "/about" },
    { name: "Como Funciona", href: "/how-it-works" },
    { name: "Contato", href: "/contact" },
  ];

  useEffect(() => {
    if (user) {
      fetchCartItemsCount();
    }
  }, [user]);

  const fetchCartItemsCount = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('cart_items')
      .select('quantity')
      .eq('user_id', user.id);
    
    const count = data?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    setCartItemsCount(count);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setIsMenuOpen(false);
    }
  };

  const handleQuickSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="glass fixed top-0 left-0 right-0 z-50 border-b border-border/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold gradient-text">
              XEGAI OUTLET
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-foreground/80 hover:text-foreground transition-colors duration-200 hover:gradient-text"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center">
            <Button
              variant="ghost"
              onClick={() => setShowSearch(true)}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <Search className="w-4 h-4" />
              <span className="hidden lg:inline">Buscar...</span>
              <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* User Account */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover-glow">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {user.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      <User className="mr-2 h-4 w-4" />
                      Meu Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/wishlist">
                      <Settings className="mr-2 h-4 w-4" />
                      Lista de Favoritos
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/address-book">
                      <Settings className="mr-2 h-4 w-4" />
                      Meus Endereços
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" asChild className="hover-glow">
                <Link to="/auth">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            )}
            
            {/* Shopping Cart */}
            <Button variant="ghost" size="icon" className="hover-glow relative" asChild>
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
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
          <div className="md:hidden py-4 space-y-4">
          {/* Mobile Search */}
          <div className="md:hidden mb-4">
            <Button
              variant="ghost"
              onClick={() => setShowSearch(true)}
              className="w-full justify-start gap-2 text-muted-foreground"
            >
              <Search className="w-4 h-4" />
              Buscar produtos...
            </Button>
          </div>

            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="block text-foreground/80 hover:text-primary transition-colors duration-200 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {!user && (
              <Link
                to="/auth"
                className="block text-foreground/80 hover:text-primary transition-colors duration-200 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Entrar / Cadastrar
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Global Search Command */}
      <SearchCommand open={showSearch} onOpenChange={setShowSearch} />
    </nav>
  );
}