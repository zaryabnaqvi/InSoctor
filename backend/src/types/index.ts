// Alert Types
export interface WazuhAlert {
    id: string;
    timestamp: string;
    rule: {
        id: string;
        level: number;
        description: string;
        groups: string[];
    };
    agent: {
        id: string;
        name: string;
        ip: string;
    };
    manager: {
        name: string;
    };
    data: {
        srcip?: string;
        dstip?: string;
        srcport?: number;
        dstport?: number;
        protocol?: string;
        [key: string]: any;
    };
    decoder: {
        name: string;
    };
    location: string;
    full_log: string;
}

export interface Alert {
    id: string;
    title: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    status: 'open' | 'investigating' | 'resolved' | 'false-positive';
    source: string;
    timestamp: string;
    assignedTo?: string;
    caseId?: string;
    caseStatus?: string;
    threatIntel?: ThreatIntel;
    rawData: WazuhAlert;
}

// Log Types
export interface WazuhLog {
    timestamp: string;
    agent: {
        id: string;
        name: string;
        ip: string;
    };
    manager: {
        name: string;
    };
    cluster: {
        name: string;
        node: string;
    };
    decoder: {
        name: string;
    };
    full_log: string;
    location: string;
    input: {
        type: string;
    };
    _index: string;
    _id: string;
}

// Case Types
export interface IrisCase {
    case_id: number;
    case_name: string;
    case_description: string;
    case_customer: number;
    case_classification: string;
    case_severity: string;
    case_state: string;
    case_open_date: string;
    case_close_date?: string;
    case_soc_id: string;
    owner: string;
    alerts?: string[];
}

export interface Case {
    id: string;
    title: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    status: 'open' | 'investigating' | 'closed';
    createdAt: string;
    updatedAt: string;
    assignedTo?: string;
    alerts: string[];
    rawData: IrisCase;
}

// Rule Types
export interface WazuhRule {
    id: string;
    level: number;
    description: string;
    groups: string[];
    filename: string;
    status: string;
    details?: {
        if_sid?: string;
        match?: string;
        regex?: string;
        decoded_as?: string;
        category?: string;
        [key: string]: any;
    };
}

// Threat Intelligence Types
export interface ThreatIntel {
    indicators: Array<{
        type: string;
        value: string;
        confidence: number;
        tags: string[];
    }>;
    events: Array<{
        id: string;
        info: string;
        threat_level: string;
        date: string;
    }>;
}

// Filter Types
export interface AlertFilters {
    severity?: string[];
    status?: string[];
    startDate?: string;
    endDate?: string;
    agentId?: string;
    ruleId?: string;
    limit?: number;
    offset?: number;
}

export interface LogFilters {
    startDate?: string;
    endDate?: string;
    agentId?: string;
    agentName?: string;
    decoder?: string;
    search?: string;
    limit?: number;
    offset?: number;
}

export interface CaseFilters {
    status?: string[];
    severity?: string[];
    assignedTo?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// User Types
export type UserRole = 'admin' | 'analyst' | 'viewer';

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string; // Only for internal use, never return in API
    role: UserRole;
    avatar?: string;
    createdAt: string;
    lastLogin?: string;
}

export interface AuthResponse {
    token: string;
    user: Omit<User, 'password'>;
}
