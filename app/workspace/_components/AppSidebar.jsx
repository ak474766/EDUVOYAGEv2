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
import { motion } from "framer-motion";
import {
  Book,
  Compass,
  LayoutDashboard,
  PencilRulerIcon,
  UserCircle2Icon,
  WalletCards,
  Plus,
  GraduationCap,
  User,
  Bell,
} from "lucide-react";
import { usePathname } from "next/navigation";
import AddNewCourseDialog from "./AddNewCourseDialog";

const SideBarOption = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/workspace",
  },
  {
    title: "My Learning",
    icon: Book,
    path: "/workspace/my-learning",
  },
  {
    title: "Explore Courses",
    icon: Compass,
    path: "/workspace/explore",
  },
  {
    title: "Notifications",
    icon: Bell,
    path: "/workspace/notifications",
  },
  {
    title: "Ai Tools",
    icon: PencilRulerIcon,
    path: "/workspace/ai-tools",
  },
  {
    title: "Billing",
    icon: WalletCards,
    path: "/workspace/billing",
  },
  {
    title: "Profile",
    icon: UserCircle2Icon,
    path: "/workspace/profile",
  },
];

const handleBack = () => {
  router.push("/workspace");
};

function AppSidebar() {
  const path = usePathname();
  const [profile, setProfile] = useState({ name: "", plan: "" });
  const [loading, setLoading] = useState(true);

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
    <Sidebar>
      <SidebarHeader className="p-6 border-b border-gray-100 dark:border-white/10">
      <div className="relative z-10">
        <div
          onClick={handleBack}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleBack();
          }}
          className="cursor-pointer flex items-center gap-3 px-2 py-1 rounded-xl hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
          title="Go to Workspace"
        >
          <div className="h-10 w-10 rounded-xl grid place-items-center bg-gradient-to-br from-indigo-600 to-blue-500 text-white ring-1 ring-black/10 shadow-md shadow-black/10">
            <GraduationCap className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">EduVoyage logo</span>
          </div>

          <div className="flex flex-col">
            <span className="text-base font-semibold leading-5 text-gray-900 dark:text-white">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600">
                EduVoyage
              </span>
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Learning platform
            </span>
          </div>
        </div>
      </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-6">
        <SidebarGroup className="mb-6">
          <AddNewCourseDialog>
            <Button className="w-full h-11 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-lg font-medium">
              <Plus className="h-4 w-4 mr-2" />
              Create New Course
            </Button>
          </AddNewCourseDialog>
        </SidebarGroup>

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
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base transition-all duration-300 ${
                        path === item.path
                          ? "text-white bg-gradient-to-r from-blue-500 to-purple-500 shadow-md"
                          : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-white/5"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {/* Simplified user profile section */}
        <motion.div
          className="relative z-10 mt-auto"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <Separator className="mb-4 bg-sidebar-border/50" />
          <motion.div
            className="flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent/30 border border-sidebar-border/30 backdrop-blur-sm glass-enhanced"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <motion.div
              className="w-10 h-10 bg-gradient-to-br from-chart-2 to-chart-3 rounded-full flex items-center justify-center relative"
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            >
              <User className="w-5 h-5 text-white relative z-10" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-sidebar-foreground truncate">
                {loading ? "Loading..." : profile.name}
              </div>
              <div className="text-xs text-sidebar-foreground/60 truncate">
                {loading
                  ? "Checking plan..."
                  : profile.plan === "Pro"
                  ? "Premium Member"
                  : "Free Member"}
              </div>
            </div>
            <motion.div
              className="w-2 h-2 bg-green-400 rounded-full"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
