import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import EndpointInventory from './EndpointInventory';
import EndpointPolicies from './EndpointPolicies';
import RemoteRemediation from './RemoteRemediation';
import AgentDeployment from './AgentDeployment';
import SystemInventory from './SystemInventory';
import VulnerabilityManagement from './VulnerabilityManagement';

export default function Endpoints() {
  const [activeTab, setActiveTab] = useState('inventory');

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Endpoint Protection</h1>
        <p className="text-muted-foreground">
          Monitor and manage security across all endpoints
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Endpoint Management</CardTitle>
          <CardDescription>
            Comprehensive endpoint security information and management tools
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Endpoints</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">192</div>
                <p className="text-xs text-muted-foreground">Managed devices</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Protected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">187</div>
                <p className="text-xs text-muted-foreground">97% coverage</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">At Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">Requiring attention</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Agent Version</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">v2.5.3</div>
                <p className="text-xs text-muted-foreground">Latest release</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Endpoint Capabilities</h3>
            <div className="flex flex-wrap gap-2">
              <Badge>EDR</Badge>
              <Badge>Anti-Malware</Badge>
              <Badge>Firewall</Badge>
              <Badge>Behavioral Monitoring</Badge>
              <Badge>Device Control</Badge>
              <Badge>Vulnerability Management</Badge>
              <Badge>Application Control</Badge>
              <Badge>Data Loss Prevention</Badge>
            </div>
          </div>
          
          <Tabs defaultValue="inventory" value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="policies">Policies</TabsTrigger>
              <TabsTrigger value="remediation">Remediation</TabsTrigger>
              <TabsTrigger value="deployment">Deployment</TabsTrigger>
              <TabsTrigger value="os-inventory">OS Inventory</TabsTrigger>
              <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
            </TabsList>
            
            <TabsContent value="inventory">
              <EndpointInventory />
            </TabsContent>
            
            <TabsContent value="policies">
              <EndpointPolicies />
            </TabsContent>
            
            <TabsContent value="remediation">
              <RemoteRemediation />
            </TabsContent>
            
            <TabsContent value="deployment">
              <AgentDeployment />
            </TabsContent>
            
            <TabsContent value="os-inventory">
              <SystemInventory />
            </TabsContent>
            
            <TabsContent value="vulnerabilities">
              <VulnerabilityManagement />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}