import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import { Toaster } from "react-hot-toast";

const LayoutContent: React.FC = () => {
    const { isExpanded, isHovered, isMobileOpen } = useSidebar();

    return (
        <div className="min-h-screen xl:flex">
            <div>
                <AppSidebar />
                <Backdrop />
            </div>
            <div
                className={`flex-1 transition-all duration-300 ease-in-out ${isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
                    } ${isMobileOpen ? "ml-0" : ""}`}
            >
                <AppHeader />
                <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
                    <Outlet />
                </div>
            </div>
            <Toaster
                position="top-right"
                reverseOrder={false}
                containerStyle={{
                    zIndex: 999999,
                }}
                toastOptions={{
                    duration: 4000,
                    style: {
                        fontSize: "16px",
                        fontWeight: "500",
                        padding: "16px 24px",
                        borderRadius: "12px",
                        maxWidth: "500px",
                        minWidth: "300px",
                    },
                    success: {
                        style: {
                            background: "#10B981",
                            color: "#fff",
                        },
                        iconTheme: {
                            primary: "#fff",
                            secondary: "#10B981",
                        },
                    },
                    error: {
                        style: {
                            background: "#EF4444",
                            color: "#fff",
                        },
                        iconTheme: {
                            primary: "#fff",
                            secondary: "#EF4444",
                        },
                    },
                }}
            />
        </div>
    );
};

const AppLayout: React.FC = () => {
    return (
        <SidebarProvider>
            <LayoutContent />
        </SidebarProvider>
    );
};

export default AppLayout;
