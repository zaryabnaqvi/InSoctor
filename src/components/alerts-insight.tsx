import { useState, useEffect } from 'react';
import { getAlerts } from '@/data/mockAlerts';
import { Filters } from '@/components/alert/filters';
import { AlertsTable } from '@/components/alert/alert-table';
import { Toaster } from '@/components/ui/toaster';
import { Alert, AlertFilter } from '@/lib/alerts-data';

function AlertsInsights() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AlertFilter>({
    lastUpdated: 'All',
    created: 'Last 30 days',
    alerts: 'All',
    caseStatus: 'All',
    dataSource: 'All',
    searchQuery: '',
  });

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await getAlerts();
        setAlerts(data);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const handleFilterChange = (key: keyof AlertFilter, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (
      filters.alerts !== 'All' &&
      alerts.find((a) => a.severity === filters.alerts.toLowerCase()) === undefined
    ) {
      return false;
    }

    if (
      filters.dataSource !== 'All' &&
      alert.dataSource !== filters.dataSource
    ) {
      return false;
    }

    if (filters.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase();
      return (
        alert.id.toLowerCase().includes(searchLower) ||
        alert.title.toLowerCase().includes(searchLower) ||
        alert.description.toLowerCase().includes(searchLower) ||
        alert.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <div className="container mx-auto py-6 px-4 md:px-6">
     
        
        <div className="space-y-4">
          <Filters filters={filters} onFilterChange={handleFilterChange} />
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <AlertsTable alerts={filteredAlerts} />
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default AlertsInsights;