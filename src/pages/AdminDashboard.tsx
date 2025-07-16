import { AdminLayout } from '@/layouts/AdminLayout';
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default function AdminDashboardPage() {
  return (
    <AdminLayout 
      title="Xegai Admin" 
      description="Sistema de Gestão"
    >
      <AdminDashboard />
    </AdminLayout>
  );
}