export interface ChatMessage {
    id: string;
    user: string;
    message: string;
    timestamp: string;
}

export interface User {
    id: string;
    name: string;
}

export interface Room {
    id: string;
    name: string;
}