import { useState, useEffect } from 'react';
import {
  Shield,
  Server,
  AlertTriangle,
  Activity,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import apiClient from '@/services/api.service';
import { formatDistanceToNow } from 'date-fns';

interface DashboardStats {
  totalAlerts: number;
  criticalAlerts: number;
  totalAgents: number;
  activeAgents: number;
  alertsBySeverity: Record<string, number>;
  alertsByRule: Array<{ rule: string; count: number }>;
  recentAlerts: any[];
  alertTrend: Array<{ hour: number; count: number; label: string }>;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAlerts: 0,
    criticalAlerts: 0,
    totalAgents: 0,
    activeAgents: 0,
    alertsBySeverity: {},
    alertsByRule: [],
    recentAlerts: [],
    alertTrend: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch alerts, agents, and stats in parallel
        const [alertsResponse, agentsResponse, statsResponse] = await Promise.all([
          apiClient.getAlerts({ limit: 1000 }),
          apiClient.getAgents(),
          apiClient.getAlertStats()
        ]);

        const alerts = alertsResponse?.data || [];
        const agents = agentsResponse?.data || [];
        const statsData = statsResponse || {};

        // Calculate stats
        const criticalAlerts = alerts.filter((a: any) =>
          a.severity === 'critical' || a.severity === 'high'
        ).length;

        const activeAgents = agents.filter((a: any) => a.status === 'active').length;

        // Alerts by severity
        const alertsBySeverity = alerts.reduce((acc: any, alert: any) => {
          acc[alert.severity] = (acc[alert.severity] || 0) + 1;
          return acc;
        }, {});

        // Top alert rules
        const ruleCount: Record<string, number> = {};
        alerts.forEach((alert: any) => {
          const rule = alert.title || alert.description || 'Unknown';
          ruleCount[rule] = (ruleCount[rule] || 0) + 1;
        });
        const alertsByRule = Object.entries(ruleCount)
          .map(([rule, count]) => ({ rule, count: count as number }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Recent critical alerts
        const recentAlerts = alerts
          .filter((a: any) => a.severity === 'critical' || a.severity === 'high')
          .slice(0, 5);

        // Alert trend by hour (Rolling last 24 hours)
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Initialize 24 buckets for the last 24 hours
        const alertTrend = new Array(24).fill(0).map((_, i) => {
          const d = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
          return {
            hour: d.getHours(),
            label: `${d.getHours()}:00`,
            count: 0,
            fullDate: d
          };
        });

        // Populate from Aggregations if available
        if (statsData.aggregations?.alert_trend?.buckets) {
          statsData.aggregations.alert_trend.buckets.forEach((bucket: any) => {
            const bucketDate = new Date(bucket.key_as_string || bucket.key);
            const diffMs = bucketDate.getTime() - twentyFourHoursAgo.getTime();
            const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
            const index = Math.min(Math.max(0, diffHours), 23);

            if (index >= 0 && index < 24) {
              alertTrend[index].count = bucket.doc_count;
            }
          });
        } else {
          // Fallback to client-side counting
          alerts.forEach((alert: any) => {
            try {
              if (!alert.timestamp) return;
              const alertDate = new Date(alert.timestamp);
              if (alertDate >= twentyFourHoursAgo && alertDate <= now) {
                const diffMs = alertDate.getTime() - twentyFourHoursAgo.getTime();
                const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
                const index = Math.min(Math.max(0, diffHours), 23);
                alertTrend[index].count++;
              }
            } catch (error) {
              console.error('Error processing alert for trend:', error);
            }
          });
        }

        setStats({
          totalAlerts: alerts.length,
          criticalAlerts,
          totalAgents: agents.length,
          activeAgents,
          alertsBySeverity,
          alertsByRule,
          recentAlerts,
          alertTrend
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getHealthScore = () => {
    if (stats.totalAgents === 0) return 0;
    const agentHealth = (stats.activeAgents / stats.totalAgents) * 50;
    const alertHealth = Math.max(0, 50 - (stats.criticalAlerts / 10));
    return Math.round(agentHealth + alertHealth);
  };

  const severityColors: Record<string, string> = {
    critical: 'bg-red-600',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-blue-500',
    info: 'bg-gray-500'
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Security Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time overview of your security posture
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAlerts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.criticalAlerts} critical/high severity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Endpoints</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAgents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeAgents} active agents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getHealthScore()}%</div>
            <Progress value={getHealthScore()} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agent Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeAgents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalAgents - stats.activeAgents} disconnected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Alert Severity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Alerts by Severity</CardTitle>
            <CardDescription>Distribution of alert severity levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.alertsBySeverity).map(([severity, count]) => {
                const percentage = stats.totalAlerts > 0
                  ? ((count / stats.totalAlerts) * 100).toFixed(1)
                  : '0';
                return (
                  <div key={severity} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded ${severityColors[severity] || 'bg-gray-500'}`} />
                        <span className="capitalize">{severity}</span>
                      </div>
                      <span className="font-medium">{count} ({percentage}%)</span>
                    </div>
                    <Progress
                      value={Number(percentage)}
                      className="h-2"
                    />
                  </div>
                );
              })}
              {Object.keys(stats.alertsBySeverity).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No alert data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Alert Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Top Alert Rules</CardTitle>
            <CardDescription>Most frequent detection rules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.alertsByRule.map((item, index) => {
                const maxCount = stats.alertsByRule[0]?.count || 1;
                const percentage = ((item.count / maxCount) * 100).toFixed(0);
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate max-w-[200px]" title={item.rule}>
                        {item.rule}
                      </span>
                      <Badge variant="secondary">{item.count}</Badge>
                    </div>
                    <Progress value={Number(percentage)} className="h-2" />
                  </div>
                );
              })}
              {stats.alertsByRule.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No rule data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Activity (Last 24 Hours)</CardTitle>
          <CardDescription>Hourly distribution of alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end space-x-1 px-2 pb-2">
            {stats.alertTrend.map((item, index) => {
              const maxCount = Math.max(...stats.alertTrend.map(t => t.count), 1);
              const maxBarHeight = 200; // 200px max height
              const height = (item.count / maxCount) * maxBarHeight;

              return (
                <div key={index} className="flex-1 flex flex-col items-center min-w-0 justify-end h-full group relative">
                  <div
                    className={`w-full rounded-t-sm transition-all relative shadow-lg ${item.count > 0
                      ? 'bg-gradient-to-t from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 cursor-pointer'
                      : 'bg-gray-800/50'
                      }`}
                    style={{ height: `${Math.max(height, 4)}px` }}
                  >
                    {item.count > 0 && (
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none border border-slate-700 shadow-xl">
                        <div className="font-bold">{item.count} alerts</div>
                        <div className="text-[10px] text-slate-400">{item.label}</div>
                      </div>
                    )}
                  </div>
                  {/* X-Axis Label */}
                  <div className="h-6 flex items-center justify-center mt-1">
                    {index % 4 === 0 && (
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {item.hour}:00
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {stats.alertTrend.every(t => t.count === 0) && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              No alert activity in the last 24 hours
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Critical Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Critical Alerts</CardTitle>
          <CardDescription>Latest high-priority security events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recentAlerts.map((alert, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border">
                <AlertTriangle className={`h-5 w-5 mt-0.5 ${alert.severity === 'critical' ? 'text-red-600' : 'text-orange-500'
                  }`} />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{alert.title}</p>
                    <Badge variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                    </span>
                    <span>Source: {alert.source}</span>
                  </div>
                </div>
              </div>
            ))}
            {stats.recentAlerts.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No critical alerts - All systems operational
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}