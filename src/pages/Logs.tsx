import { useState, useEffect } from "react";
import {
  Search,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  X,
  Calendar,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import apiClient from "@/services/api.service";
import { formatDistanceToNow } from "date-fns";

interface Log {
  id: string;
  timestamp: string;
  agentId: string;
  agentName: string;
  decoder: string;
  ruleId: string;
  ruleDescription: string;
  level: number;
  fullLog: string;
  data: any;
}

export default function Logs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [timeRange, setTimeRange] = useState("24hours");
  const [currentPage, setCurrentPage] = useState(1);
  const [chartData, setChartData] = useState<{ time: string; count: number }[]>([]);
  const logsPerPage = 50;

  // Fetch logs from API
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const filters: any = {
        limit: 500,
      };

      // Add time range filter with more options
      if (timeRange === "5min") {
        filters.startDate = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      } else if (timeRange === "15min") {
        filters.startDate = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      } else if (timeRange === "1hour") {
        filters.startDate = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      } else if (timeRange === "6hours") {
        filters.startDate = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
      } else if (timeRange === "24hours") {
        filters.startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      } else if (timeRange === "7days") {
        filters.startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      } else if (timeRange === "30days") {
        filters.startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      }

      const response = await apiClient.getLogs(filters);

      if (response.success && response.data) {
        setLogs(response.data);
        setFilteredLogs(response.data);
        generateChartData(response.data);

        toast({
          title: "Logs loaded",
          description: `Loaded ${response.data.length} logs`,
        });
      }
    } catch (error: any) {
      console.error("Failed to fetch logs:", error);
      toast({
        title: "Failed to fetch logs",
        description: error.message || "Could not load logs from the server",
        variant: "destructive",
      });
      // Set empty data on error
      setLogs([]);
      setFilteredLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Generate chart data from logs
  const generateChartData = (logsData: Log[]) => {
    const hourCounts: { [key: string]: number } = {};

    // Group logs by hour
    logsData.forEach((log) => {
      const date = new Date(log.timestamp);
      const hour = date.getHours();
      const hourKey = `${hour.toString().padStart(2, '0')}:00`;
      hourCounts[hourKey] = (hourCounts[hourKey] || 0) + 1;
    });

    // Convert to array and sort
    const data = Object.entries(hourCounts)
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => a.time.localeCompare(b.time));

    setChartData(data);
  };

  // Apply search filter
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredLogs(logs);
    } else {
      const filtered = logs.filter((log) => {
        const search = searchTerm.toLowerCase();
        return (
          log.fullLog.toLowerCase().includes(search) ||
          log.agentName.toLowerCase().includes(search) ||
          log.ruleDescription.toLowerCase().includes(search) ||
          log.decoder.toLowerCase().includes(search)
        );
      });
      setFilteredLogs(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, logs]);

  // Fetch logs ONLY on initial mount - NO auto-refresh
  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  // Chart component
  const LogsChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          No data available
        </div>
      );
    }

    const maxValue = Math.max(...chartData.map((item) => item.count), 1);

    return (
      <div className="h-64 w-full flex items-end space-x-1 px-4">
        {chartData.map((bar, index) => {
          const height = (bar.count / maxValue) * 100;
          return (
            <div key={index} className="flex flex-col items-center flex-grow">
              <div
                className="bg-blue-500 hover:bg-blue-600 w-full rounded-t-sm transition-all cursor-pointer relative group"
                style={{ height: `${Math.max(height, 2)}%` }}
                title={`${bar.time}: ${bar.count} logs`}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {bar.count} logs
                </div>
              </div>
              {index % Math.ceil(chartData.length / 12) === 0 && (
                <span className="text-xs text-muted-foreground mt-1">{bar.time}</span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Get severity badge color based on rule level
  const getLevelBadge = (level: number) => {
    if (level >= 12) return <Badge className="bg-red-500">Critical</Badge>;
    if (level >= 9) return <Badge className="bg-orange-500">High</Badge>;
    if (level >= 6) return <Badge className="bg-yellow-500">Medium</Badge>;
    if (level >= 3) return <Badge className="bg-green-500">Low</Badge>;
    return <Badge className="bg-blue-500">Info</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Security Logs</h1>
          <p className="text-muted-foreground">
            Real-time security event logs from Wazuh
          </p>
        </div>
        <Button onClick={fetchLogs} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs by content, agent, decoder..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>

            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5min">Last 5 minutes</SelectItem>
                <SelectItem value="15min">Last 15 minutes</SelectItem>
                <SelectItem value="1hour">Last 1 hour</SelectItem>
                <SelectItem value="6hours">Last 6 hours</SelectItem>
                <SelectItem value="24hours">Last 24 hours</SelectItem>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Logs Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <LogsChart />
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {indexOfFirstLog + 1}-{Math.min(indexOfLastLog, filteredLogs.length)} of{" "}
          {filteredLogs.length} logs
          {searchTerm && ` (filtered from ${logs.length} total)`}
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Decoder</TableHead>
                  <TableHead>Rule</TableHead>
                  <TableHead>Log Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <p className="text-muted-foreground">Loading logs...</p>
                    </TableCell>
                  </TableRow>
                ) : currentLogs.length > 0 ? (
                  currentLogs.map((log) => (
                    <>
                      <TableRow
                        key={log.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                      >
                        <TableCell>
                          {selectedLog?.id === log.id ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{log.agentName}</p>
                            <p className="text-xs text-muted-foreground">{log.agentId}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getLevelBadge(log.level)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.decoder}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{log.ruleId}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {log.ruleDescription}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[400px]">
                          <p className="truncate font-mono text-sm">{log.fullLog}</p>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Log Details */}
                      {selectedLog?.id === log.id && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-muted/30">
                            <div className="p-4 space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2">Full Log</h4>
                                <pre className="bg-slate-900 p-4 rounded-lg text-sm overflow-x-auto">
                                  {log.fullLog}
                                </pre>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Log Details</h4>
                                  <dl className="space-y-1 text-sm">
                                    <div className="flex">
                                      <dt className="font-medium w-32">Timestamp:</dt>
                                      <dd className="text-muted-foreground">
                                        {new Date(log.timestamp).toLocaleString()}
                                      </dd>
                                    </div>
                                    <div className="flex">
                                      <dt className="font-medium w-32">Agent Name:</dt>
                                      <dd className="text-muted-foreground">{log.agentName}</dd>
                                    </div>
                                    <div className="flex">
                                      <dt className="font-medium w-32">Agent ID:</dt>
                                      <dd className="text-muted-foreground">{log.agentId}</dd>
                                    </div>
                                    <div className="flex">
                                      <dt className="font-medium w-32">Decoder:</dt>
                                      <dd className="text-muted-foreground">{log.decoder}</dd>
                                    </div>
                                    <div className="flex">
                                      <dt className="font-medium w-32">Rule ID:</dt>
                                      <dd className="text-muted-foreground">{log.ruleId}</dd>
                                    </div>
                                    <div className="flex">
                                      <dt className="font-medium w-32">Level:</dt>
                                      <dd className="text-muted-foreground">{log.level}</dd>
                                    </div>
                                  </dl>
                                </div>

                                {log.data && Object.keys(log.data).length > 0 && (
                                  <div>
                                    <h4 className="font-semibold mb-2">Additional Data</h4>
                                    <pre className="bg-slate-900 p-3 rounded-lg text-xs overflow-x-auto max-h-48">
                                      {JSON.stringify(log.data, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedLog(null)}
                              >
                                Close Details
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Filter className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm ? "No logs match your search" : "No logs found"}
                      </p>
                      {searchTerm && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSearchTerm("")}
                          className="mt-2"
                        >
                          Clear search
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}