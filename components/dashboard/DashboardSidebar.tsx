"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  Inbox,
  LayoutDashboard,
  Package,
  Sparkles,
  Store,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  comingSoon?: boolean;
  isActive?: (pathname: string) => boolean;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    title: "Workspace",
    items: [
      {
        label: "Overview",
        href: "/dashboard",
        icon: LayoutDashboard,
        isActive: (pathname) => pathname === "/dashboard",
      },
      {
        label: "Inquiries",
        href: "/dashboard/inquiries",
        icon: Inbox,
        isActive: (pathname) => pathname.startsWith("/dashboard/inquiries"),
      },
      {
        label: "Analytics",
        href: "#",
        icon: BarChart3,
        comingSoon: true,
      },
    ],
  },
  {
    title: "Company",
    items: [
      {
        label: "Company Profile",
        href: "/dashboard/company-profile",
        icon: Building2,
        isActive: (pathname) => pathname.startsWith("/dashboard/company-profile"),
      },
      {
        label: "Products",
        href: "/dashboard/products",
        icon: Package,
        isActive: (pathname) => pathname.startsWith("/dashboard/products"),
      },
    ],
  },
  {
    title: "Marketplace",
    items: [
      {
        label: "Marketplace",
        href: "#",
        icon: Store,
        comingSoon: true,
      },
      {
        label: "AI Match",
        href: "#",
        icon: Sparkles,
        comingSoon: true,
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        label: "Profile",
        href: "/dashboard",
        icon: User,
      },
    ],
  },
];

function getIsActive(item: NavItem, pathname: string) {
  if (item.comingSoon || item.href === "#") return false;
  if (item.isActive) return item.isActive(pathname);
  return (
    pathname === item.href ||
    (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`))
  );
}

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r bg-sidebar md:flex">
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="flex size-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
          T
        </div>
        <div>
          <p className="text-sm font-bold text-sidebar-foreground">Tradexo</p>
          <p className="text-xs text-muted-foreground">Global Trade</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section.title}
            </p>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = getIsActive(item, pathname);

                if (item.comingSoon) {
                  return (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground"
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      <span className="text-xs">Soon</span>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                      isActive
                        ? "bg-blue-50 font-medium text-blue-700"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
