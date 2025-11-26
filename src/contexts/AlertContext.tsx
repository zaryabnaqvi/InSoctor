import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import apiClient from "@/services/api.service";
import { toast } from "@/hooks/use-toast";

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: 'open' | 'investigating' | 'resolved' | 'false-positive';
  source: string;
  timestamp: string;
  assignedTo?: string;
  caseId?: string;
  caseStatus?: string;
  rawData?: any;
}

type AlertContextType = {
  alerts: Alert[];
  filteredAlerts: Alert[];
  loading: boolean;
  error: string | null;
  lastFetch: Date | null;
  addAlert: (alert: Alert) => void;
  removeAlert: (id: string) => void;
  updateAlert: (id: string, updates: Partial<Alert>) => void;
  filterBySeverity: (severities: AlertSeverity[]) => void;
  filterByStatus: (statuses: string[]) => void;
  clearFilters: () => void;
  refresh: () => void;
  activeFilters: {
    severities: AlertSeverity[];
    statuses: string[];
  };
  timeRange: string;
  setTimeRange: (range: string) => void;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [activeFilters, setActiveFilters] = useState({
    severities: [] as AlertSeverity[],
    statuses: [] as string[],
  });
  const [timeRange, setTimeRange] = useState<string>('24h');

  const previousAlertsRef = useRef<Alert[]>([]);
  const hasShownErrorRef = useRef(false);

  const fetchAlerts = useCallback(async () => {
    try {
      // Calculate start date based on timeRange
      const now = new Date();
      let startDate: Date;

      const value = parseInt(timeRange.slice(0, -1));
      const unit = timeRange.slice(-1);

      switch (unit) {
        case 'm':
          startDate = new Date(now.getTime() - value * 60 * 1000);
          break;
        case 'h':
          startDate = new Date(now.getTime() - value * 60 * 60 * 1000);
          break;
        case 'd':
          startDate = new Date(now.getTime() - value * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Default 24h
      }

      const response = await apiClient.getAlerts({
        limit: 1000,
        startDate: startDate.toISOString()
      });

      if (response.success && response.data) {
        const newAlerts: Alert[] = response.data;

        // Check for new critical alerts (only if not first load)
        if (previousAlertsRef.current.length > 0) {
          const previousIds = new Set(previousAlertsRef.current.map(a => a.id));
          const newCriticalAlerts = newAlerts.filter(
            a => !previousIds.has(a.id) && (a.severity === 'critical' || a.severity === 'high')
          );

          newCriticalAlerts.forEach(alert => {
            toast({
              title: `New ${alert.severity.toUpperCase()} Alert`,
              description: alert.title,
              variant: alert.severity === 'critical' ? 'destructive' : 'default',
            });
          });
        }

        previousAlertsRef.current = newAlerts;
        setAlerts(newAlerts);
        setLastFetch(new Date());
        setError(null);
        hasShownErrorRef.current = false; // Reset error flag on success
      }
    } catch (err: any) {
      console.error('Failed to fetch alerts:', err);
      const errorMessage = err.message || 'Failed to fetch alerts';
      setError(errorMessage);

      // Show error toast only once (not on every poll)
      if (!hasShownErrorRef.current) {
        hasShownErrorRef.current = true;
        toast({
          title: 'Failed to fetch alerts',
          description: 'Could not connect to the backend. Please check if the server is running.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [timeRange]); // Re-fetch when timeRange changes

  const refresh = useCallback(() => {
    setLoading(true);
    fetchAlerts();
  }, [fetchAlerts]);

  useEffect(() => {
    // Fetch when timeRange changes
    fetchAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alerts, activeFilters]);

  const applyFilters = () => {
    let filtered = [...alerts];

    // Apply severity filters
    if (activeFilters.severities.length > 0) {
      filtered = filtered.filter(alert =>
        activeFilters.severities.includes(alert.severity)
      );
    }

    // Apply status filters
    if (activeFilters.statuses.length > 0) {
      filtered = filtered.filter(alert =>
        activeFilters.statuses.includes(alert.status)
      );
    }

    setFilteredAlerts(filtered);
  };

  const addAlert = (alert: Alert) => {
    setAlerts(prev => [alert, ...prev]);
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const updateAlert = (id: string, updates: Partial<Alert>) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === id ? { ...alert, ...updates } : alert
      )
    );
  };

  const filterBySeverity = (severities: AlertSeverity[]) => {
    setActiveFilters(prev => ({
      ...prev,
      severities
    }));
  };

  const filterByStatus = (statuses: string[]) => {
    setActiveFilters(prev => ({
      ...prev,
      statuses
    }));
  };

  const clearFilters = () => {
    setActiveFilters({
      severities: [],
      statuses: []
    });
  };

  return (
    <AlertContext.Provider
      value={{
        alerts,
        filteredAlerts,
        loading,
        error,
        lastFetch,
        addAlert,
        removeAlert,
        updateAlert,
        filterBySeverity,
        filterByStatus,
        clearFilters,
        refresh,
        activeFilters,
        timeRange,
        setTimeRange
      }}
    >
      {children}
    </AlertContext.Provider>
  );
}

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error("useAlerts must be used within an AlertProvider");
  }
  return context;
};