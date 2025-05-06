import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Network() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Network Security</h1>
        <p className="text-muted-foreground">
          Monitor and analyze network traffic for threats
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Network Security Monitoring</CardTitle>
          <CardDescription>
            This page would display comprehensive network security information, including:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Monitored Traffic</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42.7 TB</div>
                <p className="text-xs text-muted-foreground">Past 30 days</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Blocked Connections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">28,453</div>
                <p className="text-xs text-muted-foreground">Past 30 days</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Suspicious IPs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">137</div>
                <p className="text-xs text-muted-foreground">Currently tracked</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Network Devices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">48</div>
                <p className="text-xs text-muted-foreground">Monitored devices</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Network Security Capabilities</h3>
            <div className="flex flex-wrap gap-2">
              <Badge>Traffic Analysis</Badge>
              <Badge>IDS/IPS</Badge>
              <Badge>DNS Monitoring</Badge>
              <Badge>Packet Inspection</Badge>
              <Badge>Network Flow Analysis</Badge>
              <Badge>Firewall Management</Badge>
              <Badge>Encrypted Traffic Analysis</Badge>
              <Badge>Lateral Movement Detection</Badge>
            </div>
          </div>
          
          <div className="pt-4">
            <p className="text-center text-muted-foreground">
              This is a placeholder for the Network page. In a complete implementation, this would include:
            </p>
            <ul className="list-disc pl-6 pt-2 text-muted-foreground">
              <li>Network traffic visualization and analysis</li>
              <li>Layer 7 application monitoring</li>
              <li>Network device inventory and status</li>
              <li>Traffic anomaly detection</li>
              <li>Network segmentation verification</li>
              <li>C2 channel detection</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}