import React, { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Search, Grid, List, Filter, ChevronDown, BarChart3, Shield, FileCheck, Users, Clock, Eye, Copy, Trash2 } from 'lucide-react';
import type { ReportTemplate } from '@/types/report';

interface TemplateGalleryProps {
    templates: ReportTemplate[];
    onSelect: (template: ReportTemplate) => void;
    onPreview?: (template: ReportTemplate) => void;
    onDuplicate?: (template: ReportTemplate) => void;
    onDelete?: (template: ReportTemplate) => void;
    className?: string;
}

const CATEGORY_ICONS = {
    security: Shield,
    compliance: FileCheck,
    operational: BarChart3,
    executive: Users,
};

const CATEGORY_COLORS = {
    security: 'text-red-500 bg-red-100 dark:bg-red-900/30',
    compliance: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
    operational: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30',
    executive: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
};

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
    templates,
    onSelect,
    onPreview,
    onDuplicate,
    onDelete,
    className,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const filteredTemplates = useMemo(() => {
        return templates.filter((template) => {
            const matchesSearch = !searchQuery ||
                template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                template.description?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = !selectedCategory || template.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [templates, searchQuery, selectedCategory]);

    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        templates.forEach((t) => { counts[t.category] = (counts[t.category] || 0) + 1; });
        return counts;
    }, [templates]);

    const formatDate = (date: Date | string | undefined) => {
        if (!date) return 'Unknown';
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const TemplateCard = useCallback(({ template }: { template: ReportTemplate }) => {
        const CategoryIcon = CATEGORY_ICONS[template.category as keyof typeof CATEGORY_ICONS] || BarChart3;
        const categoryColor = CATEGORY_COLORS[template.category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.operational;

        return (
            <div className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg hover:border-purple-300 transition-all">
                <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 p-4 relative">
                    <div className="grid grid-cols-3 gap-2 h-full opacity-60">
                        {template.widgets?.slice(0, 6).map((widget, i) => (
                            <div key={i} className="bg-white dark:bg-slate-700 rounded shadow-sm" style={{ gridColumn: widget.position?.w && widget.position.w > 3 ? 'span 2' : 'span 1' }} />
                        ))}
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        {onPreview && (
                            <button onClick={(e) => { e.stopPropagation(); onPreview(template); }} className="p-2 bg-white/90 rounded-lg hover:bg-white">
                                <Eye className="w-4 h-4 text-slate-700" />
                            </button>
                        )}
                        <button onClick={() => onSelect(template)} className="px-3 py-2 bg-purple-500 text-white text-xs font-medium rounded-lg hover:bg-purple-600">Use Template</button>
                    </div>
                </div>
                <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-slate-900 dark:text-white truncate">{template.name}</h3>
                            <p className="text-sm text-slate-500 line-clamp-2 mt-1">{template.description || 'No description'}</p>
                        </div>
                        <div className={cn('p-2 rounded-lg flex-shrink-0', categoryColor)}><CategoryIcon className="w-4 h-4" /></div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-1 text-xs text-slate-400"><Clock className="w-3 h-3" />{formatDate(template.updatedAt)}</div>
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-500">{template.widgets?.length || 0} widgets</span>
                            {onDuplicate && (<button onClick={(e) => { e.stopPropagation(); onDuplicate(template); }} className="p-1 text-slate-400 hover:text-slate-600 rounded"><Copy className="w-3 h-3" /></button>)}
                            {onDelete && (<button onClick={(e) => { e.stopPropagation(); onDelete(template); }} className="p-1 text-slate-400 hover:text-red-500 rounded"><Trash2 className="w-3 h-3" /></button>)}
                        </div>
                    </div>
                </div>
            </div>
        );
    }, [onSelect, onPreview, onDuplicate, onDelete]);

    const TemplateRow = useCallback(({ template }: { template: ReportTemplate }) => {
        const CategoryIcon = CATEGORY_ICONS[template.category as keyof typeof CATEGORY_ICONS] || BarChart3;
        const categoryColor = CATEGORY_COLORS[template.category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.operational;
        return (
            <div onClick={() => onSelect(template)} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md cursor-pointer transition-all">
                <div className={cn('p-2 rounded-lg', categoryColor)}><CategoryIcon className="w-5 h-5" /></div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900 dark:text-white">{template.name}</h3>
                    <p className="text-sm text-slate-500 truncate">{template.description || 'No description'}</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span>{template.widgets?.length || 0} widgets</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{formatDate(template.updatedAt)}</span>
                </div>
                <button className="px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg">Use</button>
            </div>
        );
    }, [onSelect]);

    return (
        <div className={cn('flex flex-col h-full', className)}>
            <div className="flex items-center justify-between gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search templates..." className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 rounded-lg border-0 focus:ring-2 focus:ring-purple-500" />
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200">
                        <Filter className="w-4 h-4" />{selectedCategory ? <span className="capitalize">{selectedCategory}</span> : 'All'}<ChevronDown className="w-4 h-4" />
                    </button>
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                        <button onClick={() => setViewMode('grid')} className={cn('p-1.5 rounded', viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow' : '')}><Grid className="w-4 h-4" /></button>
                        <button onClick={() => setViewMode('list')} className={cn('p-1.5 rounded', viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow' : '')}><List className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                <button onClick={() => setSelectedCategory(null)} className={cn('px-3 py-1.5 text-sm rounded-full whitespace-nowrap', !selectedCategory ? 'bg-purple-500 text-white' : 'bg-slate-100 text-slate-600')}>All ({templates.length})</button>
                {Object.entries(categoryCounts).map(([category, count]) => {
                    const Icon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || BarChart3;
                    return (
                        <button key={category} onClick={() => setSelectedCategory(category)} className={cn('flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full whitespace-nowrap', selectedCategory === category ? 'bg-purple-500 text-white' : 'bg-slate-100 text-slate-600')}>
                            <Icon className="w-3 h-3" /><span className="capitalize">{category}</span>({count})
                        </button>
                    );
                })}
            </div>

            <div className="flex-1 overflow-y-auto">
                {filteredTemplates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Search className="w-12 h-12 text-slate-300 mb-4" />
                        <p className="text-slate-500">No templates found</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTemplates.map((template, index) => <TemplateCard key={template.name || index} template={template} />)}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredTemplates.map((template, index) => <TemplateRow key={template.name || index} template={template} />)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TemplateGallery;
