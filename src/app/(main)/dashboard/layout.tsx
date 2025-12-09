"use client";

import React, { useState } from "react";
import { LayoutDashboard, BarChart2, BadgeCheck, Moon, Sun, Menu, LogOut, X } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { signOut, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/signin");
  };

  // Get user display name
  const displayName = user?.user_metadata?.first_name
    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ""}`
    : user?.email?.split("@")[0] || "User";

  const userEmail = user?.email || "";

  const navItems = [
    { to: "/dashboard", end: true, icon: LayoutDashboard, label: "Dashboard" },
    { to: "/dashboard/analytics", end: false, icon: BarChart2, label: "Analytics" },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full p-6">
      <div className="flex items-center gap-2 mb-8 px-2 cursor-pointer" onClick={() => router.push("/")}>
        <BadgeCheck className="w-8 h-8 text-primary" />
        <span className="font-bold text-xl tracking-tight">HabitFlow</span>
      </div>

      <nav className="space-y-2 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.to}
            href={item.to}
            onClick={() => setIsMobileNavOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <item.icon size={20} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-border">
        {user && (
          <div className="px-3 mb-2">
            <div className="text-sm font-medium text-foreground truncate">{displayName}</div>
            <div className="text-xs text-muted-foreground truncate">{userEmail}</div>
          </div>
        )}

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-300">
      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card h-screen sticky top-0 z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileNavOpen(true)}
            className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <BadgeCheck className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">HabitFlow</span>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Drawer (Overlay) */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsMobileNavOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute left-0 top-0 bottom-0 w-3/4 max-w-xs bg-card border-r border-border shadow-2xl animate-in slide-in-from-left duration-300">
            <button
              onClick={() => setIsMobileNavOpen(false)}
              className="absolute right-4 top-4 p-1 hover:bg-muted rounded-full"
            >
              <X size={20} className="text-muted-foreground" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 w-full p-4 pt-20 md:p-8 md:pt-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto animate-in fade-in duration-500">{children}</div>
      </main>
    </div>
  );
}
