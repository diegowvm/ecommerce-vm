import { AdminLayout } from '@/layouts/AdminLayout';
import { ProductsManager } from "@/components/admin/products/ProductsManager";

export default function AdminProducts() {
  return (
    <AdminLayout 
      title="Gestão de Produtos" 
      description="Gerenciar catálogo de produtos"
    >
      <ProductsManager />
    </AdminLayout>
  );
}