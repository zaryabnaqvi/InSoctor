import React, { useMemo } from 'react';
import BaseChart from './BaseChart';
import type { EChartsOption } from 'echarts';

export interface LineChartSeries {
    name: string;
    data: Array<{ x: string | number; y: number }>;
    color?: string;
    areaStyle?: boolean;
    smooth?: boolean;
}

export interface LineChartProps {
    series: LineChartSeries[];
    title?: string;
    subtitle?: string;
    showLegend?: boolean;
    colorScheme?: string[];
    height?: string | number;
    loading?: boolean;
    className?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    xAxisType?: 'category' | 'time' | 'value';
}

const defaultColors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
];

export const LineChart: React.FC<LineChartProps> = ({
    series,
    title,
    subtitle,
    showLegend = true,
    colorScheme = defaultColors,
    height = 300,
    loading = false,
    className,
    xAxisLabel,
    yAxisLabel,
    xAxisType = 'category',
}) => {
    const option: EChartsOption = useMemo(() => {
        // Get unique x values for category axis
        const xValues = xAxisType === 'category'
            ? [...new Set(series.flatMap((s) => s.data.map((d) => d.x)))]
            : undefined;

        return {
            tooltip: {
                trigger: 'axis',
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
                type: xAxisType,
                data: xValues,
                name: xAxisLabel,
                boundaryGap: false,
                axisLabel: {
                    color: '#64748b',
                },
                axisLine: {
                    lineStyle: {
                        color: '#e2e8f0',
                    },
                },
            },
            yAxis: {
                type: 'value',
                name: yAxisLabel,
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
            series: series.map((s, i) => ({
                name: s.name,
                type: 'line',
                data: xAxisType === 'category'
                    ? s.data.map((d) => d.y)
                    : s.data.map((d) => [d.x, d.y]),
                smooth: s.smooth ?? true,
                showSymbol: false,
                lineStyle: {
                    width: 2,
                    color: s.color || colorScheme[i % colorScheme.length],
                },
                itemStyle: {
                    color: s.color || colorScheme[i % colorScheme.length],
                },
                areaStyle: s.areaStyle
                    ? {
                        opacity: 0.1,
                        color: s.color || colorScheme[i % colorScheme.length],
                    }
                    : undefined,
            })),
        };
    }, [series, showLegend, colorScheme, xAxisLabel, yAxisLabel, xAxisType]);

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

export default LineChart;
