import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useSidebarContext } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";

export function MainLayout() {
  const { collapsed } = useSidebarContext();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div
        className={cn(
          "transition-all duration-300",
          collapsed ? "pl-[72px]" : "pl-64"
        )}
      >
        <TopBar />
        <main className="p-6 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
