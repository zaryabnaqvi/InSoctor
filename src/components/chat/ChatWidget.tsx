import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, ChevronDown, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ChatMessage } from './chat.types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import axios from 'axios';
import { ReportPreview } from './ReportPreview';

const SUGGESTED_QUESTIONS = [
    "Show me critical alerts from the last 24 hours",
    "Which endpoint has the most alerts?",
    "List all active agents",
    "What are the top security vulnerabilities?",
];

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | undefined>();
    const [reportData, setReportData] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async (content: string) => {
        if (!content.trim()) return;

        const newUserMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newUserMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:3001/api/chat', {
                message: content,
                conversationId,
            });

            const { reply, conversationId: newConvId, toolsUsed, reportData: newReportData } = response.data;

            if (newConvId) setConversationId(newConvId);
            if (newReportData) setReportData(newReportData);

            const newAiMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: reply,
                timestamp: new Date(),
                toolsUsed,
            };

            setMessages((prev) => [...prev, newAiMessage]);
        } catch (error) {
            console.error('Failed to send message:', error);
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'I apologize, but I encountered an error processing your request. Please try again.',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(inputValue);
        }
    };

    return (
        <>
            {reportData && (
                <ReportPreview
                    data={reportData}
                    onClose={() => setReportData(null)}
                />
            )}
            <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-4">
                {/* Chat Window */}
                {isOpen && (
                    <div className={cn(
                        "flex flex-col rounded-3xl border-2 border-cyan-400/20 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 backdrop-blur-2xl shadow-2xl shadow-cyan-500/20 overflow-hidden transition-all duration-500 ease-out",
                        isExpanded
                            ? "fixed inset-6 z-50 w-auto h-auto"
                            : "w-[480px] h-[650px]"
                    )}>
                        {/* Header with Gradient */}
                        <div className="relative flex items-center justify-between p-5 border-b border-cyan-400/10 bg-gradient-to-r from-cyan-500/5 to-blue-500/5">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-50" />
                            <div className="relative flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/50">
                                    <Bot className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">InSOCtor AI</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
                                        <span className="text-xs text-emerald-400 font-medium">Active</span>
                                    </div>
                                </div>
                            </div>
                            <div className="relative flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    title={isExpanded ? "Minimize" : "Maximize"}
                                >
                                    {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                                    onClick={() => setMessages([])}
                                    title="Clear chat"
                                >
                                    <Sparkles className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <ChevronDown className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <ScrollArea className="flex-1 p-6">
                            <div className="flex flex-col gap-6">
                                {messages.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
                                        <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/30 shadow-xl shadow-cyan-500/20">
                                            <Bot className="w-12 h-12 text-cyan-400" />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-bold text-white text-xl">How can I assist you?</h4>
                                            <p className="text-sm text-slate-400 max-w-[300px] leading-relaxed">
                                                I can help you analyze security alerts, monitor agents, check vulnerabilities, and query your security data.
                                            </p>
                                        </div>
                                        <div className="grid gap-3 w-full pt-4">
                                            {SUGGESTED_QUESTIONS.map((q, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleSendMessage(q)}
                                                    className="text-sm text-left p-4 rounded-xl bg-gradient-to-r from-slate-800/50 to-slate-800/30 hover:from-cyan-500/10 hover:to-blue-500/10 border border-slate-700/50 hover:border-cyan-400/50 transition-all duration-300 text-slate-300 hover:text-cyan-300 shadow-lg hover:shadow-cyan-500/10 transform hover:scale-[1.02]"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Sparkles className="w-4 h-4 text-cyan-400 opacity-70" />
                                                        {q}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
                                            msg.role === 'user' ? "self-end flex-row-reverse max-w-[85%]" : "self-start w-full"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg transform transition-transform hover:scale-110",
                                            msg.role === 'user'
                                                ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-cyan-500/50"
                                                : "bg-slate-800 border-2 border-cyan-400/20 text-cyan-400 shadow-cyan-500/20"
                                        )}>
                                            {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                                        </div>

                                        <div className={cn(
                                            "flex flex-col gap-2",
                                            msg.role === 'user' ? "items-end max-w-full" : "items-start flex-1"
                                        )}>
                                            <div className={cn(
                                                "px-5 py-4 rounded-2xl text-sm leading-relaxed shadow-lg transition-all duration-300",
                                                msg.role === 'user'
                                                    ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-tr-md shadow-cyan-500/50 max-w-full"
                                                    : "bg-slate-800/80 border border-cyan-400/10 text-slate-100 rounded-tl-md w-full shadow-xl"
                                            )}>
                                                {msg.role === 'assistant' ? (
                                                    <div className="markdown-content w-full overflow-x-auto">
                                                        <ReactMarkdown
                                                            remarkPlugins={[remarkGfm]}
                                                            components={{
                                                                table: ({ node, ...props }) => (
                                                                    <div className="overflow-x-auto my-4 rounded-xl border border-cyan-400/20 shadow-lg">
                                                                        <table className="w-full border-collapse text-sm" {...props} />
                                                                    </div>
                                                                ),
                                                                thead: ({ node, ...props }) => (
                                                                    <thead className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20" {...props} />
                                                                ),
                                                                th: ({ node, ...props }) => (
                                                                    <th className="border-b-2 border-cyan-400/30 px-4 py-3 text-left text-cyan-300 font-bold uppercase text-xs tracking-wide" {...props} />
                                                                ),
                                                                td: ({ node, ...props }) => (
                                                                    <td className="border-b border-slate-700/50 px-4 py-3 text-slate-200" {...props} />
                                                                ),
                                                                tr: ({ node, ...props }) => (
                                                                    <tr className="hover:bg-cyan-500/5 transition-colors duration-150" {...props} />
                                                                ),
                                                                p: ({ node, ...props }) => (
                                                                    <p className="my-2.5 leading-relaxed" {...props} />
                                                                ),
                                                                strong: ({ node, ...props }) => (
                                                                    <strong className="text-cyan-300 font-bold" {...props} />
                                                                ),
                                                                h1: ({ node, ...props }) => (
                                                                    <h1 className="text-2xl font-bold text-white mt-4 mb-2" {...props} />
                                                                ),
                                                                h2: ({ node, ...props }) => (
                                                                    <h2 className="text-xl font-bold text-white mt-3 mb-2" {...props} />
                                                                ),
                                                                h3: ({ node, ...props }) => (
                                                                    <h3 className="text-lg font-semibold text-cyan-300 mt-3 mb-2" {...props} />
                                                                ),
                                                                ul: ({ node, ...props }) => (
                                                                    <ul className="list-disc list-inside my-3 space-y-1.5 text-slate-200" {...props} />
                                                                ),
                                                                ol: ({ node, ...props }) => (
                                                                    <ol className="list-decimal list-inside my-3 space-y-1.5 text-slate-200" {...props} />
                                                                ),
                                                                code: ({ node, inline, ...props }: any) =>
                                                                    inline ? (
                                                                        <code className="bg-slate-900/80 px-2 py-1 rounded-md text-cyan-300 font-mono text-xs border border-cyan-400/20" {...props} />
                                                                    ) : (
                                                                        <code className="block bg-slate-900/80 p-4 rounded-xl border border-cyan-400/20 my-3 font-mono text-xs leading-relaxed text-slate-200 overflow-x-auto" {...props} />
                                                                    )
                                                            }}
                                                        >
                                                            {msg.content}
                                                        </ReactMarkdown>
                                                    </div>
                                                ) : (
                                                    <span className="font-medium">{msg.content}</span>
                                                )}
                                            </div>

                                            {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                                                <div className="flex gap-2 flex-wrap">
                                                    {msg.toolsUsed.map((tool, i) => (
                                                        <span key={i} className="text-[10px] px-2.5 py-1 rounded-full bg-slate-800/80 border border-cyan-400/20 text-cyan-400 font-medium shadow-sm">
                                                            🔧 {tool}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <span className="text-[11px] text-slate-500 px-1 font-medium">
                                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="flex gap-3 self-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="w-10 h-10 rounded-xl bg-slate-800 border-2 border-cyan-400/20 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/20">
                                            <Bot className="w-5 h-5" />
                                        </div>
                                        <div className="bg-slate-800/80 border border-cyan-400/10 px-5 py-4 rounded-2xl rounded-tl-md flex items-center gap-2 shadow-xl">
                                            <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s] shadow-lg shadow-cyan-400/50" />
                                            <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s] shadow-lg shadow-cyan-400/50" />
                                            <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce shadow-lg shadow-cyan-400/50" />
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>

                        {/* Input Area with Gradient */}
                        <div className="p-5 border-t border-cyan-400/10 bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
                            <div className="flex gap-3">
                                <Input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask about your security data..."
                                    className="bg-slate-800/50 border-cyan-400/20 focus:border-cyan-400 text-white placeholder:text-slate-500 rounded-xl px-4 py-6 text-sm shadow-inner transition-all focus:shadow-cyan-500/20"
                                    disabled={isLoading}
                                />
                                <Button
                                    onClick={() => handleSendMessage(inputValue)}
                                    disabled={!inputValue.trim() || isLoading}
                                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed px-6"
                                    size="icon"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Toggle Button */}
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "h-16 w-16 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-110 relative overflow-hidden group",
                        isOpen
                            ? "bg-slate-800 hover:bg-slate-700 text-white border-2 border-cyan-400/30 shadow-cyan-500/20"
                            : "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-cyan-500/50 hover:shadow-cyan-500/80"
                    )}
                >
                    <div className={cn(
                        "absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    )} />
                    {isOpen ? (
                        <X className="w-7 h-7 relative z-10" />
                    ) : (
                        <MessageSquare className="w-7 h-7 relative z-10" />
                    )}
                </Button>
            </div>
        </>
    );
}
