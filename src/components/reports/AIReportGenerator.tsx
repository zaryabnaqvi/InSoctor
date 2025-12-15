import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2, Wand2, ChevronRight, RefreshCw, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { reportService } from '@/services/report.service';
import type { ReportTemplate } from '@/types/report';

// Example prompts for users
const EXAMPLE_PROMPTS = [
    "Create a daily security overview with alert trends and top triggered rules",
    "Build an agent health dashboard showing active/disconnected agents by OS",
    "Generate a weekly threat report with severity distribution and MITRE tactics",
    "Show me a compliance overview with failed checks and remediation status",
    "Create an executive summary report with key security KPIs",
];

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    isLoading?: boolean;
    template?: ReportTemplate;
    error?: string;
}

interface AIReportGeneratorProps {
    onTemplateGenerated?: (template: ReportTemplate) => void;
    onClose?: () => void;
    className?: string;
}

export const AIReportGenerator: React.FC<AIReportGeneratorProps> = ({
    onTemplateGenerated,
    onClose,
    className,
}) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'system',
            content: "👋 Hi! I'm your AI Report Assistant. Describe the report you'd like to create, and I'll generate a template with appropriate widgets and visualizations.",
        },
    ]);
    const [input, setInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle sending a prompt
    const handleSend = useCallback(async () => {
        if (!input.trim() || isGenerating) return;

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: input,
        };

        const loadingMessage: Message = {
            id: `loading-${Date.now()}`,
            role: 'assistant',
            content: 'Analyzing your request and generating report template...',
            isLoading: true,
        };

        setMessages((prev) => [...prev, userMessage, loadingMessage]);
        setInput('');
        setIsGenerating(true);

        try {
            const result = await reportService.generateAIReport(input);

            // Cast result to include explanation field from AI response
            const templateResult = result as ReportTemplate & { explanation?: string };

            // Remove loading message and add response
            setMessages((prev) => {
                const filtered = prev.filter((m) => m.id !== loadingMessage.id);
                return [
                    ...filtered,
                    {
                        id: `response-${Date.now()}`,
                        role: 'assistant',
                        content: templateResult.explanation || `I've created a "${result.name}" report template with ${result.widgets?.length || 0} widgets. Click "Use Template" to start customizing it.`,
                        template: result,
                    },
                ];
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to generate report. Please try again.';
            // Remove loading message and add error
            setMessages((prev) => {
                const filtered = prev.filter((m) => m.id !== loadingMessage.id);
                return [
                    ...filtered,
                    {
                        id: `error-${Date.now()}`,
                        role: 'assistant',
                        content: 'I encountered an issue generating your report.',
                        error: errorMessage,
                    },
                ];
            });
        } finally {
            setIsGenerating(false);
        }
    }, [input, isGenerating]);

    // Handle using an example prompt
    const handleExampleClick = useCallback((prompt: string) => {
        setInput(prompt);
    }, []);

    // Handle using a generated template
    const handleUseTemplate = useCallback((template: ReportTemplate) => {
        onTemplateGenerated?.(template);
    }, [onTemplateGenerated]);

    // Handle key press
    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }, [handleSend]);

    return (
        <div className={cn(
            'flex flex-col h-full bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-950 dark:to-purple-950/30 rounded-xl overflow-hidden',
            className
        )}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-slate-900 dark:text-white">AI Report Generator</h2>
                        <p className="text-xs text-slate-500">Describe your report and let AI create it</p>
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Example Prompts (show only if no user messages) */}
                {messages.filter((m) => m.role === 'user').length === 0 && (
                    <div className="mb-6">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                            <Wand2 className="w-4 h-4" />
                            Try one of these examples:
                        </p>
                        <div className="space-y-2">
                            {EXAMPLE_PROMPTS.map((prompt, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleExampleClick(prompt)}
                                    className="w-full text-left px-4 py-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-sm transition-all text-sm text-slate-700 dark:text-slate-300 flex items-center justify-between group"
                                >
                                    <span>{prompt}</span>
                                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-500 transition-colors" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Chat Messages */}
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={cn(
                            'flex',
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                    >
                        <div
                            className={cn(
                                'max-w-[85%] rounded-xl px-4 py-3',
                                message.role === 'user'
                                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                                    : message.role === 'system'
                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            )}
                        >
                            {message.isLoading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                                    <span className="text-sm">{message.content}</span>
                                </div>
                            ) : message.error ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-red-500">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-sm font-medium">{message.content}</span>
                                    </div>
                                    <p className="text-xs text-red-400">{message.error}</p>
                                    <button
                                        onClick={() => handleExampleClick(messages.find((m) => m.role === 'user')?.content || '')}
                                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
                                    >
                                        <RefreshCw className="w-3 h-3" />
                                        Try again
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                    {message.template && (
                                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                <span className="text-sm font-medium">{message.template.name}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                                                {message.template.widgets?.length || 0} widgets • {message.template.category} report
                                            </p>
                                            <button
                                                onClick={() => handleUseTemplate(message.template!)}
                                                className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                                            >
                                                Use This Template
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Describe the report you want to create..."
                        disabled={isGenerating}
                        className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border-0 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isGenerating}
                        className="px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIReportGenerator;
