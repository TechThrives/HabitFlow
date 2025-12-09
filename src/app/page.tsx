"use client";

import React from "react";
import {
  BadgeCheck,
  BarChart2,
  Calendar,
  Shield,
  ArrowRight,
  Zap,
  Moon,
  Sun,
  Layout,
  Check,
  Clock,
  Flame,
  Twitter,
  Github,
  Linkedin,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

export const Home: React.FC = () => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 overflow-x-hidden transition-colors duration-300">
      {/* Navbar */}
      <nav className="w-full border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
            <BadgeCheck className="w-7 h-7 text-primary" />
            <span className="font-bold text-xl tracking-tight">HabitFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors mr-2"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => router.push("/signin")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push("/signup")}
              className="bg-primary hover:bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium transition-all shadow-lg shadow-blue-500/20 hover:scale-105"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-10 px-6 flex flex-col items-center text-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground max-w-4xl mb-6 animate-in fade-in slide-in-from-bottom-5 duration-700 leading-[1.15]">
          Not every habit is{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-indigo-600">Daily.</span>
          <br />
          Track life on your terms.
        </h1>

        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000">
          Most trackers force you into a daily grind. HabitFlow lets you schedule habits for
          <strong> specific days</strong>, <strong>weekly goals</strong>, or <strong>monthly targets</strong>. Build a
          routine that actually fits your schedule.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100 z-10">
          <button
            onClick={() => router.push("/signup")}
            className="flex items-center justify-center gap-1 bg-foreground text-background hover:bg-foreground/90 px-4 py-2 rounded-full font-semibold text-base transition-all hover:scale-105 active:scale-95"
          >
            Start Tracking
            <ArrowRight size={14} />
          </button>
          <button
            onClick={() => router.push("/signin")}
            className="px-4 py-2 rounded-full font-medium text-foreground border border-border hover:bg-muted transition-all"
          >
            Sign In
          </button>
        </div>

        {/* Hero Visual Mockup */}
        <div className="mt-16 relative w-full max-w-4xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
          <div className="absolute -inset-1 bg-linear-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20"></div>
          <div className="relative bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
            {/* Fake Browser Header */}
            <div className="bg-muted/50 border-b border-border p-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
              </div>
              <div className="ml-4 h-2 w-32 bg-border rounded-full opacity-50"></div>
            </div>

            {/* Fake App Content */}
            <div className="p-6 md:p-8 grid md:grid-cols-2 gap-6 text-left bg-background/50">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">Your Dashboard</h3>
                </div>

                {/* Fake Card 1: Weekly */}
                <div className="bg-card border border-border p-4 rounded-xl flex items-center justify-between shadow-sm relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                  <div className="ml-2">
                    <div className="font-medium">Gym Workout</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock size={10} /> Mon, Wed, Fri at 6:00 PM
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    <Check size={14} strokeWidth={3} />
                  </div>
                </div>

                {/* Fake Card 2: Daily */}
                <div className="bg-card border border-border p-4 rounded-xl flex items-center justify-between shadow-sm relative overflow-hidden opacity-90">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>
                  <div className="ml-2">
                    <div className="font-medium">Read 10 Pages</div>
                    <div className="flex items-center gap-1 text-xs text-orange-500 mt-1">
                      <Flame size={10} fill="currentColor" /> 12 Day Streak
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-muted-foreground/30"></div>
                </div>
              </div>

              {/* Fake Analytics */}
              <div className="hidden md:block border-l border-border pl-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="font-semibold">Consistency</div>
                  <div className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full">+12%</div>
                </div>
                <div className="space-y-3">
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-[75%] bg-blue-500 rounded-full"></div>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-[45%] bg-purple-500 rounded-full"></div>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-[90%] bg-orange-500 rounded-full"></div>
                  </div>
                </div>
                <div className="mt-8 grid grid-cols-7 gap-2 opacity-50">
                  {[...Array(14)].map((_, i) => (
                    <div key={i} className={`h-6 rounded-sm ${i % 3 === 0 ? "bg-primary" : "bg-muted"}`}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid (Uniform Style) */}
      <section className="py-10 bg-muted/30 border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Why HabitFlow is different</h2>
            <p className="text-lg text-muted-foreground">
              We stripped away the gamification clutter and focused on clear, actionable scheduling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature 1: Scheduling */}
            <div className="bg-card p-8 rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col h-full">
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 text-blue-500">
                  <Calendar size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3">Scheduling Engine</h3>
                <p className="text-muted-foreground leading-relaxed flex-1">
                  Stop feeling guilty for missing a "daily" habit that was never meant to be daily. Configure habits for
                  specific weekdays, monthly goals, or classic routines.
                </p>
                <div className="mt-8 flex gap-2">
                  <span className="px-3 py-1 rounded-md bg-muted text-xs font-mono text-muted-foreground">Mon</span>
                  <span className="px-3 py-1 rounded-md bg-muted text-xs font-mono text-muted-foreground">Wed</span>
                  <span className="px-3 py-1 rounded-md bg-blue-500 text-xs font-mono text-white">Fri</span>
                </div>
              </div>
              <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <Calendar size={200} />
              </div>
            </div>

            {/* Feature 2: Analytics */}
            <div className="bg-card p-8 rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow flex flex-col h-full relative overflow-hidden group">
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 text-indigo-500">
                  <BarChart2 size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3">Visual Insights</h3>
                <p className="text-muted-foreground leading-relaxed flex-1">
                  Spot trends in your behavior. Track streaks, monthly completion rates, and total dedication over time.
                </p>
                <div className="mt-6 h-12 flex items-end gap-1 opacity-50">
                  <div className="w-full bg-indigo-500 h-[40%] rounded-t-sm"></div>
                  <div className="w-full bg-indigo-500 h-[70%] rounded-t-sm"></div>
                  <div className="w-full bg-indigo-500 h-[50%] rounded-t-sm"></div>
                  <div className="w-full bg-indigo-500 h-[90%] rounded-t-sm"></div>
                </div>
              </div>
            </div>

            {/* Feature 3: Distraction Free */}
            <div className="bg-card p-8 rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 text-emerald-500">
                <Layout size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Distraction Free</h3>
              <p className="text-muted-foreground leading-relaxed flex-1">
                No ads, no social feeds, no noise. Just a clean interface dedicated to your personal growth. Toggle
                between Dark and Light mode.
              </p>
            </div>

            {/* Feature 4: Cloud Sync */}
            <div className="bg-card p-8 rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 text-purple-500">
                <Shield size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Secure Cloud Sync</h3>
              <p className="text-muted-foreground leading-relaxed flex-1">
                Your data is stored securely in the cloud. Login from your phone, tablet, or desktop and never lose your
                streak again.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-4 border-t border-border bg-card mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* LEFT: LOGO + TAGLINE */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-2">
              <BadgeCheck className="w-5 h-5 text-primary" />
              <span className="font-semibold text-lg">HabitFlow</span>
            </div>
            <p className="text-xs text-muted-foreground">Build habits. Stay consistent.</p>
          </div>

          {/* RIGHT: LINKS */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">
              Features
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Contact
            </a>
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div className="mt-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} HabitFlow. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
