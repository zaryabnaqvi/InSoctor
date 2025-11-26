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

            const { reply, conversationId: newConvId, toolsUsed } = response.data;

            if (newConvId) setConversationId(newConvId);

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
        <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-4">
            {/* Chat Window */}
            {isOpen && (
                <div className={cn(
                    "flex flex-col rounded-2xl border border-cyan-500/30 bg-slate-950/95 backdrop-blur-xl shadow-2xl shadow-cyan-500/10 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 transition-all",
                    isExpanded
                        ? "fixed inset-4 z-50 w-auto h-auto m-4"
                        : "w-[400px] h-[600px]"
                )}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
                                <Bot className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">InSOCtor AI</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-xs text-slate-400">Online</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10"
                                onClick={() => setIsExpanded(!isExpanded)}
                                title={isExpanded ? "Minimize" : "Maximize"}
                            >
                                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10"
                                onClick={() => setMessages([])}
                                title="Clear chat"
                            >
                                <Sparkles className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10"
                                onClick={() => setIsOpen(false)}
                            >
                                <ChevronDown className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <ScrollArea className="flex-1 p-4">
                        <div className="flex flex-col gap-4">
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                                    <div className="p-4 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                                        <Bot className="w-8 h-8 text-cyan-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-medium text-white">How can I help you?</h4>
                                        <p className="text-sm text-slate-400 max-w-[250px]">
                                            I can analyze alerts, check agent status, and query your security data.
                                        </p>
                                    </div>
                                    <div className="grid gap-2 w-full pt-4">
                                        {SUGGESTED_QUESTIONS.map((q, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSendMessage(q)}
                                                className="text-xs text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-500/30 transition-all text-slate-300 hover:text-cyan-300"
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "flex gap-3",
                                        msg.role === 'user' ? "self-end flex-row-reverse max-w-[85%]" : "self-start w-full"
                                    )}
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                        msg.role === 'user'
                                            ? "bg-cyan-500 text-white"
                                            : "bg-slate-800 border border-white/10 text-cyan-400"
                                    )}>
                                        {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                                    </div>

                                    <div className={cn(
                                        "flex flex-col gap-1",
                                        msg.role === 'user' ? "items-end max-w-[85%]" : "items-start flex-1"
                                    )}>
                                        <div className={cn(
                                            "p-3 rounded-2xl text-sm leading-relaxed",
                                            msg.role === 'user'
                                                ? "bg-cyan-500 text-white rounded-tr-none max-w-full"
                                                : "bg-slate-800 border border-white/10 text-slate-200 rounded-tl-none w-full"
                                        )}>
                                            {msg.role === 'assistant' ? (
                                                <div className="markdown-content w-full overflow-x-auto">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            table: ({ node, ...props }) => (
                                                                <table className="w-full border-collapse my-4 text-sm" {...props} />
                                                            ),
                                                            thead: ({ node, ...props }) => (
                                                                <thead className="bg-slate-900/50" {...props} />
                                                            ),
                                                            th: ({ node, ...props }) => (
                                                                <th className="border border-cyan-500/30 px-3 py-2 text-left text-cyan-400 font-semibold" {...props} />
                                                            ),
                                                            td: ({ node, ...props }) => (
                                                                <td className="border border-white/10 px-3 py-2" {...props} />
                                                            ),
                                                            tr: ({ node, ...props }) => (
                                                                <tr className="hover:bg-white/5" {...props} />
                                                            ),
                                                            p: ({ node, ...props }) => (
                                                                <p className="my-2" {...props} />
                                                            ),
                                                            strong: ({ node, ...props }) => (
                                                                <strong className="text-cyan-400 font-semibold" {...props} />
                                                            ),
                                                            code: ({ node, inline, ...props }: any) =>
                                                                inline ? (
                                                                    <code className="bg-slate-900/50 px-1 py-0.5 rounded text-cyan-400" {...props} />
                                                                ) : (
                                                                    <code className="block bg-slate-900/50 p-3 rounded border border-white/10 my-2" {...props} />
                                                                )
                                                        }}
                                                    >
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                </div>
                                            ) : (
                                                msg.content
                                            )}
                                        </div>

                                        {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                                            <div className="flex gap-1.5 flex-wrap">
                                                {msg.toolsUsed.map((tool, i) => (
                                                    <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 border border-white/10 text-slate-500">
                                                        Used: {tool}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <span className="text-[10px] text-slate-500 px-1">
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex gap-3 self-start">
                                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-cyan-400">
                                        <Bot className="w-5 h-5" />
                                    </div>
                                    <div className="bg-slate-800 border border-white/10 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                                        <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="p-4 border-t border-white/10 bg-white/5">
                        <div className="flex gap-2">
                            <Input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about your security data..."
                                className="bg-slate-900/50 border-white/10 focus:border-cyan-500/50 text-white placeholder:text-slate-500"
                                disabled={isLoading}
                            />
                            <Button
                                onClick={() => handleSendMessage(inputValue)}
                                disabled={!inputValue.trim() || isLoading}
                                className="bg-cyan-500 hover:bg-cyan-600 text-white"
                                size="icon"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "h-14 w-14 rounded-full shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:scale-110",
                    isOpen
                        ? "bg-slate-800 hover:bg-slate-700 text-white border border-white/10"
                        : "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-cyan-500/40"
                )}
            >
                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <MessageSquare className="w-6 h-6" />
                )}
            </Button>
        </div>
    );
}
