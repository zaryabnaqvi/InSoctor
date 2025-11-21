import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '@/services/api.service';
import { toast } from '@/hooks/use-toast';

export interface Alert {
    id: string;
    title: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    status: 'open' | 'investigating' | 'resolved' | 'false-positive';
    source: string;
    timestamp: string;
    assignedTo?: string;
    caseId?: string;
    caseStatus?: string;
    rawData?: any;
}

interface UseRealTimeAlertsOptions {
    pollInterval?: number; // in milliseconds
    autoRefresh?: boolean;
    showNotifications?: boolean;
}

export function useRealTimeAlerts(options: UseRealTimeAlertsOptions = {}) {
    const {
        pollInterval = 15000, // 15 seconds default
        autoRefresh = true,
        showNotifications = true,
    } = options;

    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastFetch, setLastFetch] = useState<Date | null>(null);

    const previousAlertsRef = useRef<Alert[]>([]);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const fetchAlerts = useCallback(async () => {
        try {
            const response = await apiClient.getAlerts({
                limit: 500,
            });

            if (response.success && response.data) {
                const newAlerts: Alert[] = response.data;

                // Check for new critical alerts
                if (showNotifications && previousAlertsRef.current.length > 0) {
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
            }
        } catch (err: any) {
            console.error('Failed to fetch alerts:', err);
            setError(err.message || 'Failed to fetch alerts');
        } finally {
            setLoading(false);
        }
    }, [showNotifications]);

    const refresh = useCallback(() => {
        setLoading(true);
        fetchAlerts();
    }, [fetchAlerts]);

    useEffect(() => {
        // Initial fetch
        fetchAlerts();

        // Set up polling if auto-refresh is enabled
        if (autoRefresh) {
            intervalRef.current = setInterval(fetchAlerts, pollInterval);
        }

        // Cleanup
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [fetchAlerts, autoRefresh, pollInterval]);

    return {
        alerts,
        loading,
        error,
        lastFetch,
        refresh,
    };
}
