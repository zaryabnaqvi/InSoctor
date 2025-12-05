import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { cn } from '@/lib/utils';

interface FunnelDataPoint {
    name: string;
    value: number;
}

interface FunnelChartProps {
    title?: string;
    data: FunnelDataPoint[];
    colors?: string[];
    showLabels?: boolean;
    showPercent?: boolean;
    orientation?: 'vertical' | 'horizontal';
    height?: number;
    className?: string;
}

export const FunnelChart: React.FC<FunnelChartProps> = ({
    title,
    data,
    colors,
    showLabels = true,
    showPercent = true,
    orientation = 'vertical',
    height = 300,
    className,
}) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<echarts.ECharts | null>(null);

    useEffect(() => {
        if (!chartRef.current || !data.length) return;

        chartInstance.current = echarts.init(chartRef.current);

        // Sort data by value descending for funnel effect
        const sortedData = [...data].sort((a, b) => b.value - a.value);
        const maxValue = sortedData[0]?.value || 1;

        const option: echarts.EChartsOption = {
            title: title ? {
                text: title,
                left: 'center',
                textStyle: { fontSize: 14, fontWeight: 600 },
            } : undefined,
            tooltip: {
                trigger: 'item',
                formatter: (params: any) => {
                    const percent = ((params.value / maxValue) * 100).toFixed(1);
                    return `${params.name}: <b>${params.value}</b> (${percent}%)`;
                },
            },
            legend: {
                show: false,
            },
            color: colors || [
                '#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff'
            ],
            series: [
                {
                    name: title || 'Funnel',
                    type: 'funnel',
                    left: '10%',
                    right: '10%',
                    top: title ? 50 : 20,
                    bottom: 20,
                    width: '80%',
                    sort: 'descending',
                    orient: orientation,
                    gap: 2,
                    label: {
                        show: showLabels,
                        position: 'inside',
                        formatter: showPercent
                            ? (params: any) => `${params.name}\n${((params.value / maxValue) * 100).toFixed(0)}%`
                            : '{b}',
                        fontSize: 11,
                        lineHeight: 16,
                    },
                    labelLine: {
                        length: 10,
                        lineStyle: { width: 1, type: 'solid' },
                    },
                    itemStyle: {
                        borderColor: '#fff',
                        borderWidth: 1,
                    },
                    emphasis: {
                        label: { fontSize: 13, fontWeight: 'bold' },
                        itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.3)' },
                    },
                    data: sortedData.map(item => ({
                        name: item.name,
                        value: item.value,
                    })),
                },
            ],
        };

        chartInstance.current.setOption(option);

        const handleResize = () => chartInstance.current?.resize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chartInstance.current?.dispose();
        };
    }, [title, data, colors, showLabels, showPercent, orientation]);

    return (
        <div
            ref={chartRef}
            className={cn('w-full', className)}
            style={{ height }}
        />
    );
};

export default FunnelChart;
