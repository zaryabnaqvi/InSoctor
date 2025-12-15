import React, { useMemo } from 'react';
import BaseChart from './BaseChart';
import type { EChartsOption } from 'echarts';

export interface BarChartData {
    name: string;
    value: number;
    color?: string;
}

export interface BarChartProps {
    data: BarChartData[];
    title?: string;
    subtitle?: string;
    orientation?: 'vertical' | 'horizontal';
    showLegend?: boolean;
    showLabels?: boolean;
    colorScheme?: string[];
    height?: string | number;
    loading?: boolean;
    className?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
}

const defaultColors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
];

export const BarChart: React.FC<BarChartProps> = ({
    data,
    title,
    subtitle,
    orientation = 'vertical',
    showLegend = false,
    showLabels = true,
    colorScheme = defaultColors,
    height = 300,
    loading = false,
    className,
    xAxisLabel,
    yAxisLabel,
}) => {
    const option: EChartsOption = useMemo(() => {
        const categories = data.map((d) => d.name);
        const values = data.map((d) => d.value);
        const colors = data.map((d, i) => d.color || colorScheme[i % colorScheme.length]);

        const isHorizontal = orientation === 'horizontal';

        return {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow',
                },
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: '#e2e8f0',
                textStyle: {
                    color: '#334155',
                },
            },
            legend: showLegend
                ? {
                    bottom: 0,
                    textStyle: {
                        color: '#64748b',
                    },
                }
                : undefined,
            grid: {
                left: '3%',
                right: '4%',
                bottom: showLegend ? '15%' : '10%',
                top: '10%',
                containLabel: true,
            },
            xAxis: {
                type: isHorizontal ? 'value' : 'category',
                data: isHorizontal ? undefined : categories,
                name: isHorizontal ? yAxisLabel : xAxisLabel,
                axisLabel: {
                    color: '#64748b',
                    rotate: isHorizontal ? 0 : categories.some((c) => c.length > 10) ? 30 : 0,
                },
                axisLine: {
                    lineStyle: {
                        color: '#e2e8f0',
                    },
                },
                splitLine: isHorizontal
                    ? {
                        lineStyle: {
                            color: '#f1f5f9',
                        },
                    }
                    : undefined,
            },
            yAxis: {
                type: isHorizontal ? 'category' : 'value',
                data: isHorizontal ? categories : undefined,
                name: isHorizontal ? xAxisLabel : yAxisLabel,
                axisLabel: {
                    color: '#64748b',
                },
                axisLine: {
                    lineStyle: {
                        color: '#e2e8f0',
                    },
                },
                splitLine: {
                    lineStyle: {
                        color: '#f1f5f9',
                    },
                },
            },
            series: [
                {
                    type: 'bar',
                    data: values.map((v, i) => ({
                        value: v,
                        itemStyle: {
                            color: colors[i],
                            borderRadius: isHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0],
                        },
                    })),
                    barMaxWidth: 40,
                    label: showLabels
                        ? {
                            show: true,
                            position: isHorizontal ? 'right' : 'top',
                            formatter: '{c}',
                            color: '#64748b',
                            fontSize: 11,
                        }
                        : undefined,
                },
            ],
        };
    }, [data, orientation, showLegend, showLabels, colorScheme, xAxisLabel, yAxisLabel]);

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

export default BarChart;
