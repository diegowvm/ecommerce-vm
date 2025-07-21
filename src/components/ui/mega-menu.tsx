
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
  const [showMegaMenu, setShowMegaMenu] = useState(false);

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
        <div className="h-4 w-20 bg-muted/20 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-8 ${className}`}>
      {/* Item principal "Produtos" com mega menu */}
      <div
        className="relative group"
        onMouseEnter={() => setShowMegaMenu(true)}
        onMouseLeave={() => setShowMegaMenu(false)}
      >
        <Link
          to="/products"
          className="flex items-center text-foreground/80 hover:text-foreground transition-colors duration-200 hover:gradient-text group-hover:gradient-text"
        >
          Produtos
          <ChevronDown className="ml-1 h-3 w-3 transition-transform group-hover:rotate-180" />
        </Link>

        {/* Mega Menu Dropdown */}
        {showMegaMenu && categories.length > 0 && (
          <div className="absolute top-full left-0 pt-2 z-50">
            <div className="bg-background border border-border rounded-lg shadow-lg p-6 min-w-[800px] animate-slide-up">
              <div className="grid grid-cols-3 gap-8">
                {categories.map((category) => (
                  <div key={category.id} className="space-y-3">
                    {/* Categoria Principal */}
                    <Link
                      to={`/products?category=${category.slug}`}
                      className="block font-semibold text-foreground hover:text-primary transition-colors border-b border-border/30 pb-2"
                    >
                      {category.name}
                    </Link>
                    
                    {/* Subcategorias */}
                    {category.subcategories.length > 0 && (
                      <div className="space-y-2">
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
                                className="w-6 h-6 rounded object-cover mr-3"
                              />
                            )}
                            <div>
                              <div className="text-sm group-hover/sub:text-primary transition-colors">
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
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
