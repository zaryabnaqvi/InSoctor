import  { useState } from "react";
import {
  Search,
  Filter,
  PlusCircle,
  BarChart4,
  ChevronDown,
  RefreshCw,
  Clock,
  Calendar,
  MoreVertical,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import {
  Badge,
} from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Sample wazuh log data
const logData = [
  {
    time: "May 9, 2024 @ 10:44:30.633",
    source: "wazuh-archives-4-x-2024.05.09",
    clusternode: "node01",
    clustername: "wazuh",
    agentIp: "10.0.2.15",
    agentName: "Ubuntu22.04",
    agentId: "001",
    agentLabelsGroup: "Team_A",
    managername: "wazuh-server",
    decodername: "ossec",
    fullLog: "df -P: overlay 31811408 5892340 24277596 20% /var/lib/docker/overlay2/63dc5d794e794a0a59f8b1ed85976957e1ff8b1478f334916608462d97972e/merged",
    inputType: "log",
    timestamp: "May 9, 2024 @ 10:44:30.631",
    location: "df -P",
    id: "1715262270.2434987"
  },
  {
    time: "May 9, 2024 @ 10:44:30.631",
    source: "wazuh-archives-4-x-2024.05.09",
    clusternode: "node01",
    clustername: "wazuh",
    agentIp: "10.0.2.15",
    agentName: "Ubuntu22.04",
    agentId: "001",
    agentLabelsGroup: "Team_A",
    managername: "wazuh-server",
    decodername: "ossec",
    fullLog: "df -P: overlay 31811408 5892340 24277596 20% /var/lib/docker/overlay2/63dc5d794e794a0a59f8b1ed85976957e1ff8b1478f334916608462d97972e/merged",
    inputType: "log",
    timestamp: "May 9, 2024 @ 10:44:30.631",
    location: "df -P",
    id: "1715262270.2434987"
  },
  {
    time: "May 9, 2024 @ 10:44:30.629",
    source: "wazuh-archives-4-x-2024.05.09",
    clusternode: "node01",
    clustername: "wazuh",
    agentIp: "10.0.2.15",
    agentName: "Ubuntu22.04",
    agentId: "001",
    agentLabelsGroup: "Team_A",
    managername: "wazuh-server",
    decodername: "ossec",
    fullLog: "df -P: overlay 31811408 5892340 24277596 20% /var/lib/docker/overlay2/2ba1c744e3ea9a219ba51cce1c37d88812ea8996e58b2bd948c96f2c3fd2c01d/merged",
    inputType: "log",
    timestamp: "May 9, 2024 @ 10:44:30.629",
    location: "df -P",
    id: "1715262270.2434987"
  },
  {
    time: "May 9, 2024 @ 10:44:30.627",
    source: "wazuh-archives-4-x-2024.05.09",
    clusternode: "node01",
    clustername: "wazuh",
    agentIp: "10.0.2.15",
    agentName: "Ubuntu22.04",
    agentId: "001",
    agentLabelsGroup: "Team_A",
    managername: "wazuh-server",
    decodername: "ossec",
    fullLog: "df -P: overlay 31811408 5892340 24277596 20% /var/lib/docker/overlay2/35b3ec75e9d38a4edc77991ffa9c7d0e4af1b7c11dc68f7f8e5dd5d87ff3c391/merged",
    inputType: "log", 
    timestamp: "May 9, 2024 @ 10:44:30.627",
    location: "df -P",
    id: "1715262270.2434987"
  },
  {
    time: "May 9, 2024 @ 10:44:30.625",
    source: "wazuh-archives-4-x-2024.05.09",
    clusternode: "node01",
    clustername: "wazuh",
    agentIp: "10.0.2.15",
    agentName: "Ubuntu22.04",
    agentId: "001",
    agentLabelsGroup: "Team_A",
    managername: "wazuh-server",
    decodername: "ossec",
    fullLog: "df -P: vvagrant-ts8097f84.445270344.432844440.92% /vagrant",
    inputType: "log",
    timestamp: "May 9, 2024 @ 10:44:30.625",
    location: "df -P",
    id: "1715262270.2434987"
  }
];

// Sample chart data based on timestamps
const chartData = [
  { time: "12:00", count: 1200 },
  { time: "13:00", count: 1500 },
  { time: "14:00", count: 800 },
  { time: "15:00", count: 1800 },
  { time: "16:00", count: 1300 },
  { time: "17:00", count: 1700 },
  { time: "18:00", count: 2100 },
  { time: "19:00", count: 1600 },
  { time: "20:00", count: 2300 },
  { time: "21:00", count: 3100 },
  { time: "22:00", count: 2800 },
  { time: "23:00", count: 3700 },
  { time: "00:00", count: 4200 },
  { time: "01:00", count: 5100 },
  { time: "02:00", count: 6300 },
  { time: "03:00", count: 7800 },
  { time: "04:00", count: 6800 },
  { time: "05:00", count: 5300 },
  { time: "06:00", count: 800 },
  { time: "07:00", count: 400 },
  { time: "08:00", count: 200 },
  { time: "09:00", count: 1500 }
];

// Available fields for selection
const availableFields = [
  { name: "_index", type: "t" },
  { name: "@timestamp", type: "t" },
  { name: "agent.id", type: "t" },
  { name: "agent.ip", type: "t" },
  { name: "agent.name", type: "t" },
  { name: "clustername", type: "t" },
  { name: "clusternode", type: "t" },
  { name: "data.audit.arch", type: "t" },
  { name: "data.audit.auid", type: "t" },
  { name: "data.audit.command", type: "t" },
  { name: "data.audit.cwd", type: "t" },
  { name: "data.audit.directory.inode", type: "t" },
  { name: "data.audit.directory.mode", type: "t" }
];

export default function EDRLogsDashboard() {
  const [selectedFields, setSelectedFields] = useState(["_source"]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  
  // Chart component that resembles the histogram in the image
  const SimpleChart = () => {
    const maxValue = Math.max(...chartData.map(item => item.count));
    
    return (
      <div className="h-64 w-full flex items-end space-x-1">
        {chartData.map((bar, index) => {
          const height = (bar.count / maxValue) * 100;
          return (
            <div key={index} className="flex flex-col items-center flex-grow">
              <div 
                className="bg-teal-500 w-full rounded-t-sm" 
                style={{ height: `${height}%` }}
              ></div>
              {index % 3 === 0 && (
                <span className="text-xs text-gray-400 mt-1">{bar.time}</span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-slate-950 text-slate-200 min-h-screen">
      <div className="container mx-auto p-4">
        {/* Discover/Search Bar */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative w-64 border border-slate-700 rounded-md flex items-center px-2">
            <span className="text-gray-400">wazuh-archives-*</span>
            <ChevronDown className="h-4 w-4 ml-2 text-gray-400" />
          </div>
          
          <div className="relative flex-1 flex items-center">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input 
              className="pl-10 bg-slate-900 border-slate-700" 
              placeholder="Search" 
            />
          </div>
          
          <Select defaultValue="24hours">
            <SelectTrigger className="w-40 bg-slate-900 border-slate-700">
              <SelectValue placeholder="Last 24 hours" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="24hours">Last 24 hours</SelectItem>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="bg-slate-900 border-slate-700 text-slate-200">
            Show dates
          </Button>
          
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        {/* Filter Bar */}
        <div className="flex items-center mb-4">
          <Button variant="ghost" className="flex items-center text-blue-400">
            <PlusCircle className="h-4 w-4 mr-1" />
            Add filter
          </Button>
        </div>
        
        {/* Main Content Area */}
        <div className="flex gap-4">
          {/* Left Sidebar */}
          <div className="w-72 bg-slate-900 rounded-lg border border-slate-800 p-4">
            <div className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input 
                  className="pl-10 bg-slate-800 border-slate-700" 
                  placeholder="Search field names" 
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Filter by type</span>
              <Badge className="bg-slate-700 text-slate-200">3</Badge>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Selected fields</h3>
              <div className="border border-slate-700 rounded-md p-2 mb-2">
                <div className="flex items-center text-sm">
                  <span className="w-6 text-slate-500">T</span>
                  <span className="flex-1">_source</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Available fields</h3>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {availableFields.map((field, index) => (
                  <div key={index} className="flex items-center justify-between border border-slate-700 rounded-md p-2">
                    <div className="flex items-center text-sm">
                      <span className="w-6 text-slate-500">{field.type}</span>
                      <span>{field.name}</span>
                    </div>
                    <div className="flex">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Search className="h-4 w-4 text-blue-400" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <PlusCircle className="h-4 w-4 text-blue-400" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            {/* Stats and Chart */}
            <Card className="mb-4 bg-slate-900 border-slate-800">
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold">82,422 hits</div>
                  <div className="text-sm text-slate-400">
                    May 8, 2024 @ 10:44:39.935 - May 9, 2024 @ 10:44:39.935 per
                    <Select defaultValue="auto">
                      <SelectTrigger className="w-24 ml-2 h-7 bg-slate-800 border-slate-700">
                        <SelectValue placeholder="Auto" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="minute">Minute</SelectItem>
                        <SelectItem value="hour">Hour</SelectItem>
                        <SelectItem value="day">Day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <SimpleChart />
                
                <div className="text-center text-sm text-slate-400 mt-2">
                  timestamp per 30 minutes
                </div>
              </CardContent>
            </Card>
            
            {/* Logs Table */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="px-4 py-2 border-b border-slate-800">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" className="text-slate-400">
                      <BarChart4 className="h-4 w-4 mr-1" />
                      Columns
                    </Button>
                    <Button variant="ghost" size="sm" className="text-slate-400">
                      <Filter className="h-4 w-4 mr-1" />
                      Sort fields
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-slate-800">
                    <TableHead className="font-medium">
                      Time (timestamp)
                      <ChevronDown className="inline h-4 w-4 ml-1" />
                    </TableHead>
                    <TableHead className="font-medium">Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logData.map((log, index) => (
                    <TableRow 
                      key={index} 
                      className="border-slate-800 hover:bg-slate-800"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Button variant="ghost" size="sm" className="p-0 mr-2">
                            <Search className="h-4 w-4 text-blue-400" />
                          </Button>
                          {log.time}
                        </div>
                      </TableCell>
                      <TableCell className="w-full">
                        <div className="grid grid-cols-6 gap-1 text-xs">
                          <span className="flex items-center">
                            <span className="font-medium text-slate-400 mr-1">clusternode:</span>
                            {log.clusternode}
                          </span>
                          <span className="flex items-center">
                            <span className="font-medium text-slate-400 mr-1">clustername:</span>
                            {log.clustername}
                          </span>
                          <span className="flex items-center">
                            <span className="font-medium text-slate-400 mr-1">agent.ip:</span>
                            {log.agentIp}
                          </span>
                          <span className="flex items-center">
                            <span className="font-medium text-slate-400 mr-1">agent.name:</span>
                            {log.agentName}
                          </span>
                          <span className="flex items-center">
                            <span className="font-medium text-slate-400 mr-1">agent.id:</span>
                            {log.agentId}
                          </span>
                          <span className="flex items-center">
                            <span className="font-medium text-slate-400 mr-1">agent.labels.group:</span>
                            {log.agentLabelsGroup}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-1 text-xs mt-1">
                          <span className="flex items-center">
                            <span className="font-medium text-slate-400 mr-1">full_log:</span>
                            <span className="text-slate-300">{log.fullLog}</span>
                          </span>
                        </div>
                        <div className="grid grid-cols-6 gap-1 text-xs mt-1">
                          <span className="flex items-center">
                            <span className="font-medium text-slate-400 mr-1">input.type:</span>
                            {log.inputType}
                          </span>
                          <span className="flex items-center">
                            <span className="font-medium text-slate-400 mr-1">@timestamp:</span>
                            {log.timestamp}
                          </span>
                          <span className="flex items-center">
                            <span className="font-medium text-slate-400 mr-1">location:</span>
                            {log.location}
                          </span>
                          <span className="flex items-center">
                            <span className="font-medium text-slate-400 mr-1">id:</span>
                            {log.id}
                          </span>
                          <span className="flex items-center">
                            <span className="font-medium text-slate-400 mr-1">_index:</span>
                            {log.source}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-slate-800 p-2">
                <div className="flex items-center text-sm">
                  <span className="mr-2">Rows per page:</span>
                  <Select defaultValue="100">
                    <SelectTrigger className="w-16 h-8 bg-slate-800 border-slate-700">
                      <SelectValue placeholder="100" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="250">250</SelectItem>
                      <SelectItem value="500">500</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center">
                  <Button variant="ghost" size="sm" disabled>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={currentPage === 1 ? "secondary" : "ghost"}
                    size="sm"
                    className={currentPage === 1 ? "bg-slate-700" : ""}
                  >
                    1
                  </Button>
                  <Button variant="ghost" size="sm">2</Button>
                  <Button variant="ghost" size="sm">3</Button>
                  <Button variant="ghost" size="sm">4</Button>
                  <Button variant="ghost" size="sm">5</Button>
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}