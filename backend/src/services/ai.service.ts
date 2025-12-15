import { AzureOpenAI } from 'openai';
import { Alert } from '../types';

interface AIInsights {
    summary: string;
    severity_analysis: string;
    remediation_steps: string[];
    prevention_measures: string[];
    mitre_tactics?: string[];
}

class AIService {
    private client: AzureOpenAI | null = null;
    private deploymentName: string;
    private cache: Map<string, { insights: AIInsights; timestamp: number }> = new Map();
    private readonly CACHE_TTL = 3600000; // 1 hour in milliseconds
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
            console.warn('Azure OpenAI credentials not configured. AI insights will not be available.');
            this.initializationError = 'Missing endpoint or API key';
            return;
        }

        try {
            this.client = new AzureOpenAI({
                endpoint,
                apiKey,
                apiVersion,
            });
            console.log('Azure OpenAI client initialized successfully');
            this.initializationError = null;
        } catch (error: any) {
            console.error('Failed to initialize Azure OpenAI client:', error);
            this.initializationError = error.message || 'Unknown initialization error';
        }
    }

    getInitializationError(): string | null {
        return this.initializationError;
    }

    private getCacheKey(alert: any): string {
        // Create a unique cache key based on alert properties
        return `${alert.title}-${alert.severity}-${alert.ruleId || alert.source}`;
    }

    private getFromCache(cacheKey: string): AIInsights | null {
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
            console.log('Returning cached AI insights');
            return cached.insights;
        }
        if (cached) {
            this.cache.delete(cacheKey); // Remove expired cache
        }
        return null;
    }

    private setCache(cacheKey: string, insights: AIInsights): void {
        this.cache.set(cacheKey, {
            insights,
            timestamp: Date.now(),
        });
    }

    private createAnalysisPrompt(alert: any): string {
        return `You are a cybersecurity expert analyzing a security alert from a SIEM system. Analyze the following alert and provide detailed insights.

Alert Information:
- Title: ${alert.title}
- Description: ${alert.description || 'N/A'}
- Severity: ${alert.severity}
- Source: ${alert.source}
- Rule ID: ${alert.ruleId || 'N/A'}
- Timestamp: ${alert.timestamp}

Please provide your analysis in the following JSON format only, with no additional text:
{
  "summary": "A concise 2-3 sentence summary of what this alert indicates and why it matters",
  "severity_analysis": "Explain why this alert has ${alert.severity} severity and what factors contribute to this assessment",
  "remediation_steps": [
    "Step 1: Immediate action to take",
    "Step 2: Investigation steps",
    "Step 3: Long-term remediation",
    "Step 4: Additional measures if applicable"
  ],
  "prevention_measures": [
    "Measure 1: Configuration changes",
    "Measure 2: Policy updates",
    "Measure 3: Monitoring improvements"
  ],
  "mitre_tactics": ["TA0001", "TA0002"]
}

Focus on being practical and actionable. Include specific commands, configurations, or procedures where applicable.`;
    }

    async analyzeAlert(alert: any): Promise<AIInsights> {
        if (!this.client) {
            throw new Error('Azure OpenAI client is not initialized. Please check your configuration.');
        }

        // Check cache first
        const cacheKey = this.getCacheKey(alert);
        const cachedInsights = this.getFromCache(cacheKey);
        if (cachedInsights) {
            return cachedInsights;
        }

        try {
            const prompt = this.createAnalysisPrompt(alert);

            const response = await this.client.chat.completions.create({
                model: this.deploymentName,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a cybersecurity expert specializing in threat analysis and incident response. Provide detailed, actionable security insights in JSON format.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.3, // Lower temperature for more consistent, focused responses
                max_tokens: 1500,
                response_format: { type: 'json_object' },
            });

            const content = response.choices[0]?.message?.content;
            if (!content) {
                throw new Error('No response from Azure OpenAI');
            }

            const insights: AIInsights = JSON.parse(content);

            // Validate the response structure
            if (!insights.summary || !insights.remediation_steps || !Array.isArray(insights.remediation_steps)) {
                throw new Error('Invalid response format from AI');
            }

            // Cache the insights
            this.setCache(cacheKey, insights);

            return insights;
        } catch (error: any) {
            console.error('Error analyzing alert with AI:', error);

            // Provide more specific error messages
            if (error.code === 'DeploymentNotFound') {
                throw new Error(`Azure OpenAI deployment "${this.deploymentName}" not found. Please check your deployment name.`);
            } else if (error.code === 'InvalidApiKey') {
                throw new Error('Invalid Azure OpenAI API key. Please check your credentials.');
            } else if (error.message?.includes('quota')) {
                throw new Error('Azure OpenAI quota exceeded. Please try again later.');
            }

            throw new Error(`Failed to analyze alert: ${error.message || 'Unknown error'}`);
        }
    }

    // Health check method
    isConfigured(): boolean {
        return this.client !== null;
    }

    // Clear old cache entries
    clearExpiredCache(): void {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp >= this.CACHE_TTL) {
                this.cache.delete(key);
            }
        }
    }
}

// Export singleton instance
export const aiService = new AIService();

// Clean up cache every hour
setInterval(() => {
    aiService.clearExpiredCache();
}, 3600000);
