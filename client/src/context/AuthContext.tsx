import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import AuthService from "../features/auth/api/auth.service";
import { AUTH_TOKEN_KEY } from "../features/auth/auth.constants";
import {
    AuthUser,
    LoginRequest,
    LoginResponse,
} from "../features/auth/api/auth.type";

type AuthContextValue = {
    user: AuthUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (request: LoginRequest) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const clearStoredToken = () => {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
};

const userFromLogin = (response: LoginResponse): AuthUser => {
    return {
        id: response.id,
        name: response.name,
        role: response.role,
        worker_id: response.worker_id,
        token_expires_at: response.token_expires_at,
    };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [token, setToken] = useState<string | null>(() =>
        sessionStorage.getItem(AUTH_TOKEN_KEY)
    );

    useEffect(() => {
        const storedToken = sessionStorage.getItem(AUTH_TOKEN_KEY);
        if (!storedToken) {
            setIsLoading(false);
            return;
        }

        AuthService.getCurrentUser()
            .then((currentUser) => {
                setUser(currentUser);
            })
            .catch(() => {
                clearStoredToken();
                setToken(null);
                setUser(null);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    const login = useCallback(async (request: LoginRequest) => {
        const response = await AuthService.login(request);
        sessionStorage.setItem(AUTH_TOKEN_KEY, response.token);
        setToken(response.token);
        setUser(userFromLogin(response));
    }, []);

    const logout = useCallback(async () => {
        try {
            if (sessionStorage.getItem(AUTH_TOKEN_KEY)) {
                await AuthService.logout();
            }
        } finally {
            clearStoredToken();
            setToken(null);
            setUser(null);
        }
    }, []);

    const value = useMemo(
        () => ({
            user,
            isLoading,
            isAuthenticated: Boolean(user && token),
            login,
            logout,
        }),
        [isLoading, login, logout, token, user],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};
