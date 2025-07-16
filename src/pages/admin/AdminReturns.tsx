import { AdminLayout } from '@/layouts/AdminLayout';
import { ReturnsManager } from "@/components/admin/returns/ReturnsManager";

export default function AdminReturns() {
  return (
    <AdminLayout 
      title="Gestão de Devoluções" 
      description="Processar devoluções e reembolsos"
    >
      <ReturnsManager />
    </AdminLayout>
  );
}