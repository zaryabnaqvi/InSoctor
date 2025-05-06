import { 
  Calendar, 
  FileText, 
  LogIn, 
  LogOut, 
  Mail, 
  Shield, 
  Upload 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UserActivityTimelineProps {
  limit?: number;
}

export function UserActivityTimeline({ limit = 10 }: UserActivityTimelineProps) {
  const activityItems = [
    {
      id: 1,
      user: 'admin@example.com',
      action: 'Logged in',
      time: '2 minutes ago',
      icon: LogIn,
      iconColor: 'text-green-500 bg-green-500/10',
      details: 'From IP 192.168.1.45 (US)',
      severity: 'low'
    },
    {
      id: 2,
      user: 'john.doe@example.com',
      action: 'Accessed sensitive documents',
      time: '15 minutes ago',
      icon: FileText,
      iconColor: 'text-amber-500 bg-amber-500/10',
      details: 'Viewed financial reports (unusual behavior)',
      severity: 'medium'
    },
    {
      id: 3,
      user: 'jane.smith@example.com',
      action: 'Failed login attempt',
      time: '35 minutes ago',
      icon: Shield,
      iconColor: 'text-destructive bg-destructive/10',
      details: 'From unknown device, IP 45.67.89.123 (China)',
      severity: 'high'
    },
    {
      id: 4,
      user: 'guest.user@example.com',
      action: 'Password changed',
      time: '1 hour ago',
      icon: Shield,
      iconColor: 'text-blue-500 bg-blue-500/10',
      details: 'After 90 days (policy enforcement)',
      severity: 'low'
    },
    {
      id: 5,
      user: 'admin@example.com',
      action: 'Updated user permissions',
      time: '3 hours ago',
      icon: Shield,
      iconColor: 'text-purple-500 bg-purple-500/10',
      details: 'Granted admin access to dev.team@example.com',
      severity: 'medium'
    },
    {
      id: 6,
      user: 'marketing@example.com',
      action: 'Bulk email sent',
      time: '5 hours ago',
      icon: Mail,
      iconColor: 'text-blue-500 bg-blue-500/10',
      details: 'Campaign "Q2 Newsletter" to 2,450 recipients',
      severity: 'low'
    },
    {
      id: 7,
      user: 'john.doe@example.com',
      action: 'Logged out',
      time: '6 hours ago',
      icon: LogOut,
      iconColor: 'text-muted-foreground bg-muted/10',
      details: 'Session duration: 4h 12m',
      severity: 'low'
    },
    {
      id: 8,
      user: 'system@example.com',
      action: 'Scheduled maintenance',
      time: '9 hours ago',
      icon: Calendar,
      iconColor: 'text-blue-500 bg-blue-500/10',
      details: 'System backup and security updates applied',
      severity: 'low'
    },
    {
      id: 9,
      user: 'jane.smith@example.com',
      action: 'Uploaded files',
      time: '12 hours ago',
      icon: Upload,
      iconColor: 'text-amber-500 bg-amber-500/10',
      details: 'Large upload to shared drive (1.2GB)',
      severity: 'medium'
    },
    {
      id: 10,
      user: 'new.user@example.com',
      action: 'Account created',
      time: '1 day ago',
      icon: Shield,
      iconColor: 'text-green-500 bg-green-500/10',
      details: 'Created by admin@example.com',
      severity: 'low'
    }
  ].slice(0, limit);

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-medium">User Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent className="px-2">
        <div className="space-y-0">
          {activityItems.map((item) => (
            <div key={item.id} className="flex gap-3 py-3 px-2 border-b last:border-0">
              <div className={`rounded-full p-1.5 ${item.iconColor} shrink-0 mt-0.5`}>
                <item.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {item.user}
                </p>
                <div className="flex items-center flex-wrap gap-1">
                  <p className="text-sm">{item.action}</p>
                  <Badge 
                    variant="outline"
                    className={`text-xs ${
                      item.severity === 'high' ? 'bg-destructive/10 text-destructive border-destructive/20' : 
                      item.severity === 'medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                      'bg-muted/20 border-muted/20'
                    }`}
                  >
                    {item.severity}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{item.details}</p>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {item.time}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}