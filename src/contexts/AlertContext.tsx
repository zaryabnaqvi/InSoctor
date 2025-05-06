import { createContext, useContext, useState, useEffect } from "react";
import { Alert, AlertSeverity, generateMockAlerts } from "@/lib/alerts-data";

type AlertContextType = {
  alerts: Alert[];
  filteredAlerts: Alert[];
  addAlert: (alert: Alert) => void;
  removeAlert: (id: string) => void;
  updateAlert: (id: string, updates: Partial<Alert>) => void;
  filterBySeverity: (severities: AlertSeverity[]) => void;
  filterByStatus: (statuses: string[]) => void;
  clearFilters: () => void;
  activeFilters: {
    severities: AlertSeverity[];
    statuses: string[];
  };
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [activeFilters, setActiveFilters] = useState({
    severities: [] as AlertSeverity[],
    statuses: [] as string[],
  });

  useEffect(() => {
    // Load mock data
    const mockAlerts = generateMockAlerts(25);
    setAlerts(mockAlerts);
    setFilteredAlerts(mockAlerts);
  }, []);

  useEffect(() => {
    applyFilters();
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
        addAlert,
        removeAlert,
        updateAlert,
        filterBySeverity,
        filterByStatus,
        clearFilters,
        activeFilters
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