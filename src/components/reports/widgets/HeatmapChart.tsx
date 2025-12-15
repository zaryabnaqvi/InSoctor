import React, { useEffect, useRef, useMemo } from 'react';
import * as echarts from 'echarts';
import { cn } from '@/lib/utils';

interface HeatmapDataPoint {
    x: string | number;
    y: string | number;
    value: number;
}

interface HeatmapChartProps {
    title?: string;
    data: HeatmapDataPoint[];
    xLabels?: string[];
    yLabels?: string[];
    colorRange?: [string, string]; // [low color, high color]
    showLabels?: boolean;
    height?: number;
    className?: string;
}

export const HeatmapChart: React.FC<HeatmapChartProps> = ({
    title,
    data,
    xLabels,
    yLabels,
    colorRange = ['#e0f2fe', '#0369a1'],
    showLabels = true,
    height = 300,
    className,
}) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<echarts.ECharts | null>(null);

    // Extract unique x and y values if labels not provided
    const { xAxis, yAxis, chartData, minVal, maxVal } = useMemo(() => {
        const xSet = new Set<string>();
        const ySet = new Set<string>();

        data.forEach(point => {
            xSet.add(String(point.x));
            ySet.add(String(point.y));
        });

        const xAx = xLabels || Array.from(xSet);
        const yAx = yLabels || Array.from(ySet);

        // Transform data to [xIndex, yIndex, value] format
        const transformed = data.map(point => {
            const xIndex = xAx.indexOf(String(point.x));
            const yIndex = yAx.indexOf(String(point.y));
            return [xIndex, yIndex, point.value];
        });

        const values = data.map(d => d.value);
        const min = Math.min(...values);
        const max = Math.max(...values);

        return { xAxis: xAx, yAxis: yAx, chartData: transformed, minVal: min, maxVal: max };
    }, [data, xLabels, yLabels]);

    useEffect(() => {
        if (!chartRef.current) return;

        // Initialize chart
        chartInstance.current = echarts.init(chartRef.current);

        const option: echarts.EChartsOption = {
            title: title ? {
                text: title,
                left: 'center',
                textStyle: {
                    fontSize: 14,
                    fontWeight: 600,
                },
            } : undefined,
            tooltip: {
                position: 'top',
                formatter: (params: any) => {
                    const [xIdx, yIdx, val] = params.data;
                    return `${xAxis[xIdx]} × ${yAxis[yIdx]}: <b>${val}</b>`;
                },
            },
            grid: {
                left: '10%',
                right: '10%',
                top: title ? '15%' : '5%',
                bottom: '15%',
                containLabel: true,
            },
            xAxis: {
                type: 'category',
                data: xAxis,
                splitArea: { show: true },
                axisLabel: {
                    rotate: 45,
                    fontSize: 10,
                },
            },
            yAxis: {
                type: 'category',
                data: yAxis,
                splitArea: { show: true },
                axisLabel: { fontSize: 10 },
            },
            visualMap: {
                min: minVal,
                max: maxVal,
                calculable: true,
                orient: 'horizontal',
                left: 'center',
                bottom: '0%',
                inRange: {
                    color: colorRange,
                },
            },
            series: [
                {
                    type: 'heatmap',
                    data: chartData,
                    label: {
                        show: showLabels && xAxis.length <= 10 && yAxis.length <= 10,
                        fontSize: 10,
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowColor: 'rgba(0, 0, 0, 0.5)',
                        },
                    },
                },
            ],
        };

        chartInstance.current.setOption(option);

        // Handle resize
        const handleResize = () => chartInstance.current?.resize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chartInstance.current?.dispose();
        };
    }, [title, xAxis, yAxis, chartData, colorRange, showLabels, minVal, maxVal]);

    return (
        <div
            ref={chartRef}
            className={cn('w-full', className)}
            style={{ height }}
        />
    );
};

export default HeatmapChart;
