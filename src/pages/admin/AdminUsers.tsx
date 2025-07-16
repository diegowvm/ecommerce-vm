import { AdminLayout } from '@/layouts/AdminLayout';
import { UsersManager } from "@/components/admin/users/UsersManager";

export default function AdminUsers() {
  return (
    <AdminLayout 
      title="Gestão de Usuários" 
      description="Gerenciar usuários e permissões"
    >
      <UsersManager />
    </AdminLayout>
  );
}