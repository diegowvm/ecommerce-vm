import { AdminLayout } from '@/layouts/AdminLayout';
import InventoryManager from "@/components/admin/inventory/InventoryManager";

export default function AdminInventory() {
  return (
    <AdminLayout 
      title="Gestão de Estoque" 
      description="Controle de inventário e movimentações"
    >
      <InventoryManager />
    </AdminLayout>
  );
}