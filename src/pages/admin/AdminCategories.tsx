import { AdminLayout } from '@/layouts/AdminLayout';
import { CategoriesManager } from "@/components/admin/categories/CategoriesManager";

export default function AdminCategories() {
  return (
    <AdminLayout 
      title="Gestão de Categorias" 
      description="Organizar produtos por categorias"
    >
      <CategoriesManager />
    </AdminLayout>
  );
}