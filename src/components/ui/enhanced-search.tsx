import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SearchSuggestion {
  id: string;
  name: string;
  type: 'product' | 'category';
  url: string;
}

interface EnhancedSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
  className?: string;
}

export function EnhancedSearch({ 
  value, 
  onChange, 
  onSearch, 
  placeholder = "Buscar produtos...",
  className = ""
}: EnhancedSearchProps) {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularTerms] = useState(['tênis nike', 'camiseta', 'jaqueta', 'calça jeans']);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (value.length < 2) {
      setSuggestions([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      await fetchSuggestions(value);
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [value]);

  const fetchSuggestions = async (query: string) => {
    setLoading(true);
    try {
      const suggestions: SearchSuggestion[] = [];

      // Search products
      const { data: products } = await supabase
        .from('products')
        .select('id, name')
        .ilike('name', `%${query}%`)
        .eq('active', true)
        .limit(3);

      if (products) {
        products.forEach(product => {
          suggestions.push({
            id: product.id,
            name: product.name,
            type: 'product',
            url: `/product/${product.id}`
          });
        });
      }

      // Search categories
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name, slug')
        .ilike('name', `%${query}%`)
        .limit(2);

      if (categories) {
        categories.forEach(category => {
          suggestions.push({
            id: category.id,
            name: category.name,
            type: 'category',
            url: `/products?category=${category.slug}`
          });
        });
      }

      setSuggestions(suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (value.trim()) {
      saveRecentSearch(value.trim());
      onSearch();
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'product') {
      navigate(suggestion.url);
    } else {
      navigate(suggestion.url);
    }
    setShowSuggestions(false);
  };

  const handleRecentSearchClick = (term: string) => {
    onChange(term);
    setShowSuggestions(false);
    setTimeout(() => handleSearch(), 100);
  };

  const handlePopularTermClick = (term: string) => {
    onChange(term);
    setShowSuggestions(false);
    setTimeout(() => handleSearch(), 100);
  };

  const saveRecentSearch = (term: string) => {
    const updated = [term, ...recentSearches.filter(t => t !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent_searches');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Input
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setShowSuggestions(true)}
          className="pl-10 bg-surface/50 border-border/30"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        
        {/* Search button for mobile */}
        <Button
          size="sm"
          onClick={handleSearch}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 px-2 md:hidden"
        >
          <Search className="h-3 w-3" />
        </Button>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 border-border/40 shadow-lg">
          <CardContent className="p-2">
            {/* Loading state */}
            {loading && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                  Sugestões
                </div>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-2 py-2 rounded hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Search className="h-3 w-3 text-muted-foreground" />
                      <span className="flex-1">{suggestion.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {suggestion.type === 'product' ? 'Produto' : 'Categoria'}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Recent searches */}
            {!loading && suggestions.length === 0 && recentSearches.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    Buscas recentes
                  </span>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Limpar
                  </button>
                </div>
                {recentSearches.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearchClick(term)}
                    className="w-full text-left px-2 py-2 rounded hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>{term}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Popular terms */}
            {!loading && suggestions.length === 0 && recentSearches.length === 0 && (
              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                  Termos populares
                </div>
                {popularTerms.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handlePopularTermClick(term)}
                    className="w-full text-left px-2 py-2 rounded hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                      <span>{term}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No results */}
            {!loading && value.length >= 2 && suggestions.length === 0 && recentSearches.length === 0 && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                Nenhuma sugestão encontrada
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Backdrop to close suggestions */}
      {showSuggestions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
}