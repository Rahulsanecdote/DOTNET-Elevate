"use client";

import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { UserNav } from "@/components/user-nav";
import Link from "next/link";
import {
  Activity,
  BookOpen,
  Briefcase,
  Code,
  LayoutDashboard,
  Mic,
} from "lucide-react";
import { DotNetElevateLogo } from "./logo";
import { Button } from "./ui/button";

const navItems = [
  { href: "/", label: "Dashboard", icon: <LayoutDashboard /> },
  { href: "/streams", label: "Streams", icon: <Activity /> },
  { href: "/learn", label: "Learn", icon: <BookOpen /> },
  { href: "/jobs", label: "Jobs", icon: <Briefcase /> },
  { href: "/interview", label: "Interview", icon: <Mic /> },
  { href: "/work", label: "Work", icon: <Code /> },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-lg font-bold font-headline tracking-tighter text-sidebar-primary"
          >
            <DotNetElevateLogo className="h-6 w-6" />
            .NET Elevate
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => {
              // Basic logic to determine active state.
              // A more robust solution might be needed for nested routes.
              const isActive =
                item.href === "/"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={{ children: item.label }}
                  >
                    <Link href={item.href}>
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          {/* You can add footer content here, like settings or profile */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:justify-end">
          <SidebarTrigger className="md:hidden" />
          <UserNav />
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
