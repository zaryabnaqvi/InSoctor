import {
    ReportTemplate,
    GeneratedReport,
    ReportFilter,
    WidgetConfig,
    WidgetData,
    QueryDataRequest,
    GenerateReportRequest,
    CreateReportTemplateRequest,
    UpdateReportTemplateRequest,
    DataSource,
    FilterOperator
} from '../types/report.types';
import {
    ReportTemplateModel,
    GeneratedReportModel
} from '../models/report.model';
import wazuhService from './wazuh.service';
import irisService from './iris.service';
import logger from '../config/logger';

export class ReportService {

    /**
     * Create a new report template
     */
    async createTemplate(userId: string, data: CreateReportTemplateRequest): Promise<ReportTemplate> {
        try {
            const template = new ReportTemplateModel({
                ...data,
                createdBy: userId,
                widgets: data.widgets || [],
                globalFilters: data.globalFilters || [],
                layout: data.layout || { columns: 12, rowHeight: 100 },
                isPublic: data.isPublic || false,
                isPredefined: false,
                version: 1,
                tags: data.tags || []
            });

            await template.save();
            logger.info(`Report template created: ${template._id}`, { userId, templateName: template.name });
            return template.toObject();
        } catch (error: any) {
            logger.error('Failed to create report template', { error: error.message, userId });
            throw new Error(`Failed to create template: ${error.message}`);
        }
    }

    /**
     * Get all templates for a user (includes public templates)
     */
    async getTemplates(userId: string, filters?: { category?: string; tags?: string[] }): Promise<ReportTemplate[]> {
        try {
            const query: any = {
                $or: [
                    { createdBy: userId },
                    { isPublic: true }
                ]
            };

            if (filters?.category) {
                query.category = filters.category;
            }

            if (filters?.tags && filters.tags.length > 0) {
                query.tags = { $in: filters.tags };
            }

            const templates = await ReportTemplateModel.find(query).sort({ updatedAt: -1 });
            logger.debug(`Retrieved ${templates.length} templates for user ${userId}`);
            return templates.map(t => t.toObject());
        } catch (error: any) {
            logger.error('Failed to get templates', { error: error.message, userId });
            throw new Error(`Failed to get templates: ${error.message}`);
        }
    }

    /**
     * Get a specific template by ID
     */
    async getTemplate(userId: string, templateId: string): Promise<ReportTemplate> {
        try {
            const template = await ReportTemplateModel.findById(templateId);

            if (!template) {
                throw new Error('Template not found');
            }

            // Check permissions
            if (template.createdBy !== userId && !template.isPublic) {
                throw new Error('Access denied to this template');
            }

            return template.toObject();
        } catch (error: any) {
            logger.error('Failed to get template', { error: error.message, userId, templateId });
            throw error;
        }
    }

    /**
     * Update a template
     */
    async updateTemplate(
        userId: string,
        templateId: string,
        updates: UpdateReportTemplateRequest
    ): Promise<ReportTemplate> {
        try {
            const template = await ReportTemplateModel.findById(templateId);

            if (!template) {
                throw new Error('Template not found');
            }

            if (template.createdBy !== userId) {
                throw new Error('Only the template creator can update it');
            }

            // Update fields
            Object.assign(template, updates);
            template.version += 1;
            template.updatedAt = new Date().toISOString() as any;

            await template.save();
            logger.info(`Template updated: ${templateId}`, { userId, version: template.version });
            return template.toObject();
        } catch (error: any) {
            logger.error('Failed to update template', { error: error.message, userId, templateId });
            throw error;
        }
    }

    /**
     * Delete a template
     */
    async deleteTemplate(userId: string, templateId: string): Promise<void> {
        try {
            const template = await ReportTemplateModel.findById(templateId);

            if (!template) {
                throw new Error('Template not found');
            }

            if (template.createdBy !== userId) {
                throw new Error('Only the template creator can delete it');
            }

            await ReportTemplateModel.deleteOne({ _id: templateId });
            logger.info(`Template deleted: ${templateId}`, { userId });
        } catch (error: any) {
            logger.error('Failed to delete template', { error: error.message, userId, templateId });
            throw error;
        }
    }

    /**
     * Generate a report from a template
     */
    async generateReport(userId: string, request: GenerateReportRequest): Promise<GeneratedReport> {
        try {
            const startTime = Date.now();

            const template = await this.getTemplate(userId, request.templateId);

            // Merge template global filters with request filters
            const allFilters = [
                ...(template.globalFilters || []),
                ...(request.filters || [])
            ];

            // Add date range filter if provided
            if (request.dateRange) {
                allFilters.push({
                    field: 'timestamp',
                    operator: 'between',
                    value: [request.dateRange.start, request.dateRange.end]
                });
            }

            // Generate data for each widget
            const widgetDataResults: WidgetData[] = [];
            const dataSourcesUsed: Set<DataSource> = new Set();

            for (const widget of template.widgets) {
                try {
                    const data = await this.queryDataForWidget(widget, allFilters);
                    widgetDataResults.push({
                        widgetId: widget.id,
                        widgetType: widget.type,
                        data
                    });
                    dataSourcesUsed.add(widget.dataSource);
                } catch (error: any) {
                    logger.error(`Failed to generate data for widget ${widget.id}`, { error: error.message });
                    widgetDataResults.push({
                        widgetId: widget.id,
                        widgetType: widget.type,
                        data: [],
                        error: error.message
                    });
                }
            }

            const executionTime = Date.now() - startTime;
            const totalRecords = widgetDataResults.reduce((sum, w) => sum + w.data.length, 0);

            const generatedReport = new GeneratedReportModel({
                templateId: template._id,
                templateName: template.name,
                generatedAt: new Date().toISOString(),
                generatedBy: userId,
                filters: allFilters,
                data: widgetDataResults,
                metadata: {
                    totalRecords,
                    executionTime,
                    dataSourcesUsed: Array.from(dataSourcesUsed),
                    filtersSummary: this.createFilterSummary(allFilters)
                }
            });

            await generatedReport.save();
            logger.info(`Report generated: ${generatedReport._id}`, {
                userId,
                templateId: template._id,
                executionTime,
                totalRecords
            });

            return generatedReport.toObject();
        } catch (error: any) {
            logger.error('Failed to generate report', { error: error.message, userId });
            throw error;
        }
    }

    /**
     * Query data for a widget based on its configuration
     */
    private async queryDataForWidget(widget: WidgetConfig, globalFilters: ReportFilter[]): Promise<any[]> {
        const mergedFilters = [...globalFilters, ...(widget.queryConfig.filters || [])];

        const queryRequest: QueryDataRequest = {
            dataSource: widget.dataSource,
            filters: mergedFilters,
            groupBy: widget.queryConfig.groupBy,
            aggregation: widget.queryConfig.aggregation,
            limit: widget.queryConfig.limit || 1000
        };

        return this.queryData(queryRequest);
    }

    /**
     * Query data from various sources
     */
    async queryData(request: QueryDataRequest): Promise<any[]> {
        try {
            switch (request.dataSource) {
                case 'wazuh-alerts':
                    return await this.queryWazuhAlerts(request);

                case 'wazuh-agents':
                    return await this.queryWazuhAgents(request);

                case 'wazuh-rules':
                    return await this.queryWazuhRules(request);

                case 'iris-cases':
                    return await this.queryIrisCases(request);

                default:
                    throw new Error(`Unsupported data source: ${request.dataSource}`);
            }
        } catch (error: any) {
            logger.error('Failed to query data', { error: error.message, dataSource: request.dataSource });
            throw error;
        }
    }

    /**
     * Query Wazuh alerts
     */
    private async queryWazuhAlerts(request: QueryDataRequest): Promise<any[]> {
        const filters: any = this.convertToWazuhFilters(request.filters || []);
        const alerts = await wazuhService.getAlerts(filters);

        // Apply aggregation if specified
        if (request.aggregation) {
            return this.aggregateData(alerts, request.groupBy, request.aggregation);
        }

        // Apply grouping if specified
        if (request.groupBy && request.groupBy.length > 0) {
            return this.groupData(alerts, request.groupBy);
        }

        return alerts.slice(0, request.limit || 1000);
    }

    /**
     * Query Wazuh agents
     */
    private async queryWazuhAgents(request: QueryDataRequest): Promise<any[]> {
        const agents = await wazuhService.getAgents();

        // Apply filters
        let filtered = this.applyFilters(agents, request.filters || []);

        // Apply grouping
        if (request.groupBy && request.groupBy.length > 0) {
            filtered = this.groupData(filtered, request.groupBy);
        }

        return filtered.slice(0, request.limit || 1000);
    }

    /**
     * Query Wazuh rules
     */
    private async queryWazuhRules(request: QueryDataRequest): Promise<any[]> {
        const rules = await wazuhService.getRules();

        // Apply filters
        let filtered = this.applyFilters(rules, request.filters || []);

        // Apply grouping
        if (request.groupBy && request.groupBy.length > 0) {
            filtered = this.groupData(filtered, request.groupBy);
        }

        return filtered.slice(0, request.limit || 1000);
    }

    /**
     * Query IRIS cases
     */
    private async queryIrisCases(request: QueryDataRequest): Promise<any[]> {
        const filters: any = this.convertToIrisFilters(request.filters || []);
        const cases = await irisService.getCases(filters);

        // Apply grouping
        if (request.groupBy && request.groupBy.length > 0) {
            return this.groupData(cases, request.groupBy);
        }

        return cases.slice(0, request.limit || 1000);
    }

    /**
     * Convert generic filters to Wazuh-specific filters
     */
    private convertToWazuhFilters(filters: ReportFilter[]): any {
        const wazuhFilters: any = {};

        for (const filter of filters) {
            switch (filter.field) {
                case 'timestamp':
                    if (filter.operator === 'between' && Array.isArray(filter.value)) {
                        wazuhFilters.startDate = filter.value[0];
                        wazuhFilters.endDate = filter.value[1];
                    }
                    break;

                case 'severity':
                    wazuhFilters.severity = Array.isArray(filter.value) ? filter.value : [filter.value];
                    break;

                case 'agentId':
                    wazuhFilters.agentId = filter.value;
                    break;

                case 'ruleId':
                    wazuhFilters.ruleId = filter.value;
                    break;
            }
        }

        return wazuhFilters;
    }

    /**
     * Convert generic filters to IRIS-specific filters
     */
    private convertToIrisFilters(filters: ReportFilter[]): any {
        const irisFilters: any = {};

        for (const filter of filters) {
            if (filter.field === 'severity') {
                irisFilters.severity = Array.isArray(filter.value) ? filter.value : [filter.value];
            } else if (filter.field === 'status') {
                irisFilters.status = Array.isArray(filter.value) ? filter.value : [filter.value];
            }
        }

        return irisFilters;
    }

    /**
     * Apply filters to data array
     */
    private applyFilters(data: any[], filters: ReportFilter[]): any[] {
        if (!filters || filters.length === 0) return data;

        return data.filter(item => {
            return filters.every(filter => this.evaluateFilter(item, filter));
        });
    }

    /**
     * Evaluate a single filter against an item
     */
    private evaluateFilter(item: any, filter: ReportFilter): boolean {
        const value = this.getNestedValue(item, filter.field);

        switch (filter.operator) {
            case 'equals':
                return value === filter.value;

            case 'not-equals':
                return value !== filter.value;

            case 'contains':
                return String(value).toLowerCase().includes(String(filter.value).toLowerCase());

            case 'not-contains':
                return !String(value).toLowerCase().includes(String(filter.value).toLowerCase());

            case 'greater-than':
                return value > filter.value;

            case 'less-than':
                return value < filter.value;

            case 'in':
                return Array.isArray(filter.value) && filter.value.includes(value);

            case 'not-in':
                return Array.isArray(filter.value) && !filter.value.includes(value);

            case 'between':
                return Array.isArray(filter.value) && value >= filter.value[0] && value <= filter.value[1];

            case 'exists':
                return value !== undefined && value !== null;

            case 'not-exists':
                return value === undefined || value === null;

            default:
                return true;
        }
    }

    /**
     * Get nested value from object using dot notation
     */
    private getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    /**
     * Group data by specified fields
     */
    private groupData(data: any[], groupBy: string[]): any[] {
        const grouped = new Map<string, any[]>();

        for (const item of data) {
            const key = groupBy.map(field => this.getNestedValue(item, field)).join('|');
            if (!grouped.has(key)) {
                grouped.set(key, []);
            }
            grouped.get(key)!.push(item);
        }

        return Array.from(grouped.entries()).map(([key, items]) => {
            const keyValues = key.split('|');
            const result: any = { count: items.length };

            groupBy.forEach((field, index) => {
                result[field] = keyValues[index];
            });

            result.items = items;
            return result;
        });
    }

    /**
     * Aggregate data
     */
    private aggregateData(data: any[], groupBy: string[] = [], aggregation: any): any[] {
        if (groupBy.length === 0) {
            // Simple aggregation without grouping
            const value = this.calculateAggregation(data, aggregation.field, aggregation.type);
            return [{ [aggregation.type]: value }];
        }

        // Group and aggregate
        const grouped = this.groupData(data, groupBy);

        return grouped.map(group => {
            const value = this.calculateAggregation(group.items, aggregation.field, aggregation.type);
            return {
                ...group,
                [aggregation.type]: value
            };
        });
    }

    /**
     * Calculate aggregation value
     */
    private calculateAggregation(data: any[], field: string, type: string): number {
        const values = data.map(item => this.getNestedValue(item, field)).filter(v => v !== undefined && v !== null);

        switch (type) {
            case 'count':
                return values.length;

            case 'sum':
                return values.reduce((sum, v) => sum + Number(v), 0);

            case 'avg':
                return values.length > 0 ? values.reduce((sum, v) => sum + Number(v), 0) / values.length : 0;

            case 'min':
                return values.length > 0 ? Math.min(...values.map(Number)) : 0;

            case 'max':
                return values.length > 0 ? Math.max(...values.map(Number)) : 0;

            default:
                return values.length;
        }
    }

    /**
     * Create a human-readable summary of filters
     */
    private createFilterSummary(filters: ReportFilter[]): string {
        if (!filters || filters.length === 0) return 'No filters applied';

        const summaries = filters.map(f => {
            if (f.operator === 'between' && Array.isArray(f.value)) {
                return `${f.field} between ${f.value[0]} and ${f.value[1]}`;
            }
            return `${f.field} ${f.operator} ${f.value}`;
        });

        return summaries.join(', ');
    }

    /**
     * Get available data sources
     */
    getAvailableDataSources(): DataSource[] {
        return [
            'wazuh-alerts',
            'wazuh-agents',
            'wazuh-rules',
            'iris-cases',
            'vulnerabilities',
            'fim-events'
        ];
    }
}

export default new ReportService();
