import React, { useState, useCallback } from 'react';
import { Plus, X, Calendar, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReportFilter, FilterOperator } from '@/types/report';

// Date range presets
const DATE_PRESETS = [
    { label: 'Last 24 hours', value: '24h' },
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 30 days', value: '30d' },
    { label: 'Last 90 days', value: '90d' },
    { label: 'This month', value: 'this-month' },
    { label: 'Last month', value: 'last-month' },
    { label: 'This year', value: 'this-year' },
    { label: 'Custom range', value: 'custom' },
];

const OPERATORS: Array<{ value: FilterOperator; label: string }> = [
    { value: 'equals', label: 'Equals' },
    { value: 'not-equals', label: 'Not equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'not-contains', label: 'Does not contain' },
    { value: 'greater-than', label: 'Greater than' },
    { value: 'less-than', label: 'Less than' },
    { value: 'in', label: 'Is one of' },
    { value: 'not-in', label: 'Is not one of' },
    { value: 'between', label: 'Between' },
    { value: 'exists', label: 'Exists' },
    { value: 'not-exists', label: 'Does not exist' },
];

// Common fields for filtering
const COMMON_FIELDS = [
    { value: 'rule.level', label: 'Alert Level', dataSource: ['wazuh-alerts'] },
    { value: 'rule.id', label: 'Rule ID', dataSource: ['wazuh-alerts'] },
    { value: 'agent.name', label: 'Agent Name', dataSource: ['wazuh-alerts', 'wazuh-agents'] },
    { value: 'agent.id', label: 'Agent ID', dataSource: ['wazuh-alerts', 'wazuh-agents'] },
    { value: 'rule.groups', label: 'Rule Groups', dataSource: ['wazuh-alerts'] },
    { value: 'status', label: 'Status', dataSource: ['wazuh-agents', 'iris-cases'] },
    { value: 'severity', label: 'Severity', dataSource: ['iris-cases', 'vulnerabilities'] },
    { value: 'os.platform', label: 'OS Platform', dataSource: ['wazuh-agents'] },
    { value: 'case_id', label: 'Case ID', dataSource: ['iris-cases'] },
];

export interface FilterBuilderProps {
    filters: ReportFilter[];
    onChange: (filters: ReportFilter[]) => void;
    dateRange?: {
        preset: string;
        start?: string;
        end?: string;
    };
    onDateRangeChange?: (dateRange: { preset: string; start?: string; end?: string }) => void;
    dataSource?: string;
    className?: string;
}

export const FilterBuilder: React.FC<FilterBuilderProps> = ({
    filters,
    onChange,
    dateRange,
    onDateRangeChange,
    dataSource,
    className,
}) => {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [customStartDate, setCustomStartDate] = useState(dateRange?.start || '');
    const [customEndDate, setCustomEndDate] = useState(dateRange?.end || '');

    // Add a new filter
    const handleAddFilter = useCallback(() => {
        const newFilter: ReportFilter = {
            field: '',
            operator: 'equals',
            value: '',
        };
        onChange([...filters, newFilter]);
    }, [filters, onChange]);

    // Update a filter
    const handleUpdateFilter = useCallback(
        (index: number, updates: Partial<ReportFilter>) => {
            const newFilters = filters.map((f, i) => (i === index ? { ...f, ...updates } : f));
            onChange(newFilters);
        },
        [filters, onChange]
    );

    // Remove a filter
    const handleRemoveFilter = useCallback(
        (index: number) => {
            onChange(filters.filter((_, i) => i !== index));
        },
        [filters, onChange]
    );

    // Handle date preset change
    const handleDatePresetChange = useCallback(
        (preset: string) => {
            if (preset === 'custom') {
                setShowDatePicker(true);
                onDateRangeChange?.({ preset, start: customStartDate, end: customEndDate });
            } else {
                setShowDatePicker(false);
                // Calculate dates based on preset
                const now = new Date();
                let start = new Date();
                const end = now;

                switch (preset) {
                    case '24h':
                        start.setHours(start.getHours() - 24);
                        break;
                    case '7d':
                        start.setDate(start.getDate() - 7);
                        break;
                    case '30d':
                        start.setDate(start.getDate() - 30);
                        break;
                    case '90d':
                        start.setDate(start.getDate() - 90);
                        break;
                    case 'this-month':
                        start = new Date(now.getFullYear(), now.getMonth(), 1);
                        break;
                    case 'last-month':
                        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                        end.setDate(0); // Last day of previous month
                        break;
                    case 'this-year':
                        start = new Date(now.getFullYear(), 0, 1);
                        break;
                }

                onDateRangeChange?.({
                    preset,
                    start: start.toISOString(),
                    end: end.toISOString(),
                });
            }
        },
        [customStartDate, customEndDate, onDateRangeChange]
    );

    // Get available fields based on data source
    const availableFields = dataSource
        ? COMMON_FIELDS.filter((f) => f.dataSource.includes(dataSource))
        : COMMON_FIELDS;

    return (
        <div className={cn('space-y-4', className)}>
            {/* Date Range Selector */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Time Range</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {DATE_PRESETS.map((preset) => (
                        <button
                            key={preset.value}
                            onClick={() => handleDatePresetChange(preset.value)}
                            className={cn(
                                'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                                dateRange?.preset === preset.value
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            )}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>
                {showDatePicker && (
                    <div className="mt-3 flex gap-3">
                        <div className="flex-1">
                            <label className="block text-xs text-slate-500 mb-1">Start Date</label>
                            <input
                                type="datetime-local"
                                value={customStartDate}
                                onChange={(e) => {
                                    setCustomStartDate(e.target.value);
                                    onDateRangeChange?.({
                                        preset: 'custom',
                                        start: e.target.value,
                                        end: customEndDate,
                                    });
                                }}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs text-slate-500 mb-1">End Date</label>
                            <input
                                type="datetime-local"
                                value={customEndDate}
                                onChange={(e) => {
                                    setCustomEndDate(e.target.value);
                                    onDateRangeChange?.({
                                        preset: 'custom',
                                        start: customStartDate,
                                        end: e.target.value,
                                    });
                                }}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Filter Rules */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filters</span>
                    <button
                        onClick={handleAddFilter}
                        className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                        <Plus className="w-3 h-3" />
                        Add Filter
                    </button>
                </div>

                {filters.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">
                        No filters applied. Click "Add Filter" to narrow down your data.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {filters.map((filter, index) => (
                            <div key={index} className="flex items-center gap-2">
                                {index > 0 && (
                                    <select
                                        value={filter.logicalOperator || 'AND'}
                                        onChange={(e) =>
                                            handleUpdateFilter(index, { logicalOperator: e.target.value as 'AND' | 'OR' })
                                        }
                                        className="w-16 px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                    >
                                        <option value="AND">AND</option>
                                        <option value="OR">OR</option>
                                    </select>
                                )}
                                <select
                                    value={filter.field}
                                    onChange={(e) => handleUpdateFilter(index, { field: e.target.value })}
                                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                >
                                    <option value="">Select field...</option>
                                    {availableFields.map((f) => (
                                        <option key={f.value} value={f.value}>
                                            {f.label}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={filter.operator}
                                    onChange={(e) => handleUpdateFilter(index, { operator: e.target.value as FilterOperator })}
                                    className="w-36 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                >
                                    {OPERATORS.map((op) => (
                                        <option key={op.value} value={op.value}>
                                            {op.label}
                                        </option>
                                    ))}
                                </select>
                                {filter.operator !== 'exists' && filter.operator !== 'not-exists' && (
                                    <input
                                        type="text"
                                        value={filter.value}
                                        onChange={(e) => handleUpdateFilter(index, { value: e.target.value })}
                                        placeholder="Value"
                                        className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    />
                                )}
                                <button
                                    onClick={() => handleRemoveFilter(index)}
                                    className="p-2 text-slate-400 hover:text-red-500 rounded"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FilterBuilder;
