import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserMetrics } from './UserMetrics';
import { UserActivityTimeline } from './UserActivityTimeline';
import { UserRiskScoring } from './UserRiskScoring';
import { UserIdentityManagement } from './UserIdentityManagement';
import { UserHeader } from './UserHeader';

export function UserManagementDashboard() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <UserHeader />
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="identity">Identity</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="risk">Risk</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <UserMetrics />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UserRiskScoring />
            <UserActivityTimeline limit={5} />
          </div>
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-4">
          <UserActivityTimeline limit={20} />
        </TabsContent>
        
        <TabsContent value="identity" className="space-y-4">
          <UserIdentityManagement />
        </TabsContent>
        
        <TabsContent value="authentication" className="space-y-4">
          <AuthenticationAnalysis />
        </TabsContent>
        
        <TabsContent value="risk" className="space-y-4">
          <UserRiskScoring showDetails={true} />
          <AbnormalBehaviorDetection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AuthenticationAnalysis() {
  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
      <LoginAttemptAnalysis />
      <AuthenticationMethods />
    </div>
  );
}

function LoginAttemptAnalysis() {
  return (
    <div className="border rounded-lg p-4 bg-card">
      <h3 className="text-lg font-medium mb-2">Login Attempt Analysis</h3>
      <div className="space-y-4">
        <LoginAttemptsChart />
        <FailedLoginList />
      </div>
    </div>
  );
}

function LoginAttemptsChart() {
  // In a real app, this would be a chart component
  return (
    <div className="h-40 bg-muted/20 rounded flex items-center justify-center">
      <p className="text-muted-foreground">Login attempts visualization</p>
    </div>
  );
}

function FailedLoginList() {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Recent Failed Logins</h4>
      <div className="space-y-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between text-sm bg-muted/10 p-2 rounded">
            <span>user{i}@example.com</span>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">{i} min ago</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-destructive/20 text-destructive">IP: 192.168.1.{i}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuthenticationMethods() {
  return (
    <div className="border rounded-lg p-4 bg-card">
      <h3 className="text-lg font-medium mb-2">Authentication Methods</h3>
      <div className="space-y-2">
        {[
          { name: 'Password', count: 378, percent: 75 },
          { name: 'MFA', count: 120, percent: 24 },
          { name: 'SSO', count: 5, percent: 1 },
        ].map((method) => (
          <div key={method.name} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{method.name}</span>
              <span>{method.count} users ({method.percent}%)</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${method.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AbnormalBehaviorDetection() {
  return (
    <div className="border rounded-lg p-4 bg-card">
      <h3 className="text-lg font-medium mb-4">Abnormal Behavior Detection</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded p-3 bg-muted/10">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium">Unusual Login Times</h4>
              <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-500">8 users</span>
            </div>
          </div>
          
          <div className="border rounded p-3 bg-muted/10">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium">Excessive File Access</h4>
              <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-500">4 users</span>
            </div>
          </div>
          
          <div className="border rounded p-3 bg-muted/10">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium">Off-hours Activity</h4>
              <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-500">6 users</span>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-3 bg-muted/10">
          <h4 className="text-sm font-medium mb-2">Behavioral Anomalies</h4>
          <div className="space-y-2">
            {[
              { user: 'admin@example.com', event: 'Multiple login attempts from unusual locations', severity: 'high' },
              { user: 'john.doe@example.com', event: 'Large volume of sensitive data accessed', severity: 'medium' },
              { user: 'guest.user@example.com', event: 'Attempted to access restricted systems', severity: 'high' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center text-sm bg-muted/5 p-2 rounded">
                <div>
                  <span className="font-medium">{item.user}</span>
                  <p className="text-xs text-muted-foreground">{item.event}</p>
                </div>
                <span 
                  className={`text-xs px-2 py-1 rounded-full ${
                    item.severity === 'high' 
                      ? 'bg-destructive/20 text-destructive' 
                      : 'bg-amber-500/20 text-amber-500'
                  }`}
                >
                  {item.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}