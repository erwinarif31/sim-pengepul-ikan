import { QueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

const getErrorCode = (error: Error): number => {
    if (error instanceof AxiosError && error.response) {
        return error.response.status;
    }
    return 0;
};

const createGlobalQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                retry: 1,
                refetchOnMount: true,
                refetchOnReconnect: true,
                refetchOnWindowFocus: false,
                throwOnError(error) {
                    const errorCode = getErrorCode(error);

                    if ([500, 505].includes(errorCode)) {
                        alert(
                            "Terjadi kesalahan pada server, silakan coba lagi nanti!",
                        );
                    }

                    return !(error instanceof AxiosError);
                },
            },
            mutations: {
                onError(e) {
                    const errorCode = getErrorCode(e);

                    if ([401, 403].includes(errorCode)) {
                        alert(
                            "Maaf, kamu tidak memiliki akses untuk melakukan tindakan ini!",
                        );
                    }
                },
            },
        },
    });

export default createGlobalQueryClient;
