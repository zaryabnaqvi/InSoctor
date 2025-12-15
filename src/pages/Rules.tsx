import { useState, useEffect } from "react";
import { Search, RefreshCw, Shield, ShieldAlert, ShieldCheck, Filter } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import apiClient from "@/services/api.service";

interface WazuhRule {
  id: string;
  level: number;
  description: string;
  groups: string[];
  filename: string;
  status: string;
  details?: any;
}

export default function Rules() {
  const [rules, setRules] = useState<WazuhRule[]>([]);
  const [filteredRules, setFilteredRules] = useState<WazuhRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const rulesPerPage = 20;

  const fetchRules = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getRules();
      if (response.success && response.data) {
        // Add a default status if missing (Wazuh API might not always return it directly in list)
        const rulesWithStatus = response.data.map((rule: any) => ({
          ...rule,
          status: rule.status || 'enabled' // Default to enabled if not specified
        }));
        setRules(rulesWithStatus);
        setFilteredRules(rulesWithStatus);
        toast({
          title: "Rules loaded",
          description: `Loaded ${response.data.length} rules`,
        });
      }
    } catch (error: any) {
      console.error("Failed to fetch rules:", error);
      toast({
        title: "Failed to fetch rules",
        description: error.message || "Could not load rules from the server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  useEffect(() => {
    let result = rules;

    // Search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (rule) =>
          rule.id.toLowerCase().includes(lowerSearch) ||
          rule.description.toLowerCase().includes(lowerSearch) ||
          rule.groups.some((g) => g.toLowerCase().includes(lowerSearch)) ||
          rule.filename.toLowerCase().includes(lowerSearch)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((rule) => rule.status === statusFilter);
    }

    // Level filter
    if (levelFilter !== "all") {
      if (levelFilter === "high") {
        result = result.filter((rule) => rule.level >= 10);
      } else if (levelFilter === "medium") {
        result = result.filter((rule) => rule.level >= 5 && rule.level < 10);
      } else if (levelFilter === "low") {
        result = result.filter((rule) => rule.level < 5);
      }
    }

    setFilteredRules(result);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, levelFilter, rules]);

  const handleStatusToggle = async (ruleId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'enabled' ? 'disabled' : 'enabled';

    // Optimistic update
    setRules(prev => prev.map(r => r.id === ruleId ? { ...r, status: newStatus } : r));

    try {
      await apiClient.updateRuleStatus(ruleId, newStatus);
      toast({
        title: `Rule ${newStatus === 'enabled' ? 'Enabled' : 'Disabled'}`,
        description: `Rule ${ruleId} has been ${newStatus}.`,
      });
    } catch (error: any) {
      // Revert on failure
      setRules(prev => prev.map(r => r.id === ruleId ? { ...r, status: currentStatus } : r));
      toast({
        title: "Update failed",
        description: error.message || "Failed to update rule status",
        variant: "destructive",
      });
    }
  };

  // Pagination
  const indexOfLastRule = currentPage * rulesPerPage;
  const indexOfFirstRule = indexOfLastRule - rulesPerPage;
  const currentRules = filteredRules.slice(indexOfFirstRule, indexOfLastRule);
  const totalPages = Math.ceil(filteredRules.length / rulesPerPage);

  const getLevelBadge = (level: number) => {
    if (level >= 12) return <Badge className="bg-red-600">Critical ({level})</Badge>;
    if (level >= 10) return <Badge className="bg-red-500">High ({level})</Badge>;
    if (level >= 7) return <Badge className="bg-orange-500">Medium ({level})</Badge>;
    if (level >= 4) return <Badge className="bg-yellow-500">Low ({level})</Badge>;
    return <Badge className="bg-blue-500">Info ({level})</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Detection Rules</h1>
          <p className="text-muted-foreground">
            Manage Wazuh detection rules and policies
          </p>
        </div>
        <Button onClick={fetchRules} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh Rules
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rules.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all groups
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enabled Rules</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rules.filter(r => r.status === 'enabled').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active detection rules
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disabled Rules</CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rules.filter(r => r.status === 'disabled').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Inactive rules
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Rules List</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search rules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="high">High (10+)</SelectItem>
                  <SelectItem value="medium">Medium (5-9)</SelectItem>
                  <SelectItem value="low">Low (0-4)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead className="w-[100px]">Level</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Groups</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[100px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <p className="text-muted-foreground">Loading rules...</p>
                    </TableCell>
                  </TableRow>
                ) : currentRules.length > 0 ? (
                  currentRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-mono">{rule.id}</TableCell>
                      <TableCell>{getLevelBadge(rule.level)}</TableCell>
                      <TableCell className="max-w-[400px]">
                        <p className="truncate" title={rule.description}>
                          {rule.description}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {rule.groups.slice(0, 2).map((group) => (
                            <Badge key={group} variant="outline" className="text-xs">
                              {group}
                            </Badge>
                          ))}
                          {rule.groups.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{rule.groups.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground font-mono">
                        {rule.filename}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={rule.status === 'enabled' ? 'default' : 'secondary'}
                          className={rule.status === 'enabled' ? 'bg-green-600' : ''}
                        >
                          {rule.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={rule.status === 'enabled'}
                            onCheckedChange={() => handleStatusToggle(rule.id, rule.status)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p className="text-muted-foreground">No rules found</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {indexOfFirstRule + 1}-{Math.min(indexOfLastRule, filteredRules.length)} of{" "}
              {filteredRules.length} rules
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
        </CardContent>
      </Card>
    </div>
  );
}