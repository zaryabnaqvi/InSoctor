import mongoose, { Schema, Document } from 'mongoose';
import {
    ReportTemplate,
    ScheduledReport,
    GeneratedReport,
    EmailServerConfig,
    ReportHistory,
    ReportPermission,
    ReportComment,
    TemplateVersion
} from '../types/report.types';

// Report Template Schema
const WidgetPositionSchema = new Schema({
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    w: { type: Number, required: true },
    h: { type: Number, required: true }
}, { _id: false });

const QueryConfigSchema = new Schema({
    filters: [Schema.Types.Mixed],
    groupBy: [String],
    aggregation: {
        field: String,
        type: String
    },
    sortBy: {
        field: String,
        order: { type: String, enum: ['asc', 'desc'] }
    },
    limit: Number
}, { _id: false });

const ChartConfigSchema = new Schema({
    xAxis: {
        field: String,
        label: String
    },
    yAxis: {
        field: String,
        label: String
    },
    series: [{
        field: String,
        name: String,
        color: String
    }],
    colorScheme: [String],
    showLegend: Boolean,
    showTooltip: Boolean,
    showDataLabels: Boolean
}, { _id: false });

const TableConfigSchema = new Schema({
    columns: [{
        field: String,
        header: String,
        width: Number,
        sortable: Boolean,
        filterable: Boolean
    }],
    pagination: {
        enabled: Boolean,
        pageSize: Number
    },
    conditionalFormatting: [{
        condition: {
            field: String,
            operator: String,
            value: Schema.Types.Mixed
        },
        style: {
            color: String,
            backgroundColor: String,
            fontWeight: String
        }
    }]
}, { _id: false });

const WidgetConfigSchema = new Schema({
    id: { type: String, required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    description: String,
    dataSource: { type: String, required: true },
    queryConfig: QueryConfigSchema,
    chartConfig: ChartConfigSchema,
    tableConfig: TableConfigSchema,
    position: WidgetPositionSchema
}, { _id: false });

const LayoutConfigSchema = new Schema({
    columns: { type: Number, default: 12 },
    rowHeight: { type: Number, default: 100 },
    breakpoints: {
        lg: Number,
        md: Number,
        sm: Number,
        xs: Number
    }
}, { _id: false });

const ReportStylingSchema = new Schema({
    theme: { type: String, enum: ['light', 'dark', 'custom'], default: 'light' },
    primaryColor: String,
    secondaryColor: String,
    fontFamily: String,
    logo: String,
    watermark: String,
    headerText: String,
    footerText: String
}, { _id: false });

const ReportTemplateSchema = new Schema<ReportTemplate & Document>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: {
        type: String,
        enum: ['security', 'compliance', 'operational', 'executive', 'custom'],
        required: true
    },
    widgets: [WidgetConfigSchema],
    globalFilters: [Schema.Types.Mixed],
    layout: { type: LayoutConfigSchema, default: {} },
    styling: ReportStylingSchema,
    isPublic: { type: Boolean, default: false },
    isPredefined: { type: Boolean, default: false },
    createdBy: { type: String, required: true },
    version: { type: Number, default: 1 },
    tags: [String]
}, {
    timestamps: true
});

// Indexes
ReportTemplateSchema.index({ createdBy: 1 });
ReportTemplateSchema.index({ category: 1 });
ReportTemplateSchema.index({ isPublic: 1 });
ReportTemplateSchema.index({ tags: 1 });
ReportTemplateSchema.index({ name: 'text', description: 'text' });

// Scheduled Report Schema
const ScheduleConfigSchema = new Schema({
    cronExpression: { type: String, required: true },
    timezone: String,
    description: String
}, { _id: false });

const DeliveryConfigSchema = new Schema({
    method: {
        type: String,
        enum: ['email', 'webhook', 'archive'],
        required: true
    },
    recipients: [String],
    webhookUrl: String,
    format: {
        type: String,
        enum: ['pdf', 'excel', 'csv', 'json', 'powerpoint'],
        required: true
    },
    includeRawData: { type: Boolean, default: false },
    onlyIfDataChanged: { type: Boolean, default: false }
}, { _id: false });

const ScheduledReportSchema = new Schema<ScheduledReport & Document>({
    templateId: { type: String, required: true },
    templateName: { type: String, required: true },
    schedule: { type: ScheduleConfigSchema, required: true },
    delivery: { type: DeliveryConfigSchema, required: true },
    enabled: { type: Boolean, default: true },
    lastRun: Date,
    nextRun: { type: Date, required: true },
    createdBy: { type: String, required: true }
}, {
    timestamps: true
});

// Indexes
ScheduledReportSchema.index({ createdBy: 1 });
ScheduledReportSchema.index({ enabled: 1 });
ScheduledReportSchema.index({ nextRun: 1 });

// Generated Report Schema
const WidgetDataSchema = new Schema({
    widgetId: String,
    widgetType: String,
    data: [Schema.Types.Mixed],
    error: String
}, { _id: false });

const ReportMetadataSchema = new Schema({
    totalRecords: Number,
    executionTime: Number,
    dataSourcesUsed: [String],
    filtersSummary: String
}, { _id: false });

const GeneratedReportSchema = new Schema<GeneratedReport & Document>({
    templateId: { type: String, required: true },
    templateName: { type: String, required: true },
    generatedAt: { type: String, required: true },
    generatedBy: { type: String, required: true },
    filters: [Schema.Types.Mixed],
    data: [WidgetDataSchema],
    metadata: ReportMetadataSchema
}, {
    timestamps: true
});

// Indexes
GeneratedReportSchema.index({ templateId: 1 });
GeneratedReportSchema.index({ generatedBy: 1 });
GeneratedReportSchema.index({ generatedAt: -1 });

// Email Server Config Schema
const EmailServerConfigSchema = new Schema<EmailServerConfig & Document>({
    userId: { type: String, required: true, unique: true },
    host: { type: String, required: true },
    port: { type: Number, required: true },
    secure: { type: Boolean, default: false },
    auth: {
        user: { type: String, required: true },
        pass: { type: String, required: true }
    },
    fromAddress: { type: String, required: true },
    fromName: String,
    isVerified: { type: Boolean, default: false }
}, {
    timestamps: true
});

// Note: unique: true on userId already creates an index, no need for additional index

// Report History Schema
const ReportHistorySchema = new Schema<ReportHistory & Document>({
    templateId: { type: String, required: true },
    generatedReportId: { type: String, required: true },
    generatedAt: { type: String, required: true },
    generatedBy: { type: String, required: true },
    fileUrl: String,
    format: {
        type: String,
        enum: ['pdf', 'excel', 'csv', 'json', 'powerpoint'],
        required: true
    },
    fileSize: Number,
    status: {
        type: String,
        enum: ['success', 'failed', 'pending'],
        default: 'pending'
    },
    error: String
}, {
    timestamps: true
});

// Indexes
ReportHistorySchema.index({ templateId: 1 });
ReportHistorySchema.index({ generatedBy: 1 });
ReportHistorySchema.index({ generatedAt: -1 });
ReportHistorySchema.index({ status: 1 });

// Report Permission Schema
const ReportPermissionSchema = new Schema<ReportPermission & Document>({
    templateId: { type: String, required: true },
    userId: { type: String, required: true },
    permission: {
        type: String,
        enum: ['view', 'edit', 'admin'],
        required: true
    },
    grantedBy: { type: String, required: true },
    grantedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Indexes
ReportPermissionSchema.index({ templateId: 1, userId: 1 });
ReportPermissionSchema.index({ userId: 1 });

// Report Comment Schema
const ReportCommentSchema = new Schema<ReportComment & Document>({
    templateId: { type: String, required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    comment: { type: String, required: true }
}, {
    timestamps: true
});

// Indexes
ReportCommentSchema.index({ templateId: 1 });
ReportCommentSchema.index({ userId: 1 });
ReportCommentSchema.index({ createdAt: -1 });

// Template Version Schema
const TemplateVersionSchema = new Schema<TemplateVersion & Document>({
    templateId: { type: String, required: true },
    version: { type: Number, required: true },
    templateData: { type: Schema.Types.Mixed, required: true },
    changedBy: { type: String, required: true },
    changeDescription: String
}, {
    timestamps: true
});

// Indexes
TemplateVersionSchema.index({ templateId: 1, version: -1 });
TemplateVersionSchema.index({ changedBy: 1 });

// Export Models
export const ReportTemplateModel = mongoose.model<ReportTemplate & Document>('ReportTemplate', ReportTemplateSchema);
export const ScheduledReportModel = mongoose.model<ScheduledReport & Document>('ScheduledReport', ScheduledReportSchema);
export const GeneratedReportModel = mongoose.model<GeneratedReport & Document>('GeneratedReport', GeneratedReportSchema);
export const EmailServerConfigModel = mongoose.model<EmailServerConfig & Document>('EmailServerConfig', EmailServerConfigSchema);
export const ReportHistoryModel = mongoose.model<ReportHistory & Document>('ReportHistory', ReportHistorySchema);
export const ReportPermissionModel = mongoose.model<ReportPermission & Document>('ReportPermission', ReportPermissionSchema);
export const ReportCommentModel = mongoose.model<ReportComment & Document>('ReportComment', ReportCommentSchema);
export const TemplateVersionModel = mongoose.model<TemplateVersion & Document>('TemplateVersion', TemplateVersionSchema);
