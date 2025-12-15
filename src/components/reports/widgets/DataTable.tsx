import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DataTableColumn {
    key: string;
    header: string;
    sortable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
    render?: (value: any, row: any) => React.ReactNode;
}

export interface DataTableProps {
    data: any[];
    columns: DataTableColumn[];
    title?: string;
    searchable?: boolean;
    searchPlaceholder?: string;
    pageSize?: number;
    loading?: boolean;
    emptyMessage?: string;
    className?: string;
    onRowClick?: (row: any) => void;
    conditionalFormatting?: {
        column: string;
        rules: Array<{
            condition: (value: any) => boolean;
            className: string;
        }>;
    }[];
}

export const DataTable: React.FC<DataTableProps> = ({
    data,
    columns,
    title,
    searchable = true,
    searchPlaceholder = 'Search...',
    pageSize = 10,
    loading = false,
    emptyMessage = 'No data available',
    className,
    onRowClick,
    conditionalFormatting = [],
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);

    // Filter data based on search query
    const filteredData = useMemo(() => {
        if (!searchQuery) return data;
        const query = searchQuery.toLowerCase();
        return data.filter((row) =>
            columns.some((col) => {
                const value = row[col.key];
                return value?.toString().toLowerCase().includes(query);
            })
        );
    }, [data, searchQuery, columns]);

    // Sort data
    const sortedData = useMemo(() => {
        if (!sortColumn) return filteredData;
        return [...filteredData].sort((a, b) => {
            const aVal = a[sortColumn];
            const bVal = b[sortColumn];
            if (aVal === bVal) return 0;
            const comparison = aVal < bVal ? -1 : 1;
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [filteredData, sortColumn, sortDirection]);

    // Paginate data
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return sortedData.slice(start, start + pageSize);
    }, [sortedData, currentPage, pageSize]);

    const totalPages = Math.ceil(sortedData.length / pageSize);

    const handleSort = (columnKey: string) => {
        if (sortColumn === columnKey) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortColumn(columnKey);
            setSortDirection('asc');
        }
    };

    const getCellClassName = (column: DataTableColumn, value: any): string => {
        const formatting = conditionalFormatting.find((f) => f.column === column.key);
        if (!formatting) return '';
        const rule = formatting.rules.find((r) => r.condition(value));
        return rule?.className || '';
    };

    if (loading) {
        return (
            <div className={cn(
                'bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden',
                className
            )}>
                {title && (
                    <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse" />
                    </div>
                )}
                <div className="p-5 space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            'bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden',
            className
        )}>
            {/* Header */}
            {(title || searchable) && (
                <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                    {title && (
                        <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
                    )}
                    {searchable && (
                        <div className="relative flex-1 max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={cn(
                                        'px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider',
                                        column.align === 'center' && 'text-center',
                                        column.align === 'right' && 'text-right',
                                        column.sortable && 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 select-none'
                                    )}
                                    style={{ width: column.width }}
                                    onClick={() => column.sortable && handleSort(column.key)}
                                >
                                    <span className="flex items-center gap-1">
                                        {column.header}
                                        {column.sortable && sortColumn === column.key && (
                                            sortDirection === 'asc' ? (
                                                <ChevronUp className="w-4 h-4" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4" />
                                            )
                                        )}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    className={cn(
                                        'hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors',
                                        onRowClick && 'cursor-pointer'
                                    )}
                                    onClick={() => onRowClick?.(row)}
                                >
                                    {columns.map((column) => {
                                        const value = row[column.key];
                                        return (
                                            <td
                                                key={column.key}
                                                className={cn(
                                                    'px-4 py-3 text-sm text-slate-700 dark:text-slate-300',
                                                    column.align === 'center' && 'text-center',
                                                    column.align === 'right' && 'text-right',
                                                    getCellClassName(column, value)
                                                )}
                                            >
                                                {column.render ? column.render(value, row) : value}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Showing {(currentPage - 1) * pageSize + 1} to{' '}
                        {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;
