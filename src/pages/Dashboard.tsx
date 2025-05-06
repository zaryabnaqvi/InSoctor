import { SecurityMetrics } from '@/components/dashboard/SecurityMetrics';
import { ThreatMap } from '@/components/dashboard/ThreatMap';
import { AlertsTimeline } from '@/components/dashboard/AlertsTimeline';
import { SecurityStats } from '@/components/dashboard/SecurityStats';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Security Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your security posture and respond to threats
        </p>
      </div>
      
      <SecurityMetrics />
      
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <SecurityStats />
        <AlertsTimeline />
      </div>
      
      <ThreatMap />
    </div>
  );
}