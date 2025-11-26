'use client';

import EnhancedAdminLayout from '@/components/admin/EnhancedAdminLayout';
import MonitoringDashboard from '@/components/admin/MonitoringDashboard';

export default function AdminMonitoringPage() {
  return (
    <EnhancedAdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <MonitoringDashboard />
      </div>
    </EnhancedAdminLayout>
  );
}