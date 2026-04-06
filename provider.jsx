import React from "react";
import { SidebarProvider, SidebarTrigger } from "./@/components/ui/sidebar";
import AppSidebar from "./app/workspace/_components/AppSidebar";
import AppHeader from "./app/workspace/_components/AppHeader";

function Workspaceprovider({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="w-full">
        <AppHeader />
        <div className="p-10">{children}</div>
      </div>
    </SidebarProvider>
  );
}

export default Workspaceprovider;
