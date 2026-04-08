"use client";

import React, { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../../@/components/ui/sidebar";
import Link from "next/link";
import { Button } from "../../../components/ui/button";
import { Separator } from "../../../@/components/ui/separator";
import {
  Book,
  Compass,
  LayoutDashboard,
  PencilRulerIcon,
  UserCircle2Icon,
  WalletCards,
  Plus,
  TreePine,
  Bell,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import AddNewCourseDialog from "./AddNewCourseDialog";

const SideBarOption = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/workspace" },
  { title: "My Courses", icon: Book, path: "/workspace/my-learning" },
  { title: "Library", icon: Compass, path: "/workspace/explore" },
  { title: "Achievements", icon: Bell, path: "/workspace/notifications" },
  { title: "Ai Tools", icon: PencilRulerIcon, path: "/workspace/ai-tools" },
  { title: "Settings", icon: WalletCards, path: "/workspace/billing" },
];

function AppSidebar() {
  const path = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState({ name: "", plan: "" });
  const [loading, setLoading] = useState(true);

  const handleBack = () => {
    router.push("/workspace");
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch("/api/user", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load user");
        const data = await res.json();
        if (isMounted)
          setProfile({
            name: data?.name || "Guest",
            plan: data?.plan || "Free",
          });
      } catch (e) {
        if (isMounted) setProfile({ name: "Guest", plan: "Free" });
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Sidebar className="border-r-0 bg-ev-surface dark:bg-[#191c1a]">
      {/* ── Brand ────────────────────────────────── */}
      <SidebarHeader className="p-6 mb-4">
        <div
          onClick={handleBack}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleBack();
          }}
          className="cursor-pointer flex items-center gap-3 px-2"
          title="Go to Workspace"
        >
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            <TreePine className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#4e6354] dark:text-[#eceeea]">
              EduVoyage
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-ev-outline">
              Growth Mindset
            </p>
          </div>
        </div>
      </SidebarHeader>

      {/* ── Navigation ───────────────────────────── */}
      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {SideBarOption.map((item, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton
                    asChild
                    className="p-0 hover:bg-transparent"
                  >
                    <Link
                      href={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-300 ${
                        path === item.path
                          ? "text-[#4e6354] dark:text-[#bcf540] font-bold border-r-4 border-[#4e6354] dark:border-[#bcf540] hover:bg-ev-surface-container"
                          : "text-[#434842] dark:text-[#c3c8c0] opacity-70 hover:bg-ev-surface-container transition-all duration-300"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium tracking-tight">
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer ───────────────────────────────── */}
      <SidebarFooter className="p-4 space-y-4 mt-auto">
        {/* Create Course */}
        <AddNewCourseDialog>
          <Button className="w-full py-4 bg-primary text-primary-foreground rounded-full font-bold tracking-tight hover:opacity-90 transition-all h-12">
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        </AddNewCourseDialog>

        {/* Utility links */}
        <div className="pt-4 border-t border-ev-outline-variant/20 space-y-1">
          <a
            className="flex items-center gap-3 px-4 py-2 text-sm text-[#434842] dark:text-[#c3c8c0] opacity-70 hover:opacity-100 transition-opacity rounded-full"
            href="#"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Support</span>
          </a>
          <Link
            className="flex items-center gap-3 px-4 py-2 text-sm text-[#434842] dark:text-[#c3c8c0] opacity-70 hover:opacity-100 transition-opacity rounded-full"
            href="/workspace/profile"
          >
            <UserCircle2Icon className="h-4 w-4" />
            <span>Profile</span>
          </Link>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
