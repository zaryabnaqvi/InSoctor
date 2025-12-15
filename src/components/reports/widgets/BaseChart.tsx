import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';
import { cn } from '@/lib/utils';

export interface BaseChartProps {
    option: echarts.EChartsOption;
    title?: string;
    subtitle?: string;
    height?: string | number;
    loading?: boolean;
    theme?: 'light' | 'dark';
    className?: string;
}

export const BaseChart: React.FC<BaseChartProps> = ({
    option,
    title,
    subtitle,
    height = 300,
    loading = false,
    theme = 'light',
    className,
}) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useRef<echarts.ECharts | null>(null);

    // Initialize chart
    useEffect(() => {
        if (!chartRef.current) return;

        // Dispose existing chart
        if (chartInstanceRef.current) {
            chartInstanceRef.current.dispose();
        }

        // Create new chart instance
        chartInstanceRef.current = echarts.init(chartRef.current, theme === 'dark' ? 'dark' : undefined);

        // Clean up on unmount
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.dispose();
            }
        };
    }, [theme]);

    // Update chart when option changes
    useEffect(() => {
        if (!chartInstanceRef.current) return;

        const mergedOption: echarts.EChartsOption = {
            ...option,
            backgroundColor: 'transparent',
            textStyle: {
                fontFamily: 'Inter, system-ui, sans-serif',
            },
        };

        chartInstanceRef.current.setOption(mergedOption, true);
    }, [option]);

    // Handle loading state
    useEffect(() => {
        if (!chartInstanceRef.current) return;

        if (loading) {
            chartInstanceRef.current.showLoading({
                text: 'Loading...',
                color: '#3b82f6',
                textColor: '#64748b',
                maskColor: 'rgba(255, 255, 255, 0.8)',
            });
        } else {
            chartInstanceRef.current.hideLoading();
        }
    }, [loading]);

    // Handle resize
    useEffect(() => {
        const handleResize = () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.resize();
            }
        };

        window.addEventListener('resize', handleResize);

        // Also observe container resize
        const resizeObserver = new ResizeObserver(handleResize);
        if (chartRef.current) {
            resizeObserver.observe(chartRef.current);
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            resizeObserver.disconnect();
        };
    }, []);

    return (
        <div className={cn(
            'bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden',
            className
        )}>
            {(title || subtitle) && (
                <div className="px-5 pt-4 pb-2">
                    {title && (
                        <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
                    )}
                    {subtitle && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
                    )}
                </div>
            )}
            <div
                ref={chartRef}
                style={{ height: typeof height === 'number' ? `${height}px` : height }}
                className="w-full"
            />
        </div>
    );
};

export default BaseChart;
