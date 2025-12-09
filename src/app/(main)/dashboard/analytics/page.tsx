"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import { Habit, HabitEntry } from "@/types";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthProvider";
import { api } from "@/services/api";
import {
  TrendingUp,
  Target,
  Flame,
  Award,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";

type TimeRange = "7" | "30" | "90";

export const Analytics: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<Record<string, HabitEntry[]>>({});
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("30");

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      try {
        setLoading(true);
        const [fetchedHabits, fetchedEntriesArr] = await Promise.all([api.getHabits(), api.getAllEntries()]);
        setHabits(fetchedHabits);
        const entriesMap: Record<string, HabitEntry[]> = {};
        fetchedEntriesArr.forEach((e) => {
          if (!entriesMap[e.habitId]) entriesMap[e.habitId] = [];
          entriesMap[e.habitId].push(e);
        });
        setEntries(entriesMap);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  // ----------------------------------------------------------------------
  // Helper: Calculate stats for a specific date range
  // ----------------------------------------------------------------------
  const calculatePeriodStats = (daysBack: number, offsetDays: number = 0) => {
    let completed = 0;
    let totalActive = 0;

    for (let i = 0; i < daysBack; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (i + offsetDays));
      const dateStr = date.toISOString().split("T")[0];

      habits.forEach((h) => {
        if (h.startDate <= dateStr) {
          totalActive++;
          const entry = entries[h.id]?.find((e) => e.date === dateStr);
          if (entry?.status === "completed") completed++;
        }
      });
    }

    return totalActive > 0 ? (completed / totalActive) * 100 : 0;
  };

  // ----------------------------------------------------------------------
  // Stats Comparison Logic
  // ----------------------------------------------------------------------
  const statsComparison = useMemo(() => {
    const days = parseInt(timeRange);
    const currentRate = calculatePeriodStats(days, 0);
    const prevRate = calculatePeriodStats(days, days);

    const diff = currentRate - prevRate;
    return {
      currentRate: Math.round(currentRate),
      diff: Math.round(diff),
      trend: diff > 0 ? "up" : diff < 0 ? "down" : "neutral",
    };
  }, [habits, entries, timeRange]);

  // ----------------------------------------------------------------------
  // Chart Logic: Trend (Dynamic based on Time Range)
  // ----------------------------------------------------------------------
  const trendData = useMemo(() => {
    const days = parseInt(timeRange);
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const displayDate =
        timeRange === "90"
          ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : date.toLocaleDateString("en-US", { day: "numeric" });

      let activeCount = 0;
      let completedCount = 0;

      habits.forEach((h) => {
        if (h.startDate <= dateStr) {
          activeCount++;
          const entry = entries[h.id]?.find((e) => e.date === dateStr);
          if (entry?.status === "completed") {
            completedCount++;
          }
        }
      });

      data.push({
        date: displayDate,
        fullDate: dateStr,
        percentage: activeCount > 0 ? Math.round((completedCount / activeCount) * 100) : 0,
      });
    }
    return data;
  }, [habits, entries, timeRange]);

  // ----------------------------------------------------------------------
  // Chart Logic: Heatmap (Last 365 Days)
  // ----------------------------------------------------------------------
  const heatmapData = useMemo(() => {
    const data = [];
    const today = new Date();
    // Generate last 365 days
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];

      let count = 0;
      Object.values(entries)
        .flat()
        .forEach((e) => {
          if (e.date === dateStr && e.status === "completed") count++;
        });

      data.push({ date: dateStr, count });
    }
    return data;
  }, [entries]);

  const maxDailyCompletions = useMemo(() => {
    return Math.max(...heatmapData.map((d) => d.count), 1);
  }, [heatmapData]);

  // ----------------------------------------------------------------------
  // Chart Logic: Overall Status & Weekday (Remaining logic same as before)
  // ----------------------------------------------------------------------
  const overallStats = useMemo(() => {
    let completed = 0;
    let skipped = 0;
    let missed = 0;
    const today = new Date();

    habits.forEach((h) => {
      const startDate = new Date(h.startDate);
      const diffTime = Math.abs(today.getTime() - startDate.getTime());
      const daysActive = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      const habitEntries = entries[h.id] || [];
      let hCompleted = 0;
      let hSkipped = 0;

      habitEntries.forEach((e) => {
        if (e.status === "completed") hCompleted++;
        if (e.status === "skipped") hSkipped++;
      });

      completed += hCompleted;
      skipped += hSkipped;
      missed += Math.max(0, daysActive - habitEntries.length);
    });

    return [
      { name: "Completed", value: completed, color: "#3b82f6" },
      { name: "Skipped", value: skipped, color: "#ef4444" },
      { name: "Missed", value: missed, color: theme === "dark" ? "#3f3f46" : "#d4d4d8" },
    ].filter((x) => x.value > 0);
  }, [habits, entries, theme]);

  const weekdayData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    Object.values(entries)
      .flat()
      .forEach((e) => {
        if (e.status === "completed") {
          const dayIndex = new Date(e.date).getDay();
          counts[dayIndex]++;
        }
      });
    return days.map((day, i) => ({ name: day, completions: counts[i] }));
  }, [entries]);

  // ----------------------------------------------------------------------
  // General Stats
  // ----------------------------------------------------------------------
  const generalStats = useMemo(() => {
    const totalCompletions = Object.values(entries)
      .flat()
      .filter((e) => e.status === "completed").length;

    // Simple streak calculation
    let currentStreak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];

      // Check if ANY habit was done this day (aggregate streak)
      const anyDone = Object.values(entries)
        .flat()
        .some((e) => e.date === dateStr && e.status === "completed");
      if (anyDone) currentStreak++;
      else if (i > 0) break; // Allow today to be incomplete if checking early
    }

    const bestDay = weekdayData.reduce((max, d) => (d.completions > max.completions ? d : max), weekdayData[0]);

    return { totalCompletions, currentStreak, bestDay: bestDay?.name || "N/A" };
  }, [entries, weekdayData]);

  // ----------------------------------------------------------------------
  // Theme Vars
  // ----------------------------------------------------------------------
  const axisColor = theme === "dark" ? "#71717a" : "#9ca3af";
  const gridColor = theme === "dark" ? "#27272a" : "#e5e7eb";
  const tooltipBg = theme === "dark" ? "#18181b" : "#ffffff";
  const tooltipBorder = theme === "dark" ? "#27272a" : "#e5e7eb";
  const textColor = theme === "dark" ? "#fafafa" : "#09090b";

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground animate-in fade-in">
        <div className="bg-muted/50 p-6 rounded-full mb-4">
          <BarChart3 size={48} className="opacity-50" />
        </div>
        <h3 className="text-xl font-medium text-foreground mb-2">No data available</h3>
        <p className="max-w-xs text-center">Start tracking your habits to unlock powerful analytics and insights.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">Deep dive into your performance metrics.</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center bg-muted p-1 rounded-lg self-start sm:self-auto">
          {(["7", "30", "90"] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                timeRange === range
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              {range} Days
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Completions */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <Target size={20} />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{generalStats.totalCompletions}</div>
          <p className="text-sm text-muted-foreground">Total Completions</p>
        </div>

        {/* Completion Rate (Dynamic) */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
              <TrendingUp size={20} />
            </div>
            <div
              className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                statsComparison.trend === "up"
                  ? "bg-green-500/10 text-green-600"
                  : statsComparison.trend === "down"
                  ? "bg-red-500/10 text-red-600"
                  : "bg-zinc-500/10 text-zinc-500"
              }`}
            >
              {statsComparison.trend === "up" && <ArrowUpRight size={14} className="mr-1" />}
              {statsComparison.trend === "down" && <ArrowDownRight size={14} className="mr-1" />}
              {statsComparison.trend === "neutral" && <Minus size={14} className="mr-1" />}
              {Math.abs(statsComparison.diff)}%
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{statsComparison.currentRate}%</div>
          <p className="text-sm text-muted-foreground">Completion Rate ({timeRange}d)</p>
        </div>

        {/* Current Streak */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
              <Flame size={20} />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{generalStats.currentStreak}</div>
          <p className="text-sm text-muted-foreground">Day Active Streak</p>
        </div>

        {/* Best Day */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
              <Award size={20} />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{generalStats.bestDay}</div>
          <p className="text-sm text-muted-foreground">Most Productive Day</p>
        </div>
      </div>

      {/* Contribution Heatmap (Year of Activity) */}
      <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="text-muted-foreground" size={20} />
          <h3 className="text-lg font-semibold">Year of Activity</h3>
        </div>
        <div className="w-full overflow-x-auto pb-2">
          <div className="flex gap-[3px] min-w-max">
            {/* Create 52 columns of 7 days (simplified grid visual) */}
            {Array.from({ length: 53 }).map((_, colIndex) => (
              <div key={colIndex} className="flex flex-col gap-[3px]">
                {Array.from({ length: 7 }).map((_, rowIndex) => {
                  const dataIndex = colIndex * 7 + rowIndex;
                  const dayData = heatmapData[dataIndex]; // Note: simple mapping, not exact calendar alignment for brevity

                  if (!dayData) return null;

                  // Color Intensity Logic
                  let bgClass = "bg-muted"; // Level 0
                  if (dayData.count > 0) {
                    const intensity = dayData.count / maxDailyCompletions;
                    if (intensity < 0.25) bgClass = "bg-blue-200 dark:bg-blue-900/40";
                    else if (intensity < 0.5) bgClass = "bg-blue-400 dark:bg-blue-700/60";
                    else if (intensity < 0.75) bgClass = "bg-blue-500 dark:bg-blue-600";
                    else bgClass = "bg-blue-600 dark:bg-blue-500";
                  }

                  return (
                    <div
                      key={rowIndex}
                      title={`${dayData.date}: ${dayData.count} habits`}
                      className={`w-3 h-3 rounded-xs transition-colors hover:ring-1 hover:ring-foreground/50 ${bgClass}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 mt-3 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-xs bg-muted"></div>
            <div className="w-3 h-3 rounded-xs bg-blue-200 dark:bg-blue-900/40"></div>
            <div className="w-3 h-3 rounded-xs bg-blue-400 dark:bg-blue-700/60"></div>
            <div className="w-3 h-3 rounded-xs bg-blue-600 dark:bg-blue-500"></div>
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Consistency Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke={axisColor}
                  tick={{ fontSize: 12, fill: axisColor }}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                  minTickGap={30}
                />
                <YAxis
                  stroke={axisColor}
                  tick={{ fontSize: 12, fill: axisColor }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}%`}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    borderRadius: "8px",
                    color: textColor,
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="percentage"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#colorRate)"
                  fillOpacity={1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Habits Leaderboard */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold mb-6">Top Performing Habits</h3>
          <div className="flex-1 space-y-5">
            {habits
              .map((h) => ({
                ...h,
                count: entries[h.id]?.filter((e) => e.status === "completed").length || 0,
              }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 5)
              .map((h, i) => (
                <div key={h.id} className="flex items-center gap-4 group">
                  <div
                    className={`text-sm font-bold w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                      i === 0
                        ? "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20"
                        : i === 1
                        ? "bg-zinc-400/10 text-zinc-500 border border-zinc-400/20"
                        : i === 2
                        ? "bg-orange-500/10 text-orange-600 border border-orange-500/20"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium truncate">{h.title}</span>
                      <span className="text-muted-foreground shrink-0 ml-2 text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                        {h.count}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${Math.min(
                            100,
                            (h.count /
                              Math.max(
                                ...habits.map(
                                  (habit) => entries[habit.id]?.filter((e) => e.status === "completed").length || 0
                                ),
                                1
                              )) *
                              100
                          )}%`,
                          backgroundColor: h.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            {habits.length === 0 && <p className="text-sm text-muted-foreground">No habits to show.</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overall Pie */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Status Breakdown</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={overallStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {overallStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    borderRadius: "8px",
                    color: textColor,
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span style={{ color: textColor }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekday Bar */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Productivity by Day</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekdayData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke={axisColor}
                  tick={{ fontSize: 12, fill: axisColor }}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis stroke={axisColor} tick={{ fontSize: 12, fill: axisColor }} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: gridColor, opacity: 0.4 }}
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    borderRadius: "8px",
                    color: textColor,
                  }}
                />
                <Bar
                  dataKey="completions"
                  name="Completions"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                  barSize={32}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
