"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Smartphone,
  Settings,
  LogOut,
  Waypoints,
  Users,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { logoutAction } from "@/actions/auth";
import { getMe } from "@/api/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null,
  );

  useEffect(() => {
    getMe()
      .then((res) => {
        if (res.data) setUser(res.data);
      })
      .catch(() => {
        // middleware handles redirect, but just in case
        console.error("Failed to fetch user");
      });
  }, []);

  const handleLogout = async () => {
    await logoutAction();
    router.push("/login");
  };

  const navItems = [
    { name: "แดชบอร์ด", href: "/admin/dashboard", icon: LayoutDashboard },
    {
      name: "ประวัติการประเมิน",
      href: "/admin/assessments",
      icon: CheckCircle2,
    },
    { name: "ความพึงพอใจ", href: "/admin/feedback", icon: MessageSquare },
    { name: "ผู้ใช้งาน", href: "/admin/users", icon: Users },
    { name: "แบรนด์", href: "/admin/brands", icon: Smartphone },
    { name: "รุ่นมือถือ", href: "/admin/models", icon: Smartphone },
    { name: "เส้นทาง", href: "/admin/paths", icon: Waypoints },
    { name: "เกณฑ์สภาพ", href: "/admin/conditions", icon: Settings },
  ];

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-sidebar-foreground flex items-center gap-2">
            <LayoutDashboard className="w-8 h-8 text-primary fill-primary/20" />
            Admin DSS
          </h1>
          {user && (
            <p className="text-xs text-muted-foreground mt-2 px-1">
              Welcome, {user.name}
            </p>
          )}
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5",
                    isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            ออกจากระบบ
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 bg-background">
        {children}
      </main>
    </div>
  );
}
