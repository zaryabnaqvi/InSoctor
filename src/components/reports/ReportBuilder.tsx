import React, { useState, useCallback, useMemo } from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
import { Plus, Save, Eye, Download, Trash2, Settings, Grip, BarChart3, PieChart as PieIcon, LineChart as LineIcon, Table, Gauge, AreaChart as AreaIcon, Grid3X3, Activity, GitBranch, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WidgetRenderer } from './WidgetRenderer';
import type { WidgetConfig, WidgetType, ReportTemplate, ReportFilter } from '@/types/report';
import 'react-grid-layout/css/styles.css';

// Widget type definitions for the library
const WIDGET_TYPES: Array<{
    type: WidgetType;
    label: string;
    icon: React.ElementType;
    description: string;
    defaultSize: { w: number; h: number };
}> = [
        { type: 'kpi', label: 'KPI Card', icon: Gauge, description: 'Display a single metric', defaultSize: { w: 3, h: 2 } },
        { type: 'bar-chart', label: 'Bar Chart', icon: BarChart3, description: 'Compare categories', defaultSize: { w: 6, h: 4 } },
        { type: 'line-chart', label: 'Line Chart', icon: LineIcon, description: 'Show trends over time', defaultSize: { w: 6, h: 4 } },
        { type: 'pie-chart', label: 'Pie Chart', icon: PieIcon, description: 'Show proportions', defaultSize: { w: 4, h: 4 } },
        { type: 'area-chart', label: 'Area Chart', icon: AreaIcon, description: 'Stacked trends', defaultSize: { w: 6, h: 4 } },
        { type: 'data-table', label: 'Data Table', icon: Table, description: 'Display tabular data', defaultSize: { w: 12, h: 5 } },
        // Milestone 3 Advanced Widgets
        { type: 'heatmap', label: 'Heatmap', icon: Grid3X3, description: 'Pattern visualization', defaultSize: { w: 6, h: 5 } },
        { type: 'gauge', label: 'Gauge', icon: Activity, description: 'Meter with thresholds', defaultSize: { w: 4, h: 4 } },
        { type: 'funnel', label: 'Funnel', icon: GitBranch, description: 'Conversion stages', defaultSize: { w: 4, h: 5 } },
        { type: 'timeline', label: 'Timeline', icon: Clock, description: 'Event timeline', defaultSize: { w: 6, h: 5 } },
    ];


export interface ReportBuilderProps {
    template?: ReportTemplate;
    onSave?: (template: ReportTemplate) => void;
    onPreview?: (template: ReportTemplate) => void;
    className?: string;
}

export const ReportBuilder: React.FC<ReportBuilderProps> = ({
    template,
    onSave,
    onPreview,
    className,
}) => {
    const [widgets, setWidgets] = useState<WidgetConfig[]>(template?.widgets || []);
    const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
    const [templateName, setTemplateName] = useState(template?.name || 'Untitled Report');
    const [templateDescription, setTemplateDescription] = useState(template?.description || '');
    const [isDraggingNew, setIsDraggingNew] = useState(false);

    // Convert widgets to grid layout format
    const layout: Layout[] = useMemo(() =>
        widgets.map((widget) => ({
            i: widget.id,
            x: widget.position.x,
            y: widget.position.y,
            w: widget.position.w,
            h: widget.position.h,
            minW: 2,
            minH: 2,
        })),
        [widgets]
    );

    // Handle layout change
    const handleLayoutChange = useCallback((newLayout: Layout[]) => {
        setWidgets((prev) =>
            prev.map((widget) => {
                const layoutItem = newLayout.find((l) => l.i === widget.id);
                if (!layoutItem) return widget;
                return {
                    ...widget,
                    position: {
                        x: layoutItem.x,
                        y: layoutItem.y,
                        w: layoutItem.w,
                        h: layoutItem.h,
                    },
                };
            })
        );
    }, []);

    // Add new widget
    const handleAddWidget = useCallback((type: WidgetType) => {
        const widgetDef = WIDGET_TYPES.find((w) => w.type === type);
        if (!widgetDef) return;

        const newWidget: WidgetConfig = {
            id: `widget-${Date.now()}`,
            type,
            title: widgetDef.label,
            dataSource: 'wazuh-alerts',
            queryConfig: {
                filters: [],
                limit: 100,
            },
            position: {
                x: 0,
                y: Infinity, // Will be placed at bottom
                w: widgetDef.defaultSize.w,
                h: widgetDef.defaultSize.h,
            },
        };

        setWidgets((prev) => [...prev, newWidget]);
        setSelectedWidgetId(newWidget.id);
    }, []);

    // Delete widget
    const handleDeleteWidget = useCallback((widgetId: string) => {
        setWidgets((prev) => prev.filter((w) => w.id !== widgetId));
        if (selectedWidgetId === widgetId) {
            setSelectedWidgetId(null);
        }
    }, [selectedWidgetId]);

    // Build and save template
    const handleSave = useCallback(() => {
        const newTemplate: ReportTemplate = {
            _id: template?._id,
            name: templateName,
            description: templateDescription,
            category: template?.category || 'custom',
            widgets,
            layout: template?.layout || { columns: 12, rowHeight: 30 },
            isPublic: template?.isPublic || false,
            isPredefined: false,
            createdBy: template?.createdBy || '',
            createdAt: template?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: (template?.version || 0) + 1,
            tags: template?.tags || [],
        };
        onSave?.(newTemplate);
    }, [template, templateName, templateDescription, widgets, onSave]);

    // Preview template
    const handlePreview = useCallback(() => {
        const previewTemplate: ReportTemplate = {
            _id: template?._id,
            name: templateName,
            description: templateDescription,
            category: template?.category || 'custom',
            widgets,
            layout: template?.layout || { columns: 12, rowHeight: 30 },
            isPublic: false,
            isPredefined: false,
            createdBy: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
        };
        onPreview?.(previewTemplate);
    }, [template, templateName, templateDescription, widgets, onPreview]);

    const selectedWidget = widgets.find((w) => w.id === selectedWidgetId);

    return (
        <div className={cn('flex h-full bg-slate-100 dark:bg-slate-950', className)}>
            {/* Left Sidebar - Widget Library */}
            <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="font-semibold text-slate-900 dark:text-white">Widget Library</h2>
                    <p className="text-xs text-slate-500 mt-1">Click to add widgets to your report</p>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {WIDGET_TYPES.map((widgetType) => (
                        <button
                            key={widgetType.type}
                            onClick={() => handleAddWidget(widgetType.type)}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40">
                                    <widgetType.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{widgetType.label}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{widgetType.description}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Canvas */}
            <div className="flex-1 flex flex-col">
                {/* Toolbar */}
                <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <input
                            type="text"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-0 text-slate-900 dark:text-white"
                            placeholder="Report Name"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePreview}
                            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-2"
                        >
                            <Eye className="w-4 h-4" />
                            Preview
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            Save
                        </button>
                    </div>
                </div>

                {/* Grid Canvas */}
                <div className="flex-1 overflow-auto p-6">
                    {widgets.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                    <Plus className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white">No widgets yet</h3>
                                <p className="text-sm text-slate-500 mt-1">Click on a widget type in the left sidebar to add it to your report</p>
                            </div>
                        </div>
                    ) : (
                        <GridLayout
                            className="layout"
                            layout={layout}
                            cols={12}
                            rowHeight={30}
                            width={1200}
                            onLayoutChange={handleLayoutChange}
                            draggableHandle=".widget-drag-handle"
                            compactType="vertical"
                            preventCollision={false}
                            margin={[16, 16]}
                        >
                            {widgets.map((widget) => (
                                <div
                                    key={widget.id}
                                    className={cn(
                                        'bg-white dark:bg-slate-900 rounded-xl shadow-sm border-2 overflow-hidden',
                                        selectedWidgetId === widget.id
                                            ? 'border-blue-500'
                                            : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                                    )}
                                    onClick={() => setSelectedWidgetId(widget.id)}
                                >
                                    {/* Widget Header */}
                                    <div className="widget-drag-handle flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800 cursor-move">
                                        <div className="flex items-center gap-2">
                                            <Grip className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{widget.title}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedWidgetId(widget.id);
                                                }}
                                                className="p-1 text-slate-400 hover:text-blue-500 rounded"
                                            >
                                                <Settings className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteWidget(widget.id);
                                                }}
                                                className="p-1 text-slate-400 hover:text-red-500 rounded"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    {/* Widget Content */}
                                    <div className="p-2 h-[calc(100%-40px)]">
                                        <WidgetRenderer
                                            config={widget}
                                            loading={false}
                                            className="h-full border-0 shadow-none"
                                        />
                                    </div>
                                </div>
                            ))}
                        </GridLayout>
                    )}
                </div>
            </div>

            {/* Right Sidebar - Widget Config */}
            {selectedWidget && (
                <div className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <h2 className="font-semibold text-slate-900 dark:text-white">Widget Settings</h2>
                        <button
                            onClick={() => setSelectedWidgetId(null)}
                            className="text-slate-400 hover:text-slate-600"
                        >
                            ×
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Title
                            </label>
                            <input
                                type="text"
                                value={selectedWidget.title}
                                onChange={(e) => {
                                    setWidgets((prev) =>
                                        prev.map((w) =>
                                            w.id === selectedWidget.id ? { ...w, title: e.target.value } : w
                                        )
                                    );
                                }}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Data Source
                            </label>
                            <select
                                value={selectedWidget.dataSource}
                                onChange={(e) => {
                                    setWidgets((prev) =>
                                        prev.map((w) =>
                                            w.id === selectedWidget.id ? { ...w, dataSource: e.target.value as any } : w
                                        )
                                    );
                                }}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="wazuh-alerts">Wazuh Alerts</option>
                                <option value="wazuh-agents">Wazuh Agents</option>
                                <option value="wazuh-rules">Wazuh Rules</option>
                                <option value="iris-cases">IRIS Cases</option>
                                <option value="vulnerabilities">Vulnerabilities</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Widget Type
                            </label>
                            <select
                                value={selectedWidget.type}
                                onChange={(e) => {
                                    setWidgets((prev) =>
                                        prev.map((w) =>
                                            w.id === selectedWidget.id ? { ...w, type: e.target.value as WidgetType } : w
                                        )
                                    );
                                }}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {WIDGET_TYPES.map((wt) => (
                                    <option key={wt.type} value={wt.type}>{wt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportBuilder;
