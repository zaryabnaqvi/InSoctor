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
  const [isLoading, setIsLoading] = useState(true);

  const fetchEndpoints = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getAgents();
      if (response.success && response.data) {
        setEndpoints(response.data);
        setFilteredEndpoints(response.data);
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
    if (searchTerm.trim() === '') {
      setFilteredEndpoints(endpoints);
    } else {
      const lowerSearch = searchTerm.toLowerCase();
      const filtered = endpoints.filter(agent =>
        agent.name.toLowerCase().includes(lowerSearch) ||
        agent.id.toLowerCase().includes(lowerSearch) ||
        (agent.ip && agent.ip.toLowerCase().includes(lowerSearch)) ||
        (agent.os?.name && agent.os.name.toLowerCase().includes(lowerSearch))
      );
      setFilteredEndpoints(filtered);
    }
  }, [searchTerm, endpoints]);

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
                  <span className="hidden sm:inline">Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem>All Endpoints</DropdownMenuItem>
                <DropdownMenuItem>Active Only</DropdownMenuItem>
                <DropdownMenuItem>Disconnected Only</DropdownMenuItem>
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
                  <p className="text-muted-foreground">No endpoints found</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}