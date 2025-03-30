import type React from "react";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { UserNav } from "@/components/dashboard/user-nav";
import { ThemeToggle } from "@/components/theme-toggle"; // Import ThemeToggle component

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          {/* Left Section: Blink-Bank */}
          <div className="flex items-center gap-2 font-bold">
            <span className="text-primary">Blink-Bank</span>
          </div>

          {/* Right Section: ThemeToggle and UserNav */}
          <div className="flex items-center gap-4">
            {/* ThemeToggle */}
            <ThemeToggle />

            {/* UserNav */}
            <UserNav />
          </div>
        </div>
      </header>
      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr]">
        <aside className="hidden w-[200px] flex-col md:flex lg:w-[240px]">
          <DashboardNav />
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden py-6">{children}</main>
      </div>
    </div>
  );
}