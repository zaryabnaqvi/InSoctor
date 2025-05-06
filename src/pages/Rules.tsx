import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  FileText,
  FolderOpen,
  Plus,
  RefreshCw,
  Settings,
  Download,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Sample data based on the screenshot
const initialRules = [
  {
    id: 1,
    description: "Generic template for all syslog rules.",
    groups: ["syslog"],
    compliance: [],
    level: 0,
    file: "0010-rules_config.xml",
    path: "ruleset/rules",
  },
  {
    id: 2,
    description: "Generic template for all firewall rules.",
    groups: ["firewall"],
    compliance: [],
    level: 0,
    file: "0010-rules_config.xml",
    path: "ruleset/rules",
  },
  {
    id: 3,
    description: "Generic template for all ids rules.",
    groups: ["ids"],
    compliance: [],
    level: 0,
    file: "0010-rules_config.xml",
    path: "ruleset/rules",
  },
  {
    id: 4,
    description: "Generic template for all web rules.",
    groups: ["web-log"],
    compliance: [],
    level: 0,
    file: "0010-rules_config.xml",
    path: "ruleset/rules",
  },
  {
    id: 5,
    description: "Generic template for all web proxy rules.",
    groups: ["squid"],
    compliance: [],
    level: 0,
    file: "0010-rules_config.xml",
    path: "ruleset/rules",
  },
  {
    id: 6,
    description: "Generic template for all windows rules.",
    groups: ["windows"],
    compliance: [],
    level: 0,
    file: "0010-rules_config.xml",
    path: "ruleset/rules",
  },
  {
    id: 7,
    description: "Generic template for all wazuh rules.",
    groups: ["ossec"],
    compliance: [],
    level: 0,
    file: "0010-rules_config.xml",
    path: "ruleset/rules",
  },
  {
    id: 200,
    description: "Grouping of wazuh rules.",
    groups: ["wazuh"],
    compliance: [],
    level: 0,
    file: "0016-wazuh_rules.xml",
    path: "ruleset/rules",
  },
  {
    id: 201,
    description: "Agent event queue rule",
    groups: ["agent_flooding", "wazuh"],
    compliance: [],
    level: 0,
    file: "0016-wazuh_rules.xml",
    path: "ruleset/rules",
  },
  {
    id: 202,
    description: "Agent event queue is level full.",
    groups: ["agent_flooding", "wazuh"],
    compliance: ["PCI_DSS", "GDPR"],
    level: 7,
    file: "0016-wazuh_rules.xml",
    path: "ruleset/rules",
  },
];

export default function RulesManagement() {
  const [rules, setRules] = useState(initialRules);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [activeTab, setActiveTab] = useState("wql");
  const [isAddRuleDialogOpen, setIsAddRuleDialogOpen] = useState(false);
  const [selectedRuleId, setSelectedRuleId] = useState(null);
  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(rules.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  // Filter and sort rules
  const filteredRules = rules.filter((rule) => {
    if (!searchQuery) return true;
    return (
      rule.id.toString().includes(searchQuery) ||
      rule.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.groups.some((group) =>
        group.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      rule.file.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const sortedRules = [...filteredRules].sort((a:any, b:any) => {
    if (sortDirection === "asc") {
      if (sortColumn === "id") return a.id - b.id;
      return a[sortColumn].toString().localeCompare(b[sortColumn].toString());
    } else {
      if (sortColumn === "id") return b.id - a.id;
      return b[sortColumn].toString().localeCompare(a[sortColumn].toString());
    }
  });

  const displayedRules = sortedRules.slice(startIndex, endIndex);

  const handleSort = (column:any) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleAddRule = () => {
    setIsAddRuleDialogOpen(true);
  };

  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleEditRule = (id:any) => {
    setSelectedRuleId(id);
    setIsAddRuleDialogOpen(true);
  };

  const handleDeleteRule = (id:any) => {
    if (confirm("Are you sure you want to delete this rule?")) {
      setRules(rules.filter((rule) => rule.id !== id));
    }
  };

  const renderPaginationLinks = () => {
    const links = [];
    for (let i = 1; i <= Math.min(5, totalPages); i++) {
      links.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => setCurrentPage(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    return links;
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-50">
      <header className="border-b border-zinc-800 p-4">
        <h1 className="text-2xl font-bold">Rules ({rules.length})</h1>
        <p className="text-zinc-400 text-sm mt-1">
          From here you can manage your rules.
        </p>
      </header>

      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button variant="outline" className="flex items-center gap-2">
              <FileText size={16} />
              Manage rules files
            </Button>
            <Button onClick={handleAddRule} className="flex items-center gap-2">
              <Plus size={16} />
              Add new rules file
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download size={16} />
              Export formatted
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="relative w-1/3">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search"
              className="pl-8 bg-zinc-900 border-zinc-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex space-x-2">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-[400px]"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="wql">WQL</TabsTrigger>
                <TabsTrigger value="custom">Custom rules</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-zinc-800/50 border-zinc-800">
                  <TableHead
                    className="w-16 cursor-pointer"
                    onClick={() => handleSort("id")}
                  >
                    <div className="flex items-center">
                      ID
                      {sortColumn === "id" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("description")}
                  >
                    <div className="flex items-center">
                      Description
                      {sortColumn === "description" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Groups</TableHead>
                  <TableHead>Regulatory compliance</TableHead>
                  <TableHead
                    className="w-20 cursor-pointer"
                    onClick={() => handleSort("level")}
                  >
                    <div className="flex items-center">
                      Level
                      {sortColumn === "level" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("file")}
                  >
                    <div className="flex items-center">
                      File
                      {sortColumn === "file" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Path</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedRules.map((rule) => (
                  <TableRow
                    key={rule.id}
                    className="hover:bg-zinc-800/50 border-zinc-800"
                  >
                    <TableCell>{rule.id}</TableCell>
                    <TableCell className="font-medium">
                      {rule.description}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {rule.groups.map((group) => (
                          <Badge
                            key={group}
                            variant="outline"
                            className="bg-zinc-800 text-zinc-300"
                          >
                            {group}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {rule.compliance.map((item) => (
                          <Badge
                            key={item}
                            className="bg-blue-900/30 text-blue-300 border-blue-800"
                          >
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          rule.level >= 7
                            ? "bg-red-900/30 text-red-300 border-red-800"
                            : rule.level >= 4
                            ? "bg-amber-900/30 text-amber-300 border-amber-800"
                            : "bg-green-900/30 text-green-300 border-green-800"
                        }
                      >
                        {rule.level}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-blue-400 hover:underline">
                      {rule.file}
                    </TableCell>
                    <TableCell>{rule.path}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            aria-label="Open menu"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-200">
                          <DropdownMenuItem
                            className="cursor-pointer hover:bg-zinc-800"
                            onClick={() => handleEditRule(rule.id)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer hover:bg-zinc-800"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-zinc-800" />
                          <DropdownMenuItem
                            className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            onClick={() => handleDeleteRule(rule.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t border-zinc-800 px-6 py-4">
            <div className="flex items-center space-x-2 text-zinc-500 text-sm">
              <div>
                Rows per page:{" "}
                <Select
                  value={rowsPerPage.toString()}
                  onValueChange={(value) => {
                    setRowsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-16 h-8 bg-zinc-900 border-zinc-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => {
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                    className={
                      currentPage === 1
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
                {renderPaginationLinks()}
                {totalPages > 5 && (
                  <>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => setCurrentPage(totalPages)}
                        isActive={currentPage === totalPages}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => {
                      if (currentPage < totalPages)
                        setCurrentPage(currentPage + 1);
                    }}
                    className={
                      currentPage === totalPages
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        </Card>
      </div>

      {/* Add/Edit Rule Dialog */}
      <Dialog open={isAddRuleDialogOpen} onOpenChange={setIsAddRuleDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedRuleId ? "Edit Rule" : "Add New Rule"}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              {selectedRuleId
                ? "Modify the existing rule details below."
                : "Create a new security rule by filling out the form below."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-zinc-400">ID</label>
              <Input
                id="id"
                defaultValue={
                  selectedRuleId
                    ? rules.find((r) => r.id === selectedRuleId)?.id
                    : Math.max(...rules.map((r) => r.id)) + 1
                }
                className="col-span-3 bg-zinc-800 border-zinc-700"
                readOnly={selectedRuleId !== null}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-zinc-400">Description</label>
              <Input
                id="description"
                defaultValue={
                  selectedRuleId
                    ? rules.find((r) => r.id === selectedRuleId)?.description
                    : ""
                }
                className="col-span-3 bg-zinc-800 border-zinc-700"
                placeholder="Enter rule description"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-zinc-400">Groups</label>
              <Input
                id="groups"
                defaultValue={
                  selectedRuleId
                    ? rules
                        .find((r) => r.id === selectedRuleId)
                        ?.groups.join(", ")
                    : ""
                }
                className="col-span-3 bg-zinc-800 border-zinc-700"
                placeholder="Enter groups (comma separated)"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-zinc-400">Compliance</label>
              <Input
                id="compliance"
                defaultValue={
                  selectedRuleId
                    ? rules
                        .find((r) => r.id === selectedRuleId)
                        ?.compliance.join(", ")
                    : ""
                }
                className="col-span-3 bg-zinc-800 border-zinc-700"
                placeholder="Enter compliance standards (comma separated)"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-zinc-400">Level</label>
              <Select
                defaultValue={
                  selectedRuleId
                    ? rules
                        .find((r) => r.id === selectedRuleId)
                        ?.level.toString()
                    : "0"
                }
              >
                <SelectTrigger className="col-span-3 bg-zinc-800 border-zinc-700">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(
                    (level) => (
                      <SelectItem key={level} value={level.toString()}>
                        {level}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-zinc-400">File</label>
              <Input
                id="file"
                defaultValue={
                  selectedRuleId
                    ? rules.find((r) => r.id === selectedRuleId)?.file
                    : ""
                }
                className="col-span-3 bg-zinc-800 border-zinc-700"
                placeholder="Enter file name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-zinc-400">Path</label>
              <Input
                id="path"
                defaultValue={
                  selectedRuleId
                    ? rules.find((r) => r.id === selectedRuleId)?.path
                    : "ruleset/rules"
                }
                className="col-span-3 bg-zinc-800 border-zinc-700"
                placeholder="Enter path"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <label className="text-right text-zinc-400 pt-2">Rule XML</label>
              <div className="col-span-3">
                <div className="relative">
                  <div className="absolute top-0 right-0 bg-zinc-800 text-zinc-400 text-xs px-2 py-1 rounded-bl">
                    XML
                  </div>
                  <textarea
                    className="w-full h-64 p-4 font-mono text-sm bg-zinc-800 border-zinc-700 rounded-md"
                    placeholder="<rule id='202' level='7'>
  <if_sid>201</if_sid>
  <field name='data.status'>full</field>
  <description>Agent event queue is level full.</description>
  <group>agent_flooding,wazuh</group>
  <rule_id>202</rule_id>
  <pci_dss>10.6.1</pci_dss>
  <gdpr>IV_35.7.d</gdpr>
</rule>"
                    defaultValue={
                      selectedRuleId
                        ? `<rule id='${
                            rules.find((r) => r.id === selectedRuleId)?.id
                          }' level='${
                            rules.find((r) => r.id === selectedRuleId)?.level
                          }'>
  <if_sid>201</if_sid>
  <field name='data.status'>full</field>
  <description>${
    rules.find((r) => r.id === selectedRuleId)?.description
  }</description>
  <group>${rules
    .find((r) => r.id === selectedRuleId)
    ?.groups.join(",")}</group>
  <rule_id>${rules.find((r) => r.id === selectedRuleId)?.id}</rule_id>
  ${rules
    .find((r) => r.id === selectedRuleId)
    ?.compliance.map((c) => {
      if (c === "PCI_DSS") return "<pci_dss>10.6.1</pci_dss>";
      if (c === "GDPR") return "<gdpr>IV_35.7.d</gdpr>";
      return "";
    })
    .join("\n  ")}
</rule>`
                        : ""
                    }
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddRuleDialogOpen(false)}
              className="border-zinc-700 hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              {selectedRuleId ? "Update Rule" : "Add Rule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activate Windows Notice - Modeled after what was in the screenshot */}
      <div className="fixed bottom-0 right-0 bg-zinc-800/80 backdrop-blur-sm text-zinc-200 p-4 shadow-lg rounded-tl-md">
        <div className="flex flex-col items-end">
          <h3 className="text-lg font-medium">Activate Windows</h3>
          <p className="text-sm text-zinc-400">
            Go to Settings to activate Windows
          </p>
        </div>
      </div>
    </div>
  );
}