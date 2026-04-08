import React from "react";
import { SidebarProvider, SidebarTrigger } from "./@/components/ui/sidebar";
import AppSidebar from "./app/workspace/_components/AppSidebar";
import AppHeader from "./app/workspace/_components/AppHeader";

function WorkspaceProvider({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="w-full min-h-screen bg-ev-surface dark:bg-[#191c1a]">
        <AppHeader />
        <div className="px-8 pb-12 max-w-[1400px] mx-auto space-y-12">{children}</div>
      </div>
    </SidebarProvider>
  );
}

export default WorkspaceProvider;
