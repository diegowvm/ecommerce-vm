import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, User, Menu, X, LogOut, Settings } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "./dropdown-menu";
import { Badge } from "./badge";
import { MegaMenu } from "./mega-menu";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.rpc('fetch_categories_with_subcategories');
      if (error) throw error;
      
      // Transform subcategories from jsonb to array
      const transformedData = (data || []).map((category: any) => ({
        ...category,
        subcategories: Array.isArray(category.subcategories) 
          ? category.subcategories 
          : typeof category.subcategories === 'string' 
          ? JSON.parse(category.subcategories)
          : []
      }));
      
      setCategories(transformedData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

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

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="glass fixed top-0 left-0 right-0 z-50 border-b border-border/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center ml-2 md:ml-4">
            <Link to="/" className="flex items-center">
              <img 
                src="/placeholder.png" 
                alt="Xegai Shop" 
                className="h-16 md:h-20 lg:h-24 w-auto" 
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex">
            <MegaMenu />
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex relative">
            <Input
              type="search"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pr-10 bg-surface/50 border-border/30 focus:border-primary/50"
            />
            <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Search className="h-4 w-4 text-muted-foreground" />
            </button>
          </form>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Mobile Search */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
            </Button>
            
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
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">
                        <Settings className="mr-2 h-4 w-4" />
                        Painel Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
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
            
            {/* Shopping Bag */}
            <Button variant="ghost" size="icon" className="hover-glow relative" asChild>
              <Link to="/cart">
                <ShoppingBag className="h-5 w-5" />
                {cartItemsCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {cartItemsCount}
                  </Badge>
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
          <div className="md:hidden py-4 space-y-4 animate-slide-up">
            <form onSubmit={handleSearch} className="relative mb-4">
              <Input
                type="search"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 bg-surface/50 border-border/30"
              />
              <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Search className="h-4 w-4 text-muted-foreground" />
              </button>
            </form>
            
            {/* Produtos - Link principal */}
            <div className="border-b border-border/20 pb-4">
              <Link
                to="/products"
                className="block text-foreground/80 hover:text-primary transition-colors duration-200 py-2 font-semibold text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Produtos
              </Link>
              
              {/* Categorias organizadas sob Produtos */}
              <div className="ml-4 mt-2 space-y-3">
                {categories.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <Link
                      to={`/products?category=${category.slug}`}
                      className="block text-foreground/80 hover:text-primary transition-colors duration-200 py-2 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                    {category.subcategories && category.subcategories.length > 0 && (
                      <div className="ml-4 space-y-1">
                        {category.subcategories.map((subcategory) => (
                          <Link
                            key={subcategory.id}
                            to={`/products?category=${category.slug}&subcategory=${subcategory.slug}`}
                            className="block text-sm text-foreground/60 hover:text-primary transition-colors duration-200 py-1"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {subcategory.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
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
    </nav>
  );
}
