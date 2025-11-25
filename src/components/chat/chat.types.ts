export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    toolsUsed?: string[];
}

export interface ChatState {
    isOpen: boolean;
    messages: ChatMessage[];
    isLoading: boolean;
    conversationId?: string;
}
