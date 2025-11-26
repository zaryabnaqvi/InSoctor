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
      <Card className="modern-card border-l-4 border-l-cyan-500 glass-card hover:bg-white/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">Total Alerts</CardTitle>
          <AlertTriangle className="h-4 w-4 text-cyan-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats.totalAlerts}</div>
          <p className="text-xs text-slate-400">
            {stats.criticalAlerts} critical/high severity
          </p>
        </CardContent>
      </Card>

      <Card className="modern-card border-l-4 border-l-red-500 glass-card hover:bg-white/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">Endpoints</CardTitle>
          <Server className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats.totalAgents}</div>
          <p className="text-xs text-slate-400">
            {stats.activeAgents} active agents
          </p>
        </CardContent>
      </Card>

      <Card className="modern-card border-l-4 border-l-orange-500 glass-card hover:bg-white/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">Security Score</CardTitle>
          <Shield className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{getHealthScore()}%</div>
          <Progress value={getHealthScore()} className="mt-2" />
        </CardContent>
      </Card>

      <Card className="modern-card border-l-4 border-l-blue-500 glass-card hover:bg-white/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">Agent Health</CardTitle>
          <Activity className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats.activeAgents}</div>
          <p className="text-xs text-slate-400">
            {stats.totalAgents - stats.activeAgents} disconnected
          </p>
        </CardContent>
      </Card>
    </div>

    {/* Charts Row */}
    <div className="grid gap-6 md:grid-cols-2">
      {/* Alert Severity Distribution */}
      <Card className="modern-card glass-card hover:bg-white/5">
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
      <Card className="modern-card glass-card hover:bg-white/5">
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
    <Card className="modern-card glass-card hover:bg-white/5">
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
    <Card className="modern-card glass-card hover:bg-white/5">
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