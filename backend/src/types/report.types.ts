// Report Widget Types
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

// Widget Configuration
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
}

export interface WidgetPosition {
    x: number;
    y: number;
    w: number;  // width in grid units
    h: number;  // height in grid units
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

// Filter Configuration
export interface ReportFilter {
    field: string;
    operator: FilterOperator;
    value: any;
    logicalOperator?: 'AND' | 'OR';
}

// Report Template
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

export interface LayoutConfig {
    columns: number;  // Grid columns (default: 12)
    rowHeight: number;  // Height of each row in pixels
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

// Generated Report
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

export interface WidgetData {
    widgetId: string;
    widgetType: WidgetType;
    data: any[];
    error?: string;
}

export interface ReportMetadata {
    totalRecords: number;
    executionTime: number;  // in milliseconds
    dataSourcesUsed: DataSource[];
    filtersSummary: string;
}

// Scheduled Report
export interface ScheduledReport {
    _id?: string;
    templateId: string;
    templateName: string;
    schedule: ScheduleConfig;
    delivery: DeliveryConfig;
    enabled: boolean;
    lastRun?: string;
    nextRun: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface ScheduleConfig {
    cronExpression: string;
    timezone?: string;
    description?: string;  // Human-readable: "Daily at 9:00 AM"
}

export interface DeliveryConfig {
    method: 'email' | 'webhook' | 'archive';
    recipients?: string[];  // Email addresses
    webhookUrl?: string;
    format: ExportFormat;
    includeRawData?: boolean;
    onlyIfDataChanged?: boolean;
}

// Email Configuration (User Settings)
export interface EmailServerConfig {
    _id?: string;
    userId: string;
    host: string;
    port: number;
    secure: boolean;  // true for 465, false for other ports
    auth: {
        user: string;
        pass: string;
    };
    fromAddress: string;
    fromName?: string;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

// Report History
export interface ReportHistory {
    _id?: string;
    templateId: string;
    generatedReportId: string;
    generatedAt: string;
    generatedBy: string;
    fileUrl?: string;
    format: ExportFormat;
    fileSize?: number;  // in bytes
    status: 'success' | 'failed' | 'pending';
    error?: string;
}

// AI Report Request
export interface AIReportRequest {
    prompt: string;
    context?: {
        timeRange?: {
            start: string;
            end: string;
        };
        dataSources?: DataSource[];
        preferredWidgets?: WidgetType[];
    };
    userId: string;
}

export interface AIReportResponse {
    template: ReportTemplate;
    explanation: string;
    suggestions?: string[];
    confidence: number;  // 0-1
}

export interface AIInsightRequest {
    data: any[];
    context: string;  // What the data represents
    focusAreas?: string[];  // e.g., ['trends', 'anomalies', 'recommendations']
}

export interface AIInsightResponse {
    summary: string;
    keyFindings: string[];
    trends: string[];
    anomalies: Array<{
        description: string;
        severity: 'low' | 'medium' | 'high';
        recommendation?: string;
    }>;
    recommendations: string[];
}

// Widget Suggestion
export interface WidgetSuggestion {
    widgetType: WidgetType;
    title: string;
    description: string;
    confidence: number;
    sampleConfig: Partial<WidgetConfig>;
}

// Report Permissions
export interface ReportPermission {
    _id?: string;
    templateId: string;
    userId: string;
    permission: 'view' | 'edit' | 'admin';
    grantedBy: string;
    grantedAt: string;
}

// Report Comment
export interface ReportComment {
    _id?: string;
    templateId: string;
    userId: string;
    userName: string;
    comment: string;
    createdAt: string;
    updatedAt?: string;
}

// Template Version
export interface TemplateVersion {
    _id?: string;
    templateId: string;
    version: number;
    templateData: ReportTemplate;
    changedBy: string;
    changeDescription?: string;
    createdAt: string;
}

// API Request/Response Types
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
    version?: number;  // For optimistic locking
}

export interface GenerateReportRequest {
    templateId: string;
    filters?: ReportFilter[];
    dateRange?: {
        start: string;
        end: string;
    };
}

export interface ExportReportRequest {
    reportId: string;
    format: ExportFormat;
    styling?: ReportStyling;
    includeRawData?: boolean;
}

export interface ScheduleReportRequest {
    templateId: string;
    schedule: ScheduleConfig;
    delivery: DeliveryConfig;
}

export interface TestEmailConnectionRequest {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
    fromAddress: string;
    testRecipient: string;
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

// Predefined Templates
export interface PredefinedTemplate {
    id: string;
    name: string;
    description: string;
    category: ReportCategory;
    thumbnail?: string;
    template: Omit<ReportTemplate, '_id' | 'createdBy' | 'createdAt' | 'updatedAt'>;
}
