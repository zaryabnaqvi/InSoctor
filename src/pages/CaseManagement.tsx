import { useState, useEffect } from 'react';
import {
    Briefcase,
    RefreshCw,
    Plus,
    Search,
    Filter,
    X,
    ChevronDown,
    ChevronRight,
    AlertCircle,
    Clock,
    User
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

interface Case {
    id: string;
    title: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    status: 'open' | 'investigating' | 'closed';
    createdAt: string;
    updatedAt: string;
    assignedTo?: string;
    alerts: string[];
}

export default function CaseManagement() {
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCase, setSelectedCase] = useState<Case | null>(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [stats, setStats] = useState({
        total: 0,
        open: 0,
        investigating: 0,
        closed: 0,
        critical: 0,
        high: 0
    });

    const casesPerPage = 20;

    const fetchCases = async () => {
        setLoading(true);
        try {
            const filters: any = {
                limit: 200
            };

            if (statusFilter !== 'all') {
                filters.status = [statusFilter];
            }

            if (severityFilter !== 'all') {
                filters.severity = [severityFilter];
            }

            const response = await apiClient.getCases(filters);
            const data = response.data || [];

            setCases(data);

            // Calculate stats
            const statsData = {
                total: data.length,
                open: data.filter((c: Case) => c.status === 'open').length,
                investigating: data.filter((c: Case) => c.status === 'investigating').length,
                closed: data.filter((c: Case) => c.status === 'closed').length,
                critical: data.filter((c: Case) => c.severity === 'critical').length,
                high: data.filter((c: Case) => c.severity === 'high').length
            };
            setStats(statsData);

        } catch (error) {
            console.error('Failed to fetch cases:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch cases from IRIS. Please check your connection.',
                variant: 'destructive',
            });
            // Set empty data on error
            setCases([]);
            setStats({ total: 0, open: 0, investigating: 0, closed: 0, critical: 0, high: 0 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCases();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, severityFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    // Filter and pagination
    const filteredCases = searchQuery
        ? cases.filter(c =>
            c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : cases;

    const indexOfLastCase = currentPage * casesPerPage;
    const indexOfFirstCase = indexOfLastCase - casesPerPage;
    const currentCases = filteredCases.slice(indexOfFirstCase, indexOfLastCase);
    const totalPages = Math.ceil(filteredCases.length / casesPerPage);

    const getSeverityBadge = (severity: string) => {
        const variants: Record<string, string> = {
            critical: 'bg-red-600',
            high: 'bg-orange-500',
            medium: 'bg-yellow-500',
            low: 'bg-blue-500',
        };
        return (
            <Badge className={variants[severity] || 'bg-gray-500'}>
                {severity.charAt(0).toUpperCase() + severity.slice(1)}
            </Badge>
        );
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            open: 'bg-green-600',
            investigating: 'bg-blue-600',
            closed: 'bg-gray-600',
        };
        return (
            <Badge className={variants[status] || 'bg-gray-500'}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Case Management</h1>
                    <p className="text-muted-foreground">
                        Manage security incidents and investigations with IRIS
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={fetchCases} disabled={loading} variant="outline">
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Case
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Open</CardTitle>
                        <AlertCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.open}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Investigating</CardTitle>
                        <Clock className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.investigating}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Closed</CardTitle>
                        <Clock className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-600">{stats.closed}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Critical</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">High Severity</CardTitle>
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{stats.high}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search cases..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                >
                                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                </button>
                            )}
                        </div>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="investigating">Investigating</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={severityFilter} onValueChange={setSeverityFilter}>
                            <SelectTrigger className="w-[180px]">
                                <AlertCircle className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Severity" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Severity</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
            </Card>

            {/* Summary */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Showing {indexOfFirstCase + 1}-{Math.min(indexOfLastCase, filteredCases.length)} of{' '}
                    {filteredCases.length} cases
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

            {/* Cases Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead>Case ID</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Severity</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Assigned To</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Alerts</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8">
                                            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                                            <p className="text-muted-foreground">Loading cases from IRIS...</p>
                                        </TableCell>
                                    </TableRow>
                                ) : currentCases.length > 0 ? (
                                    currentCases.map((case_) => (
                                        <>
                                            <TableRow
                                                key={case_.id}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => setSelectedCase(selectedCase?.id === case_.id ? null : case_)}
                                            >
                                                <TableCell>
                                                    {selectedCase?.id === case_.id ? (
                                                        <ChevronDown className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4" />
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">#{case_.id}</TableCell>
                                                <TableCell className="max-w-[300px]">
                                                    <p className="truncate font-medium" title={case_.title}>
                                                        {case_.title}
                                                    </p>
                                                </TableCell>
                                                <TableCell>{getSeverityBadge(case_.severity)}</TableCell>
                                                <TableCell>{getStatusBadge(case_.status)}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm">{case_.assignedTo || 'Unassigned'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {formatDistanceToNow(new Date(case_.createdAt), { addSuffix: true })}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant="outline">{case_.alerts.length}</Badge>
                                                </TableCell>
                                            </TableRow>

                                            {/* Expanded Details */}
                                            {selectedCase?.id === case_.id && (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="bg-muted/30">
                                                        <div className="p-4 space-y-4">
                                                            <div>
                                                                <h4 className="font-semibold mb-2">Description</h4>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {case_.description || 'No description available'}
                                                                </p>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <h4 className="font-semibold mb-2">Case Information</h4>
                                                                    <div className="text-sm space-y-1">
                                                                        <div><span className="font-medium">Case ID:</span> #{case_.id}</div>
                                                                        <div><span className="font-medium">Created:</span> {new Date(case_.createdAt).toLocaleString()}</div>
                                                                        <div><span className="font-medium">Last Updated:</span> {new Date(case_.updatedAt).toLocaleString()}</div>
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <h4 className="font-semibold mb-2">Linked Alerts</h4>
                                                                    <div className="text-sm">
                                                                        {case_.alerts.length > 0 ? (
                                                                            <div className="space-y-1">
                                                                                {case_.alerts.slice(0, 5).map((alertId, idx) => (
                                                                                    <div key={idx} className="font-mono text-xs">
                                                                                        Alert: {alertId}
                                                                                    </div>
                                                                                ))}
                                                                                {case_.alerts.length > 5 && (
                                                                                    <div className="text-muted-foreground">
                                                                                        +{case_.alerts.length - 5} more
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        ) : (
                                                                            <p className="text-muted-foreground">No linked alerts</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex gap-2">
                                                                <Button variant="outline" size="sm">
                                                                    Edit Case
                                                                </Button>
                                                                <Button variant="outline" size="sm">
                                                                    Add Note
                                                                </Button>
                                                                <Button variant="outline" size="sm">
                                                                    Link Alert
                                                                </Button>
                                                                {case_.status !== 'closed' && (
                                                                    <Button variant="outline" size="sm">
                                                                        Close Case
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8">
                                            <Briefcase className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                                            <p className="text-muted-foreground">
                                                {searchQuery ? 'No cases match your search' : 'No cases found'}
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-2">
                                                Cases from IRIS will appear here
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
