import { useState } from 'react';
import { useAlerts } from '@/contexts/AlertContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, RefreshCw, Filter, ArrowUpDown, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AlertsInsights from '@/components/alerts-insight';
import { AlertDetailsDialog } from '@/components/dialogs/AlertDetailsDialog';

export function Alerts() {
  const { filteredAlerts, updateAlert, filterBySeverity, filterByStatus, clearFilters, activeFilters, timeRange, setTimeRange } = useAlerts();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const itemsPerPage = 50;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    toast({
      title: "Refreshing alerts",
      description: "Fetching the latest security alerts...",
    });

    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Alerts refreshed",
        description: "Alert data has been updated.",
      });
    }, 1000);
  };

  const handleStatusChange = (alertId: string, status: 'open' | 'investigating' | 'resolved' | 'false-positive') => {
    updateAlert(alertId, { status });

    const statusMessages = {
      investigating: "Investigation started",
      resolved: "Alert marked as resolved",
      'false-positive': "Alert marked as false positive",
      open: "Alert reopened"
    };

    toast({
      title: statusMessages[status],
      description: "Alert status has been updated successfully.",
    });
  };

  // Filter and paginate alerts
  const searchFiltered = filteredAlerts.filter(alert =>
    alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedAlerts = searchFiltered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(searchFiltered.length / itemsPerPage);

  const handleSeverityFilterChange = (severity: string) => {
    if (severity === 'all') {
      clearFilters();
    } else {
      filterBySeverity([severity as any]);
    }
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status: string) => {
    if (status === 'all') {
      clearFilters();
    } else {
      filterByStatus([status]);
    }
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Security Alerts</h1>
          <p className="text-muted-foreground">
            View and manage active security alerts within your environment
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          className="h-9 gap-1"
          disabled={isLoading}
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Alert Management</CardTitle>
          <CardDescription>
            Showing {displayedAlerts.length} of {searchFiltered.length} alerts {searchTerm && `(filtered from ${filteredAlerts.length} total)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 mb-4">
            <div className="relative w-full sm:w-96">
              <form onSubmit={handleSearch}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search alerts..."
                  className="pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </form>
            </div>

            <div className="flex space-x-2">
              <div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[130px]">
                    <Clock className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15m">Last 15 min</SelectItem>
                    <SelectItem value="30m">Last 30 min</SelectItem>
                    <SelectItem value="1h">Last 1 hour</SelectItem>
                    <SelectItem value="24h">Last 24 hours</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select onValueChange={handleSeverityFilterChange}>
                  <SelectTrigger className="w-[130px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select onValueChange={handleStatusFilterChange}>
                  <SelectTrigger className="w-[130px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="false-positive">False Positive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {activeFilters.severities.length > 0 || activeFilters.statuses.length > 0 ? (
            <div className="flex items-center mb-4 gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>

              {activeFilters.severities.map(severity => (
                <Badge key={severity} variant="secondary" className="gap-1">
                  {severity}
                  <button onClick={() => clearFilters()}>
                    <XCircle className="h-3 w-3" />
                  </button>
                </Badge>
              ))}

              {activeFilters.statuses.map(status => (
                <Badge key={status} variant="secondary" className="gap-1">
                  {status}
                  <button onClick={() => clearFilters()}>
                    <XCircle className="h-3 w-3" />
                  </button>
                </Badge>
              ))}

              <Button
                variant="ghost"
                className="h-7 px-2 text-xs"
                onClick={clearFilters}
              >
                Clear all
              </Button>
            </div>
          ) : null}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">
                    <div className="flex items-center space-x-1">
                      <span>Severity</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center space-x-1">
                      <span>Alert</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Source</TableHead>
                  <TableHead className="hidden lg:table-cell">Rule ID</TableHead>
                  <TableHead className="hidden md:table-cell">
                    <div className="flex items-center space-x-1">
                      <span>Time</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedAlerts.length > 0 ? (
                  displayedAlerts.map(alert => (
                    <TableRow
                      key={alert.id}
                      className="cursor-pointer hover:bg-secondary/50"
                      onClick={() => {
                        setSelectedAlert(alert);
                        setIsDetailsDialogOpen(true);
                      }}
                    >
                      <TableCell>
                        <Badge className={cn(
                          alert.severity === 'critical' && "bg-destructive hover:bg-destructive",
                          alert.severity === 'high' && "bg-orange-500 hover:bg-orange-600",
                          alert.severity === 'medium' && "bg-yellow-500 hover:bg-yellow-600",
                          alert.severity === 'low' && "bg-green-500 hover:bg-green-600",
                          alert.severity === 'info' && "bg-blue-500 hover:bg-blue-600"
                        )}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{alert.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                            {alert.description}
                          </div>
                          {alert.status === 'investigating' && alert.assignedTo && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Assigned to: {alert.assignedTo}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{alert.source}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="outline" className="font-mono text-xs">
                          {alert.rawData?.rule?.id || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div
                          className="flex justify-end space-x-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {alert.status === 'open' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(alert.id, 'investigating')}
                            >
                              <Clock className="h-4 w-4 mr-1" />
                              Investigate
                            </Button>
                          )}
                          {(alert.status === 'open' || alert.status === 'investigating') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(alert.id, 'resolved')}
                              className="text-green-500 border-green-500"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Resolve
                            </Button>
                          )}
                          <Select
                            onValueChange={(value) => handleStatusChange(alert.id, value as any)}
                          >
                            <SelectTrigger className="h-8 w-8 p-0">
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <ArrowUpDown className="h-4 w-4" />
                              </Button>
                            </SelectTrigger>
                            <SelectContent>
                              {alert.status !== 'investigating' && (
                                <SelectItem value="investigating">Investigate</SelectItem>
                              )}
                              {alert.status !== "resolved" && (
                                <SelectItem value="resolved">Resolve</SelectItem>
                              )}
                              {alert.status !== "false-positive" && (
                                <SelectItem value="false-positive">False Positive</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Search className="h-10 w-10 mb-2" />
                        <p>No alerts found matching your criteria</p>
                        <Button
                          variant="link"
                          onClick={clearFilters}
                        >
                          Clear all filters
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {searchFiltered.length > itemsPerPage && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages} • {searchFiltered.length} total alerts
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDetailsDialog
        alert={selectedAlert}
        open={isDetailsDialogOpen}
        onOpenChange={(open) => {
          setIsDetailsDialogOpen(open);
          if (!open) setSelectedAlert(null);
        }}
      />
    </div>
  );
}

export default function AlertsDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Security Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage security events and alerts
          </p>
        </div>
      </div>

      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="alerts">All Alerts</TabsTrigger>
          <TabsTrigger value="insights">Offense Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts">
          <Alerts />
        </TabsContent>

        <TabsContent value="insights">
          <AlertsInsights />
        </TabsContent>
      </Tabs>
    </div>
  );
}