export interface User {
    id: string;
    created_at: string;
    profile_id: string | null;
    status: number;
    // ... 기타 사용자 정보
}

export interface AuthResponse {
    token: string;
    user: User;
}