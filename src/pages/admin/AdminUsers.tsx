import { AdminLayout } from '@/layouts/AdminLayout';
import { EnhancedUsersManager } from "@/components/admin/users/EnhancedUsersManager";

export default function AdminUsers() {
  return (
    <AdminLayout 
      title="Gestão de Usuários" 
      description="Gerenciar usuários e permissões"
    >
      <EnhancedUsersManager />
    </AdminLayout>
  );
}