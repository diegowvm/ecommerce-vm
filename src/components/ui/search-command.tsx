import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Search, Package, Users, ShoppingCart, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'product' | 'category' | 'user' | 'order';
  url: string;
  icon: React.ReactNode;
}

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      await performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    setLoading(true);
    try {
      const results: SearchResult[] = [];

      // Search products
      const { data: products } = await supabase
        .from('products')
        .select('id, name, description, categories(name)')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('active', true)
        .limit(5);

      if (products) {
        products.forEach(product => {
          results.push({
            id: product.id,
            title: product.name,
            description: `Produto • ${product.categories?.name || 'Sem categoria'}`,
            type: 'product',
            url: `/product/${product.id}`,
            icon: <Package className="h-4 w-4" />
          });
        });
      }

      // Search categories
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name, slug')
        .ilike('name', `%${query}%`)
        .limit(3);

      if (categories) {
        categories.forEach(category => {
          results.push({
            id: category.id,
            title: category.name,
            description: 'Categoria de produtos',
            type: 'category',
            url: `/products?category=${category.slug}`,
            icon: <Tag className="h-4 w-4" />
          });
        });
      }

      setResults(results);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (result: SearchResult) => {
    navigate(result.url);
    onOpenChange(false);
    setSearchQuery('');
  };

  const quickActions = [
    {
      id: 'products',
      title: 'Ver todos os produtos',
      description: 'Navegar pelo catálogo completo',
      type: 'product' as const,
      url: '/products',
      icon: <Package className="h-4 w-4" />
    },
    {
      id: 'cart',
      title: 'Meu carrinho',
      description: 'Ver itens no carrinho',
      type: 'order' as const,
      url: '/cart',
      icon: <ShoppingCart className="h-4 w-4" />
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl">
        <Command className="rounded-lg border-none shadow-md">
          <CommandInput
            placeholder="Buscar produtos, categorias..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="border-none focus:ring-0"
          />
          <CommandList className="max-h-96">
            {!searchQuery && (
              <CommandGroup heading="Ações rápidas">
                {quickActions.map((action) => (
                  <CommandItem
                    key={action.id}
                    value={action.title}
                    onSelect={() => handleSelect(action)}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                  >
                    {action.icon}
                    <div className="flex-1">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-sm text-muted-foreground">{action.description}</div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {searchQuery && !loading && results.length === 0 && (
              <CommandEmpty>
                <div className="flex flex-col items-center gap-2 py-6">
                  <Search className="h-8 w-8 text-muted-foreground" />
                  <p>Nenhum resultado encontrado para "{searchQuery}"</p>
                  <p className="text-sm text-muted-foreground">
                    Tente buscar por outros termos
                  </p>
                </div>
              </CommandEmpty>
            )}

            {results.length > 0 && (
              <CommandGroup heading="Resultados da busca">
                {results.map((result) => (
                  <CommandItem
                    key={result.id}
                    value={result.title}
                    onSelect={() => handleSelect(result)}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                  >
                    {result.icon}
                    <div className="flex-1">
                      <div className="font-medium">{result.title}</div>
                      <div className="text-sm text-muted-foreground">{result.description}</div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {loading && (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}