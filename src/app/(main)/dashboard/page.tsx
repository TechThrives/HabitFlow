"use client";

import React, { useEffect, useState } from "react";
import { Plus, ListTodo, Sun, Calendar, CalendarDays } from "lucide-react";
import { Habit, HabitEntry, getTodayDate } from "@/types";
import { HabitCard } from "@/components/HabitCard";
import { HabitModal } from "@/components/HabitModal";
import { useAuth } from "@/context/AuthProvider";
import { api } from "@/services/api";

export const Dashboard: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<Record<string, HabitEntry[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentDateDisplay, setCurrentDateDisplay] = useState("");
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Set date on client-side only to prevent hydration mismatch
  useEffect(() => {
    setCurrentDateDisplay(new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }));
  }, []);

  // Data Fetching
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const [fetchedHabits, fetchedEntriesArr] = await Promise.all([api.getHabits(), api.getAllEntries()]);

        setHabits(fetchedHabits);

        const entriesMap: Record<string, HabitEntry[]> = {};
        fetchedEntriesArr.forEach((e) => {
          if (!entriesMap[e.habitId]) entriesMap[e.habitId] = [];
          entriesMap[e.habitId].push(e);
        });
        setEntries(entriesMap);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user]);

  const addHabit = async (habit: Habit) => {
    const prevHabits = habits;
    setHabits([...habits, habit]);

    try {
      await api.saveHabit(habit);
    } catch (e) {
      console.error(e);
      setHabits(prevHabits);
      alert("Failed to save habit");
    }
  };

  const toggleEntry = async (habitId: string, date: string) => {
    const currentEntries = entries[habitId] || [];
    const existingIndex = currentEntries.findIndex((e) => e.date === date);

    let action: "save" | "delete" = "save";
    let newStatus: "completed" | "skipped" = "completed";
    let optimisticList = [...currentEntries];

    if (existingIndex >= 0) {
      const currentStatus = currentEntries[existingIndex].status;
      if (currentStatus === "completed") {
        newStatus = "skipped";
        optimisticList[existingIndex] = { ...currentEntries[existingIndex], status: "skipped" };
      } else {
        action = "delete";
        optimisticList = currentEntries.filter((e) => e.date !== date);
      }
    } else {
      optimisticList.push({ habitId, date, status: "completed" });
    }

    const prevEntries = entries;
    setEntries({ ...entries, [habitId]: optimisticList });

    try {
      if (action === "delete") {
        await api.deleteEntry(habitId, date);
      } else {
        await api.saveEntry({ habitId, date, status: newStatus });
      }
    } catch (e) {
      console.error(e);
      setEntries(prevEntries);
    }
  };

  const todayStr = getTodayDate();

  // Calculate today's progress based on SCHEDULED habits only
  const dueHabits = habits.filter((h) => {
    // 1. Check if habit hasn't started yet
    if (h.startDate > todayStr) return false;

    // 2. Check schedule rules
    const today = new Date();
    if (h.goalType === "daily") return true;
    if (h.goalType === "weekly") return h.targetDayOfWeek === today.getDay();
    if (h.goalType === "monthly") return h.targetDayOfMonth === today.getDate();
    return false;
  });

  const activeHabitsCount = dueHabits.length;

  const completedTodayCount = dueHabits.filter((h) =>
    entries[h.id]?.find((e) => e.date === todayStr && e.status === "completed")
  ).length;

  const progressPercentage = activeHabitsCount > 0 ? Math.round((completedTodayCount / activeHabitsCount) * 100) : 0;

  // Group habits for display
  const dailyHabits = habits.filter((h) => h.goalType === "daily");
  const weeklyHabits = habits.filter((h) => h.goalType === "weekly");
  const monthlyHabits = habits.filter((h) => h.goalType === "monthly");

  const renderSection = (title: string, icon: React.ReactNode, items: Habit[]) => {
    if (items.length === 0) return null;
    return (
      <div className="animate-in fade-in duration-500">
        <div className="flex items-center gap-2 mb-4 mt-6">
          <div className="p-1.5 bg-muted rounded-md text-muted-foreground">{icon}</div>
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <span className="text-xs font-medium text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
            {items.length}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((habit) => (
            <HabitCard key={habit.id} habit={habit} entries={entries[habit.id] || []} onToggle={toggleEntry} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">{currentDateDisplay || "Loading..."}</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          disabled={isLoading}
          className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50"
        >
          <Plus size={20} />
          New Habit
        </button>
      </div>

      {isLoading ? (
        // Loading Skeleton
        <div className="space-y-6 animate-pulse">
          <div className="h-24 bg-card border border-border rounded-xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="h-32 bg-card border border-border rounded-xl"></div>
            <div className="h-32 bg-card border border-border rounded-xl"></div>
            <div className="h-32 bg-card border border-border rounded-xl"></div>
          </div>
        </div>
      ) : (
        <>
          {/* Progress Bar */}
          {activeHabitsCount > 0 ? (
            <div className="bg-card border border-border p-6 rounded-xl animate-in fade-in duration-500">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Today's Goal ({completedTodayCount}/{activeHabitsCount})
                </span>
                <span className="text-sm font-bold text-primary">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className="bg-linear-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          ) : (
            habits.length > 0 && (
              <div className="bg-card border border-border p-6 rounded-xl animate-in fade-in duration-500 flex items-center justify-between">
                <div className="text-sm font-medium text-muted-foreground">
                  No habits scheduled for today. Enjoy your day off!
                </div>
                <Sun className="text-orange-400" size={20} />
              </div>
            )
          )}

          {/* Habit Sections */}
          {habits.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-border rounded-xl animate-in zoom-in-95 duration-300">
              <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ListTodo size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">No habits yet</h3>
              <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
                Start tracking your goals by creating your first habit today.
              </p>
              <button onClick={() => setIsModalOpen(true)} className="text-primary hover:underline font-medium">
                Create a habit
              </button>
            </div>
          ) : (
            <div className="space-y-8 pb-10">
              {renderSection("Daily Habits", <Sun size={20} />, dailyHabits)}
              {renderSection("Weekly Habits", <CalendarDays size={20} />, weeklyHabits)}
              {renderSection("Monthly Habits", <Calendar size={20} />, monthlyHabits)}
            </div>
          )}
        </>
      )}

      <HabitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={addHabit} />
    </div>
  );
};

export default Dashboard;
