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

const flattenObject = (obj: any, prefix = ''): Record<string, any> => {
  return Object.keys(obj || {}).reduce((acc: any, k) => {
    const pre = prefix.length ? prefix + '.' : '';
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      Object.assign(acc, flattenObject(obj[k], pre + k));
    } else {
      acc[pre + k] = obj[k];
    }
    return acc;
  }, {});
};

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

  const generateChartData = (logs: Log[]) => {
    if (!logs.length) {
      setChartData([]);
      return;
    }

    // Group by hour for the chart
    const buckets = new Map<string, number>();
    logs.forEach(log => {
      try {
        const d = new Date(log.timestamp);
        // Simple formatting for the key
        const key = `${d.getHours()}:00`;
        buckets.set(key, (buckets.get(key) || 0) + 1);
      } catch (e) {
        // ignore invalid dates
      }
    });

    // Convert to array
    // For a better visualization we might want to sort them by time, 
    // but since we just have "HH:00", sorting might be ambiguous if spanning days.
    // However, for "Last 24 Hours", the logs are usually returned in desc order.
    // We can just take the buckets and display them.
    // To make it look like a timeline, we should probably sort by the actual timestamp of the bucket.
    // Let's try to be a bit smarter: use the full date as key for sorting, then format for display.

    const smartBuckets = new Map<number, number>();
    logs.forEach(log => {
      try {
        const d = new Date(log.timestamp);
        d.setMinutes(0, 0, 0); // Round to hour
        const time = d.getTime();
        smartBuckets.set(time, (smartBuckets.get(time) || 0) + 1);
      } catch (e) { }
    });

    const sortedData = Array.from(smartBuckets.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([time, count]) => {
        const d = new Date(time);
        return {
          time: `${d.getHours()}:00`,
          count
        };
      });

    setChartData(sortedData);
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const filters: any = {
        limit: 1000, // Fetch more logs for better client-side aggregation
      };

      // Calculate start date based on timeRange
      const now = new Date();
      let startDate = new Date();
      switch (timeRange) {
        case "5min": startDate.setMinutes(now.getMinutes() - 5); break;
        case "15min": startDate.setMinutes(now.getMinutes() - 15); break;
        case "1hour": startDate.setHours(now.getHours() - 1); break;
        case "6hours": startDate.setHours(now.getHours() - 6); break;
        case "24hours": startDate.setHours(now.getHours() - 24); break;
        case "7days": startDate.setDate(now.getDate() - 7); break;
        case "30days": startDate.setDate(now.getDate() - 30); break;
      }
      filters.startDate = startDate.toISOString();

      const response = await apiClient.getLogs(filters);
      const data = response.data || [];

      setLogs(data);
      setFilteredLogs(data);
      generateChartData(data);

    } catch (error) {
      console.error("Failed to fetch logs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch logs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and time range change
  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  // Search filtering
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

  // Pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  // Chart Component
  const LogsChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          No data available
        </div>
      );
    }

    const maxValue = Math.max(...chartData.map((item) => item.count), 1);
    const maxBarHeight = 200;

    return (
      <div className="h-64 w-full flex items-end space-x-1 px-4 pb-2">
        {chartData.map((bar, index) => {
          const height = (bar.count / maxValue) * maxBarHeight;
          return (
            <div key={index} className="flex flex-col items-center flex-grow justify-end h-full group relative">
              <div
                className="w-full rounded-t-sm transition-all cursor-pointer relative shadow-lg bg-gradient-to-t from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400"
                style={{ height: `${Math.max(height, 4)}px` }}
              >
                {/* Tooltip */}
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none border border-slate-700 shadow-xl">
                  <div className="font-bold">{bar.count} logs</div>
                  <div className="text-[10px] text-slate-400">{bar.time}</div>
                </div>
              </div>

              {/* X-Axis Label */}
              <div className="h-6 flex items-center justify-center mt-1">
                {/* Show label every ~12th item to avoid crowding if many bars */}
                {index % Math.ceil(chartData.length / 12) === 0 && (
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {bar.time}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

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
                  <TableHead>Log Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
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
                        <TableCell className="max-w-[400px]">
                          <p className="truncate font-mono text-sm">{log.fullLog}</p>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Log Details */}
                      {selectedLog?.id === log.id && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-muted/30 p-0">
                            <div className="p-4 space-y-6">
                              {/* Parsed Fields Table */}
                              <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
                                <div className="px-4 py-3 border-b bg-muted/40">
                                  <h4 className="font-semibold text-sm">Event Fields</h4>
                                </div>
                                <div className="max-h-[500px] overflow-y-auto">
                                  <Table>
                                    <TableBody>
                                      {Object.entries(flattenObject({
                                        timestamp: log.timestamp,
                                        agent: { id: log.agentId, name: log.agentName },
                                        rule: { id: log.ruleId, description: log.ruleDescription, level: log.level },
                                        decoder: log.decoder,
                                        ...log.data
                                      })).map(([key, value]) => (
                                        <TableRow key={key} className="hover:bg-muted/50">
                                          <TableCell className="font-medium text-xs w-1/3 text-muted-foreground py-2">{key}</TableCell>
                                          <TableCell className="font-mono text-xs break-all py-2 text-foreground">
                                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>

                              {/* Raw Log */}
                              <div>
                                <h4 className="font-semibold text-sm mb-2">Raw Log</h4>
                                <pre className="bg-slate-950 p-4 rounded-lg text-xs font-mono overflow-x-auto text-slate-300 border border-slate-800">
                                  {log.fullLog}
                                </pre>
                              </div>

                              <div className="flex justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedLog(null)}
                                >
                                  Close Details
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
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