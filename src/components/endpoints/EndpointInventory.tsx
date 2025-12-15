import { useState, useEffect } from 'react';
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
  ArrowUpDownIcon,
  PlusIcon,
  CopyIcon,
  CheckIcon,
  TerminalIcon
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
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import apiClient from '@/services/api.service';
import { formatDistanceToNow } from 'date-fns';

// Device type icons mapping
const deviceIcons = {
  desktop: <ComputerIcon className="h-4 w-4" />,
  laptop: <LaptopIcon className="h-4 w-4" />,
  mobile: <SmartphoneIcon className="h-4 w-4" />,
  server: <ServerIcon className="h-4 w-4" />,
  tablet: <TabletIcon className="h-4 w-4" />,
  unknown: <ComputerIcon className="h-4 w-4" />
};

// Status components with appropriate colors
const StatusBadge = ({ status }: { status: string }) => {
  const normalizedStatus = status.toLowerCase();
  let statusClass = 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  let dotClass = 'bg-gray-500';

  if (normalizedStatus === 'active' || normalizedStatus === 'online') {
    statusClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    dotClass = 'bg-green-500';
  } else if (normalizedStatus === 'disconnected' || normalizedStatus === 'offline') {
    statusClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    dotClass = 'bg-red-500';
  } else if (normalizedStatus === 'pending') {
    statusClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    dotClass = 'bg-yellow-500';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
      <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${dotClass}`}></span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default function EndpointInventory() {
  const [endpoints, setEndpoints] = useState<any[]>([]);
  const [filteredEndpoints, setFilteredEndpoints] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Dialog states
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddAgentOpen, setIsAddAgentOpen] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);

  const fetchEndpoints = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getAgents();
      if (response.success && response.data) {
        setEndpoints(response.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch endpoints:', error);
      toast({
        title: 'Failed to fetch endpoints',
        description: error.message || 'Could not load agents from server',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEndpoints();
  }, []);

  useEffect(() => {
    let result = endpoints;

    // Apply search
    if (searchTerm.trim() !== '') {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(agent =>
        agent.name.toLowerCase().includes(lowerSearch) ||
        agent.id.toLowerCase().includes(lowerSearch) ||
        (agent.ip && agent.ip.toLowerCase().includes(lowerSearch)) ||
        (agent.os?.name && agent.os.name.toLowerCase().includes(lowerSearch))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(agent => {
        if (statusFilter === 'active') return agent.status === 'active' || agent.status === 'online';
        if (statusFilter === 'disconnected') return agent.status === 'disconnected' || agent.status === 'offline';
        return true;
      });
    }

    setFilteredEndpoints(result);
  }, [searchTerm, endpoints, statusFilter]);

  const handleRestart = async (agentId: string) => {
    try {
      await apiClient.restartAgent(agentId);
      toast({
        title: 'Restart command sent',
        description: `Agent ${agentId} is restarting...`,
      });
    } catch (error: any) {
      toast({
        title: 'Restart failed',
        description: error.message || 'Could not restart agent',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (agentId: string) => {
    if (!confirm(`Are you sure you want to delete agent ${agentId}?`)) return;

    try {
      await apiClient.deleteAgent(agentId);
      toast({
        title: 'Agent deleted',
        description: `Agent ${agentId} has been removed`,
      });
      fetchEndpoints(); // Refresh list
    } catch (error: any) {
      toast({
        title: 'Delete failed',
        description: error.message || 'Could not delete agent',
        variant: 'destructive',
      });
    }
  };

  const getDeviceType = (osName: string = '') => {
    const lowerOs = osName.toLowerCase();
    if (lowerOs.includes('server') || lowerOs.includes('linux')) return 'server';
    if (lowerOs.includes('mac') || lowerOs.includes('windows')) return 'desktop'; // Could be laptop, hard to tell
    if (lowerOs.includes('ios') || lowerOs.includes('android')) return 'mobile';
    return 'unknown';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
    toast({
      title: 'Copied to clipboard',
      description: 'Command copied to clipboard',
    });
  };

  const installCommandLinux = `curl -so wazuh-agent.deb https://packages.wazuh.com/4.x/apt/pool/main/w/wazuh-agent/wazuh-agent_4.7.2-1_amd64.deb && sudo WAZUH_MANAGER='${window.location.hostname}' dpkg -i ./wazuh-agent.deb && sudo systemctl start wazuh-agent`;
  const installCommandWindows = `Invoke-WebRequest -Uri https://packages.wazuh.com/4.x/windows/wazuh-agent-4.7.2-1.msi -OutFile wazuh-agent.msi; ./wazuh-agent.msi /q WAZUH_MANAGER='${window.location.hostname}' WAZUH_REGISTRATION_SERVER='${window.location.hostname}'; Start-Service -Name WazuhSvc`;

  return (
    <>
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
                    <Button variant="outline" size="icon" onClick={fetchEndpoints}>
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
                    <span className="hidden sm:inline">
                      {statusFilter === 'all' ? 'Filter' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuCheckboxItem
                    checked={statusFilter === 'all'}
                    onCheckedChange={() => setStatusFilter('all')}
                  >
                    All Endpoints
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={statusFilter === 'active'}
                    onCheckedChange={() => setStatusFilter('active')}
                  >
                    Active Only
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={statusFilter === 'disconnected'}
                    onCheckedChange={() => setStatusFilter('disconnected')}
                  >
                    Disconnected Only
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button className="gap-1" onClick={() => setIsAddAgentOpen(true)}>
                <PlusIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Add Endpoint</span>
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
                <TableHead>ID</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>OS</TableHead>
                <TableHead>Last Keep Alive</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={`cell-${i}-${j}`}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredEndpoints.length > 0 ? (
                filteredEndpoints.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {deviceIcons[getDeviceType(agent.os?.name) as keyof typeof deviceIcons]}
                        <span className="truncate max-w-[140px]" title={agent.name}>{agent.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{agent.id}</TableCell>
                    <TableCell>{agent.ip}</TableCell>
                    <TableCell>{agent.os?.name || 'Unknown'} {agent.os?.version || ''}</TableCell>
                    <TableCell>
                      {agent.lastKeepAlive ? formatDistanceToNow(new Date(agent.lastKeepAlive), { addSuffix: true }) : 'Never'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={agent.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  setSelectedAgent(agent);
                                  setIsDetailsOpen(true);
                                }}
                              >
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
                            <DropdownMenuItem onClick={() => handleRestart(agent.id)}>
                              <PowerIcon className="h-4 w-4 mr-2" />
                              <span>Restart</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(agent.id)}>
                              <TrashIcon className="h-4 w-4 mr-2" />
                              <span>Remove</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-muted-foreground">No endpoints found matching your criteria</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Agent Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAgent && deviceIcons[getDeviceType(selectedAgent.os?.name) as keyof typeof deviceIcons]}
              {selectedAgent?.name}
            </DialogTitle>
            <DialogDescription>
              Agent ID: {selectedAgent?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedAgent && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">IP Address</span>
                  <p className="text-sm">{selectedAgent.ip}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Status</span>
                  <div><StatusBadge status={selectedAgent.status} /></div>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Operating System</span>
                  <p className="text-sm">{selectedAgent.os?.name} {selectedAgent.os?.version}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Architecture</span>
                  <p className="text-sm">{selectedAgent.os?.arch || 'Unknown'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Wazuh Version</span>
                  <p className="text-sm">{selectedAgent.version || 'Unknown'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Last Keep Alive</span>
                  <p className="text-sm">
                    {selectedAgent.lastKeepAlive ? new Date(selectedAgent.lastKeepAlive).toLocaleString() : 'Never'}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Registered At</span>
                  <p className="text-sm">
                    {selectedAgent.dateAdd ? new Date(selectedAgent.dateAdd).toLocaleString() : 'Unknown'}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Manager</span>
                  <p className="text-sm">{selectedAgent.manager || 'Unknown'}</p>
                </div>
              </div>

              <div className="mt-4">
                <span className="text-sm font-medium text-muted-foreground mb-2 block">Raw Data</span>
                <div className="bg-muted p-3 rounded-md overflow-auto max-h-[200px]">
                  <pre className="text-xs">{JSON.stringify(selectedAgent, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Agent Dialog */}
      <Dialog open={isAddAgentOpen} onOpenChange={setIsAddAgentOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Deploy New Agent</DialogTitle>
            <DialogDescription>
              Run the following command on your endpoint to install and register the Wazuh agent.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="linux" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="linux">Linux</TabsTrigger>
              <TabsTrigger value="windows">Windows</TabsTrigger>
            </TabsList>
            <TabsContent value="linux" className="space-y-4 py-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">1. Run the installation command:</p>
                <div className="relative bg-slate-950 text-slate-50 p-4 rounded-md font-mono text-sm overflow-x-auto">
                  <div className="absolute top-2 right-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
                      onClick={() => copyToClipboard(installCommandLinux)}
                    >
                      {copiedCommand ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                    </Button>
                  </div>
                  <code className="block whitespace-pre-wrap pr-10">
                    {installCommandLinux}
                  </code>
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm text-blue-700 dark:text-blue-300 flex gap-2">
                <TerminalIcon className="h-5 w-5 flex-shrink-0" />
                <p>This command downloads the agent, configures it to connect to this manager, and starts the service.</p>
              </div>
            </TabsContent>
            <TabsContent value="windows" className="space-y-4 py-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">1. Run the following PowerShell command (Administrator):</p>
                <div className="relative bg-slate-950 text-slate-50 p-4 rounded-md font-mono text-sm overflow-x-auto">
                  <div className="absolute top-2 right-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
                      onClick={() => copyToClipboard(installCommandWindows)}
                    >
                      {copiedCommand ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                    </Button>
                  </div>
                  <code className="block whitespace-pre-wrap pr-10">
                    {installCommandWindows}
                  </code>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}