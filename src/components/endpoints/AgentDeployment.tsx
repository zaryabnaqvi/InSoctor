import { useState } from 'react';
import { 
  PlusIcon, 
  DownloadCloudIcon, 
  ServerIcon, 
  LaptopIcon, 
  PcCaseIcon,
  SmartphoneIcon,
  TabletIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon,
  UploadCloudIcon,
  RefreshCwIcon,
  SearchIcon,
  SettingsIcon,
  HistoryIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Sample agent versions
const agentVersions = [
  { 
    version: 'v2.5.3',
    releaseDate: '2023-08-30',
    status: 'current',
    deployedCount: 187,
    platforms: ['Windows', 'macOS', 'Linux', 'iOS', 'Android'],
    releaseNotes: 'Enhanced behavioral monitoring, improved memory scanning, and fixed false positive detections.',
  },
  { 
    version: 'v2.5.2',
    releaseDate: '2023-07-15',
    status: 'previous',
    deployedCount: 5,
    platforms: ['Windows', 'macOS', 'Linux', 'iOS', 'Android'],
    releaseNotes: 'Fixed compatibility issues with latest OS updates and improved stability.',
  },
  { 
    version: 'v2.5.1',
    releaseDate: '2023-06-02',
    status: 'archive',
    deployedCount: 0,
    platforms: ['Windows', 'macOS', 'Linux', 'iOS', 'Android'],
    releaseNotes: 'Performance optimizations and memory usage improvements.',
  },
  { 
    version: 'v2.5.0',
    releaseDate: '2023-05-10',
    status: 'archive',
    deployedCount: 0,
    platforms: ['Windows', 'macOS', 'Linux', 'iOS', 'Android'],
    releaseNotes: 'Major feature update: Added advanced behavioral monitoring system.',
  },
];

// Sample deployment tasks
const deploymentTasks = [
  {
    id: 'DEPLOY-001',
    name: 'Marketing Department Update',
    version: 'v2.5.3',
    status: 'completed',
    progress: 100,
    targetCount: 15,
    successCount: 15,
    failureCount: 0,
    startTime: '2023-09-14 09:30:00',
    endTime: '2023-09-14 10:15:22',
  },
  {
    id: 'DEPLOY-002',
    name: 'Server Cluster Update',
    version: 'v2.5.3',
    status: 'in-progress',
    progress: 60,
    targetCount: 10,
    successCount: 6,
    failureCount: 0,
    startTime: '2023-09-15 14:45:10',
    endTime: null,
  },
  {
    id: 'DEPLOY-003',
    name: 'Executive Laptops',
    version: 'v2.5.3',
    status: 'scheduled',
    progress: 0,
    targetCount: 8,
    successCount: 0,
    failureCount: 0,
    startTime: null,
    endTime: null,
    scheduledTime: '2023-09-16 22:00:00',
  },
  {
    id: 'DEPLOY-004',
    name: 'Finance Department Update',
    version: 'v2.5.3',
    status: 'failed',
    progress: 75,
    targetCount: 12,
    successCount: 9,
    failureCount: 3,
    startTime: '2023-09-13 16:30:00',
    endTime: '2023-09-13 17:20:15',
  },
];

// Deployment status component
const DeploymentStatus = ({ status }: { status: string }) => {
  const statusMap: Record<string, { icon: React.ReactNode, color: string }> = {
    'completed': { 
      icon: <CheckCircleIcon className="h-4 w-4 mr-1.5" />, 
      color: 'text-green-500'
    },
    'in-progress': { 
      icon: <RefreshCwIcon className="h-4 w-4 mr-1.5 animate-spin" />, 
      color: 'text-blue-500'
    },
    'scheduled': { 
      icon: <HistoryIcon className="h-4 w-4 mr-1.5" />, 
      color: 'text-amber-500'
    },
    'failed': { 
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
      <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
    </div>
  );
};

// Get the appropriate platform icon
const getPlatformIcon = (platform: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'Windows': <PcCaseIcon className="h-4 w-4" />,
    'macOS': <LaptopIcon className="h-4 w-4" />,
    'Linux': <ServerIcon className="h-4 w-4" />,
    'iOS': <SmartphoneIcon className="h-4 w-4" />,
    'Android': <SmartphoneIcon className="h-4 w-4" />,
  };
  
  return iconMap[platform] || <LaptopIcon className="h-4 w-4" />;
};

export default function AgentDeployment() {
  const [activeTab, setActiveTab] = useState('agent-versions');
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="agent-versions">Agent Versions</TabsTrigger>
          <TabsTrigger value="deployment-tasks">Deployment Tasks</TabsTrigger>
        </TabsList>
        
        {/* Agent Versions Tab */}
        <TabsContent value="agent-versions">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">Agent Versions</CardTitle>
                  <CardDescription>
                    Manage and deploy agent versions across your endpoints
                  </CardDescription>
                </div>
                <Button>
                  <UploadCloudIcon className="h-4 w-4 mr-2" />
                  Upload New Version
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Current Version Stats */}
                <Card className="bg-muted/20 border-2 border-primary/20">
                  <CardHeader className="py-4">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <div className="flex items-center">
                        <Badge className="mr-2">Current</Badge>
                        {agentVersions[0].version}
                      </div>
                      <div className="text-sm font-normal text-muted-foreground">
                        Released: {agentVersions[0].releaseDate}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Endpoints Deployed</p>
                        <div className="flex items-end">
                          <span className="text-2xl font-semibold">
                            {agentVersions[0].deployedCount}
                          </span>
                          <span className="text-sm text-muted-foreground ml-1 mb-0.5">
                            / 192
                          </span>
                        </div>
                        <Progress value={Math.round((agentVersions[0].deployedCount / 192) * 100)} className="h-1.5" />
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Platforms Supported</p>
                        <div className="flex flex-wrap gap-1.5">
                          {agentVersions[0].platforms.map((platform, i) => (
                            <TooltipProvider key={i}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant="outline" className="gap-1">
                                    {getPlatformIcon(platform)}
                                    <span className="sr-only">{platform}</span>
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{platform}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-end">
                          <Button variant="outline" size="sm" className="gap-1">
                            <DownloadCloudIcon className="h-3.5 w-3.5" />
                            <span>Deploy</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <div className="font-medium mb-1">Release Notes:</div>
                      <p className="text-muted-foreground">
                        {agentVersions[0].releaseNotes}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Previous Versions */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Previous Versions</h3>
                  
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Version</TableHead>
                          <TableHead>Release Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Deployed On</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {agentVersions.slice(1).map((version, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{version.version}</TableCell>
                            <TableCell>{version.releaseDate}</TableCell>
                            <TableCell>
                              <Badge variant={version.status === 'previous' ? 'outline' : 'secondary'}>
                                {version.status === 'previous' ? 'Active' : 'Archived'}
                              </Badge>
                            </TableCell>
                            <TableCell>{version.deployedCount} endpoints</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">Details</Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  disabled={version.status === 'archive'}
                                >
                                  Deploy
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Deployment Tasks Tab */}
        <TabsContent value="deployment-tasks">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">Deployment Tasks</CardTitle>
                  <CardDescription>
                    Schedule and monitor agent deployment across endpoints
                  </CardDescription>
                </div>
                <Button>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Deployment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div className="relative w-full sm:w-auto max-w-sm">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search deployments..."
                    className="pl-8 w-full sm:w-[260px] bg-background"
                  />
                </div>
                
                <div className="flex items-center gap-2 ml-auto">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" size="icon">
                    <SettingsIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task Name</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Targets</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deploymentTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.name}</TableCell>
                        <TableCell>{task.version}</TableCell>
                        <TableCell>
                          <DeploymentStatus status={task.status} />
                        </TableCell>
                        <TableCell className="w-[180px]">
                          <div className="flex items-center gap-2">
                            <Progress value={task.progress} className="h-2" />
                            <span className="text-xs text-muted-foreground w-8 text-right">
                              {task.progress}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 items-center">
                            <span>{task.successCount}</span>
                            <span className="text-muted-foreground">/</span>
                            <span>{task.targetCount}</span>
                            {task.failureCount > 0 && (
                              <Badge variant="destructive" className="text-[10px] h-4">
                                {task.failureCount} failed
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {task.status === 'scheduled' ? (
                            <span className="text-xs">
                              Scheduled: {task.scheduledTime?.split(' ')[1] || ''}
                            </span>
                          ) : task.startTime ? (
                            <span className="text-xs">
                              Started: {task.startTime.split(' ')[1]}
                              {task.endTime && (
                                <>
                                  <br />
                                  Ended: {task.endTime.split(' ')[1]}
                                </>
                              )}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Not started</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}