import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Shield, AlertTriangle, Server, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAlerts } from '@/contexts/AlertContext';

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  progress?: number;
  progressColor?: string;
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
  progress,
  progressColor = 'bg-primary'
}: MetricCardProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 1000);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          <span className={cn(
            "transition-all",
            animate ? "text-primary scale-105" : ""
          )}>{value}</span>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
        
        {progress !== undefined && (
          <div className="mt-3">
            <Progress value={progress} className={cn("h-1", progressColor)} />
          </div>
        )}
        
        {trend && (
          <div className="mt-3 flex items-center text-xs">
            <span className={cn(
              "mr-1",
              trend === 'up' ? "text-destructive" : "",
              trend === 'down' ? "text-green-500" : "",
              trend === 'neutral' ? "text-muted-foreground" : "",
            )}>
              {trendValue}
            </span>
            <span className="text-muted-foreground">from last 24 hours</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function SecurityMetrics() {
  const { alerts } = useAlerts();
  
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && a.status === 'open').length;
  const highAlerts = alerts.filter(a => a.severity === 'high' && a.status === 'open').length;
  const totalAlerts = alerts.filter(a => a.status === 'open').length;
  
  // Calculate security score (mock calculation)
  const securityScore = 100 - (criticalAlerts * 5) - (highAlerts * 2);
  const finalScore = Math.max(0, Math.min(100, securityScore));
  
  const resolvedLast24h = alerts.filter(a => a.status === 'resolved' && 
    new Date(a.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000).length;

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Security Score"
        value={`${finalScore}%`}
        description="Overall security posture"
        icon={Shield}
        progress={finalScore}
        progressColor={cn(
          finalScore > 70 ? "bg-green-500" : "",
          finalScore > 40 && finalScore <= 70 ? "bg-yellow-500" : "",
          finalScore <= 40 ? "bg-destructive" : ""
        )}
      />
      
      <MetricCard
        title="Active Alerts"
        value={totalAlerts}
        description={`${criticalAlerts} critical, ${highAlerts} high priority`}
        icon={AlertTriangle}
        trend={totalAlerts > 10 ? 'up' : 'down'}
        trendValue={totalAlerts > 10 ? `+${totalAlerts - 10}` : `-${10 - totalAlerts}`}
      />
      
      <MetricCard
        title="Protected Endpoints"
        value="187/192"
        description="97% devices secured"
        icon={Server}
        progress={97}
      />
      
      <MetricCard
        title="Resolved Incidents"
        value={resolvedLast24h}
        description="Threats neutralized in last 24h"
        icon={Users}
        trend="down"
        trendValue="+5"
      />
    </div>
  );
}