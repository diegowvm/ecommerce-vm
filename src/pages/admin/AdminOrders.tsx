import { AdminLayout } from '@/layouts/AdminLayout';
import { OrdersManager } from "@/components/admin/orders/OrdersManager";

export default function AdminOrders() {
  return (
    <AdminLayout 
      title="Gestão de Pedidos" 
      description="Acompanhar e gerenciar pedidos"
    >
      <OrdersManager />
    </AdminLayout>
  );
}