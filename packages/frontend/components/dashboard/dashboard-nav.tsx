"use client";

import { useEffect, useState } from "react";
import { Home, BarChart3, CreditCard, PiggyBank, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

export function DashboardNav() {
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const pathname = usePathname();

  // Ensure the pathname is set only on the client side
  useEffect(() => {
    setCurrentPath(pathname);
  }, [pathname]);

  const navItems: NavItem[] = [
    { title: "Dashboard", href: "/dashboard", icon: <Home className="mr-2 h-4 w-4" /> },
    { title: "Transactions", href: "/dashboard/transactions", icon: <CreditCard className="mr-2 h-4 w-4" /> },
    { title: "Analytics", href: "/dashboard/analytics", icon: <BarChart3 className="mr-2 h-4 w-4" /> },
    { title: "Budgets", href: "/dashboard/budgets", icon: <PiggyBank className="mr-2 h-4 w-4" /> },
    { title: "Settings", href: "/dashboard/settings", icon: <Settings className="mr-2 h-4 w-4" /> },
  ];

  return (
    <nav className="grid items-start gap-2 py-4">
      {navItems.map((item) => {
        const isActive =
          currentPath === item.href ||
          (item.href !== "/dashboard" && currentPath?.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              isActive ? "bg-accent text-accent-foreground" : "transparent"
            )}
          >
            {item.icon}
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
