import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAlerts } from '@/contexts/AlertContext';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AlertsTimeline() {
  const { alerts } = useAlerts();
  
  // Get 8 most recent alerts
  const recentAlerts = [...alerts]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'critical': return 'border-destructive text-destructive';
      case 'high': return 'border-orange-500 text-orange-500';
      case 'medium': return 'border-yellow-500 text-yellow-500';
      case 'low': return 'border-green-500 text-green-500';
      default: return 'border-blue-500 text-blue-500';
    }
  };

  return (
    <Card className="col-span-full md:col-span-1">
      <CardHeader>
        <CardTitle>Recent Alerts Timeline</CardTitle>
        <CardDescription>Security events detected in your environment</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-[2px] bg-border" />
          
          {recentAlerts.map((alert, i) => (
            <div key={alert.id} className="mb-6 relative">
              <div className="flex gap-4">
                {/* Timeline dot */}
                <div className={cn(
                  "h-5 w-5 rounded-full border-2 bg-background z-10 mt-1",
                  getSeverityColor(alert.severity)
                )} />
                
                {/* Alert content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{alert.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                      </div>
                    </div>
                    <Button variant="ghost"  className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="mt-2 text-sm">{alert.description}</div>
                  
                  <div className="mt-2 flex gap-2">
                    <div className="text-xs bg-secondary text-secondary-foreground px-2.5 py-0.5 rounded-full">
                      {alert.source}
                    </div>
                    {alert.tags.slice(0, 2).map(tag => (
                      <div key={tag} className="text-xs bg-muted text-muted-foreground px-2.5 py-0.5 rounded-full">
                        {tag}
                      </div>
                    ))}
                    {alert.tags.length > 2 && (
                      <div className="text-xs bg-muted text-muted-foreground px-2.5 py-0.5 rounded-full">
                        +{alert.tags.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <Button variant="outline" className="w-full">View All Alerts</Button>
        </div>
      </CardContent>
    </Card>
  );
}