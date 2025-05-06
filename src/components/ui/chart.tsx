import { ReactNode } from 'react';
import { Bar, Line, Pie } from 'recharts';
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  LineChart as RechartsLineChart,
  PieChart as RechartsPieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';

type ChartProps = {
  data: Record<string, any>[];
  index: string;
  categories: string[];
  colors?: string[];
  valueFormatter?: (value: number) => string;
  startEndOnly?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showLegend?: boolean;
  showGridLines?: boolean;
  height?: number;
  className?: string;
};

const defaultColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const defaultFormatter = (value: number) => value.toString();

export function BarChart({
  data,
  index,
  categories,
  colors = defaultColors,
  valueFormatter = defaultFormatter,
  startEndOnly = false,
  showXAxis = true,
  showYAxis = true,
  showLegend = true,
  showGridLines = true,
  height = 300,
  className = '',
}: ChartProps) {
  return (
    <div style={{ width: '100%', height }} className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          {showGridLines && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />}
          {showXAxis && (
            <XAxis
              dataKey={index}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={(value) => {
                if (startEndOnly) {
                  const isFirstOrLast = data.findIndex(item => item[index] === value) === 0 || 
                    data.findIndex(item => item[index] === value) === data.length - 1;
                  return isFirstOrLast ? value : '';
                }
                return value;
              }}
            />
          )}
          {showYAxis && (
            <YAxis 
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={(value) => value}
            />
          )}
          <Tooltip
            formatter={(value: number) => [valueFormatter(value), '']}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              borderColor: 'hsl(var(--border))',
              color: 'hsl(var(--card-foreground))',
              borderRadius: '0.375rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            }}
          />
          {showLegend && (
            <Legend
              verticalAlign="top"
              formatter={(value: string) => <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>}
            />
          )}
          {categories.map((category, index) => (
            <Bar
              key={category}
              dataKey={category}
              fill={colors[index % colors.length]}
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LineChart({
  data,
  index,
  categories,
  colors = defaultColors,
  valueFormatter = defaultFormatter,
  startEndOnly = false,
  showXAxis = true,
  showYAxis = true,
  showLegend = true,
  showGridLines = true,
  height = 300,
  className = '',
}: ChartProps) {
  return (
    <div style={{ width: '100%', height }} className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          {showGridLines && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />}
          {showXAxis && (
            <XAxis
              dataKey={index}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={(value) => {
                if (startEndOnly) {
                  const isFirstOrLast = data.findIndex(item => item[index] === value) === 0 || 
                    data.findIndex(item => item[index] === value) === data.length - 1;
                  return isFirstOrLast ? value : '';
                }
                return value;
              }}
            />
          )}
          {showYAxis && (
            <YAxis 
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={(value) => value}
            />
          )}
          <Tooltip
            formatter={(value: number) => [valueFormatter(value), '']}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              borderColor: 'hsl(var(--border))',
              color: 'hsl(var(--card-foreground))',
              borderRadius: '0.375rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            }}
          />
          {showLegend && (
            <Legend
              verticalAlign="top"
              formatter={(value: string) => <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>}
            />
          )}
          {categories.map((category, index) => (
            <Line
              key={category}
              type="monotone"
              dataKey={category}
              stroke={colors[index % colors.length]}
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PieChart({
  data,
  index,
  categories,
  colors = defaultColors,
  valueFormatter = defaultFormatter,
  showLegend = true,
  height = 300,
  className = '',
}: Omit<ChartProps, 'showXAxis' | 'showYAxis' | 'showGridLines' | 'startEndOnly'>) {
  return (
    <div style={{ width: '100%', height }} className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            nameKey={index}
            dataKey={categories[0]}
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [valueFormatter(value), '']}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              borderColor: 'hsl(var(--border))',
              color: 'hsl(var(--card-foreground))',
              borderRadius: '0.375rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            }}
          />
          {showLegend && (
            <Legend
              formatter={(value: string) => <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}