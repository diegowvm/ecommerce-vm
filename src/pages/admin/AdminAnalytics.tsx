import { AdminLayout } from '@/layouts/AdminLayout';
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default function AdminAnalytics() {
  return (
    <AdminLayout 
      title="Analytics Avançado" 
      description="Análises detalhadas e relatórios"
    >
      <AdminDashboard />
    </AdminLayout>
  );
}