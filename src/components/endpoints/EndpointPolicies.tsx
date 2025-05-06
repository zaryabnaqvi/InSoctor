import { useState } from 'react';
import { 
  PlusIcon, 
  SearchIcon, 
  ShieldCheckIcon, 
  FileTextIcon,
  ArrowRightIcon, 
  CheckCircleIcon,
  AlertCircleIcon,
  CopyIcon,
  PencilIcon,
  TrashIcon,
  InfoIcon,
  MoreHorizontalIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Sample policy data
const policies = [
  {
    id: 'POL-001',
    name: 'Standard Workstation Policy',
    description: 'Default security policy for standard workstations',
    type: 'workstation',
    status: 'active',
    appliedTo: 156,
    compliant: 154,
    lastUpdated: '2 days ago',
    categories: [
      { name: 'Malware Protection', compliance: 100 },
      { name: 'Firewall Settings', compliance: 99 },
      { name: 'Application Control', compliance: 98 },
      { name: 'Device Control', compliance: 100 },
      { name: 'Data Protection', compliance: 97 },
    ]
  },
  {
    id: 'POL-002',
    name: 'Executive Laptop Policy',
    description: 'Enhanced security policy for executive laptops with sensitive data',
    type: 'laptop',
    status: 'active',
    appliedTo: 12,
    compliant: 12,
    lastUpdated: '1 week ago',
    categories: [
      { name: 'Malware Protection', compliance: 100 },
      { name: 'Firewall Settings', compliance: 100 },
      { name: 'Application Control', compliance: 100 },
      { name: 'Device Control', compliance: 100 },
      { name: 'Data Protection', compliance: 100 },
    ]
  },
  {
    id: 'POL-003',
    name: 'Server Protection Policy',
    description: 'Dedicated security policy for production servers',
    type: 'server',
    status: 'active',
    appliedTo: 18,
    compliant: 17,
    lastUpdated: '3 days ago',
    categories: [
      { name: 'Malware Protection', compliance: 100 },
      { name: 'Firewall Settings', compliance: 94 },
      { name: 'Application Control', compliance: 100 },
      { name: 'Device Control', compliance: 100 },
      { name: 'Data Protection', compliance: 100 },
    ]
  },
  {
    id: 'POL-004',
    name: 'Mobile Device Policy',
    description: 'Security controls for company mobile devices',
    type: 'mobile',
    status: 'active',
    appliedTo: 45,
    compliant: 42,
    lastUpdated: '5 days ago',
    categories: [
      { name: 'Malware Protection', compliance: 100 },
      { name: 'App Store Control', compliance: 93 },
      { name: 'Data Encryption', compliance: 100 },
      { name: 'Remote Wipe', compliance: 100 },
      { name: 'Screen Lock', compliance: 95 },
    ]
  },
  {
    id: 'POL-005',
    name: 'PCI Compliance Policy',
    description: 'Special policy for systems handling payment card data',
    type: 'workstation',
    status: 'draft',
    appliedTo: 0,
    compliant: 0,
    lastUpdated: 'Just now',
    categories: [
      { name: 'Malware Protection', compliance: 0 },
      { name: 'Firewall Settings', compliance: 0 },
      { name: 'Application Control', compliance: 0 },
      { name: 'Device Control', compliance: 0 },
      { name: 'Data Protection', compliance: 0 },
    ]
  },
];

export default function EndpointPolicies() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>('POL-001');

  // Get the selected policy details
  const currentPolicy = policies.find(p => p.id === selectedPolicy) || null;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Policy List */}
      <Card className="md:col-span-1">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-medium">Security Policies</h3>
          <Button size="sm">
            <PlusIcon className="h-4 w-4 mr-1" />
            New Policy
          </Button>
        </div>
        
        <div className="p-4 pb-2 border-b">
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search policies..."
              className="pl-8 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <ScrollArea className="h-[400px]">
          {policies.map((policy) => (
            <div 
              key={policy.id}
              className={`p-4 border-b hover:bg-muted/40 cursor-pointer transition-colors ${selectedPolicy === policy.id ? 'bg-muted/50' : ''}`}
              onClick={() => setSelectedPolicy(policy.id)}
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center">
                  <ShieldCheckIcon className="h-4 w-4 mr-2 text-primary" />
                  <span className="font-medium text-sm">{policy.name}</span>
                </div>
                <Badge variant={policy.status === 'active' ? 'default' : 'outline'}>
                  {policy.status === 'active' ? 'Active' : 'Draft'}
                </Badge>
              </div>
              
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {policy.description}
              </p>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Applied to {policy.appliedTo} endpoints
                </span>
                <span className="text-muted-foreground">
                  Updated {policy.lastUpdated}
                </span>
              </div>
            </div>
          ))}
        </ScrollArea>
      </Card>
      
      {/* Policy Details */}
      <Card className="md:col-span-2">
        {currentPolicy ? (
          <>
            <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{currentPolicy.name}</h3>
                  <Badge variant={currentPolicy.status === 'active' ? 'default' : 'outline'}>
                    {currentPolicy.status === 'active' ? 'Active' : 'Draft'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentPolicy.description}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <PencilIcon className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontalIcon className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <CopyIcon className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ArrowRightIcon className="h-4 w-4 mr-2" />
                      Deploy
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <CardContent className="p-4 space-y-6">
              {/* Policy Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-muted/20 p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Applied To</div>
                  <div className="text-2xl font-semibold">{currentPolicy.appliedTo}</div>
                  <div className="text-xs text-muted-foreground">endpoints</div>
                </div>
                
                <div className="bg-muted/20 p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Compliance</div>
                  <div className="text-2xl font-semibold">
                    {currentPolicy.appliedTo > 0 
                      ? Math.round((currentPolicy.compliant / currentPolicy.appliedTo) * 100)
                      : 0}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {currentPolicy.compliant} of {currentPolicy.appliedTo} compliant
                  </div>
                </div>
                
                <div className="bg-muted/20 p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Last Updated</div>
                  <div className="text-2xl font-semibold">{currentPolicy.lastUpdated}</div>
                  <div className="text-xs text-muted-foreground">by Admin</div>
                </div>
              </div>
              
              {/* Policy Categories */}
              <div>
                <h4 className="text-sm font-medium mb-3">Policy Components</h4>
                <div className="space-y-4">
                  {currentPolicy.categories.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileTextIcon className="h-4 w-4 mr-2 text-primary" />
                          <span className="text-sm">{category.name}</span>
                        </div>
                        <div className="flex items-center">
                          {category.compliance > 0 ? (
                            <>
                              <span className="text-xs font-medium mr-2">
                                {category.compliance}%
                              </span>
                              {category.compliance === 100 ? (
                                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                              ) : category.compliance > 90 ? (
                                <InfoIcon className="h-4 w-4 text-amber-500" />
                              ) : (
                                <AlertCircleIcon className="h-4 w-4 text-red-500" />
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">Not deployed</span>
                          )}
                        </div>
                      </div>
                      
                      <Progress 
                        value={category.compliance} 
                        className="h-1.5"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Applied Endpoints */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium">Applied Endpoints</h4>
                  <Button variant="link" size="sm" className="h-auto p-0">
                    View all
                  </Button>
                </div>
                
                <div className="bg-muted/20 p-4 rounded-lg text-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline">Manage Endpoints</Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Add or remove endpoints from this policy</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <div className="p-8 text-center">
            <ShieldCheckIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg mb-2">No Policy Selected</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Select a policy from the list to view details or create a new policy to define
              security settings for your endpoints.
            </p>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create New Policy
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}