import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { X, FileText, FileSpreadsheet, FileType, Download, Mail, Link2, Loader2, CheckCircle } from 'lucide-react';
import type { ReportTemplate } from '@/types/report';

interface ExportDialogProps {
    template: ReportTemplate;
    onClose: () => void;
    onExport?: (options: ExportOptions) => Promise<void>;
    className?: string;
}

interface ExportOptions {
    format: 'pdf' | 'excel' | 'csv' | 'json';
    includeCharts: boolean;
    includeRawData: boolean;
    pageLayout: 'portrait' | 'landscape';
    sendEmail?: string;
    generateLink?: boolean;
}

const FORMAT_OPTIONS = [
    {
        value: 'pdf',
        label: 'PDF Document',
        icon: FileText,
        description: 'Best for sharing and printing',
        color: 'text-red-500',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
    },
    {
        value: 'excel',
        label: 'Excel Spreadsheet',
        icon: FileSpreadsheet,
        description: 'Best for data analysis',
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
    {
        value: 'csv',
        label: 'CSV File',
        icon: FileType,
        description: 'Raw data format',
        color: 'text-blue-500',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
        value: 'json',
        label: 'JSON Data',
        icon: FileType,
        description: 'For API/integrations',
        color: 'text-purple-500',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
];

export const ExportDialog: React.FC<ExportDialogProps> = ({
    template,
    onClose,
    onExport,
    className,
}) => {
    const [options, setOptions] = useState<ExportOptions>({
        format: 'pdf',
        includeCharts: true,
        includeRawData: false,
        pageLayout: 'landscape',
    });
    const [email, setEmail] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const [exportSuccess, setExportSuccess] = useState(false);

    const handleFormatChange = useCallback((format: ExportOptions['format']) => {
        setOptions((prev) => ({ ...prev, format }));
    }, []);

    const handleExport = useCallback(async () => {
        setIsExporting(true);
        try {
            const exportOptions = { ...options, sendEmail: email || undefined };
            if (onExport) {
                await onExport(exportOptions);
            } else {
                // Simulate export for demo
                await new Promise((resolve) => setTimeout(resolve, 1500));
            }
            setExportSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    }, [options, email, onExport, onClose]);

    if (exportSuccess) {
        return (
            <div className={cn('fixed inset-0 z-50 flex items-center justify-center bg-black/50', className)}>
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-sm text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Export Complete!</h3>
                    <p className="text-sm text-slate-500 mt-2">Your report has been exported successfully.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn('fixed inset-0 z-50 flex items-center justify-center bg-black/50', className)}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Export Report</h2>
                        <p className="text-sm text-slate-500">{template.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Format Selection */}
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            Export Format
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {FORMAT_OPTIONS.map((format) => {
                                const Icon = format.icon;
                                return (
                                    <button
                                        key={format.value}
                                        onClick={() => handleFormatChange(format.value as ExportOptions['format'])}
                                        className={cn(
                                            'flex items-start gap-3 p-3 rounded-xl border-2 transition-all text-left',
                                            options.format === format.value
                                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                        )}
                                    >
                                        <div className={cn('p-2 rounded-lg', format.bgColor)}>
                                            <Icon className={cn('w-5 h-5', format.color)} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{format.label}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{format.description}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Options */}
                    {(options.format === 'pdf' || options.format === 'excel') && (
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Options
                            </label>

                            {options.format === 'pdf' && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Page Layout</span>
                                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                                        <button
                                            onClick={() => setOptions((prev) => ({ ...prev, pageLayout: 'portrait' }))}
                                            className={cn(
                                                'px-3 py-1 text-xs rounded-md transition-colors',
                                                options.pageLayout === 'portrait'
                                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow'
                                                    : 'text-slate-500'
                                            )}
                                        >
                                            Portrait
                                        </button>
                                        <button
                                            onClick={() => setOptions((prev) => ({ ...prev, pageLayout: 'landscape' }))}
                                            className={cn(
                                                'px-3 py-1 text-xs rounded-md transition-colors',
                                                options.pageLayout === 'landscape'
                                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow'
                                                    : 'text-slate-500'
                                            )}
                                        >
                                            Landscape
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Include Charts</span>
                                <button
                                    onClick={() => setOptions((prev) => ({ ...prev, includeCharts: !prev.includeCharts }))}
                                    className={cn(
                                        'w-10 h-5 rounded-full transition-colors',
                                        options.includeCharts ? 'bg-purple-500' : 'bg-slate-300 dark:bg-slate-600'
                                    )}
                                >
                                    <div className={cn(
                                        'w-4 h-4 bg-white rounded-full transition-transform shadow',
                                        options.includeCharts ? 'translate-x-5' : 'translate-x-0.5'
                                    )} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Include Raw Data</span>
                                <button
                                    onClick={() => setOptions((prev) => ({ ...prev, includeRawData: !prev.includeRawData }))}
                                    className={cn(
                                        'w-10 h-5 rounded-full transition-colors',
                                        options.includeRawData ? 'bg-purple-500' : 'bg-slate-300 dark:bg-slate-600'
                                    )}
                                >
                                    <div className={cn(
                                        'w-4 h-4 bg-white rounded-full transition-transform shadow',
                                        options.includeRawData ? 'translate-x-5' : 'translate-x-0.5'
                                    )} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            <Mail className="w-4 h-4 inline mr-1" />
                            Send via Email (optional)
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="recipient@example.com"
                            className="w-full px-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 rounded-lg border-0 focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
                    >
                        Cancel
                    </button>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                            <Link2 className="w-4 h-4" />
                            Copy Link
                        </button>
                        <button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white text-sm font-medium rounded-lg hover:bg-purple-600 disabled:opacity-50"
                        >
                            {isExporting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4" />
                            )}
                            Export
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExportDialog;
