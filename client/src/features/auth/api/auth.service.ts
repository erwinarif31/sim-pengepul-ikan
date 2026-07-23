import http from "../../../lib/http";
import {
    ApiEnvelope,
    AuthUser,
    LoginRequest,
    LoginResponse,
} from "./auth.type";

class AuthService {
    static async login(request: LoginRequest): Promise<LoginResponse> {
        const response = await http.post<ApiEnvelope<LoginResponse>>(
            "/api/users/login",
            request,
        );
        return response.data.data;
    }

    static async getCurrentUser(): Promise<AuthUser> {
        const response = await http.get<ApiEnvelope<AuthUser>>(
            "/api/users/me",
        );
        return response.data.data;
    }

    static async logout(): Promise<boolean> {
        const response = await http.post<ApiEnvelope<boolean>>(
            "/api/users/logout",
        );
        return response.data.data;
    }
}

export default AuthService;
