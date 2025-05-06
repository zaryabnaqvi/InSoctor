import { useState } from 'react';
import { 
  PlusIcon, 
  Terminal, 
  RefreshCw, 
  ShieldIcon, 
  ShieldCheckIcon,
  ShieldXIcon,
  AlertCircleIcon,
  SearchIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowRightIcon,
  FilterIcon,
  PlayIcon,
  StopCircleIcon,
  DatabaseIcon,
  FileDigitIcon,
  LockIcon,
  UnlockIcon,
  LaptopIcon,
  ServerIcon
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
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Sample quick action tools
const quickActions = [
  {
    id: 'scan',
    name: 'Security Scan',
    icon: <ShieldIcon className="h-5 w-5" />,
    description: 'Run a full security scan on selected endpoints',
  },
  {
    id: 'isolate',
    name: 'Network Isolation',
    icon: <LockIcon className="h-5 w-5" />,
    description: 'Isolate endpoints from the network in case of security incidents',
  },
  {
    id: 'restore',
    name: 'Restore Connection',
    icon: <UnlockIcon className="h-5 w-5" />,
    description: 'Restore network connectivity for isolated endpoints',
  },
  {
    id: 'update',
    name: 'Update Agents',
    icon: <RefreshCw className="h-5 w-5" />,
    description: 'Push agent updates to selected endpoints',
  },
  {
    id: 'restart',
    name: 'Restart Endpoint',
    icon: <PlayIcon className="h-5 w-5" />,
    description: 'Remotely restart selected endpoints',
  },
  {
    id: 'backup',
    name: 'Backup Data',
    icon: <DatabaseIcon className="h-5 w-5" />,
    description: 'Create backup of critical endpoint data',
  },
];

// Sample remediation tasks
const remediationTasks = [
  {
    id: 'TASK-001',
    name: 'Full Security Scan',
    target: 'DESKTOP-XY12345',
    status: 'completed',
    initiatedBy: 'admin@company.com',
    startTime: '2023-09-15 14:30:22',
    endTime: '2023-09-15 14:45:18',
    result: 'No threats found',
  },
  {
    id: 'TASK-002',
    name: 'Network Isolation',
    target: 'LAPTOP-CD24680',
    status: 'completed',
    initiatedBy: 'admin@company.com',
    startTime: '2023-09-15 10:12:05',
    endTime: '2023-09-15 10:12:08',
    result: 'Endpoint isolated',
  },
  {
    id: 'TASK-003',
    name: 'Agent Update',
    target: 'SRV-WEB-PROD-01',
    status: 'in-progress',
    initiatedBy: 'admin@company.com',
    startTime: '2023-09-15 15:05:30',
    endTime: null,
    result: null,
  },
  {
    id: 'TASK-004',
    name: 'Restore Connection',
    target: 'LAPTOP-CD24680',
    status: 'failed',
    initiatedBy: 'admin@company.com',
    startTime: '2023-09-15 11:30:12',
    endTime: '2023-09-15 11:30:22',
    result: 'Connection failed - network unavailable',
  },
  {
    id: 'TASK-005',
    name: 'Full Security Scan',
    target: 'iPhone-Tim',
    status: 'queued',
    initiatedBy: 'admin@company.com',
    startTime: null,
    endTime: null,
    result: null,
  },
];

// Console commands history
const commandHistory = [
  { command: 'agent status DESKTOP-XY12345', output: 'Agent running. Version 2.5.3. Last check-in: 2 minutes ago. Status: Protected.', timestamp: '15:30:22' },
  { command: 'scan quick DESKTOP-XY12345', output: 'Starting quick scan on DESKTOP-XY12345...\nScanning system files...\nScanning memory...\nScanning registry...\nScan complete. No threats detected.', timestamp: '15:32:10' },
  { command: 'list isolated', output: 'Currently isolated endpoints:\n- LAPTOP-CD24680 (Isolated at: 2023-09-15 10:12:05)', timestamp: '15:35:45' },
  { command: 'help', output: 'Available commands:\n- agent [status|restart|update] [endpoint-id]\n- scan [quick|full|custom] [endpoint-id]\n- isolate [endpoint-id]\n- restore [endpoint-id]\n- list [all|isolated|vulnerable]\n- help', timestamp: '15:36:30' },
];

export default function RemoteRemediation() {
  const [consoleInput, setConsoleInput] = useState('');
  const [selectedEndpoints, setSelectedEndpoints] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('quick-actions');

  // Handle console command submission
  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Command handling would go here
    setConsoleInput('');
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="quick-actions">Quick Actions</TabsTrigger>
          <TabsTrigger value="task-history">Task History</TabsTrigger>
          <TabsTrigger value="command-console">Command Console</TabsTrigger>
        </TabsList>
        
        {/* Quick Actions Tab */}
        <TabsContent value="quick-actions">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Remote Remediation Tools</CardTitle>
              <CardDescription>
                Perform common remediation tasks on endpoints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-2">Target Endpoints</h4>
                <div className="flex flex-wrap items-center gap-2 p-3 border rounded-md bg-muted/10">
                  {selectedEndpoints.length === 0 ? (
                    <span className="text-sm text-muted-foreground">No endpoints selected</span>
                  ) : (
                    <>
                      {selectedEndpoints.map((endpoint, i) => (
                        <Badge key={i} variant="secondary" className="flex items-center gap-1">
                          {endpoint}
                          <XCircleIcon 
                            className="h-3.5 w-3.5 ml-1 cursor-pointer" 
                            onClick={() => {
                              setSelectedEndpoints(selectedEndpoints.filter(e => e !== endpoint));
                            }}
                          />
                        </Badge>
                      ))}
                    </>
                  )}
                </div>
                
                <div className="mt-2 flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <PlusIcon className="h-3.5 w-3.5 mr-1" /> 
                    Add Endpoints
                  </Button>
                  
                  {selectedEndpoints.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedEndpoints([])}
                    >
                      Clear All
                    </Button>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-3">Available Actions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {quickActions.map((action) => (
                    <Card key={action.id} className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer">
                      <CardHeader className="p-4 pb-0">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <div className="mr-2 p-1.5 rounded-md bg-primary/10 text-primary">
                            {action.icon}
                          </div>
                          {action.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <p className="text-xs text-muted-foreground">
                          {action.description}
                        </p>
                      </CardContent>
                      <div className="px-4 py-2 bg-muted/20 flex justify-end border-t">
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={selectedEndpoints.length === 0}
                        >
                          Run
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Task History Tab */}
        <TabsContent value="task-history">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Remediation Task History</CardTitle>
              <CardDescription>
                View and manage remediation tasks and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div className="relative w-full sm:w-auto max-w-sm">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search tasks..."
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
                      <SelectItem value="queued">Queued</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" size="icon">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Task ID</TableHead>
                      <TableHead>Task Name</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Initiated By</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {remediationTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.id}</TableCell>
                        <TableCell>{task.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {task.target.includes('DESKTOP') ? (
                              <LaptopIcon className="h-3.5 w-3.5 mr-1.5" />
                            ) : task.target.includes('SRV') ? (
                              <ServerIcon className="h-3.5 w-3.5 mr-1.5" />
                            ) : (
                              <LaptopIcon className="h-3.5 w-3.5 mr-1.5" />
                            )}
                            {task.target}
                          </div>
                        </TableCell>
                        <TableCell>{task.initiatedBy}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {task.status === 'completed' && (
                              <>
                                <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 mr-1.5" />
                                <span>Completed</span>
                              </>
                            )}
                            {task.status === 'in-progress' && (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 text-blue-500 mr-1.5 animate-spin" />
                                <span>In Progress</span>
                              </>
                            )}
                            {task.status === 'queued' && (
                              <>
                                <ClockIcon className="h-3.5 w-3.5 text-amber-500 mr-1.5" />
                                <span>Queued</span>
                              </>
                            )}
                            {task.status === 'failed' && (
                              <>
                                <XCircleIcon className="h-3.5 w-3.5 text-red-500 mr-1.5" />
                                <span>Failed</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {task.startTime ? (
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
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <ArrowRightIcon className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View details</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Command Console Tab */}
        <TabsContent value="command-console">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">EDR Command Console</CardTitle>
              <CardDescription>
                Execute advanced commands directly on endpoints
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 mb-2">
                <div className="w-full sm:w-1/2">
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Target Endpoint" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Endpoints</SelectItem>
                      <SelectItem value="DESKTOP-XY12345">DESKTOP-XY12345</SelectItem>
                      <SelectItem value="LAPTOP-AB67890">LAPTOP-AB67890</SelectItem>
                      <SelectItem value="SRV-WEB-PROD-01">SRV-WEB-PROD-01</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-full sm:w-1/2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        <span>Common Commands</span>
                        <FilterIcon className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[240px]">
                      <DropdownMenuItem 
                        onSelect={() => setConsoleInput('agent status <endpoint-id>')}
                      >
                        agent status &lt;endpoint-id&gt;
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => setConsoleInput('scan quick <endpoint-id>')}
                      >
                        scan quick &lt;endpoint-id&gt;
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => setConsoleInput('scan full <endpoint-id>')}
                      >
                        scan full &lt;endpoint-id&gt;
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => setConsoleInput('isolate <endpoint-id>')}
                      >
                        isolate &lt;endpoint-id&gt;
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => setConsoleInput('restore <endpoint-id>')}
                      >
                        restore &lt;endpoint-id&gt;
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => setConsoleInput('list all')}
                      >
                        list all
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => setConsoleInput('help')}
                      >
                        help
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <div className="border rounded-md bg-black text-white font-mono">
                <div className="p-2 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
                  <div className="flex items-center">
                    <Terminal className="h-4 w-4 mr-2" />
                    <span className="text-sm">EDR Command Console</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white">
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white">
                      <StopCircleIcon className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                
                <ScrollArea className="h-[260px] p-3 text-sm">
                  {commandHistory.map((entry, i) => (
                    <div key={i} className="mb-3">
                      <div className="flex items-center text-green-400 mb-1">
                        <span className="text-gray-500 mr-2">[{entry.timestamp}]</span>
                        <span className="text-blue-400 mr-1">$</span> {entry.command}
                      </div>
                      <div className="pl-6 text-gray-300 whitespace-pre-line">{entry.output}</div>
                    </div>
                  ))}
                </ScrollArea>
                
                <div className="p-2 border-t border-gray-700">
                  <form onSubmit={handleCommandSubmit} className="flex items-center">
                    <span className="text-blue-400 mr-1.5">$</span>
                    <input
                      type="text"
                      value={consoleInput}
                      onChange={(e) => setConsoleInput(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-white"
                      placeholder="Type command..."
                    />
                  </form>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-md">
                <strong>Note:</strong> Commands executed on endpoints are logged and require appropriate permissions.
                Use <code>help</code> to see available commands.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}