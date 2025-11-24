import { apiClient } from './api.service';

export interface AIInsights {
    summary: string;
    severity_analysis: string;
    remediation_steps: string[];
    prevention_measures: string[];
    mitre_tactics?: string[];
}

export interface AIAnalysisRequest {
    alert: {
        id: string;
        title: string;
        description: string;
        severity: string;
        source: string;
        ruleId?: string;
        timestamp: string;
        [key: string]: any;
    };
}

export interface AIAnalysisResponse {
    success: boolean;
    data?: AIInsights;
    error?: string;
}

class AIService {
    async analyzeAlert(alert: any): Promise<AIInsights> {
        try {
            const response = await (apiClient as any).client.post<AIAnalysisResponse>(
                '/ai/analyze-alert',
                { alert }
            );

            if (!response.data.success || !response.data.data) {
                throw new Error(response.data.error || 'Failed to analyze alert');
            }

            return response.data.data;
        } catch (error: any) {
            // Handle specific error cases
            if (error.response?.status === 429) {
                throw new Error('Too many requests. Please wait a moment and try again.');
            } else if (error.response?.status === 503) {
                throw new Error('AI service is currently unavailable. Please contact your administrator.');
            } else if (error.response?.data?.error) {
                throw new Error(error.response.data.error);
            }
            throw new Error('Failed to get AI insights. Please try again later.');
        }
    }

    async checkHealth(): Promise<{ configured: boolean; message: string }> {
        try {
            const response = await (apiClient as any).client.get('/ai/health');
            return {
                configured: response.data.configured,
                message: response.data.message,
            };
        } catch (error) {
            return {
                configured: false,
                message: 'AI service is not available',
            };
        }
    }
}

export const aiService = new AIService();
