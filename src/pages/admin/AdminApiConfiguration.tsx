import { AdminLayout } from '@/layouts/AdminLayout';
import { ApiConfigurationManager } from "@/components/admin/api-configuration/ApiConfigurationManager";

export default function AdminApiConfiguration() {
  return (
    <AdminLayout 
      title="Configuração de APIs" 
      description="Gerenciar credenciais de marketplaces"
    >
      <ApiConfigurationManager />
    </AdminLayout>
  );
}