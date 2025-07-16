import { AdminLayout } from '@/layouts/AdminLayout';
import { MarketplacesManager } from "@/components/admin/marketplaces/MarketplacesManager";

export default function AdminMarketplaces() {
  return (
    <AdminLayout 
      title="Gestão de Marketplaces" 
      description="Integrações com marketplaces"
    >
      <MarketplacesManager />
    </AdminLayout>
  );
}