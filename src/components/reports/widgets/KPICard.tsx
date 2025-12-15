import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Shield, Users, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface KPICardProps {
    title: string;
    value: number | string;
    subtitle?: string;
    trend?: {
        value: number;
        direction: 'up' | 'down' | 'neutral';
        label?: string;
    };
    sparklineData?: number[];
    icon?: 'alert' | 'shield' | 'users' | 'activity' | React.ReactNode;
    color?: 'default' | 'success' | 'warning' | 'danger' | 'info';
    loading?: boolean;
    className?: string;
}

const iconMap = {
    alert: AlertTriangle,
    shield: Shield,
    users: Users,
    activity: Activity,
};

const colorClasses = {
    default: {
        bg: 'bg-slate-100 dark:bg-slate-800',
        icon: 'text-slate-600 dark:text-slate-400',
        trend: 'text-slate-600 dark:text-slate-400',
    },
    success: {
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        icon: 'text-emerald-600 dark:text-emerald-400',
        trend: 'text-emerald-600 dark:text-emerald-400',
    },
    warning: {
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        icon: 'text-amber-600 dark:text-amber-400',
        trend: 'text-amber-600 dark:text-amber-400',
    },
    danger: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        icon: 'text-red-600 dark:text-red-400',
        trend: 'text-red-600 dark:text-red-400',
    },
    info: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        icon: 'text-blue-600 dark:text-blue-400',
        trend: 'text-blue-600 dark:text-blue-400',
    },
};

const Sparkline: React.FC<{ data: number[]; color?: string }> = ({ data, color = '#60a5fa' }) => {
    const normalizedData = useMemo(() => {
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;
        return data.map((v) => ((v - min) / range) * 100);
    }, [data]);

    const points = useMemo(() => {
        const width = 100;
        const height = 30;
        const step = width / (normalizedData.length - 1);
        return normalizedData
            .map((v, i) => `${i * step},${height - (v * height) / 100}`)
            .join(' ');
    }, [normalizedData]);

    return (
        <svg viewBox="0 0 100 30" className="w-full h-8" preserveAspectRatio="none">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
            />
        </svg>
    );
};

export const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    subtitle,
    trend,
    sparklineData,
    icon,
    color = 'default',
    loading = false,
    className,
}) => {
    const colors = colorClasses[color];

    const IconComponent = useMemo(() => {
        if (!icon) return null;
        if (typeof icon === 'string' && icon in iconMap) {
            return iconMap[icon as keyof typeof iconMap];
        }
        return null;
    }, [icon]);

    const TrendIcon = useMemo(() => {
        if (!trend) return null;
        switch (trend.direction) {
            case 'up':
                return TrendingUp;
            case 'down':
                return TrendingDown;
            default:
                return Minus;
        }
    }, [trend]);

    const trendColorClass = useMemo(() => {
        if (!trend) return '';
        switch (trend.direction) {
            case 'up':
                return 'text-emerald-500';
            case 'down':
                return 'text-red-500';
            default:
                return 'text-slate-400';
        }
    }, [trend]);

    if (loading) {
        return (
            <div className={cn(
                'bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-800',
                'animate-pulse',
                className
            )}>
                <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
                        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16" />
                    </div>
                    <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            'bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-800',
            'hover:shadow-md transition-shadow duration-200',
            className
        )}>
            <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {title}
                    </p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </p>
                        {trend && TrendIcon && (
                            <span className={cn('flex items-center gap-1 text-sm font-medium', trendColorClass)}>
                                <TrendIcon className="w-4 h-4" />
                                {trend.value}%
                                {trend.label && <span className="text-slate-400 dark:text-slate-500">{trend.label}</span>}
                            </span>
                        )}
                    </div>
                    {subtitle && (
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                            {subtitle}
                        </p>
                    )}
                </div>

                {(IconComponent || typeof icon !== 'string') && (
                    <div className={cn('p-2.5 rounded-lg', colors.bg)}>
                        {IconComponent ? (
                            <IconComponent className={cn('w-5 h-5', colors.icon)} />
                        ) : (
                            icon
                        )}
                    </div>
                )}
            </div>

            {sparklineData && sparklineData.length > 1 && (
                <div className="mt-4">
                    <Sparkline
                        data={sparklineData}
                        color={color === 'danger' ? '#ef4444' : color === 'success' ? '#10b981' : '#60a5fa'}
                    />
                </div>
            )}
        </div>
    );
};

export default KPICard;
