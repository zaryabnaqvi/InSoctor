// import { Alert } from '@/types/alert';
import { AlertScore } from '@/components/alert/alert-score';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { formatDate, getStatusColor, capitalizeFirstLetter } from '@/lib/utils';
import { AttackPhaseIndicator } from '@/components/ui/attack-phase-indicator';
import { 
  CalendarIcon, 
  Clock, 
  FileText, 
  Shield, 
  Tag, 
  Users, 
  AlertTriangle 
} from 'lucide-react';
import { Alert } from '@/lib/alerts-data';

interface AlertDetailProps {
  alert: Alert;
}

export function AlertDetail({ alert }: AlertDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <AlertScore score={alert?.score|| 0} className="flex-shrink-0" />
        <div className="flex-1 space-y-1">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            {alert.title}
            <Badge 
              variant="outline" 
              className={getStatusColor(alert.status)}
            >
              {capitalizeFirstLetter(alert.status)}
            </Badge>
          </h2>
          <div className="text-sm text-muted-foreground">{alert.id}</div>
          <p className="text-sm mt-2">{alert.description}</p>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" /> Data Source
            </h3>
            <p className="text-sm mt-1">{alert.dataSource}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Event Count
            </h3>
            <p className="text-sm mt-1">{alert.eventCount} events detected</p>
          </div>

          <div>
            <h3 className="text-sm font-medium flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" /> Timeline
            </h3>
            <div className="text-sm mt-1 space-y-1">
              <div className="flex justify-between">
                <span>First seen:</span>
                <span>{formatDate(alert.firstSeen)}</span>
              </div>
              <div className="flex justify-between">
                <span>Last seen:</span>
                <span>{formatDate(alert.lastSeen)}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4" /> Tags
            </h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {alert.tags.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" /> Affected Assets ({alert.affectedAssets.length})
            </h3>
            <div className="text-sm mt-2 max-h-24 overflow-y-auto border rounded-md p-2">
              <ul className="space-y-1">
                {alert.affectedAssets.map((asset) => (
                  <li key={asset} className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    {asset}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" /> Attack Phase
            </h3>
            <div className="mt-2">
              <div className="text-xs mb-2">{alert.attackPhase}</div>
              <AttackPhaseIndicator phase={alert.attackPhase || ''} />
            </div>
          </div>

          {alert.assignedTo ? (
            <div>
              <h3 className="text-sm font-medium">Assigned To</h3>
              <p className="text-sm mt-1">{alert.assignedTo}</p>
            </div>
          ) : null}
        </div>
      </div>

      <Separator />

      <div className="flex justify-between">
        <Button variant="outline">Mark as Resolved</Button>
        <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
          <FileText className="h-4 w-4 mr-2" />
          Create Case
        </Button>
      </div>
    </div>
  );
}