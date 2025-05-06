import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
// import { Alert } from '@/types/alert';
import { AlertScore } from './alert-score';
import { AttackPhaseIndicator } from '@/components/ui/attack-phase-indicator';
import { formatDate } from '@/lib/utils';
// import { AlertDetail } from '@/components/alert/alert-detail';
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { FileText, MonitorDot } from 'lucide-react';
import { AlertDetail } from './alert-details';
import { Alert } from '@/lib/alerts-data';

interface AlertsTableProps {
  alerts: Alert[];
}

export function AlertsTable({ alerts }: AlertsTableProps) {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[60px]">Score</TableHead>
              <TableHead>Insight</TableHead>
              <TableHead className="w-[100px]">Impact scope</TableHead>
              <TableHead className="w-[150px]">Case</TableHead>
              <TableHead className="w-[200px]">Attack phase</TableHead>
              <TableHead className="w-[200px]">Data source / processor</TableHead>
              <TableHead className="w-[200px]">Last updated</TableHead>
              <TableHead className="w-[200px]">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.map((alert) => (
              <TableRow 
                key={alert.id} 
                className="cursor-pointer hover:bg-muted/20 transition-colors"
                onClick={() => setSelectedAlert(alert)}
              >
                <TableCell>
                  <AlertScore score={alert.score || 0} />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-primary">{alert.id}</span>
                    <span className="text-sm text-foreground">
                      {alert.title}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <MonitorDot className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{alert.impactScope}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" className="w-full text-blue-600 border-blue-600/20 hover:bg-blue-50 hover:text-blue-700">
                    <FileText className="h-4 w-4 mr-1" />
                    Open new case
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="relative group">
                    <div className="text-xs mb-2 text-foreground">{alert.attackPhase}</div>
                    <AttackPhaseIndicator phase={alert.attackPhase || ''} />
                  </div>
                </TableCell>
                <TableCell>
                  <span>{alert.dataSource}</span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{formatDate(alert.timestamp)}</span>
                    <span className="text-xs text-muted-foreground">New alert correlated</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <span>{formatDate(alert.firstSeen)}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedAlert} onOpenChange={(open) => !open && setSelectedAlert(null)}>
        <DialogContent className="max-w-4xl">
          {selectedAlert && <AlertDetail alert={selectedAlert} />}
        </DialogContent>
      </Dialog>
    </>
  );
}