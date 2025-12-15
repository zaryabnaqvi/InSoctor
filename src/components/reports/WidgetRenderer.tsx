import React from 'react';
import { KPICard, DataTable, BarChart, LineChart, PieChart, AreaChart, HeatmapChart, GaugeChart, FunnelChart, TimelineChart } from './widgets';
import type { WidgetConfig, WidgetData } from '@/types/report';
import { cn } from '@/lib/utils';

export interface WidgetRendererProps {
    config: WidgetConfig;
    data?: WidgetData;
    loading?: boolean;
    error?: string;
    onEdit?: () => void;
    onDelete?: () => void;
    className?: string;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({
    config,
    data,
    loading = false,
    error,
    onEdit,
    onDelete,
    className,
}) => {
    const widgetData = data?.data || [];

    if (error) {
        return (
            <div className={cn(
                'bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-red-200 dark:border-red-800 p-5',
                className
            )}>
                <div className="text-center">
                    <p className="text-red-500 font-medium">{config.title}</p>
                    <p className="text-sm text-red-400 mt-1">{error}</p>
                </div>
            </div>
        );
    }

    switch (config.type) {
        case 'kpi':
            const kpiValue = widgetData.length > 0 ? widgetData[0] : { value: 0 };
            return (
                <KPICard
                    title={config.title}
                    value={kpiValue.value ?? kpiValue.count ?? 0}
                    trend={kpiValue.trend}
                    sparklineData={kpiValue.sparkline}
                    color={config.customization?.color as any}
                    loading={loading}
                    className={className}
                />
            );

        case 'bar-chart':
            const barData = widgetData.map((d: any) => ({
                name: d.name || d.label || d.key || 'Unknown',
                value: d.value || d.count || 0,
            }));
            return (
                <BarChart
                    data={barData}
                    title={config.title}
                    orientation={config.customization?.orientation as any}
                    showLegend={config.customization?.showLegend}
                    height={config.customization?.height || 300}
                    loading={loading}
                    className={className}
                />
            );

        case 'line-chart':
            let lineSeries: any[] = [];
            if (Array.isArray(widgetData) && widgetData.length > 0) {
                if (widgetData[0].series) {
                    lineSeries = widgetData[0].series;
                } else if (widgetData[0].data && Array.isArray(widgetData[0].data)) {
                    lineSeries = widgetData.map((s: any) => ({
                        name: s.name || 'Series',
                        data: s.data.map((d: any) => ({ x: d.x || d.date || d.time, y: d.y || d.value })),
                    }));
                } else {
                    lineSeries = [{
                        name: config.title,
                        data: widgetData.map((d: any) => ({
                            x: d.x || d.date || d.time || d.name,
                            y: d.y || d.value || d.count || 0,
                        })),
                    }];
                }
            }
            return (
                <LineChart
                    series={lineSeries}
                    title={config.title}
                    showLegend={config.customization?.showLegend ?? lineSeries.length > 1}
                    height={config.customization?.height || 300}
                    loading={loading}
                    className={className}
                />
            );

        case 'pie-chart':
            const pieData = widgetData.map((d: any) => ({
                name: d.name || d.label || d.key || 'Unknown',
                value: d.value || d.count || 0,
            }));
            return (
                <PieChart
                    data={pieData}
                    title={config.title}
                    donut={config.customization?.donut}
                    showLegend={config.customization?.showLegend ?? true}
                    height={config.customization?.height || 300}
                    loading={loading}
                    className={className}
                />
            );

        case 'area-chart':
            let areaSeries: any[] = [];
            if (Array.isArray(widgetData) && widgetData.length > 0) {
                if (widgetData[0].data && Array.isArray(widgetData[0].data)) {
                    areaSeries = widgetData.map((s: any) => ({
                        name: s.name || 'Series',
                        data: s.data.map((d: any) => ({ x: d.x || d.date, y: d.y || d.value })),
                    }));
                } else {
                    areaSeries = [{
                        name: config.title,
                        data: widgetData.map((d: any) => ({
                            x: d.x || d.date || d.time || d.name,
                            y: d.y || d.value || d.count || 0,
                        })),
                    }];
                }
            }
            return (
                <AreaChart
                    series={areaSeries}
                    title={config.title}
                    stacked={config.customization?.stacked}
                    showLegend={config.customization?.showLegend ?? areaSeries.length > 1}
                    height={config.customization?.height || 300}
                    loading={loading}
                    className={className}
                />
            );

        case 'data-table':
            const columns = config.customization?.columns ||
                (widgetData.length > 0
                    ? Object.keys(widgetData[0]).map((key) => ({
                        key,
                        header: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
                        sortable: true,
                    }))
                    : []);
            return (
                <DataTable
                    data={widgetData}
                    columns={columns}
                    title={config.title}
                    pageSize={config.customization?.pageSize || 10}
                    searchable={config.customization?.searchable ?? true}
                    loading={loading}
                    className={className}
                />
            );

        // Milestone 3 Advanced Widgets
        case 'heatmap':
            const heatmapData = widgetData.map((d: any) => ({
                x: d.x || d.day || d.column || 'X',
                y: d.y || d.hour || d.row || 'Y',
                value: d.value || d.count || 0,
            }));
            return (
                <HeatmapChart
                    data={heatmapData}
                    title={config.title}
                    height={config.customization?.height || 350}
                    className={className}
                />
            );

        case 'gauge':
            const gaugeValue = widgetData.length > 0 ? (widgetData[0].value ?? widgetData[0].count ?? 0) : 50;
            return (
                <GaugeChart
                    title={config.title}
                    value={gaugeValue}
                    max={config.customization?.max || 100}
                    min={config.customization?.min || 0}
                    unit={config.customization?.unit || '%'}
                    thresholds={config.customization?.thresholds}
                    height={config.customization?.height || 250}
                    className={className}
                />
            );

        case 'funnel':
            const funnelData = widgetData.map((d: any) => ({
                name: d.name || d.stage || d.label || 'Stage',
                value: d.value || d.count || 0,
            }));
            return (
                <FunnelChart
                    data={funnelData}
                    title={config.title}
                    height={config.customization?.height || 350}
                    className={className}
                />
            );

        case 'timeline':
            const timelineEvents = widgetData.map((d: any, i: number) => ({
                id: d.id || `event-${i}`,
                timestamp: d.timestamp || d.date || d.time || new Date().toISOString(),
                title: d.title || d.name || d.event || 'Event',
                description: d.description || d.message || d.details,
                type: d.type || d.severity || 'info',
            }));
            return (
                <TimelineChart
                    events={timelineEvents}
                    title={config.title}
                    orientation={config.customization?.orientation || 'vertical'}
                    showTime={config.customization?.showTime ?? true}
                    maxEvents={config.customization?.maxEvents || 10}
                    className={className}
                />
            );

        default:
            return (
                <div className={cn(
                    'bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5',
                    className
                )}>
                    <div className="text-center text-slate-500">
                        <p className="font-medium">{config.title}</p>
                        <p className="text-sm mt-1">Widget type "{config.type}" is not yet implemented</p>
                    </div>
                </div>
            );
    }
};

export default WidgetRenderer;
