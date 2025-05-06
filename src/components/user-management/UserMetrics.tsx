import { Activity, AlertCircle, Clock, Fingerprint as FingerPrint, ShieldAlert, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function UserMetrics() {
  const metrics = [
    {
      title: 'Active Users',
      value: '503',
      change: '+2.5%',
      trend: 'positive',
      description: 'From last month',
      icon: Users,
      color: 'text-primary'
    },
    {
      title: 'High Risk Users',
      value: '12',
      change: '-8%',
      trend: 'positive',
      description: 'From last week',
      icon: AlertCircle,
      color: 'text-destructive'
    },
    {
      title: 'Auth Failures',
      value: '217',
      change: '+12%',
      trend: 'negative',
      description: 'Last 7 days',
      icon: FingerPrint,
      color: 'text-amber-500'
    },
    {
      title: 'Avg. Risk Score',
      value: '24.3',
      change: '-2.1',
      trend: 'positive',
      description: 'From last week',
      icon: Activity,
      color: 'text-primary'
    },
    {
      title: 'Privileged Users',
      value: '42',
      change: 'No change',
      trend: 'neutral',
      description: 'Administrative access',
      icon: ShieldAlert,
      color: 'text-blue-500'
    },
    {
      title: 'Avg. Session Time',
      value: '1h 24m',
      change: '+12m',
      trend: 'neutral',
      description: 'Per active user',
      icon: Clock,
      color: 'text-green-500'
    }
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
      {metrics.map((metric, i) => (
        <Card key={i} className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.title}
            </CardTitle>
            <metric.icon className={`h-4 w-4 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className={
                metric.trend === 'positive' ? 'text-green-500' : 
                metric.trend === 'negative' ? 'text-destructive' : 
                'text-muted-foreground'
              }>
                {metric.change}
              </span>
              {metric.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}