import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  order: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  order: number;
  subcategories: Subcategory[];
}

interface MegaMenuProps {
  className?: string;
}

export function MegaMenu({ className = "" }: MegaMenuProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchCategoriesWithSubcategories();
  }, []);

  const fetchCategoriesWithSubcategories = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center space-x-8 ${className}`}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-4 w-20 bg-muted/20 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-8 ${className}`}>
      {/* Link para todos os produtos */}
      <Link
        to="/products"
        className="text-foreground/80 hover:text-foreground transition-colors duration-200 hover:gradient-text"
      >
        Produtos
      </Link>

      {/* Categorias dinâmicas com mega menu */}
      {categories.map((category) => (
        <div
          key={category.id}
          className="relative group"
          onMouseEnter={() => setHoveredCategory(category.id)}
          onMouseLeave={() => setHoveredCategory(null)}
        >
          <Link
            to={`/products?category=${category.slug}`}
            className="flex items-center text-foreground/80 hover:text-foreground transition-colors duration-200 hover:gradient-text group-hover:gradient-text"
          >
            {category.name}
            {category.subcategories.length > 0 && (
              <ChevronDown className="ml-1 h-3 w-3 transition-transform group-hover:rotate-180" />
            )}
          </Link>

          {/* Mega Menu Dropdown */}
          {category.subcategories.length > 0 && hoveredCategory === category.id && (
            <div className="absolute top-full left-0 pt-2 z-50">
              <div className="bg-background border border-border rounded-lg shadow-lg p-4 min-w-[300px] animate-slide-up">
                <div className="grid grid-cols-1 gap-2">
                  {category.subcategories.map((subcategory) => (
                    <Link
                      key={subcategory.id}
                      to={`/products?category=${category.slug}&subcategory=${subcategory.slug}`}
                      className="flex items-center p-2 rounded-md hover:bg-muted/50 transition-colors group/sub"
                    >
                      {subcategory.image_url && (
                        <img
                          src={subcategory.image_url}
                          alt={subcategory.name}
                          className="w-8 h-8 rounded object-cover mr-3"
                        />
                      )}
                      <div>
                        <div className="font-medium text-sm group-hover/sub:text-primary transition-colors">
                          {subcategory.name}
                        </div>
                        {subcategory.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {subcategory.description}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}