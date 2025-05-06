import { useState } from 'react';
import { SearchIcon, FilterIcon, RefreshCwIcon, CheckCircleIcon, XCircleIcon, AlertCircleIcon, ArrowUpDownIcon, PencilIcon, DownloadIcon, MicroscopeIcon as MicrosoftIcon, AppleIcon, LinkIcon as LinuxIcon, PackageIcon, ShieldIcon, InfoIcon, ExternalLinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

// Sample OS inventory data
const osInventory = [
  {
    id: 'OS-001',
    endpoint: 'DESKTOP-XY12345',
    os: 'Windows 11 Pro',
    osIcon: <MicrosoftIcon className="h-4 w-4" />,
    version: '21H2',
    build: '22000.795',
    architecture: 'x64',
    installDate: '2023-01-15',
    lastUpdate: '2023-08-10',
    updateStatus: 'up-to-date',
    eol: '2024-10-14',
    compliance: 'compliant'
  },
  {
    id: 'OS-002',
    endpoint: 'LAPTOP-AB67890',
    os: 'macOS',
    osIcon: <AppleIcon className="h-4 w-4" />,
    version: '12.6',
    build: '21G115',
    architecture: 'arm64',
    installDate: '2022-10-30',
    lastUpdate: '2023-08-28',
    updateStatus: 'up-to-date',
    eol: '2025-11-01',
    compliance: 'compliant'
  },
  {
    id: 'OS-003',
    endpoint: 'LAPTOP-CD24680',
    os: 'Windows 10 Enterprise',
    osIcon: <MicrosoftIcon className="h-4 w-4" />,
    version: '21H1',
    build: '19043.1288',
    architecture: 'x64',
    installDate: '2022-03-05',
    lastUpdate: '2023-06-15',
    updateStatus: 'update-required',
    eol: '2023-12-13',
    compliance: 'non-compliant'
  },
  {
    id: 'OS-004',
    endpoint: 'SRV-WEB-PROD-01',
    os: 'Ubuntu',
    osIcon: <LinuxIcon className="h-4 w-4" />,
    version: '22.04 LTS',
    build: '22.04.2',
    architecture: 'x64',
    installDate: '2022-08-20',
    lastUpdate: '2023-07-20',
    updateStatus: 'up-to-date',
    eol: '2027-04-01',
    compliance: 'compliant'
  },
  {
    id: 'OS-005',
    endpoint: 'iPhone-Tim',
    os: 'iOS',
    osIcon: <AppleIcon className="h-4 w-4" />,
    version: '16.5',
    build: '20F66',
    architecture: 'arm64',
    installDate: '2022-09-16',
    lastUpdate: '2023-08-02',
    updateStatus: 'up-to-date',
    eol: '2026-09-01',
    compliance: 'compliant'
  },
  {
    id: 'OS-006',
    endpoint: 'DESKTOP-WS12346',
    os: 'Windows 10 Pro',
    osIcon: <MicrosoftIcon className="h-4 w-4" />,
    version: '20H2',
    build: '19042.1466',
    architecture: 'x64',
    installDate: '2021-06-10',
    lastUpdate: '2023-05-05',
    updateStatus: 'update-required',
    eol: '2023-11-09',
    compliance: 'warning'
  },
];

// Sample software inventory data
const softwareInventory = [
  {
    id: 'SW-001',
    name: 'Microsoft Office',
    publisher: 'Microsoft',
    version: '2021',
    installDate: '2023-01-20',
    size: '4.2 GB',
    status: 'licensed',
    usage: 'high',
    endpoints: 156,
    risk: 'low'
  },
  {
    id: 'SW-002',
    name: 'Adobe Creative Cloud',
    publisher: 'Adobe',
    version: '2023.2.0.532',
    installDate: '2023-03-15',
    size: '2.1 GB',
    status: 'licensed',
    usage: 'medium',
    endpoints: 42,
    risk: 'low'
  },
  {
    id: 'SW-003',
    name: 'Google Chrome',
    publisher: 'Google',
    version: '116.0.5845.110',
    installDate: '2023-08-25',
    size: '280 MB',
    status: 'freeware',
    usage: 'high',
    endpoints: 189,
    risk: 'medium'
  },
  {
    id: 'SW-004',
    name: 'Mozilla Firefox',
    publisher: 'Mozilla',
    version: '115.0',
    installDate: '2023-07-10',
    size: '250 MB',
    status: 'freeware',
    usage: 'low',
    endpoints: 23,
    risk: 'medium'
  },
  {
    id: 'SW-005',
    name: 'Slack',
    publisher: 'Slack Technologies',
    version: '4.33.73',
    installDate: '2023-08-05',
    size: '180 MB',
    status: 'licensed',
    usage: 'high',
    endpoints: 174,
    risk: 'low'
  },
  {
    id: 'SW-006',
    name: 'Zoom',
    publisher: 'Zoom Video Communications',
    version: '5.15.5',
    installDate: '2023-08-30',
    size: '210 MB',
    status: 'licensed',
    usage: 'high',
    endpoints: 168,
    risk: 'medium'
  },
  {
    id: 'SW-007',
    name: 'FileZilla',
    publisher: 'FileZilla Project',
    version: '3.63.2',
    installDate: '2023-06-12',
    size: '15 MB',
    status: 'freeware',
    usage: 'low',
    endpoints: 11,
    risk: 'low'
  },
  {
    id: 'SW-008',
    name: 'WinRAR',
    publisher: 'win.rar GmbH',
    version: '6.21',
    installDate: '2023-04-18',
    size: '6 MB',
    status: 'licensed',
    usage: 'medium',
    endpoints: 96,
    risk: 'low'
  },
];

// Compliance status component
const ComplianceStatus = ({ status }: { status: string }) => {
  const statusMap: Record<string, { icon: React.ReactNode, color: string }> = {
    'compliant': { 
      icon: <CheckCircleIcon className="h-4 w-4 mr-1.5" />, 
      color: 'text-green-500'
    },
    'warning': { 
      icon: <AlertCircleIcon className="h-4 w-4 mr-1.5" />, 
      color: 'text-amber-500'
    },
    'non-compliant': { 
      icon: <XCircleIcon className="h-4 w-4 mr-1.5" />, 
      color: 'text-red-500'
    },
  };
  
  const { icon, color } = statusMap[status] || { 
    icon: <AlertCircleIcon className="h-4 w-4 mr-1.5" />, 
    color: 'text-gray-500'
  };
  
  return (
    <div className={`flex items-center ${color}`}>
      {icon}
      <span>{status === 'non-compliant' ? 'Non-Compliant' : status.charAt(0).toUpperCase() + status.slice(1)}</span>
    </div>
  );
};

// Risk level component
const RiskLevel = ({ level }: { level: string }) => {
  const levelMap: Record<string, { color: string }> = {
    'low': { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
    'medium': { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' },
    'high': { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
  };
  
  const { color } = levelMap[level] || { color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  );
};

export default function SystemInventory() {
  const [activeTab, setActiveTab] = useState('os-inventory');
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
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="os-inventory">Operating Systems</TabsTrigger>
          <TabsTrigger value="software-inventory">Software</TabsTrigger>
        </TabsList>
        
        {/* OS Inventory Tab */}
        <TabsContent value="os-inventory">
          <Card>
            <div className="p-4 bg-muted/20 border-b">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:w-auto max-w-sm">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search OS inventory..."
                    className="pl-8 w-full sm:w-[260px] bg-background"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="OS Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All OS Types</SelectItem>
                      <SelectItem value="windows">Windows</SelectItem>
                      <SelectItem value="macos">macOS</SelectItem>
                      <SelectItem value="linux">Linux</SelectItem>
                      <SelectItem value="ios">iOS</SelectItem>
                      <SelectItem value="android">Android</SelectItem>
                    </SelectContent>
                  </Select>
                  
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
                        <p>Refresh inventory data</p>
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
                      <DropdownMenuGroup>
                        <DropdownMenuItem className="flex items-center gap-2">
                          <Checkbox id="compliance-all" />
                          <label htmlFor="compliance-all">All Statuses</label>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2">
                          <Checkbox id="compliance-compliant" />
                          <label htmlFor="compliance-compliant">Compliant</label>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2">
                          <Checkbox id="compliance-warning" />
                          <label htmlFor="compliance-warning">Warning</label>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2">
                          <Checkbox id="compliance-non-compliant" />
                          <label htmlFor="compliance-non-compliant">Non-Compliant</label>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button className="gap-1">
                    <DownloadIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                </div>
              </div>
            </div>
            
            <CardContent className="p-0">
              <ScrollArea className="max-h-[500px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="w-[180px]">
                        <div className="flex items-center gap-1">
                          Endpoint
                          <ArrowUpDownIcon className="h-3.5 w-3.5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
                        </div>
                      </TableHead>
                      <TableHead>OS</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Architecture</TableHead>
                      <TableHead>Install Date</TableHead>
                      <TableHead>Last Update</TableHead>
                      <TableHead>EOL Date</TableHead>
                      <TableHead>Compliance</TableHead>
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
                      osInventory.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.endpoint}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              {item.osIcon}
                              <span>{item.os}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.version}
                            <span className="text-xs text-muted-foreground ml-2">
                              (Build {item.build})
                            </span>
                          </TableCell>
                          <TableCell>{item.architecture}</TableCell>
                          <TableCell>{item.installDate}</TableCell>
                          <TableCell>{item.lastUpdate}</TableCell>
                          <TableCell>{item.eol}</TableCell>
                          <TableCell>
                            <ComplianceStatus status={item.compliance} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Software Inventory Tab */}
        <TabsContent value="software-inventory">
          <Card>
            <div className="p-4 bg-muted/20 border-b">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:w-auto max-w-sm">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search software..."
                    className="pl-8 w-full sm:w-[260px] bg-background"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="License Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Licenses</SelectItem>
                      <SelectItem value="licensed">Licensed</SelectItem>
                      <SelectItem value="freeware">Freeware</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                  
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
                        <p>Refresh inventory data</p>
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
                    <DropdownMenuContent align="end" className="w-[220px]">
                      <DropdownMenuGroup>
                        <DropdownMenuItem className="flex items-center gap-2">
                          <Checkbox id="risk-all" />
                          <label htmlFor="risk-all">All Risk Levels</label>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2">
                          <Checkbox id="risk-high" />
                          <label htmlFor="risk-high">High Risk</label>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2">
                          <Checkbox id="risk-medium" />
                          <label htmlFor="risk-medium">Medium Risk</label>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2">
                          <Checkbox id="risk-low" />
                          <label htmlFor="risk-low">Low Risk</label>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button className="gap-1">
                    <DownloadIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                </div>
              </div>
            </div>
            
            <CardContent className="p-0">
              <ScrollArea className="max-h-[500px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="w-[180px]">
                        <div className="flex items-center gap-1">
                          Software
                          <ArrowUpDownIcon className="h-3.5 w-3.5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
                        </div>
                      </TableHead>
                      <TableHead>Publisher</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Install Date</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Endpoints</TableHead>
                      <TableHead>Risk Level</TableHead>
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
                      softwareInventory.map((software) => (
                        <TableRow key={software.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-1.5">
                              <PackageIcon className="h-4 w-4 text-primary" />
                              <span>{software.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{software.publisher}</TableCell>
                          <TableCell>{software.version}</TableCell>
                          <TableCell>{software.installDate}</TableCell>
                          <TableCell>{software.size}</TableCell>
                          <TableCell>
                            <Badge variant={software.status === 'licensed' ? 'default' : 'outline'}>
                              {software.status.charAt(0).toUpperCase() + software.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{software.endpoints}</TableCell>
                          <TableCell>
                            <RiskLevel level={software.risk} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}