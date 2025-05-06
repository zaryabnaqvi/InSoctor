import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, LineChart, PieChart } from '@/components/ui/chart';
import { useEffect, useState } from 'react';

// Mock data for security statistics
const alertsByTypeData = [
  { name: 'Malware', value: 35 },
  { name: 'Phishing', value: 25 },
  { name: 'Exploits', value: 20 },
  { name: 'Suspicious', value: 15 },
  { name: 'Other', value: 5 }
];

const alertsOverTimeData = [
  { date: '2023-01', Critical: 5, High: 15, Medium: 25, Low: 35 },
  { date: '2023-02', Critical: 7, High: 17, Medium: 22, Low: 34 },
  { date: '2023-03', Critical: 10, High: 20, Medium: 30, Low: 40 },
  { date: '2023-04', Critical: 8, High: 18, Medium: 28, Low: 38 },
  { date: '2023-05', Critical: 12, High: 22, Medium: 32, Low: 42 },
  { date: '2023-06', Critical: 9, High: 19, Medium: 29, Low: 39 },
  { date: '2023-07', Critical: 11, High: 21, Medium: 31, Low: 41 },
];

const vulnerabilityData = [
  { name: 'Critical', count: 12 },
  { name: 'High', count: 24 },
  { name: 'Medium', count: 48 },
  { name: 'Low', count: 65 },
];

export function SecurityStats() {
  const [activeTab, setActiveTab] = useState('alerts');
  const [chartData, setChartData] = useState<any[]>([]);
  
  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      if (activeTab === 'alerts') {
        setChartData(alertsOverTimeData);
      } else if (activeTab === 'vulnerabilities') {
        setChartData(vulnerabilityData);
      } else if (activeTab === 'types') {
        setChartData(alertsByTypeData);
      }
    }, 300);
  }, [activeTab]);

  return (
    <Card className="col-span-full md:col-span-2">
      <CardHeader>
        <CardTitle>Security Analytics</CardTitle>
        <CardDescription>Analyze trends and patterns in security data</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="alerts" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="alerts">Alerts Over Time</TabsTrigger>
            <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
            <TabsTrigger value="types">Alert Types</TabsTrigger>
          </TabsList>
          
          <TabsContent value="alerts" className="h-[300px]">
            <LineChart 
              data={chartData}
              categories={['Critical', 'High', 'Medium', 'Low']}
              index="date"
              colors={['#e11d48', '#f97316', '#eab308', '#22c55e']}
              valueFormatter={(value: number) => `${value} alerts`}
              showLegend
              showXAxis
              showYAxis
              showGridLines
            />
          </TabsContent>
          
          <TabsContent value="vulnerabilities" className="h-[300px]">
            <BarChart
              data={chartData}
              index="name"
              categories={['count']}
              colors={['#0ea5e9']}
              valueFormatter={(value: number) => `${value} vulnerabilities`}
              showLegend={false}
              showXAxis
              showYAxis
              showGridLines
            />
          </TabsContent>
          
          <TabsContent value="types" className="h-[300px]">
            <PieChart
              data={chartData}
              index="name"
              categories={['value']}
              colors={['#e11d48', '#f97316', '#0ea5e9', '#22c55e', '#a855f7']}
              valueFormatter={(value: number) => `${value}%`}
              showLegend
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}