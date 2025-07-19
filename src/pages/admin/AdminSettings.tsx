import { AdminLayout } from '@/layouts/AdminLayout';
import SettingsManager from "@/components/admin/settings/SettingsManager";

export default function AdminSettings() {
  return (
    <AdminLayout 
      title="Configurações" 
      description="Configurações gerais do sistema"
    >
      <SettingsManager />
    </AdminLayout>
  );
}