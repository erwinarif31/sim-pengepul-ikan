export type UserRole = "ADMIN" | "OWNER" | "WORKER";

export type AuthUser = {
    id: string;
    name: string;
    role: UserRole;
    worker_id?: string | null;
    token_expires_at?: number;
};

export type LoginResponse = AuthUser & {
    token: string;
};

export type LoginRequest = {
    id: string;
    password: string;
};

export type ApiEnvelope<T> = {
    data: T;
    errors?: string;
};
