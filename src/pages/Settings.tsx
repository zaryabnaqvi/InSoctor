import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">
          Configure and manage platform settings
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Platform Configuration</CardTitle>
          <CardDescription>
            This page would display comprehensive system settings, including:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">User Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42</div>
                <p className="text-xs text-muted-foreground">Platform users</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">API Keys</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">Active keys</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">System Version</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3.5.2</div>
                <p className="text-xs text-muted-foreground">Released: 3 days ago</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Data Storage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.2 TB</div>
                <p className="text-xs text-muted-foreground">71% capacity</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Setting Categories</h3>
            <div className="flex flex-wrap gap-2">
              <Badge>User Management</Badge>
              <Badge>Authentication</Badge>
              <Badge>System Configuration</Badge>
              <Badge>Notifications</Badge>
              <Badge>Audit Logging</Badge>
              <Badge>Data Retention</Badge>
              <Badge>API Management</Badge>
              <Badge>Licensing</Badge>
            </div>
          </div>
          
          <div className="pt-4">
            <p className="text-center text-muted-foreground">
              This is a placeholder for the Settings page. In a complete implementation, this would include:
            </p>
            <ul className="list-disc pl-6 pt-2 text-muted-foreground">
              <li>User and role management</li>
              <li>Authentication and access control</li>
              <li>System configuration and preferences</li>
              <li>API management and documentation</li>
              <li>Notification settings and templates</li>
              <li>Audit logging and system health</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}