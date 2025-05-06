import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Security Reports</h1>
        <p className="text-muted-foreground">
          Generate and view security analytics and reports
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Security Analytics Platform</CardTitle>
          <CardDescription>
            This page would display comprehensive reporting capabilities, including:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Report Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">Available templates</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Scheduled Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">Active schedules</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Custom Dashboards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">User created</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Data Retention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">365d</div>
                <p className="text-xs text-muted-foreground">Historical data</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Report Categories</h3>
            <div className="flex flex-wrap gap-2">
              <Badge>Executive Summary</Badge>
              <Badge>Compliance</Badge>
              <Badge>Threat Intelligence</Badge>
              <Badge>Incident Response</Badge>
              <Badge>Vulnerability Management</Badge>
              <Badge>User Activity</Badge>
              <Badge>System Performance</Badge>
              <Badge>Risk Assessment</Badge>
            </div>
          </div>
          
          <div className="pt-4">
            <p className="text-center text-muted-foreground">
              This is a placeholder for the Reports page. In a complete implementation, this would include:
            </p>
            <ul className="list-disc pl-6 pt-2 text-muted-foreground">
              <li>Report template library and designer</li>
              <li>Custom dashboard builder</li>
              <li>Scheduled report management</li>
              <li>Data visualization tools</li>
              <li>Export capabilities (PDF, CSV, etc.)</li>
              <li>Compliance and regulatory reporting</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}