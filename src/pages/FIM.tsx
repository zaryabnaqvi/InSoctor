import { useState, useEffect } from 'react';
import {
    Shield,
    RefreshCw,
    Search,
    Calendar,
    Filter,
    ChevronDown,
    ChevronRight,
    FileCheck,
    FilePlus,
    FileEdit,
    FileX,
    X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import apiClient from '@/services/api.service';
import { formatDistanceToNow } from 'date-fns';

interface FIMAlert {
    id: string;
    timestamp: string;
    agent: {
        id: string;
        name: string;
    };
    syscheck: {
        path: string;
        event: string;
        size_before?: number;
        size_after?: number;
        perm_before?: string;
        perm_after?: string;
        md5_before?: string;
        md5_after?: string;
        sha1_before?: string;
        sha1_after?: string;
        uname_before?: string;
        uname_after?: string;
        gname_before?: string;
        gname_after?: string;
        mtime_before?: string;
        mtime_after?: string;
    };
    rule: {
        id: string;
        description: string;
        level: number;
    };
    severity: string;
}

export default function FIM() {
    const [alerts, setAlerts] = useState<FIMAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAlert, setSelectedAlert] = useState<FIMAlert | null>(null);
    const [timeRange, setTimeRange] = useState('24hours');
    const [actionFilter, setActionFilter] = useState('all');
    const [searchPath, setSearchPath] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [chartData, setChartData] = useState<{ time: string; count: number }[]>([]);
    const [stats, setStats] = useState({
        total: 0,
        added: 0,
        modified: 0,
        deleted: 0,
        critical: 0
    });

    const alertsPerPage = 50;

    const fetchFimAlerts = async () => {
        setLoading(true);
        try {
            const filters: any = {
                limit: 500,
            };

            // Calculate start date based on timeRange
            const now = new Date();
            let startDate = new Date();
            switch (timeRange) {
                case '1hour':
                    startDate.setHours(now.getHours() - 1);
                    break;
                case '6hours':
                    startDate.setHours(now.getHours() - 6);
                    break;
                case '24hours':
                    startDate.setHours(now.getHours() - 24);
                    break;
                case '7days':
                    startDate.setDate(now.getDate() - 7);
                    break;
            }
            filters.startDate = startDate.toISOString();

            if (actionFilter !== 'all') {
                filters.action = actionFilter;
            }

            if (searchPath.trim()) {
                filters.path = searchPath.trim();
            }

            const response = await apiClient.getFimAlerts(filters);
            const data = response.data || [];

            setAlerts(data);

            // Calculate stats
            const statsData = {
                total: data.length,
                added: data.filter((a: FIMAlert) => a.syscheck.event === 'added').length,
                modified: data.filter((a: FIMAlert) => a.syscheck.event === 'modified').length,
                deleted: data.filter((a: FIMAlert) => a.syscheck.event === 'deleted').length,
                critical: data.filter((a: FIMAlert) => a.severity === 'critical' || a.severity === 'high').length
            };
            setStats(statsData);

            // Generate chart data from aggregations if available
            if (response.aggregations?.fim_timeline?.buckets) {
                const timeline = response.aggregations.fim_timeline.buckets.map((bucket: any) => ({
                    time: new Date(bucket.key_as_string || bucket.key).getHours() + ':00',
                    count: bucket.doc_count
                }));
                setChartData(timeline);
            } else {
                // Client-side chart generation
                generateChartData(data);
            }

        } catch (error) {
            console.error('Failed to fetch FIM alerts:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch FIM alerts. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const generateChartData = (alerts: FIMAlert[]) => {
        if (!alerts.length) {
            setChartData([]);
            return;
        }

        const smartBuckets = new Map<number, number>();
        alerts.forEach(alert => {
            try {
                const d = new Date(alert.timestamp);
                d.setMinutes(0, 0, 0);
                const time = d.getTime();
                smartBuckets.set(time, (smartBuckets.get(time) || 0) + 1);
            } catch (e) {
                // ignore
            }
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

    useEffect(() => {
        fetchFimAlerts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeRange, actionFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchPath]);

    // Pagination
    const filteredAlerts = searchPath
        ? alerts.filter(a => a.syscheck.path.toLowerCase().includes(searchPath.toLowerCase()))
        : alerts;

    const indexOfLastAlert = currentPage * alertsPerPage;
    const indexOfFirstAlert = indexOfLastAlert - alertsPerPage;
    const currentAlerts = filteredAlerts.slice(indexOfFirstAlert, indexOfLastAlert);
    const totalPages = Math.ceil(filteredAlerts.length / alertsPerPage);

    const getActionIcon = (event: string) => {
        switch (event) {
            case 'added':
                return <FilePlus className="h-4 w-4 text-green-500" />;
            case 'modified':
                return <FileEdit className="h-4 w-4 text-yellow-500" />;
            case 'deleted':
                return <FileX className="h-4 w-4 text-red-500" />;
            default:
                return <FileCheck className="h-4 w-4 text-blue-500" />;
        }
    };

    const getActionBadge = (event: string) => {
        const variants: Record<string, string> = {
            added: 'bg-green-500',
            modified: 'bg-yellow-500',
            deleted: 'bg-red-500',
        };
        return (
            <Badge className={variants[event] || 'bg-blue-500'}>
                {event.charAt(0).toUpperCase() + event.slice(1)}
            </Badge>
        );
    };

    const getSeverityBadge = (severity: string) => {
        const variants: Record<string, string> = {
            critical: 'bg-red-600',
            high: 'bg-orange-500',
            medium: 'bg-yellow-500',
            low: 'bg-blue-500',
            info: 'bg-gray-500',
        };
        return (
            <Badge className={variants[severity] || 'bg-gray-500'}>
                {severity.charAt(0).toUpperCase() + severity.slice(1)}
            </Badge>
        );
    };

    const FIMChart = () => {
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
                                className="w-full rounded-t-sm transition-all cursor-pointer relative shadow-lg bg-gradient-to-t from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400"
                                style={{ height: `${Math.max(height, 4)}px` }}
                            >
                                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none border border-slate-700 shadow-xl">
                                    <div className="font-bold">{bar.count} events</div>
                                    <div className="text-[10px] text-slate-400">{bar.time}</div>
                                </div>
                            </div>
                            <div className="h-6 flex items-center justify-center mt-1">
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">File Integrity Monitoring</h1>
                    <p className="text-muted-foreground">
                        Monitor file system changes and integrity violations
                    </p>
                </div>
                <Button onClick={fetchFimAlerts} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Files Added</CardTitle>
                        <FilePlus className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.added}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Files Modified</CardTitle>
                        <FileEdit className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.modified}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Files Deleted</CardTitle>
                        <FileX className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.deleted}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
                        <Shield className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Chart */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">FIM Activity Timeline</CardTitle>
                    <CardDescription>File integrity events over time</CardDescription>
                </CardHeader>
                <CardContent>
                    <FIMChart />
                </CardContent>
            </Card>

            {/* Filters */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by file path..."
                                className="pl-10"
                                value={searchPath}
                                onChange={(e) => setSearchPath(e.target.value)}
                            />
                            {searchPath && (
                                <button
                                    onClick={() => setSearchPath('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                >
                                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                </button>
                            )}
                        </div>

                        <Select value={actionFilter} onValueChange={setActionFilter}>
                            <SelectTrigger className="w-[180px]">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Action type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Actions</SelectItem>
                                <SelectItem value="added">Added</SelectItem>
                                <SelectItem value="modified">Modified</SelectItem>
                                <SelectItem value="deleted">Deleted</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={timeRange} onValueChange={setTimeRange}>
                            <SelectTrigger className="w-[180px]">
                                <Calendar className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Time range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1hour">Last 1 hour</SelectItem>
                                <SelectItem value="6hours">Last 6 hours</SelectItem>
                                <SelectItem value="24hours">Last 24 hours</SelectItem>
                                <SelectItem value="7days">Last 7 days</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
            </Card>

            {/* Summary */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Showing {indexOfFirstAlert + 1}-{Math.min(indexOfLastAlert, filteredAlerts.length)} of{' '}
                    {filteredAlerts.length} events
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

            {/* FIM Alerts Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>File Path</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Agent</TableHead>
                                    <TableHead>Severity</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                                            <p className="text-muted-foreground">Loading FIM events...</p>
                                        </TableCell>
                                    </TableRow>
                                ) : currentAlerts.length > 0 ? (
                                    currentAlerts.map((alert) => (
                                        <>
                                            <TableRow
                                                key={alert.id}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => setSelectedAlert(selectedAlert?.id === alert.id ? null : alert)}
                                            >
                                                <TableCell>
                                                    {selectedAlert?.id === alert.id ? (
                                                        <ChevronDown className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4" />
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">
                                                    {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                                                </TableCell>
                                                <TableCell className="max-w-[300px]">
                                                    <p className="truncate font-mono text-sm" title={alert.syscheck.path}>
                                                        {alert.syscheck.path}
                                                    </p>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        {getActionIcon(alert.syscheck.event)}
                                                        {getActionBadge(alert.syscheck.event)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{alert.agent.name}</p>
                                                        <p className="text-xs text-muted-foreground">{alert.agent.id}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                                            </TableRow>

                                            {/* Expanded Details */}
                                            {selectedAlert?.id === alert.id && (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="bg-muted/30">
                                                        <div className="p-4 space-y-4">
                                                            <div>
                                                                <h4 className="font-semibold mb-2">Rule Information</h4>
                                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                                    <div>
                                                                        <span className="font-medium">Rule ID:</span>{' '}
                                                                        {alert.rule.id}
                                                                    </div>
                                                                    <div>
                                                                        <span className="font-medium">Level:</span>{' '}
                                                                        {alert.rule.level}
                                                                    </div>
                                                                    <div className="col-span-2">
                                                                        <span className="font-medium">Description:</span>{' '}
                                                                        {alert.rule.description}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4">
                                                                {alert.syscheck.size_before !== undefined && (
                                                                    <div>
                                                                        <h4 className="font-semibold mb-2">File Size</h4>
                                                                        <div className="text-sm space-y-1">
                                                                            <div>Before: {alert.syscheck.size_before} bytes</div>
                                                                            <div>After: {alert.syscheck.size_after} bytes</div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {alert.syscheck.perm_before && (
                                                                    <div>
                                                                        <h4 className="font-semibold mb-2">Permissions</h4>
                                                                        <div className="text-sm space-y-1">
                                                                            <div>Before: {alert.syscheck.perm_before}</div>
                                                                            <div>After: {alert.syscheck.perm_after}</div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {alert.syscheck.md5_before && (
                                                                    <div>
                                                                        <h4 className="font-semibold mb-2">MD5 Hash</h4>
                                                                        <div className="text-sm space-y-1">
                                                                            <div className="font-mono text-xs">
                                                                                Before: {alert.syscheck.md5_before}
                                                                            </div>
                                                                            <div className="font-mono text-xs">
                                                                                After: {alert.syscheck.md5_after}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {alert.syscheck.sha256_before && (
                                                                    <div>
                                                                        <h4 className="font-semibold mb-2">SHA256 Hash</h4>
                                                                        <div className="text-sm space-y-1">
                                                                            <div className="font-mono text-xs truncate">
                                                                                Before: {alert.syscheck.sha256_before}
                                                                            </div>
                                                                            <div className="font-mono text-xs truncate">
                                                                                After: {alert.syscheck.sha256_after}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {alert.syscheck.uname_before && (
                                                                    <div>
                                                                        <h4 className="font-semibold mb-2">Owner</h4>
                                                                        <div className="text-sm space-y-1">
                                                                            <div>Before: {alert.syscheck.uname_before}</div>
                                                                            <div>After: {alert.syscheck.uname_after}</div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {alert.syscheck.gname_before && (
                                                                    <div>
                                                                        <h4 className="font-semibold mb-2">Group</h4>
                                                                        <div className="text-sm space-y-1">
                                                                            <div>Before: {alert.syscheck.gname_before}</div>
                                                                            <div>After: {alert.syscheck.gname_after}</div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setSelectedAlert(null)}
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
                                        <TableCell colSpan={6} className="text-center py-8">
                                            <Filter className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                                            <p className="text-muted-foreground">
                                                {searchPath ? 'No FIM events match your search' : 'No FIM events found'}
                                            </p>
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
