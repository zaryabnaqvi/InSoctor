import { AzureOpenAI, OpenAI } from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import wazuhIndexerService from './wazuh-indexer.service';
import wazuhService from './wazuh.service';

// Try to load env from current dir and parent dir
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface ChatMessage {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
    tool_call_id?: string;
}

interface ChatResponse {
    reply: string;
    conversationId: string;
    toolsUsed?: string[];
}

class ChatService {
    private openai: OpenAI | AzureOpenAI;
    private conversations: Map<string, ChatMessage[]> = new Map();

    constructor() {
        const azureApiKey = process.env.AZURE_OPENAI_API_KEY;
        const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
        const azureDeployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
        const azureApiVersion = process.env.AZURE_OPENAI_API_VERSION;

        if (azureApiKey && azureEndpoint && azureDeployment) {
            console.log('Initializing Azure OpenAI client...');
            this.openai = new AzureOpenAI({
                apiKey: azureApiKey,
                endpoint: azureEndpoint,
                apiVersion: azureApiVersion || '2024-02-15-preview',
                deployment: azureDeployment
            });
        } else {
            const apiKey = process.env.OPENAI_API_KEY;
            if (!apiKey) {
                console.error('CRITICAL: Neither AZURE_OPENAI_API_KEY nor OPENAI_API_KEY is present!');
                // Initialize with dummy key to prevent crash
                this.openai = new OpenAI({ apiKey: 'dummy-key' });
            } else {
                this.openai = new OpenAI({ apiKey });
            }
        }
    }

    /**
     * Process a chat message and return AI response
     */
    async chat(message: string, conversationId?: string): Promise<ChatResponse> {
        const convId = conversationId || this.generateConversationId();

        // Get or create conversation history
        let messages = this.conversations.get(convId) || [
            {
                role: 'system',
                content: `You are an AI security assistant for InSOCtor, a security operations platform powered by Wazuh.
You help users query and understand their security data including:
- Security alerts and their severity levels
- Agent/endpoint status and information  
- Vulnerabilities 
- Security events and trends
- Compliance and configuration assessments

When users ask questions, use the available functions to query Wazuh data and provide clear, actionable answers.
Format responses professionally with bullet points, tables, or summaries as appropriate.`
            }
        ];

        // Add user message
        messages.push({ role: 'user', content: message });

        const toolsUsed: string[] = [];

        try {
            const modelName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4-turbo-preview';

            // Call OpenAI with function calling
            const response = await this.openai.chat.completions.create({
                model: modelName,
                messages: messages as any,
                tools: this.getAvailableTools(),
                tool_choice: 'auto',
            });

            const responseMessage = response.choices[0].message;
            let finalReply = responseMessage.content;
            let reportData = null;

            // Handle tool calls
            if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
                // Add assistant's response with tool calls
                messages.push(responseMessage as any);

                // Execute each tool call
                for (const toolCall of responseMessage.tool_calls) {
                    if (toolCall.type !== 'function') continue;

                    const functionName = toolCall.function.name;
                    const functionArgs = JSON.parse(toolCall.function.arguments);

                    toolsUsed.push(functionName);

                    // Execute the function
                    const functionResult = await this.executeFunction(functionName, functionArgs);

                    // If this was a report generation, capture the data
                    if (functionName === 'generate_report') {
                        reportData = functionResult;
                    }

                    // Add function response to messages
                    messages.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        content: JSON.stringify(functionResult),
                    } as any);
                }

                // Get final response from OpenAI
                const finalResponse = await this.openai.chat.completions.create({
                    model: modelName,
                    messages: messages as any,
                });

                finalReply = finalResponse.choices[0].message.content || 'I processed your request but encountered an issue generating a response.';
            }

            // Add final assistant message to history
            if (finalReply) {
                messages.push({ role: 'assistant', content: finalReply });
            }

            // Save conversation
            this.conversations.set(convId, messages);

            return {
                reply: finalReply || 'I apologize, but I could not generate a response.',
                conversationId: convId,
                toolsUsed,
                reportData // Return the report data to frontend
            };
        } catch (error) {
            console.error('Chat service error:', error);
            throw new Error('Failed to process chat message');
        }
    }

    /**
     * Define available tools/functions for OpenAI
     */
    private getAvailableTools(): OpenAI.Chat.Completions.ChatCompletionTool[] {
        return [
            {
                type: 'function' as const,
                function: {
                    name: 'get_agents_list',
                    description: 'Get list of Wazuh agents/endpoints with their status',
                    parameters: {
                        type: 'object',
                        properties: {
                            status: {
                                type: 'string',
                                enum: ['active', 'disconnected', 'all'],
                                description: 'Filter agents by status'
                            },
                            limit: {
                                type: 'number',
                                description: 'Maximum number of agents to return'
                            }
                        }
                    }
                }
            },
            {
                type: 'function' as const,
                function: {
                    name: 'get_alerts',
                    description: 'Get security alerts from Wazuh with optional filters',
                    parameters: {
                        type: 'object',
                        properties: {
                            timeRange: {
                                type: 'string',
                                description: 'Time range for alerts (e.g., "24h", "7d", "30d")'
                            },
                            severity: {
                                type: 'string',
                                enum: ['critical', 'high', 'medium', 'low'],
                                description: 'Filter by severity level'
                            },
                            limit: {
                                type: 'number',
                                description: 'Maximum number of alerts to return'
                            }
                        }
                    }
                }
            },
            {
                type: 'function' as const,
                function: {
                    name: 'get_top_endpoints_by_alerts',
                    description: 'Get endpoints/agents with the most alerts in a time period',
                    parameters: {
                        type: 'object',
                        properties: {
                            timeRange: {
                                type: 'string',
                                description: 'Time range (e.g., "24h", "7d", "30d")'
                            },
                            limit: {
                                type: 'number',
                                description: 'Number of top endpoints to return'
                            }
                        },
                        required: ['timeRange']
                    }
                }
            },
            {
                type: 'function' as const,
                function: {
                    name: 'get_vulnerability_stats',
                    description: 'Get vulnerability statistics and counts by severity',
                    parameters: {
                        type: 'object',
                        properties: {}
                    }
                }
            },
            {
                type: 'function' as const,
                function: {
                    name: 'search_security_events',
                    description: 'Search for specific security events or patterns',
                    parameters: {
                        type: 'object',
                        properties: {
                            query: {
                                type: 'string',
                                description: 'Search query or pattern to look for'
                            },
                            timeRange: {
                                type: 'string',
                                description: 'Time range to search'
                            }
                        },
                        required: ['query']
                    }
                }
            },
            {
                type: 'function' as const,
                function: {
                    name: 'generate_report',
                    description: 'Generate a comprehensive security report with metrics and trends',
                    parameters: {
                        type: 'object',
                        properties: {
                            timeRange: {
                                type: 'string',
                                description: 'Time range for the report (e.g., "7d", "30d")'
                            },
                            title: {
                                type: 'string',
                                description: 'Custom title for the report'
                            }
                        },
                        required: ['timeRange']
                    }
                }
            }
        ];
    }

    /**
     * Execute a function call
     */
    private async executeFunction(functionName: string, args: any): Promise<any> {
        try {
            switch (functionName) {
                case 'get_agents_list':
                    const agents = await wazuhService.getAgents();

                    // Filter by status if specified
                    let filteredAgents = agents;
                    if (args.status && args.status !== 'all') {
                        filteredAgents = agents.filter((a: any) => a.status === args.status);
                    }

                    // Apply limit
                    if (args.limit) {
                        filteredAgents = filteredAgents.slice(0, args.limit);
                    }

                    return {
                        total: filteredAgents.length,
                        agents: filteredAgents.map((a: any) => ({
                            id: a.id,
                            name: a.name,
                            status: a.status,
                            ip: a.ip,
                            os: a.os?.name || 'Unknown',
                            lastKeepAlive: a.lastKeepAlive
                        }))
                    };


                case 'get_alerts':
                    // Parse time range to dates
                    let startDate: string | undefined;
                    let endDate: string | undefined;

                    if (args.timeRange) {
                        const now = new Date();
                        endDate = now.toISOString();

                        // Parse time range like "24h", "7d", "30d"
                        const match = args.timeRange.match(/(\d+)([hdwmy])/i);
                        if (match) {
                            const value = parseInt(match[1]);
                            const unit = match[2].toLowerCase();

                            const startTime = new Date(now);
                            switch (unit) {
                                case 'h':
                                    startTime.setHours(startTime.getHours() - value);
                                    break;
                                case 'd':
                                    startTime.setDate(startTime.getDate() - value);
                                    break;
                                case 'w':
                                    startTime.setDate(startTime.getDate() - (value * 7));
                                    break;
                                case 'm':
                                    startTime.setMonth(startTime.getMonth() - value);
                                    break;
                                case 'y':
                                    startTime.setFullYear(startTime.getFullYear() - value);
                                    break;
                            }
                            startDate = startTime.toISOString();
                        }
                    }

                    // Build filter object
                    const alertFilters: any = {
                        limit: args.limit || 100,
                        startDate,
                        endDate
                    };

                    // Add severity filter if specified
                    if (args.severity) {
                        alertFilters.severity = [args.severity];
                    }

                    console.log('Chat AI calling getAlerts with filters:', JSON.stringify(alertFilters, null, 2));

                    let alerts;
                    try {
                        // Use Wazuh Indexer service (not Manager API) for querying alerts
                        alerts = await wazuhIndexerService.getAlerts(alertFilters);
                        console.log(`Successfully fetched ${alerts.length} alerts from Wazuh Indexer`);
                    } catch (err: any) {
                        console.error('Error fetching alerts from Wazuh Indexer:', err);
                        return {
                            error: `Failed to fetch alerts: ${err.message || 'Unknown error'}`,
                            details: 'There was an issue connecting to Wazuh Indexer or processing the alert query.'
                        };
                    }

                    return {
                        total: alerts.length,
                        alerts: alerts.slice(0, args.limit || 50).map((a: any) => ({
                            id: a.id,
                            title: a.title,
                            severity: a.severity,
                            timestamp: a.timestamp,
                            agent: a.source || 'Unknown',
                            description: a.description
                        }))
                    };

                case 'get_top_endpoints_by_alerts':
                    const allAlerts = await wazuhIndexerService.getAlerts({ limit: 1000 });

                    // Count alerts by agent
                    const agentCounts: Record<string, number> = {};
                    allAlerts.forEach((alert: any) => {
                        // Extract agent name from source "Agent: name"
                        const agentName = alert.source?.replace('Agent: ', '') || 'Unknown';
                        agentCounts[agentName] = (agentCounts[agentName] || 0) + 1;
                    });

                    // Sort and get top
                    const topEndpoints = Object.entries(agentCounts)
                        .map(([name, count]) => ({ endpoint: name, alertCount: count }))
                        .sort((a, b) => b.alertCount - a.alertCount)
                        .slice(0, args.limit || 5);

                    return {
                        timeRange: args.timeRange,
                        topEndpoints
                    };

                case 'get_vulnerability_stats':
                    // Assuming this method exists or similar in indexer service
                    // If not, we might need to query vulnerabilities directly
                    // For now, let's try to use what we think exists or fallback
                    try {
                        const vulnStats = await wazuhIndexerService.getVulnerabilityStats();
                        return vulnStats;
                    } catch (e) {
                        // Fallback if method doesn't exist
                        return { error: "Vulnerability stats not available" };
                    }

                case 'search_security_events':
                    // Simple search across alerts
                    const searchResults = await wazuhIndexerService.getAlerts({ limit: 500 });

                    const query = args.query.toLowerCase();
                    const matches = searchResults.filter((alert: any) => {
                        const title = (alert.title || '').toLowerCase();
                        const desc = (alert.description || '').toLowerCase();
                        return title.includes(query) || desc.includes(query);
                    });

                    return {
                        query: args.query,
                        matchCount: matches.length,
                        events: matches.slice(0, 10).map((a: any) => ({
                            title: a.title,
                            severity: a.severity,
                            timestamp: a.timestamp,
                            agent: a.source
                        }))
                    };

                case 'generate_report':
                    // 1. Parse time range
                    let reportStartDate: string | undefined;
                    const reportEndDate = new Date().toISOString();

                    if (args.timeRange) {
                        const now = new Date();
                        const match = args.timeRange.match(/(\d+)([hdwmy])/i);
                        if (match) {
                            const value = parseInt(match[1]);
                            const unit = match[2].toLowerCase();
                            const startTime = new Date(now);

                            switch (unit) {
                                case 'h': startTime.setHours(startTime.getHours() - value); break;
                                case 'd': startTime.setDate(startTime.getDate() - value); break;
                                case 'w': startTime.setDate(startTime.getDate() - (value * 7)); break;
                                case 'm': startTime.setMonth(startTime.getMonth() - value); break;
                                case 'y': startTime.setFullYear(startTime.getFullYear() - value); break;
                            }
                            reportStartDate = startTime.toISOString();
                        }
                    }

                    // 2. Fetch all alerts for the period
                    const reportAlerts = await wazuhIndexerService.getAlerts({
                        startDate: reportStartDate,
                        endDate: reportEndDate,
                        limit: 1000 // Limit for analysis
                    });

                    // 3. Calculate Statistics
                    const severityCounts: Record<string, number> = {
                        critical: 0, high: 0, medium: 0, low: 0, info: 0
                    };

                    const agentActivity: Record<string, number> = {};
                    const dailyTrend: Record<string, number> = {};

                    reportAlerts.forEach((alert: any) => {
                        // Severity
                        if (alert.severity) severityCounts[alert.severity] = (severityCounts[alert.severity] || 0) + 1;

                        // Agent
                        const agent = alert.source?.replace('Agent: ', '') || 'Unknown';
                        agentActivity[agent] = (agentActivity[agent] || 0) + 1;

                        // Daily Trend
                        const date = alert.timestamp.split('T')[0];
                        dailyTrend[date] = (dailyTrend[date] || 0) + 1;
                    });

                    // 4. Format Data for Report
                    return {
                        reportType: 'security_summary',
                        title: args.title || `Security Report (${args.timeRange})`,
                        generatedAt: new Date().toISOString(),
                        timeRange: args.timeRange,
                        metrics: {
                            totalAlerts: reportAlerts.length,
                            severityDistribution: Object.entries(severityCounts).map(([name, value]) => ({ name, value })),
                            topAgents: Object.entries(agentActivity)
                                .map(([name, value]) => ({ name, value }))
                                .sort((a, b) => b.value - a.value)
                                .slice(0, 5),
                            alertTrend: Object.entries(dailyTrend)
                                .map(([date, count]) => ({ date, count }))
                                .sort((a, b) => a.date.localeCompare(b.date))
                        },
                        summary: `Generated report for ${args.timeRange}. Found ${reportAlerts.length} total alerts.`
                    };

                default:
                    return { error: `Unknown function: ${functionName}` };
            }
        } catch (error: any) {
            console.error(`Error executing function ${functionName}:`, error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                args
            });
            return {
                error: `Failed to execute ${functionName}: ${error.message || 'Unknown error'}`
            };
        }
    }

    /**
     * Generate a unique conversation ID
     */
    private generateConversationId(): string {
        return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Clear a conversation
     */
    clearConversation(conversationId: string): void {
        this.conversations.delete(conversationId);
    }

    /**
     * Clear all old conversations (cleanup)
     */
    clearOldConversations(): void {
        // Keep only conversations from last 24 hours
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);

        for (const [id, messages] of this.conversations.entries()) {
            const timestamp = parseInt(id.split('_')[1]);
            if (timestamp < oneDayAgo) {
                this.conversations.delete(id);
            }
        }
    }
}

export const chatService = new ChatService();

// Clean up old conversations every hour
setInterval(() => {
    chatService.clearOldConversations();
}, 60 * 60 * 1000);
