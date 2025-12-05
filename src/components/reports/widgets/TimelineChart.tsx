import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, AlertTriangle, Info, CheckCircle, Clock, LucideIcon } from 'lucide-react';

interface TimelineEvent {
    id: string;
    timestamp: string | Date;
    title: string;
    description?: string;
    type?: 'info' | 'warning' | 'error' | 'success';
}

interface TimelineChartProps {
    title?: string;
    events: TimelineEvent[];
    orientation?: 'vertical' | 'horizontal';
    showTime?: boolean;
    maxEvents?: number;
    className?: string;
}

type TypeStyleConfig = {
    icon: LucideIcon;
    bgColor: string;
    iconColor: string;
};

const TYPE_STYLES: Record<string, TypeStyleConfig> = {
    info: {
        icon: Info,
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        iconColor: 'text-blue-500',
    },
    warning: {
        icon: AlertTriangle,
        bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        iconColor: 'text-amber-500',
    },
    error: {
        icon: AlertCircle,
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        iconColor: 'text-red-500',
    },
    success: {
        icon: CheckCircle,
        bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
        iconColor: 'text-emerald-500',
    },
};

export const TimelineChart: React.FC<TimelineChartProps> = ({
    title,
    events,
    orientation = 'vertical',
    showTime = true,
    maxEvents = 10,
    className,
}) => {
    const sortedEvents = [...events]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, maxEvents);

    const formatTime = (timestamp: string | Date) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (timestamp: string | Date) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (orientation === 'horizontal') {
        return (
            <div className={cn('', className)}>
                {title && <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">{title}</h3>}
                <div className="flex overflow-x-auto pb-4 gap-4">
                    {sortedEvents.map((event, index) => {
                        const type = event.type || 'info';
                        const styles = TYPE_STYLES[type];
                        const IconComponent = styles.icon;
                        return (
                            <div key={event.id} className="flex-shrink-0 w-40">
                                <div className="flex flex-col items-center">
                                    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', styles.bgColor)}>
                                        <IconComponent className={cn('w-5 h-5', styles.iconColor)} />
                                    </div>
                                    {index < sortedEvents.length - 1 && (
                                        <div className="w-full h-0.5 bg-slate-200 dark:bg-slate-700 mt-5" />
                                    )}
                                </div>
                                <div className="mt-2 text-center">
                                    {showTime && (
                                        <p className="text-xs text-slate-400">
                                            {formatDate(event.timestamp)} {formatTime(event.timestamp)}
                                        </p>
                                    )}
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-1">{event.title}</p>
                                    {event.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{event.description}</p>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className={cn('', className)}>
            {title && <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">{title}</h3>}
            <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
                <div className="space-y-4">
                    {sortedEvents.map((event) => {
                        const type = event.type || 'info';
                        const styles = TYPE_STYLES[type];
                        const IconComponent = styles.icon;
                        return (
                            <div key={event.id} className="relative flex gap-4">
                                <div className={cn('relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0', styles.bgColor)}>
                                    <IconComponent className={cn('w-5 h-5', styles.iconColor)} />
                                </div>
                                <div className="flex-1 min-w-0 pb-4">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{event.title}</p>
                                        {showTime && (
                                            <span className="flex items-center gap-1 text-xs text-slate-400">
                                                <Clock className="w-3 h-3" />
                                                {formatDate(event.timestamp)} {formatTime(event.timestamp)}
                                            </span>
                                        )}
                                    </div>
                                    {event.description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{event.description}</p>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TimelineChart;
