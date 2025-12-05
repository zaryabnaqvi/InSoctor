import axios, { AxiosInstance } from 'axios';
import {
    ReportTemplate,
    GeneratedReport,
    CreateReportTemplateRequest,
    UpdateReportTemplateRequest,
    GenerateReportRequest,
    QueryDataRequest,
    DataSource
} from '../types/report';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ReportService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: `${API_BASE_URL}/api/reports`,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Add auth token interceptor
        this.api.interceptors.request.use((config) => {
            const token = localStorage.getItem('auth_token');
            console.log('[ReportService] Request to:', config.baseURL + config.url);
            console.log('[ReportService] Token present:', !!token);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        // Add response interceptor for debugging
        this.api.interceptors.response.use(
            (response) => {
                console.log('[ReportService] Response OK:', response.status, response.config.url);
                return response;
            },
            (error) => {
                console.error('[ReportService] Error:', error.response?.status, error.config?.baseURL + error.config?.url);
                return Promise.reject(error);
            }
        );
    }

    /**
     * Get all templates
     */
    async getTemplates(filters?: { category?: string; tags?: string[] }): Promise<ReportTemplate[]> {
        const params = new URLSearchParams();
        if (filters?.category) {
            params.append('category', filters.category);
        }
        if (filters?.tags) {
            filters.tags.forEach(tag => params.append('tags', tag));
        }

        const response = await this.api.get(`/templates?${params.toString()}`);
        return response.data.data;
    }

    /**
     * Get a specific template
     */
    async getTemplate(id: string): Promise<ReportTemplate> {
        const response = await this.api.get(`/templates/${id}`);
        return response.data.data;
    }

    /**
     * Create a new template
     */
    async createTemplate(data: CreateReportTemplateRequest): Promise<ReportTemplate> {
        const response = await this.api.post('/templates', data);
        return response.data.data;
    }

    /**
     * Update a template
     */
    async updateTemplate(id: string, data: UpdateReportTemplateRequest): Promise<ReportTemplate> {
        const response = await this.api.put(`/templates/${id}`, data);
        return response.data.data;
    }

    /**
     * Delete a template
     */
    async deleteTemplate(id: string): Promise<void> {
        await this.api.delete(`/templates/${id}`);
    }

    /**
     * Generate a report from a template
     */
    async generateReport(request: GenerateReportRequest): Promise<GeneratedReport> {
        const response = await this.api.post('/generate', request);
        return response.data.data;
    }

    /**
     * Query data with filters - SAFE: never throws, returns empty array on error
     */
    async queryData(request: QueryDataRequest): Promise<any[]> {
        try {
            console.log('[ReportService] queryData request:', request);
            const response = await this.api.post('/data/query', request);
            const data = response.data?.data || [];
            console.log('[ReportService] queryData got', data.length, 'records');
            return Array.isArray(data) ? data : [];
        } catch (error: any) {
            console.error('[ReportService] queryData failed:', error.message);
            // Return empty array instead of throwing to prevent UI crashes
            return [];
        }
    }

    /**
     * Get available data sources
     */
    async getDataSources(): Promise<DataSource[]> {
        const response = await this.api.get('/data/sources');
        return response.data.data;
    }

    /**
     * AI report generation - convert natural language to template
     */
    async generateAIReport(prompt: string): Promise<ReportTemplate & { explanation?: string }> {
        try {
            const response = await this.api.post('/ai/generate', { prompt });
            const result = response.data.data;
            // Return template with explanation attached
            return {
                ...result.template,
                explanation: result.explanation,
                suggestedFilters: result.suggestedFilters
            };
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'AI report generation failed');
        }
    }

    /**
     * Placeholder for AI insights (Milestone 2)
     */
    async getAIInsights(data: any[], context: string): Promise<any> {
        try {
            const response = await this.api.post('/ai/insights', { data, context });
            return response.data.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'AI insights not yet implemented');
        }
    }
}

export const reportService = new ReportService();
