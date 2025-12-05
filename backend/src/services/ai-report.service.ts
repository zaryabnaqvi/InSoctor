import { AzureOpenAI } from 'openai';
import { ReportTemplate, WidgetConfig, WidgetType, DataSource, ReportCategory } from '../types/report.types';

// Widget suggestion structure
interface WidgetSuggestion {
    type: WidgetType;
    title: string;
    description: string;
    dataSource: DataSource;
    reasoning: string;
    priority: number;
}

// AI Report generation result
interface AIReportResult {
    template: ReportTemplate;
    explanation: string;
    suggestedFilters?: string[];
}

// AI Insight result
interface AIInsight {
    summary: string;
    keyFindings: string[];
    trends: string[];
    recommendations: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

class AIReportService {
    private client: AzureOpenAI | null = null;
    private deploymentName: string;
    private initializationError: string | null = null;

    constructor() {
        this.deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4';
        this.initializeClient();
    }

    private initializeClient(): void {
        const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
        const apiKey = process.env.AZURE_OPENAI_API_KEY;
        const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview';

        if (!endpoint || !apiKey) {
            console.warn('Azure OpenAI credentials not configured. AI report generation will not be available.');
            this.initializationError = 'Missing endpoint or API key';
            return;
        }

        try {
            this.client = new AzureOpenAI({
                endpoint,
                apiKey,
                apiVersion,
            });
            console.log('Azure OpenAI client initialized for AI Report Service');
            this.initializationError = null;
        } catch (error: any) {
            console.error('Failed to initialize Azure OpenAI client:', error);
            this.initializationError = error.message || 'Unknown initialization error';
        }
    }

    /**
     * Generate a report template from natural language request
     */
    async generateReportFromNLP(request: string, context?: { dataSources?: DataSource[] }): Promise<AIReportResult> {
        if (!this.client) {
            throw new Error('Azure OpenAI client is not initialized. Please check your configuration.');
        }

        const availableDataSources = context?.dataSources || [
            'wazuh-alerts', 'wazuh-agents', 'wazuh-rules', 'iris-cases'
        ];

        const prompt = this.createReportGenerationPrompt(request, availableDataSources);

        try {
            const response = await this.client.chat.completions.create({
                model: this.deploymentName,
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert security report designer. You help users create comprehensive security reports by converting their natural language requests into structured report templates with appropriate widgets and visualizations. Always respond with valid JSON.`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.4,
                max_tokens: 2000,
                response_format: { type: 'json_object' }
            });

            const content = response.choices[0]?.message?.content;
            if (!content) {
                throw new Error('No response from Azure OpenAI');
            }

            const result = JSON.parse(content);

            // Build the template from AI response
            const template: ReportTemplate = {
                name: result.name || 'AI Generated Report',
                description: result.description || request,
                category: (result.category as ReportCategory) || 'custom',
                widgets: this.buildWidgetsFromAI(result.widgets || []),
                globalFilters: [],
                layout: {
                    columns: 12,
                    rowHeight: 30
                },
                isPublic: false,
                isPredefined: false,
                createdBy: 'ai',
                version: 1,
                tags: result.tags || ['ai-generated']
            };

            return {
                template,
                explanation: result.explanation || 'Report generated based on your request.',
                suggestedFilters: result.suggestedFilters || []
            };
        } catch (error: any) {
            console.error('Error generating report from NLP:', error);
            throw new Error(`Failed to generate report: ${error.message}`);
        }
    }

    /**
     * Suggest widgets based on a data source
     */
    async suggestWidgets(dataSource: DataSource, purpose?: string): Promise<WidgetSuggestion[]> {
        if (!this.client) {
            throw new Error('Azure OpenAI client is not initialized.');
        }

        const prompt = `Given the data source "${dataSource}" ${purpose ? `and the purpose "${purpose}"` : ''}, suggest 4-6 appropriate widgets for a security dashboard.

Available widget types: kpi, bar-chart, line-chart, pie-chart, area-chart, data-table

For each widget, provide:
{
  "widgets": [
    {
      "type": "widget-type",
      "title": "Widget Title",
      "description": "What this widget shows",
      "reasoning": "Why this widget is useful",
      "priority": 1-5 (1 being highest priority)
    }
  ]
}

Data source descriptions:
- wazuh-alerts: Security alerts from Wazuh SIEM (severity, rule, agent, timestamp)
- wazuh-agents: Agent status and health information
- wazuh-rules: Security detection rules
- iris-cases: Incident response cases from DFIR-IRIS

Respond only with valid JSON.`;

        try {
            const response = await this.client.chat.completions.create({
                model: this.deploymentName,
                messages: [
                    { role: 'system', content: 'You are a security dashboard expert. Suggest appropriate widgets for security monitoring.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.3,
                max_tokens: 1000,
                response_format: { type: 'json_object' }
            });

            const content = response.choices[0]?.message?.content;
            if (!content) {
                throw new Error('No response from Azure OpenAI');
            }

            const result = JSON.parse(content);
            return (result.widgets || []).map((w: any) => ({
                type: w.type as WidgetType,
                title: w.title,
                description: w.description,
                dataSource,
                reasoning: w.reasoning,
                priority: w.priority || 3
            }));
        } catch (error: any) {
            console.error('Error suggesting widgets:', error);
            throw new Error(`Failed to suggest widgets: ${error.message}`);
        }
    }

    /**
     * Generate insights from report data
     */
    async generateInsights(data: any[], context: string): Promise<AIInsight> {
        if (!this.client) {
            throw new Error('Azure OpenAI client is not initialized.');
        }

        // Limit data size for API
        const sampleData = data.slice(0, 50);

        const prompt = `Analyze the following security data and provide insights.

Context: ${context}

Data Sample (${data.length} total records, showing first ${sampleData.length}):
${JSON.stringify(sampleData, null, 2)}

Provide your analysis in this JSON format:
{
  "summary": "2-3 sentence executive summary",
  "keyFindings": ["finding 1", "finding 2", "finding 3"],
  "trends": ["trend 1", "trend 2"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "riskLevel": "low|medium|high|critical"
}

Focus on actionable security insights. Be specific about numbers and patterns you observe.`;

        try {
            const response = await this.client.chat.completions.create({
                model: this.deploymentName,
                messages: [
                    { role: 'system', content: 'You are a cybersecurity analyst providing data-driven insights.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.3,
                max_tokens: 1000,
                response_format: { type: 'json_object' }
            });

            const content = response.choices[0]?.message?.content;
            if (!content) {
                throw new Error('No response from Azure OpenAI');
            }

            return JSON.parse(content) as AIInsight;
        } catch (error: any) {
            console.error('Error generating insights:', error);
            throw new Error(`Failed to generate insights: ${error.message}`);
        }
    }

    /**
     * Generate executive summary from report data
     */
    async generateExecutiveSummary(reportData: any): Promise<string> {
        if (!this.client) {
            throw new Error('Azure OpenAI client is not initialized.');
        }

        const prompt = `Generate a concise executive summary for this security report.

Report Name: ${reportData.name || 'Security Report'}
Time Period: ${reportData.dateRange || 'Last 24 hours'}
Widgets Data:
${JSON.stringify(reportData.widgets || [], null, 2)}

Write a 3-4 paragraph executive summary that:
1. Highlights key metrics and their significance
2. Identifies any concerning trends or anomalies
3. Provides high-level recommendations

Write in clear, professional language suitable for C-level executives. Respond with just the summary text, no JSON.`;

        try {
            const response = await this.client.chat.completions.create({
                model: this.deploymentName,
                messages: [
                    { role: 'system', content: 'You are a senior security analyst writing executive summaries.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.4,
                max_tokens: 800
            });

            return response.choices[0]?.message?.content || 'Unable to generate summary.';
        } catch (error: any) {
            console.error('Error generating executive summary:', error);
            throw new Error(`Failed to generate summary: ${error.message}`);
        }
    }

    /**
     * Check if the service is properly configured
     */
    isConfigured(): boolean {
        return this.client !== null;
    }

    getInitializationError(): string | null {
        return this.initializationError;
    }

    // Helper: Create detailed prompt for report generation
    private createReportGenerationPrompt(request: string, dataSources: string[]): string {
        return `Convert this natural language request into a structured report template.

User Request: "${request}"

Available Data Sources: ${dataSources.join(', ')}

Available Widget Types:
- kpi: Single metric display (e.g., "Total Alerts", "Active Agents")
- bar-chart: Compare categories (e.g., "Alerts by Severity", "Top 10 Rules")
- line-chart: Show trends over time (e.g., "Alert Trend Last 7 Days")
- pie-chart: Show proportions (e.g., "Alert Distribution by Type")
- area-chart: Stacked trends (e.g., "Incident Volume Over Time")
- data-table: Detailed data list (e.g., "Recent Critical Alerts")

Respond with this JSON structure:
{
  "name": "Report Name",
  "description": "What this report shows",
  "category": "security|operational|executive|compliance",
  "explanation": "Brief explanation of why you chose these widgets",
  "suggestedFilters": ["Last 7 days", "Critical severity only"],
  "tags": ["tag1", "tag2"],
  "widgets": [
    {
      "type": "widget-type",
      "title": "Widget Title",
      "dataSource": "data-source",
      "position": { "x": 0, "y": 0, "w": 6, "h": 4 }
    }
  ]
}

Layout widgets on a 12-column grid. Common sizes:
- KPI: w:3, h:2
- Charts: w:6, h:4
- Tables: w:12, h:5

Position widgets to fill rows (x + w should sum to 12 for each row).`;
    }

    // Helper: Build widget configs from AI response
    private buildWidgetsFromAI(aiWidgets: any[]): WidgetConfig[] {
        return aiWidgets.map((w, index) => {
            const widget: WidgetConfig = {
                id: `widget-${Date.now()}-${index}`,
                type: w.type as WidgetType,
                title: w.title,
                dataSource: w.dataSource as DataSource,
                queryConfig: {
                    filters: [],
                    limit: 10000
                },
                position: w.position || {
                    x: (index % 2) * 6,
                    y: Math.floor(index / 2) * 4,
                    w: 6,
                    h: 4
                }
            };
            return widget;
        });
    }
}

// Export singleton instance
export const aiReportService = new AIReportService();

