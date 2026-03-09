import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useSidebarContext } from "@/contexts/SidebarContext";

export function MainLayout() {
  const { isMobile } = useSidebarContext();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className={isMobile ? "pl-0" : "pl-72 transition-all duration-300"}>
        <TopBar />
        <main className="p-4 lg:p-6 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
