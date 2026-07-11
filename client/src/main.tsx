import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import "swiper/swiper-bundle.css";
import "simplebar-react/dist/simplebar.min.css";
import App from "./App.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { AppWrapper } from "./component/common/PageMeta.tsx";
import createGlobalQueryClient from "./hooks/useGlobalQueryClient.ts";

// Instantiate the QueryClient
const queryClient = createGlobalQueryClient();

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <ThemeProvider>
                    <AppWrapper>
                        <App />
                    </AppWrapper>
                </ThemeProvider>
            </BrowserRouter>
        </QueryClientProvider>
    </StrictMode>,
);
