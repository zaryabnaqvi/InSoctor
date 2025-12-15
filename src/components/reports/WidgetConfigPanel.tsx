import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { X, Palette, BarChart3, Database, Type, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import type { ReportWidget } from '@/types/report';

interface WidgetConfigPanelProps {
    widget: ReportWidget;
    onUpdate: (widget: ReportWidget) => void;
    onClose: () => void;
    className?: string;
}

// Color palette options
const COLOR_PALETTES = [
    { name: 'Default', colors: ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e'] },
    { name: 'Ocean', colors: ['#0ea5e9', '#06b6d4', '#14b8a6', '#22c55e', '#84cc16'] },
    { name: 'Sunset', colors: ['#f59e0b', '#f97316', '#ef4444', '#ec4899', '#a855f7'] },
    { name: 'Forest', colors: ['#22c55e', '#16a34a', '#15803d', '#14532d', '#052e16'] },
    { name: 'Mono', colors: ['#374151', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db'] },
];

// Data source options
const DATA_SOURCES = [
    { value: 'alerts', label: 'Alerts' },
    { value: 'agents', label: 'Agents' },
    { value: 'rules', label: 'Rules' },
    { value: 'events', label: 'Events' },
    { value: 'vulnerabilities', label: 'Vulnerabilities' },
    { value: 'compliance', label: 'Compliance Checks' },
];

// Aggregation functions
const AGGREGATIONS = [
    { value: 'count', label: 'Count' },
    { value: 'sum', label: 'Sum' },
    { value: 'avg', label: 'Average' },
    { value: 'min', label: 'Minimum' },
    { value: 'max', label: 'Maximum' },
];

interface ConfigSectionProps {
    title: string;
    icon: React.ReactNode;
    defaultOpen?: boolean;
    children: React.ReactNode;
}

const ConfigSection: React.FC<ConfigSectionProps> = ({ title, icon, defaultOpen = true, children }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-slate-200 dark:border-slate-700">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{title}</span>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {isOpen && <div className="px-4 pb-4 space-y-3">{children}</div>}
        </div>
    );
};

export const WidgetConfigPanel: React.FC<WidgetConfigPanelProps> = ({
    widget,
    onUpdate,
    onClose,
    className,
}) => {
    const [config, setConfig] = useState(widget.config);

    const handleConfigChange = useCallback((key: string, value: any) => {
        const newConfig = { ...config, [key]: value };
        setConfig(newConfig);
        onUpdate({ ...widget, config: newConfig });
    }, [config, widget, onUpdate]);

    const handleTitleChange = useCallback((title: string) => {
        onUpdate({ ...widget, title });
    }, [widget, onUpdate]);

    return (
        <div className={cn(
            'bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col',
            className
        )}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-purple-500" />
                    <h3 className="font-semibold text-slate-900 dark:text-white">Configure Widget</h3>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Config Sections */}
            <div className="flex-1 overflow-y-auto">
                {/* Basic Info */}
                <ConfigSection title="Basic" icon={<Type className="w-4 h-4 text-slate-400" />}>
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">Widget Title</label>
                        <input
                            type="text"
                            value={widget.title || ''}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 rounded-lg border-0 focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter widget title"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">Description</label>
                        <textarea
                            value={config.description || ''}
                            onChange={(e) => handleConfigChange('description', e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 rounded-lg border-0 focus:ring-2 focus:ring-purple-500 resize-none"
                            rows={2}
                            placeholder="Optional description"
                        />
                    </div>
                </ConfigSection>

                {/* Data Source */}
                <ConfigSection title="Data Source" icon={<Database className="w-4 h-4 text-slate-400" />}>
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">Source</label>
                        <select
                            value={config.dataSource || 'alerts'}
                            onChange={(e) => handleConfigChange('dataSource', e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 rounded-lg border-0 focus:ring-2 focus:ring-purple-500"
                        >
                            {DATA_SOURCES.map((ds) => (
                                <option key={ds.value} value={ds.value}>{ds.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">Aggregation</label>
                        <select
                            value={config.aggregation || 'count'}
                            onChange={(e) => handleConfigChange('aggregation', e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 rounded-lg border-0 focus:ring-2 focus:ring-purple-500"
                        >
                            {AGGREGATIONS.map((agg) => (
                                <option key={agg.value} value={agg.value}>{agg.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">Group By</label>
                        <input
                            type="text"
                            value={config.groupBy || ''}
                            onChange={(e) => handleConfigChange('groupBy', e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 rounded-lg border-0 focus:ring-2 focus:ring-purple-500"
                            placeholder="e.g., severity, agent.os"
                        />
                    </div>
                </ConfigSection>

                {/* Chart Options (for chart widgets) */}
                {(widget.type === 'bar' || widget.type === 'line' || widget.type === 'pie' || widget.type === 'area') && (
                    <ConfigSection title="Chart Options" icon={<BarChart3 className="w-4 h-4 text-slate-400" />}>
                        <div className="flex items-center justify-between">
                            <label className="text-xs text-slate-500">Show Legend</label>
                            <button
                                onClick={() => handleConfigChange('showLegend', !config.showLegend)}
                                className={cn(
                                    'w-10 h-5 rounded-full transition-colors',
                                    config.showLegend ? 'bg-purple-500' : 'bg-slate-300 dark:bg-slate-600'
                                )}
                            >
                                <div className={cn(
                                    'w-4 h-4 bg-white rounded-full transition-transform shadow',
                                    config.showLegend ? 'translate-x-5' : 'translate-x-0.5'
                                )} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-xs text-slate-500">Show Labels</label>
                            <button
                                onClick={() => handleConfigChange('showLabels', !config.showLabels)}
                                className={cn(
                                    'w-10 h-5 rounded-full transition-colors',
                                    config.showLabels ? 'bg-purple-500' : 'bg-slate-300 dark:bg-slate-600'
                                )}
                            >
                                <div className={cn(
                                    'w-4 h-4 bg-white rounded-full transition-transform shadow',
                                    config.showLabels ? 'translate-x-5' : 'translate-x-0.5'
                                )} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-xs text-slate-500">Smooth Lines</label>
                            <button
                                onClick={() => handleConfigChange('smooth', !config.smooth)}
                                className={cn(
                                    'w-10 h-5 rounded-full transition-colors',
                                    config.smooth ? 'bg-purple-500' : 'bg-slate-300 dark:bg-slate-600'
                                )}
                            >
                                <div className={cn(
                                    'w-4 h-4 bg-white rounded-full transition-transform shadow',
                                    config.smooth ? 'translate-x-5' : 'translate-x-0.5'
                                )} />
                            </button>
                        </div>
                    </ConfigSection>
                )}

                {/* Colors */}
                <ConfigSection title="Colors" icon={<Palette className="w-4 h-4 text-slate-400" />} defaultOpen={false}>
                    <div className="space-y-2">
                        {COLOR_PALETTES.map((palette) => (
                            <button
                                key={palette.name}
                                onClick={() => handleConfigChange('colorPalette', palette.name)}
                                className={cn(
                                    'w-full flex items-center gap-3 p-2 rounded-lg transition-colors',
                                    config.colorPalette === palette.name
                                        ? 'bg-purple-100 dark:bg-purple-900/30 ring-1 ring-purple-500'
                                        : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                                )}
                            >
                                <div className="flex gap-1">
                                    {palette.colors.map((color, i) => (
                                        <div
                                            key={i}
                                            className="w-4 h-4 rounded-sm"
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                                <span className="text-xs text-slate-600 dark:text-slate-400">{palette.name}</span>
                            </button>
                        ))}
                    </div>
                </ConfigSection>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <button
                    onClick={onClose}
                    className="w-full px-4 py-2 bg-purple-500 text-white text-sm font-medium rounded-lg hover:bg-purple-600 transition-colors"
                >
                    Done
                </button>
            </div>
        </div>
    );
};

export default WidgetConfigPanel;
