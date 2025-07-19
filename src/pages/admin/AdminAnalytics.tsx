import { AdminLayout } from '@/layouts/AdminLayout';
import AnalyticsManager from "@/components/admin/analytics/AnalyticsManager";

export default function AdminAnalytics() {
  return (
    <AdminLayout 
      title="Analytics Avançado" 
      description="Análises detalhadas e relatórios"
    >
      <AnalyticsManager />
    </AdminLayout>
  );
}