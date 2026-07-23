import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { UserRole } from "../../features/auth/api/auth.type";

type ProtectedRouteProps = {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
    fallbackTo?: string;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles,
    fallbackTo = "/login",
}) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                Memuat sesi...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to={fallbackTo} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
