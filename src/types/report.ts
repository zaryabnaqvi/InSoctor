// Mirror of backend types for frontend use

export type WidgetType =
    | 'kpi'
    | 'bar-chart'
    | 'line-chart'
    | 'pie-chart'
    | 'area-chart'
    | 'data-table'
    | 'heatmap'
    | 'timeline'
    | 'geo-map'
    | 'gauge'
    | 'funnel'
    | 'sparkline';

export type DataSource =
    | 'wazuh-alerts'
    | 'wazuh-agents'
    | 'wazuh-rules'
    | 'iris-cases'
    | 'vulnerabilities'
    | 'fim-events'
    | 'custom-query';

export type AggregationType = 'count' | 'sum' | 'avg' | 'min' | 'max' | 'percentile';

export type FilterOperator =
    | 'equals'
    | 'not-equals'
    | 'contains'
    | 'not-contains'
    | 'greater-than'
    | 'less-than'
    | 'in'
    | 'not-in'
    | 'between'
    | 'exists'
    | 'not-exists';

export type ReportCategory = 'security' | 'compliance' | 'operational' | 'executive' | 'custom';

export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json' | 'powerpoint';

export interface WidgetPosition {
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface ReportFilter {
    field: string;
    operator: FilterOperator;
    value: any;
    logicalOperator?: 'AND' | 'OR';
}

export interface QueryConfig {
    filters: ReportFilter[];
    groupBy?: string[];
    aggregation?: {
        field: string;
        type: AggregationType;
    };
    sortBy?: {
        field: string;
        order: 'asc' | 'desc';
    };
    limit?: number;
}

export interface ChartConfig {
    xAxis?: {
        field: string;
        label?: string;
    };
    yAxis?: {
        field: string;
        label?: string;
    };
    series?: Array<{
        field: string;
        name: string;
        color?: string;
    }>;
    colorScheme?: string[];
    showLegend?: boolean;
    showTooltip?: boolean;
    showDataLabels?: boolean;
}

export interface TableConfig {
    columns: Array<{
        field: string;
        header: string;
        width?: number;
        sortable?: boolean;
        filterable?: boolean;
    }>;
    pagination?: {
        enabled: boolean;
        pageSize: number;
    };
    conditionalFormatting?: Array<{
        condition: {
            field: string;
            operator: FilterOperator;
            value: any;
        };
        style: {
            color?: string;
            backgroundColor?: string;
            fontWeight?: string;
        };
    }>;
}

export interface WidgetConfig {
    id: string;
    type: WidgetType;
    title: string;
    description?: string;
    dataSource: DataSource;
    queryConfig: QueryConfig;
    chartConfig?: ChartConfig;
    tableConfig?: TableConfig;
    position: WidgetPosition;
    customization?: {
        color?: 'default' | 'success' | 'warning' | 'danger' | 'info';
        orientation?: 'vertical' | 'horizontal';
        showLegend?: boolean;
        showLabels?: boolean;
        donut?: boolean;
        stacked?: boolean;
        height?: number;
        pageSize?: number;
        searchable?: boolean;
        columns?: Array<{
            key: string;
            header: string;
            sortable?: boolean;
            width?: string;
        }>;
    };
}

export interface LayoutConfig {
    columns: number;
    rowHeight: number;
    breakpoints?: {
        lg: number;
        md: number;
        sm: number;
        xs: number;
    };
}

export interface ReportStyling {
    theme?: 'light' | 'dark' | 'custom';
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    logo?: string;
    watermark?: string;
    headerText?: string;
    footerText?: string;
}

export interface ReportTemplate {
    _id?: string;
    name: string;
    description: string;
    category: ReportCategory;
    widgets: WidgetConfig[];
    globalFilters?: ReportFilter[];
    layout: LayoutConfig;
    styling?: ReportStyling;
    isPublic: boolean;
    isPredefined: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    version: number;
    tags?: string[];
}

export interface WidgetData {
    widgetId: string;
    widgetType: WidgetType;
    data: any[];
    error?: string;
}

export interface ReportMetadata {
    totalRecords: number;
    executionTime: number;
    dataSourcesUsed: DataSource[];
    filtersSummary: string;
}

export interface GeneratedReport {
    _id?: string;
    templateId: string;
    templateName: string;
    generatedAt: string;
    generatedBy: string;
    filters: ReportFilter[];
    data: WidgetData[];
    metadata: ReportMetadata;
}

export interface CreateReportTemplateRequest {
    name: string;
    description: string;
    category: ReportCategory;
    widgets?: WidgetConfig[];
    globalFilters?: ReportFilter[];
    layout?: LayoutConfig;
    styling?: ReportStyling;
    isPublic?: boolean;
    tags?: string[];
}

export interface UpdateReportTemplateRequest extends Partial<CreateReportTemplateRequest> {
    version?: number;
}

export interface GenerateReportRequest {
    templateId: string;
    filters?: ReportFilter[];
    dateRange?: {
        start: string;
        end: string;
    };
}

export interface QueryDataRequest {
    dataSource: DataSource;
    filters?: ReportFilter[];
    groupBy?: string[];
    aggregation?: {
        field: string;
        type: AggregationType;
    };
    limit?: number;
    offset?: number;
}

export interface PredefinedTemplate {
    id: string;
    name: string;
    description: string;
    category: ReportCategory;
    thumbnail?: string;
    template: Omit<ReportTemplate, '_id' | 'createdBy' | 'createdAt' | 'updatedAt'>;
}
