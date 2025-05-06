import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Key, Lock, Shield, User } from 'lucide-react';

export function UserIdentityManagement() {
  const users = [
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'Administrator',
      department: 'IT Security',
      status: 'Active',
      lastActive: '2 min ago',
      riskScore: 12,
      permissions: ['Full System Access', 'User Management', 'Security Settings'],
      privileged: true
    },
    {
      id: 2,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'Developer',
      department: 'Engineering',
      status: 'Active',
      lastActive: '15 min ago',
      riskScore: 42,
      permissions: ['Code Repository', 'Development Tools', 'Test Servers'],
      privileged: false
    },
    {
      id: 3,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'Finance Manager',
      department: 'Finance',
      status: 'Active',
      lastActive: '35 min ago',
      riskScore: 38,
      permissions: ['Financial Reports', 'Accounting System', 'Payroll Data'],
      privileged: true
    },
    {
      id: 4,
      name: 'Guest User',
      email: 'guest.user@example.com',
      role: 'Contractor',
      department: 'Marketing',
      status: 'Inactive',
      lastActive: '2 days ago',
      riskScore: 65,
      permissions: ['Marketing Materials', 'Analytics Dashboard'],
      privileged: false
    },
    {
      id: 5,
      name: 'Robert Johnson',
      email: 'robert.j@example.com',
      role: 'Support Agent',
      department: 'Customer Support',
      status: 'Active',
      lastActive: '1 hour ago',
      riskScore: 18,
      permissions: ['Support Tickets', 'Knowledge Base', 'Customer Data'],
      privileged: false
    }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <RoleDistribution />
        <PrivilegedAccountsCard />
        <IdentitySecurityCard />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">User Identity & Access Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                      <span className="text-xs text-muted-foreground">{user.department}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.privileged ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Shield className="h-3 w-3 text-blue-500" />
                        <span>{user.role}</span>
                      </div>
                    ) : (
                      <span className="text-sm">{user.role}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}>
                      {user.status}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      Last seen: {user.lastActive}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={`
                        ${user.riskScore > 60 ? 'bg-destructive/10 text-destructive border-destructive/20' : 
                          user.riskScore > 30 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                          'bg-green-500/10 text-green-500 border-green-500/20'
                        }
                      `}
                    >
                      {user.riskScore}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.permissions.map((perm, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {perm}
                        </Badge>
                      )).slice(0, 2)}
                      {user.permissions.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{user.permissions.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Key className="h-3.5 w-3.5 mr-1" />
                        Access
                      </Button>
                      <Button variant="outline" size="sm">
                        <Lock className="h-3.5 w-3.5 mr-1" />
                        Security
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function RoleDistribution() {
  const roles = [
    { name: 'Standard Users', count: 387, color: 'bg-blue-500' },
    { name: 'Administrators', count: 42, color: 'bg-purple-500' },
    { name: 'Service Accounts', count: 38, color: 'bg-green-500' },
    { name: 'Contractors', count: 24, color: 'bg-amber-500' },
    { name: 'Guests', count: 12, color: 'bg-slate-500' }
  ];

  return (
    <Card className="bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Role Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {roles.map((role) => (
            <div key={role.name} className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${role.color}`} />
              <div className="flex justify-between w-full text-sm">
                <span className="text-muted-foreground">{role.name}</span>
                <span className="font-medium">{role.count}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PrivilegedAccountsCard() {
  return (
    <Card className="bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Privileged Accounts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-3xl font-bold">42</div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Admins</span>
              <span>28</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Super Users</span>
              <span>9</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Service Accounts</span>
              <span>5</span>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full">
            <Shield className="h-3.5 w-3.5 mr-1" />
            Manage Privileges
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function IdentitySecurityCard() {
  return (
    <Card className="bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Identity Security</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">MFA Enabled</span>
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              78%
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Password Policy</span>
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              Strong
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Dormant Accounts</span>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
              15
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Expired Credentials</span>
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
              8
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}