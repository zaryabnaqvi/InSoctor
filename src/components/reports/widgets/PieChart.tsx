import React, { useMemo } from 'react';
import BaseChart from './BaseChart';
import type { EChartsOption } from 'echarts';

export interface PieChartData {
    name: string;
    value: number;
    color?: string;
}

export interface PieChartProps {
    data: PieChartData[];
    title?: string;
    subtitle?: string;
    donut?: boolean;
    showLegend?: boolean;
    showLabels?: boolean;
    colorScheme?: string[];
    height?: string | number;
    loading?: boolean;
    className?: string;
    labelPosition?: 'outside' | 'inside';
}

const defaultColors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
];

export const PieChart: React.FC<PieChartProps> = ({
    data,
    title,
    subtitle,
    donut = false,
    showLegend = true,
    showLabels = true,
    colorScheme = defaultColors,
    height = 300,
    loading = false,
    className,
    labelPosition = 'outside',
}) => {
    const option: EChartsOption = useMemo(() => {
        const total = data.reduce((sum, d) => sum + d.value, 0);

        return {
            tooltip: {
                trigger: 'item',
                formatter: (params: any) => {
                    const percent = ((params.value / total) * 100).toFixed(1);
                    return `<strong>${params.name}</strong><br/>${params.value.toLocaleString()} (${percent}%)`;
                },
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: '#e2e8f0',
                textStyle: {
                    color: '#334155',
                },
            },
            legend: showLegend
                ? {
                    type: 'scroll',
                    orient: 'horizontal',
                    bottom: 0,
                    textStyle: {
                        color: '#64748b',
                    },
                }
                : undefined,
            series: [
                {
                    type: 'pie',
                    radius: donut ? ['50%', '75%'] : ['0%', '75%'],
                    center: ['50%', showLegend ? '45%' : '50%'],
                    avoidLabelOverlap: true,
                    itemStyle: {
                        borderRadius: 4,
                        borderColor: '#fff',
                        borderWidth: 2,
                    },
                    label: showLabels
                        ? {
                            show: true,
                            position: labelPosition,
                            formatter: labelPosition === 'inside'
                                ? '{d}%'
                                : '{b}: {d}%',
                            fontSize: 12,
                            color: labelPosition === 'inside' ? '#fff' : '#64748b',
                        }
                        : { show: false },
                    labelLine: showLabels && labelPosition === 'outside'
                        ? {
                            show: true,
                            length: 10,
                            length2: 10,
                            lineStyle: {
                                color: '#e2e8f0',
                            },
                        }
                        : { show: false },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.2)',
                        },
                        label: {
                            show: true,
                            fontWeight: 'bold',
                        },
                    },
                    data: data.map((d, i) => ({
                        name: d.name,
                        value: d.value,
                        itemStyle: {
                            color: d.color || colorScheme[i % colorScheme.length],
                        },
                    })),
                },
            ],
        };
    }, [data, donut, showLegend, showLabels, colorScheme, labelPosition]);

    return (
        <BaseChart
            option={option}
            title={title}
            subtitle={subtitle}
            height={height}
            loading={loading}
            className={className}
        />
    );
};

export default PieChart;
