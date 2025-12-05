import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { cn } from '@/lib/utils';

interface GaugeChartProps {
    title?: string;
    value: number;
    max?: number;
    min?: number;
    unit?: string;
    thresholds?: {
        value: number;
        color: string;
        label?: string;
    }[];
    height?: number;
    className?: string;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
    title,
    value,
    max = 100,
    min = 0,
    unit = '',
    thresholds = [
        { value: 30, color: '#22c55e', label: 'Low' },
        { value: 70, color: '#f59e0b', label: 'Medium' },
        { value: 100, color: '#ef4444', label: 'High' },
    ],
    height = 250,
    className,
}) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<echarts.ECharts | null>(null);

    useEffect(() => {
        if (!chartRef.current) return;

        chartInstance.current = echarts.init(chartRef.current);

        // Build axis line colors from thresholds
        const axisLineColors = thresholds.map((t) => {
            return [(t.value - min) / (max - min), t.color];
        });

        // Determine current color based on value
        const currentColor = thresholds.find(t => value <= t.value)?.color || thresholds[thresholds.length - 1].color;

        const option: echarts.EChartsOption = {
            series: [
                {
                    type: 'gauge',
                    startAngle: 180,
                    endAngle: 0,
                    min,
                    max,
                    splitNumber: 5,
                    center: ['50%', '70%'],
                    radius: '90%',
                    axisLine: {
                        lineStyle: {
                            width: 15,
                            color: axisLineColors as any,
                        },
                    },
                    pointer: {
                        icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
                        length: '70%',
                        width: 10,
                        offsetCenter: [0, '-10%'],
                        itemStyle: {
                            color: currentColor,
                        },
                    },
                    axisTick: {
                        length: 8,
                        lineStyle: { color: 'auto', width: 1 },
                    },
                    splitLine: {
                        length: 12,
                        lineStyle: { color: 'auto', width: 2 },
                    },
                    axisLabel: {
                        color: '#6b7280',
                        fontSize: 10,
                        distance: 20,
                        formatter: (val: number) => `${val}${unit}`,
                    },
                    title: {
                        show: !!title,
                        offsetCenter: [0, '30%'],
                        fontSize: 12,
                        color: '#374151',
                    },
                    detail: {
                        fontSize: 24,
                        fontWeight: 'bold',
                        offsetCenter: [0, '0%'],
                        valueAnimation: true,
                        formatter: (val: number) => `${val}${unit}`,
                        color: currentColor,
                    },
                    data: [{ value, name: title }],
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
    }, [title, value, max, min, unit, thresholds]);

    return (
        <div
            ref={chartRef}
            className={cn('w-full', className)}
            style={{ height }}
        />
    );
};

export default GaugeChart;
