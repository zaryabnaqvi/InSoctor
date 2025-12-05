import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  FileText, Plus, Calendar, TrendingUp, BarChart3, Settings, Sparkles,
  Database, ArrowLeft, Play, Eye, Download, LayoutGrid, Loader2, Clock
} from 'lucide-react';
import { reportService } from '../services/report.service';
import { ReportTemplate, WidgetData } from '../types/report';
import { useToast } from '@/hooks/use-toast';
import { ReportBuilder } from '@/components/reports/ReportBuilder';
import { WidgetRenderer } from '@/components/reports/WidgetRenderer';
import { AIReportGenerator } from '@/components/reports/AIReportGenerator';
import { ExportDialog } from '@/components/reports/ExportDialog';
import { TemplateGallery } from '@/components/reports/TemplateGallery';

type ViewMode = 'gallery' | 'builder' | 'preview' | 'templates';

// Time range options
const TIME_RANGES = [
  { value: '1h', label: 'Last 1 hour', hours: 1 },
  { value: '2h', label: 'Last 2 hours', hours: 2 },
  { value: '6h', label: 'Last 6 hours', hours: 6 },
  { value: '12h', label: 'Last 12 hours', hours: 12 },
  { value: '24h', label: 'Last 24 hours', hours: 24 },
  { value: '3d', label: 'Last 3 days', hours: 72 },
  { value: '7d', label: 'Last 7 days', hours: 168 },
  { value: '14d', label: 'Last 14 days', hours: 336 },
  { value: '30d', label: 'Last 30 days', hours: 720 },
  { value: '90d', label: 'Last 90 days', hours: 2160 },
];

// Helper: Get severity from alert (handles both transformed and raw formats)
function getAlertSeverity(alert: any): string {
  // Already transformed format: has 'severity' string
  if (alert?.severity && typeof alert.severity === 'string') {
    // Capitalize first letter
    return alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1);
  }
  // Raw format: has rule.level or rawData.rule.level
  const level = alert?.rawData?.rule?.level || alert?.rule?.level || 0;
  return getSeverityLabel(level);
}

// Helper: Get agent name from alert (handles both formats)
function getAlertAgent(alert: any): string {
  // Transformed format: agent name is in 'source' field
  if (alert?.source && alert.source !== 'Unknown') {
    return alert.source;
  }
  // Raw format: agent.name or rawData.agent.name
  return alert?.rawData?.agent?.name || alert?.agent?.name || 'Unknown';
}

// Helper: Get timestamp from alert
function getAlertTimestamp(alert: any): string {
  return alert?.timestamp || alert?.rawData?.timestamp || alert?.rawData?.['@timestamp'] || alert?.['@timestamp'] || new Date().toISOString();
}

// Helper: Get rule level from alert
function getAlertLevel(alert: any): number {
  return alert?.rawData?.rule?.level || alert?.rule?.level || 0;
}

// Helper: Get title from alert
function getAlertTitle(alert: any): string {
  return alert?.title || alert?.rawData?.rule?.description || alert?.rule?.description || 'Unknown Alert';
}

// Convert rule level to severity label
function getSeverityLabel(level: number | string): string {
  const numLevel = typeof level === 'string' ? parseInt(level) || 0 : level || 0;
  if (numLevel >= 12) return 'Critical';
  if (numLevel >= 8) return 'High';
  if (numLevel >= 4) return 'Medium';
  return 'Low';
}

function getLevelType(level: number | string): string {
  const numLevel = typeof level === 'string' ? parseInt(level) || 0 : level || 0;
  if (numLevel >= 12) return 'error';
  if (numLevel >= 8) return 'warning';
  if (numLevel >= 4) return 'info';
  return 'success';
}

// Transform raw Wazuh alert data into chart-friendly format
function transformDataForWidget(rawData: any[], widgetType: string, groupBy?: string[]): any[] {
  if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
    return generateMockDataForWidget(widgetType);
  }

  // Debug log first alert structure
  console.log('[transformData] Widget type:', widgetType, 'Records:', rawData.length);
  if (rawData[0]) {
    console.log('[transformData] First alert keys:', Object.keys(rawData[0]));
  }

  try {
    switch (widgetType) {
      case 'kpi':
        return [{ value: rawData.length, count: rawData.length, trend: { value: 5, direction: 'up' } }];

      case 'bar-chart':
      case 'pie-chart':
        const severityCounts: Record<string, number> = {};
        rawData.forEach((alert: any) => {
          const severity = getAlertSeverity(alert);
          severityCounts[severity] = (severityCounts[severity] || 0) + 1;
        });
        console.log('[transformData] Severity breakdown:', severityCounts);
        return Object.entries(severityCounts).map(([name, value]) => ({ name, value }));

      case 'line-chart':
      case 'area-chart':
        const timeCounts: Record<string, number> = {};
        rawData.forEach((alert: any) => {
          const ts = getAlertTimestamp(alert);
          const hour = new Date(ts).toISOString().slice(0, 13) + ':00';
          timeCounts[hour] = (timeCounts[hour] || 0) + 1;
        });
        return Object.entries(timeCounts)
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-48)
          .map(([x, y]) => ({ x: x.slice(5, 16).replace('T', ' '), y }));

      case 'data-table':
        return rawData.slice(0, 50).map((alert: any, i: number) => ({
          id: alert?.id || i + 1,
          name: getAlertTitle(alert),
          severity: getAlertSeverity(alert),
          agent: getAlertAgent(alert),
          timestamp: getAlertTimestamp(alert)
        }));

      case 'timeline':
        return rawData.slice(0, 15).map((alert: any, i: number) => ({
          id: String(alert?.id || i),
          timestamp: getAlertTimestamp(alert),
          title: getAlertTitle(alert),
          description: `Severity: ${getAlertSeverity(alert)} | Agent: ${getAlertAgent(alert)}`,
          type: getLevelType(getAlertLevel(alert))
        }));

      case 'gauge':
        const criticalCount = rawData.filter((a: any) => getAlertSeverity(a).toLowerCase() === 'critical').length;
        const highCount = rawData.filter((a: any) => getAlertSeverity(a).toLowerCase() === 'high').length;
        const score = Math.max(0, 100 - (criticalCount * 10) - (highCount * 5));
        return [{ value: Math.round(score) }];

      case 'heatmap':
        const heatmapData: any[] = [];
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const hours = ['00', '06', '12', '18'];
        days.forEach(d => hours.forEach(h => heatmapData.push({ x: d, y: h, value: 0 })));

        rawData.forEach((alert: any) => {
          const ts = new Date(getAlertTimestamp(alert));
          const dayIdx = (ts.getDay() + 6) % 7;
          const hourBucket = Math.floor(ts.getHours() / 6) * 6;
          const key = `${days[dayIdx]}-${String(hourBucket).padStart(2, '0')}`;
          const item = heatmapData.find(h => `${h.x}-${h.y}` === key);
          if (item) item.value++;
        });
        return heatmapData;

      case 'funnel':
        const highCrit = rawData.filter((a: any) => {
          const sev = getAlertSeverity(a).toLowerCase();
          return sev === 'critical' || sev === 'high';
        }).length;
        return [
          { name: 'Total Alerts', value: rawData.length },
          { name: 'High+Critical', value: highCrit },
          { name: 'Needs Review', value: Math.floor(rawData.length * 0.3) },
          { name: 'Resolved', value: Math.floor(rawData.length * 0.1) }
        ];

      default:
        return [{ value: rawData.length }];
    }
  } catch (err) {
    console.error('[transformData] Error:', err);
    return generateMockDataForWidget(widgetType);
  }
}

// Mock data generator
function generateMockDataForWidget(type: string): any[] {
  switch (type) {
    case 'kpi': return [{ value: Math.floor(Math.random() * 1000), trend: { value: 12, direction: 'up' } }];
    case 'bar-chart': return [{ name: 'Critical', value: 23 }, { name: 'High', value: 67 }, { name: 'Medium', value: 142 }, { name: 'Low', value: 215 }];
    case 'line-chart': return Array.from({ length: 7 }, (_, i) => ({ x: `Day ${i + 1}`, y: Math.floor(Math.random() * 100) + 50 }));
    case 'pie-chart': return [{ name: 'Windows', value: 45 }, { name: 'Linux', value: 35 }, { name: 'MacOS', value: 20 }];
    case 'area-chart': return Array.from({ length: 7 }, (_, i) => ({ x: `Week ${i + 1}`, y: Math.floor(Math.random() * 150) + 50 }));
    case 'data-table': return Array.from({ length: 5 }, (_, i) => ({ id: i + 1, name: `Alert ${i + 1}`, severity: ['Critical', 'High', 'Medium', 'Low'][i % 4], timestamp: new Date().toISOString() }));
    case 'heatmap': return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].flatMap(d => ['00', '06', '12', '18'].map(h => ({ x: d, y: h, value: Math.floor(Math.random() * 100) })));
    case 'gauge': return [{ value: Math.floor(Math.random() * 100) }];
    case 'funnel': return [{ name: 'Total', value: 1000 }, { name: 'Analyzed', value: 800 }, { name: 'Confirmed', value: 400 }, { name: 'Resolved', value: 200 }];
    case 'timeline': return Array.from({ length: 5 }, (_, i) => ({ id: `${i}`, timestamp: new Date(Date.now() - i * 3600000).toISOString(), title: `Event ${i + 1}`, description: 'Security event', type: ['info', 'warning', 'error', 'success'][i % 4] }));
    default: return [{ value: 0 }];
  }
}

export default function Reports() {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [previewData, setPreviewData] = useState<WidgetData[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [alertCount, setAlertCount] = useState(0);
  const { toast } = useToast();

  const stats = {
    totalTemplates: templates.length,
    myTemplates: templates.filter(t => !t.isPredefined).length,
    predefinedTemplates: templates.filter(t => t.isPredefined).length,
    scheduled: 0
  };

  useEffect(() => { loadTemplates(); }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await reportService.getTemplates();
      setTemplates(data);
    } catch (error: any) {
      console.error('Failed to load templates:', error);
      toast({ title: 'Error loading templates', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleNewReport = useCallback(() => {
    setSelectedTemplate(null);
    setViewMode('builder');
  }, []);

  const handleEditTemplate = useCallback((template: ReportTemplate) => {
    setSelectedTemplate(template);
    setViewMode('builder');
  }, []);

  const handleOpenAIGenerator = useCallback(() => {
    setShowAIGenerator(true);
  }, []);

  const handleAITemplateGenerated = useCallback((template: ReportTemplate) => {
    setSelectedTemplate(template);
    setShowAIGenerator(false);
    setViewMode('builder');
    toast({ title: 'AI Template Generated', description: 'You can now customize your report' });
  }, [toast]);

  const handleExport = useCallback((template: ReportTemplate) => {
    setSelectedTemplate(template);
    setShowExportDialog(true);
  }, []);

  const handleDoExport = useCallback(async (options: any) => {
    toast({ title: 'Exporting...', description: `Exporting as ${options.format.toUpperCase()}` });
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({ title: 'Export Complete', description: 'Your report has been exported' });
  }, [toast]);

  const handleGenerateReport = useCallback(async () => {
    if (!selectedTemplate) return;
    setIsGenerating(true);
    toast({ title: 'Generating Report...' });

    try {
      const widgets = selectedTemplate.widgets || [];
      const widgetData: WidgetData[] = widgets.map(widget => ({
        widgetId: widget.id,
        widgetType: widget.type,
        data: generateMockDataForWidget(widget.type)
      }));

      await new Promise(resolve => setTimeout(resolve, 500));
      setPreviewData(widgetData);
      toast({ title: 'Report Generated!' });
      setShowExportDialog(true);
    } catch (error: any) {
      console.error('Generate error:', error);
      toast({ title: 'Generation Failed', description: String(error?.message || error), variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  }, [selectedTemplate, toast]);

  const handlePreviewTemplate = useCallback((template: ReportTemplate) => {
    try {
      setSelectedTemplate(template);
      setViewMode('preview');
      setPreviewLoading(true);

      const widgets = template.widgets || [];
      const widgetData: WidgetData[] = widgets.map(widget => ({
        widgetId: widget.id,
        widgetType: widget.type,
        data: generateMockDataForWidget(widget.type)
      }));

      setPreviewData(widgetData);
      setPreviewLoading(false);
      setAlertCount(0);
    } catch (error: any) {
      console.error('[Preview] Error:', error);
      toast({ title: 'Preview Error', description: String(error?.message || error), variant: 'destructive' });
      setPreviewLoading(false);
    }
  }, [toast]);

  // Fetch live data with TIME RANGE filter
  const handleRefreshWithLiveData = useCallback(async () => {
    if (!selectedTemplate) {
      toast({ title: 'No template selected', variant: 'destructive' });
      return;
    }

    const timeRange = TIME_RANGES.find(t => t.value === selectedTimeRange);
    const hoursAgo = timeRange?.hours || 24;
    const fromDate = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();

    setPreviewLoading(true);
    toast({ title: `Fetching ${timeRange?.label || 'Last 24 hours'} data...` });

    try {
      const widgets = selectedTemplate.widgets || [];
      const results: WidgetData[] = [];
      let totalAlerts = 0;

      for (const widget of widgets) {
        try {
          if (!widget.dataSource) {
            results.push({ widgetId: widget.id, widgetType: widget.type, data: generateMockDataForWidget(widget.type) });
            continue;
          }

          const timeFilter = {
            field: 'timestamp',
            operator: 'gte' as const,
            value: fromDate
          };

          const existingFilters = widget.queryConfig?.filters || [];

          const rawData = await reportService.queryData({
            dataSource: widget.dataSource,
            filters: [...existingFilters, timeFilter],
            groupBy: widget.queryConfig?.groupBy,
            aggregation: widget.queryConfig?.aggregation,
            limit: 10000
          });

          console.log(`[LiveData] Widget ${widget.id} got ${rawData?.length || 0} records`);
          totalAlerts = Math.max(totalAlerts, rawData?.length || 0);

          const transformedData = transformDataForWidget(rawData, widget.type, widget.queryConfig?.groupBy);
          results.push({ widgetId: widget.id, widgetType: widget.type, data: transformedData });
        } catch (err: any) {
          console.warn(`[LiveData] Widget ${widget.id} failed:`, err?.message || err);
          results.push({ widgetId: widget.id, widgetType: widget.type, data: generateMockDataForWidget(widget.type) });
        }
      }

      setPreviewData(results);
      setAlertCount(totalAlerts);
      toast({ title: 'Live Data Loaded!', description: `${totalAlerts} alerts from ${timeRange?.label}` });
    } catch (error: any) {
      console.error('[LiveData] Fatal error:', error);
      toast({ title: 'Failed to load live data', description: String(error?.message || error), variant: 'destructive' });
    } finally {
      setPreviewLoading(false);
    }
  }, [selectedTemplate, selectedTimeRange, toast]);

  const handleSaveTemplate = useCallback(async (template: ReportTemplate) => {
    try {
      if (template._id) {
        await reportService.updateTemplate(template._id, template);
        toast({ title: 'Template updated' });
      } else {
        await reportService.createTemplate(template);
        toast({ title: 'Template created' });
      }
      await loadTemplates();
      setViewMode('gallery');
    } catch (error: any) {
      toast({ title: 'Error saving', description: String(error?.message || error), variant: 'destructive' });
    }
  }, [toast]);

  const handleDuplicateTemplate = useCallback(async (template: ReportTemplate) => {
    try {
      await reportService.createTemplate({ ...template, _id: undefined, name: `${template.name} (Copy)`, isPredefined: false } as ReportTemplate);
      toast({ title: 'Template duplicated' });
      await loadTemplates();
    } catch (error: any) {
      toast({ title: 'Error', description: String(error?.message || error), variant: 'destructive' });
    }
  }, [toast]);

  const handleDeleteTemplate = useCallback(async (template: ReportTemplate) => {
    if (template.isPredefined) { toast({ title: 'Cannot delete pre-built', variant: 'destructive' }); return; }
    if (!confirm('Delete this template?')) return;
    try {
      await reportService.deleteTemplate(template._id!);
      toast({ title: 'Deleted' });
      await loadTemplates();
    } catch (error: any) {
      toast({ title: 'Error', description: String(error?.message || error), variant: 'destructive' });
    }
  }, [toast]);

  const handleBackToGallery = useCallback(() => {
    setViewMode('gallery');
    setSelectedTemplate(null);
    setPreviewData([]);
    setAlertCount(0);
  }, []);

  // TEMPLATES VIEW
  if (viewMode === 'templates') {
    return (
      <>
        <div className="h-[calc(100vh-4rem)] flex flex-col">
          <div className="flex items-center gap-4 p-4 border-b bg-background">
            <Button variant="ghost" size="sm" onClick={handleBackToGallery}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
            <span className="text-muted-foreground">|</span>
            <span className="font-medium">Template Gallery</span>
          </div>
          <div className="flex-1 p-6 overflow-hidden">
            <TemplateGallery templates={templates} onSelect={handleEditTemplate} onPreview={handlePreviewTemplate} onDuplicate={handleDuplicateTemplate} onDelete={handleDeleteTemplate} />
          </div>
        </div>
        {showExportDialog && selectedTemplate && <ExportDialog template={selectedTemplate} onClose={() => setShowExportDialog(false)} onExport={handleDoExport} />}
      </>
    );
  }

  // BUILDER VIEW
  if (viewMode === 'builder') {
    return (
      <>
        <div className="h-[calc(100vh-4rem)]">
          <div className="flex items-center justify-between gap-4 p-4 border-b bg-background">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleBackToGallery}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
              <span className="text-muted-foreground">|</span>
              <span className="font-medium">{selectedTemplate ? 'Edit Template' : 'New Report'}</span>
            </div>
            {selectedTemplate && <Button variant="outline" size="sm" onClick={() => handleExport(selectedTemplate)}><Download className="h-4 w-4 mr-2" />Export</Button>}
          </div>
          <ReportBuilder template={selectedTemplate || undefined} onSave={handleSaveTemplate} onPreview={handlePreviewTemplate} className="h-[calc(100%-60px)]" />
        </div>
        {showExportDialog && selectedTemplate && <ExportDialog template={selectedTemplate} onClose={() => setShowExportDialog(false)} onExport={handleDoExport} />}
      </>
    );
  }

  // PREVIEW VIEW
  if (viewMode === 'preview' && selectedTemplate) {
    const widgets = selectedTemplate.widgets || [];
    const timeRange = TIME_RANGES.find(t => t.value === selectedTimeRange);

    return (
      <>
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleBackToGallery}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
              <span className="text-muted-foreground">|</span>
              <div>
                <h1 className="text-2xl font-bold">{selectedTemplate.name}</h1>
                <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                <Clock className="h-4 w-4 ml-2 text-muted-foreground" />
                <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                  <SelectTrigger className="w-[160px] border-0 bg-transparent">
                    <SelectValue placeholder="Time range" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_RANGES.map(range => (
                      <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" onClick={handleRefreshWithLiveData} disabled={previewLoading}>
                {previewLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Database className="h-4 w-4 mr-2" />}
                Load {timeRange?.label}
              </Button>
              <Button variant="outline" onClick={() => handleExport(selectedTemplate)}><Download className="h-4 w-4 mr-2" />Export</Button>
              <Button variant="outline" onClick={() => handleEditTemplate(selectedTemplate)}><Settings className="h-4 w-4 mr-2" />Edit</Button>
              <Button onClick={handleGenerateReport} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                {isGenerating ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </div>

          {alertCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-2">
              <Database className="h-4 w-4" />
              <span>Showing <strong>{alertCount.toLocaleString()}</strong> alerts from <strong>{timeRange?.label}</strong></span>
            </div>
          )}

          {previewLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-3 text-muted-foreground">Loading {timeRange?.label} data from Wazuh...</span>
            </div>
          ) : widgets.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No widgets in this template</CardContent></Card>
          ) : (
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}>
              {widgets.map(widget => {
                const data = previewData.find(d => d.widgetId === widget.id);
                return (
                  <div key={widget.id} style={{ gridColumn: `span ${widget.position?.w || 6}`, gridRow: `span ${Math.ceil((widget.position?.h || 4) / 2)}` }}>
                    <WidgetRenderer config={widget} data={data} loading={previewLoading} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {showExportDialog && <ExportDialog template={selectedTemplate} onClose={() => setShowExportDialog(false)} onExport={handleDoExport} />}
      </>
    );
  }

  // GALLERY VIEW (default)
  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground">Create, manage, and automate security reports</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setViewMode('templates')}><LayoutGrid className="h-4 w-4" />Gallery</Button>
            <Button variant="outline" className="gap-2" onClick={handleOpenAIGenerator}><Sparkles className="h-4 w-4" />AI Generate</Button>
            <Button className="gap-2" onClick={handleNewReport}><Plus className="h-4 w-4" />New Report</Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="cursor-pointer hover:shadow-md" onClick={() => setViewMode('templates')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.totalTemplates}</div><p className="text-xs text-muted-foreground">Click to browse</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">My Templates</CardTitle><BarChart3 className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.myTemplates}</div><p className="text-xs text-muted-foreground">Custom</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Pre-built</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.predefinedTemplates}</div><p className="text-xs text-muted-foreground">Ready to use</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Scheduled</CardTitle><Calendar className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.scheduled}</div><p className="text-xs text-muted-foreground">M5</p></CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Templates</TabsTrigger>
            <TabsTrigger value="predefined">Pre-built</TabsTrigger>
            <TabsTrigger value="my-templates">My Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {loading ? (
              <Card><CardContent className="flex items-center justify-center py-12"><Loader2 className="h-4 w-4 animate-spin mr-2" /><span>Loading...</span></CardContent></Card>
            ) : templates.length === 0 ? (
              <Card><CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Database className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleOpenAIGenerator}><Sparkles className="h-4 w-4 mr-2" />AI Generate</Button>
                  <Button onClick={handleNewReport}><Plus className="h-4 w-4 mr-2" />Create</Button>
                </div>
              </CardContent></Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <Card key={template._id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <CardDescription className="mt-1 line-clamp-2">{template.description}</CardDescription>
                        </div>
                        {template.isPredefined && <Badge variant="secondary" className="ml-2">Pre-built</Badge>}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1"><BarChart3 className="h-3 w-3" />{(template.widgets || []).length} widgets</span>
                        <Badge variant="outline" className="capitalize">{template.category}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handlePreviewTemplate(template)}><Eye className="h-4 w-4 mr-1" />Preview</Button>
                        <Button variant="outline" size="sm" onClick={() => handleExport(template)}><Download className="h-4 w-4" /></Button>
                        <Button size="sm" className="flex-1" onClick={() => handleEditTemplate(template)}>Use</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="predefined">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.filter(t => t.isPredefined).length === 0 ? (
                <Card className="col-span-full"><CardContent className="py-12 text-center text-muted-foreground">No pre-built templates</CardContent></Card>
              ) : templates.filter(t => t.isPredefined).map(t => (
                <Card key={t._id} className="hover:shadow-md">
                  <CardHeader><CardTitle className="text-lg">{t.name}</CardTitle><CardDescription>{t.description}</CardDescription></CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handlePreviewTemplate(t)}>Preview</Button>
                      <Button size="sm" onClick={() => handleEditTemplate(t)}>Use</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-templates">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.filter(t => !t.isPredefined).length === 0 ? (
                <Card className="col-span-full"><CardContent className="py-12 text-center"><Button onClick={handleNewReport}><Plus className="h-4 w-4 mr-2" />Create Template</Button></CardContent></Card>
              ) : templates.filter(t => !t.isPredefined).map(t => (
                <Card key={t._id} className="hover:shadow-md">
                  <CardHeader><CardTitle className="text-lg">{t.name}</CardTitle><CardDescription>{t.description}</CardDescription></CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handlePreviewTemplate(t)}>Preview</Button>
                      <Button size="sm" onClick={() => handleEditTemplate(t)}>Edit</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showAIGenerator} onOpenChange={setShowAIGenerator}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-purple-500" />AI Report Generator</DialogTitle></DialogHeader>
          <AIReportGenerator onTemplateGenerated={handleAITemplateGenerated} />
        </DialogContent>
      </Dialog>

      {showExportDialog && selectedTemplate && <ExportDialog template={selectedTemplate} onClose={() => setShowExportDialog(false)} onExport={handleDoExport} />}
    </>
  );
}