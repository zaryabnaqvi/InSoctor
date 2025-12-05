import React, { useMemo } from 'react';
import BaseChart from './BaseChart';
import type { EChartsOption } from 'echarts';

export interface AreaChartSeries {
    name: string;
    data: Array<{ x: string | number; y: number }>;
    color?: string;
    smooth?: boolean;
}

export interface AreaChartProps {
    series: AreaChartSeries[];
    title?: string;
    subtitle?: string;
    showLegend?: boolean;
    stacked?: boolean;
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

export const AreaChart: React.FC<AreaChartProps> = ({
    series,
    title,
    subtitle,
    showLegend = true,
    stacked = false,
    colorScheme = defaultColors,
    height = 300,
    loading = false,
    className,
    xAxisLabel,
    yAxisLabel,
    xAxisType = 'category',
}) => {
    const option: EChartsOption = useMemo(() => {
        const xValues = xAxisType === 'category'
            ? [...new Set(series.flatMap((s) => s.data.map((d) => d.x)))]
            : undefined;

        return {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    crossStyle: {
                        color: '#999',
                    },
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
            series: series.map((s, i) => {
                const color = s.color || colorScheme[i % colorScheme.length];
                return {
                    name: s.name,
                    type: 'line',
                    stack: stacked ? 'Total' : undefined,
                    data: xAxisType === 'category'
                        ? s.data.map((d) => d.y)
                        : s.data.map((d) => [d.x, d.y]),
                    smooth: s.smooth ?? true,
                    showSymbol: false,
                    lineStyle: {
                        width: 2,
                        color,
                    },
                    itemStyle: {
                        color,
                    },
                    areaStyle: {
                        opacity: stacked ? 0.6 : 0.2,
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [
                                { offset: 0, color: color },
                                { offset: 1, color: 'rgba(255,255,255,0)' },
                            ],
                        },
                    },
                };
            }),
        };
    }, [series, showLegend, stacked, colorScheme, xAxisLabel, yAxisLabel, xAxisType]);

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

export default AreaChart;
