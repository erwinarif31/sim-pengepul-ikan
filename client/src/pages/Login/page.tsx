import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../../context/AuthContext";

const schema = z.object({
    id: z.string().min(1, "ID wajib diisi"),
    password: z.string().min(1, "Password wajib diisi"),
});

type FormData = z.infer<typeof schema>;

const LoginPage: React.FC = () => {
    const { isAuthenticated, isLoading, login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [serverError, setServerError] = useState<string | null>(null);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({ resolver: zodResolver(schema) });

    if (isLoading) {
        return null;
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    const onSubmit = async (data: FormData) => {
        setServerError(null);
        try {
            await login(data);
            const from = (location.state as { from?: { pathname: string } } | null)
                ?.from;
            navigate(from?.pathname || "/", { replace: true });
        } catch {
            setServerError("ID atau password tidak valid.");
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10 dark:bg-gray-950">
            <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-theme-md dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-8">
                    <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">
                        Catchery
                    </p>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        Masuk ke sistem
                    </h1>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Gunakan akun yang diberikan untuk melanjutkan.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label
                            htmlFor="login-id"
                            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            ID pengguna
                        </label>
                        <input
                            id="login-id"
                            autoComplete="username"
                            {...register("id")}
                            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white"
                        />
                        {errors.id && (
                            <p className="mt-1 text-xs text-error-500">
                                {errors.id.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="login-password"
                            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Password
                        </label>
                        <input
                            id="login-password"
                            type="password"
                            autoComplete="current-password"
                            {...register("password")}
                            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white"
                        />
                        {errors.password && (
                            <p className="mt-1 text-xs text-error-500">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {serverError && (
                        <p role="alert" className="rounded-lg bg-error-50 px-3 py-2 text-sm text-error-600 dark:bg-error-500/10 dark:text-error-400">
                            {serverError}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-11 w-full rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting ? "Memproses..." : "Masuk"}
                    </button>
                </form>
            </section>
        </main>
    );
};

export default LoginPage;
