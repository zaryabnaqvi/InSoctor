import { useState } from 'react';
import { 
  ComputerIcon, 
  LaptopIcon, 
  SmartphoneIcon, 
  ServerIcon, 
  TabletIcon,
  ShieldCheckIcon,
  ShieldAlertIcon,
  FilterIcon,
  SearchIcon,
  RefreshCwIcon,
  MoreVerticalIcon,
  EyeIcon,
  PowerIcon,
  LockIcon,
  TrashIcon,
  ArrowUpDownIcon
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

// Device type icons mapping
const deviceIcons = {
  desktop: <ComputerIcon className="h-4 w-4" />,
  laptop: <LaptopIcon className="h-4 w-4" />,
  mobile: <SmartphoneIcon className="h-4 w-4" />,
  server: <ServerIcon className="h-4 w-4" />,
  tablet: <TabletIcon className="h-4 w-4" />,
};

// Status components with appropriate colors
const StatusBadge = ({ status }: { status: 'online' | 'offline' | 'at-risk' }) => {
  const statusClasses = {
    'online': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'offline': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    'at-risk': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status]}`}>
      {status === 'online' && (
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-green-500"></span>
      )}
      {status === 'offline' && (
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-gray-500"></span>
      )}
      {status === 'at-risk' && (
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-red-500"></span>
      )}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Protection status components
const ProtectionStatus = ({ status }: { status: 'protected' | 'at-risk' | 'unknown' }) => {
  return (
    <div className="flex items-center">
      {status === 'protected' && <ShieldCheckIcon className="h-4 w-4 text-green-500 mr-1.5" />}
      {status === 'at-risk' && <ShieldAlertIcon className="h-4 w-4 text-red-500 mr-1.5" />}
      {status === 'unknown' && <ShieldAlertIcon className="h-4 w-4 text-gray-400 mr-1.5" />}
      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
    </div>
  );
};

// Sample data for the endpoints
const endpoints = [
  { 
    id: "EP-001", 
    name: "DESKTOP-XY12345", 
    type: "desktop", 
    ip: "192.168.1.101", 
    os: "Windows 11 Pro", 
    lastSeen: "Just now", 
    status: "online", 
    protection: "protected",
    compliance: 100,
    group: "Executive",
    user: "John.Smith"
  },
  { 
    id: "EP-002", 
    name: "LAPTOP-AB67890", 
    type: "laptop", 
    ip: "192.168.1.102", 
    os: "macOS 12.6", 
    lastSeen: "5 minutes ago", 
    status: "online", 
    protection: "protected",
    compliance: 100,
    group: "IT",
    user: "Admin.User"
  },
  { 
    id: "EP-003", 
    name: "LAPTOP-CD24680", 
    type: "laptop", 
    ip: "192.168.1.103", 
    os: "Windows 11 Pro", 
    lastSeen: "10 minutes ago", 
    status: "at-risk", 
    protection: "at-risk",
    compliance: 85,
    group: "Marketing",
    user: "Jane.Doe"
  },
  { 
    id: "EP-004", 
    name: "SRV-WEB-PROD-01", 
    type: "server", 
    ip: "192.168.10.50", 
    os: "Ubuntu 22.04 LTS", 
    lastSeen: "Just now", 
    status: "online", 
    protection: "protected",
    compliance: 98,
    group: "Servers",
    user: "system"
  },
  { 
    id: "EP-005", 
    name: "iPhone-Tim", 
    type: "mobile", 
    ip: "192.168.1.105", 
    os: "iOS 16.5", 
    lastSeen: "30 minutes ago", 
    status: "online", 
    protection: "protected",
    compliance: 95,
    group: "Mobile",
    user: "Tim.Cook"
  },
  { 
    id: "EP-006", 
    name: "DESKTOP-WS12346", 
    type: "desktop", 
    ip: "192.168.1.106", 
    os: "Windows 10 Enterprise", 
    lastSeen: "2 hours ago", 
    status: "offline", 
    protection: "unknown",
    compliance: 90,
    group: "Finance",
    user: "Sarah.Johnson"
  },
  { 
    id: "EP-007", 
    name: "iPadPro-Alex", 
    type: "tablet", 
    ip: "192.168.1.107", 
    os: "iPadOS 16.4", 
    lastSeen: "1 hour ago", 
    status: "offline", 
    protection: "protected",
    compliance: 100,
    group: "Executive",
    user: "Alex.Williams"
  },
];

export default function EndpointInventory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handler for refreshing data
  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-4 bg-muted/20 border-b">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-auto max-w-sm">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search endpoints..."
              className="pl-8 w-full sm:w-[260px] bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleRefresh}>
                    {isLoading ? (
                      <RefreshCwIcon className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCwIcon className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh endpoint data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <FilterIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem>All Endpoints</DropdownMenuItem>
                <DropdownMenuItem>Online Only</DropdownMenuItem>
                <DropdownMenuItem>Offline Only</DropdownMenuItem>
                <DropdownMenuItem>At Risk</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Windows</DropdownMenuItem>
                <DropdownMenuItem>macOS</DropdownMenuItem>
                <DropdownMenuItem>Linux</DropdownMenuItem>
                <DropdownMenuItem>iOS / iPadOS</DropdownMenuItem>
                <DropdownMenuItem>Android</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button className="gap-1">
              <span>Add Endpoint</span>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="rounded-md border-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">
                <div className="flex items-center gap-1">
                  Name
                  <ArrowUpDownIcon className="h-3.5 w-3.5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
                </div>
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>OS</TableHead>
              <TableHead>Last Seen</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Protection</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={`cell-${i}-${j}`}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              endpoints.map((endpoint) => (
                <TableRow key={endpoint.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {deviceIcons[endpoint.type as keyof typeof deviceIcons]}
                      <span className="truncate max-w-[140px]">{endpoint.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {endpoint.type.charAt(0).toUpperCase() + endpoint.type.slice(1)}
                  </TableCell>
                  <TableCell>{endpoint.ip}</TableCell>
                  <TableCell>{endpoint.os}</TableCell>
                  <TableCell>{endpoint.lastSeen}</TableCell>
                  <TableCell>
                    <StatusBadge status={endpoint.status as 'online' | 'offline' | 'at-risk'} />
                  </TableCell>
                  <TableCell>
                    <ProtectionStatus 
                      status={endpoint.protection as 'protected' | 'at-risk' | 'unknown'} 
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View details</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVerticalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <PowerIcon className="h-4 w-4 mr-2" />
                            <span>Restart</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <LockIcon className="h-4 w-4 mr-2" />
                            <span>Isolate</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <TrashIcon className="h-4 w-4 mr-2" />
                            <span>Remove</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}