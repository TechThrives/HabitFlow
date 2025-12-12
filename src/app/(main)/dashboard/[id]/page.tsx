"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft,
  Trash2,
  Edit,
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  Check,
  X,
  Clock,
  Loader,
  Flame,
  Award,
} from "lucide-react";
import { Habit, HabitEntry, getTodayDate, calculateStreak, formatTime, DAYS_OF_WEEK, getOrdinalSuffix } from "@/types";
import { HabitModal } from "@/components/HabitModal";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthProvider";
import { useParams, useRouter } from "next/navigation";

export const HabitDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [habit, setHabit] = useState<Habit | null>(null);
  const [entries, setEntries] = useState<Record<string, HabitEntry[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;

    const loadData = async () => {
      try {
        setLoading(true);

        const [habit, entries] = await Promise.all([
          api.getHabit(id), // fetch only ONE habit
          api.getEntriesByHabit(id), // fetch only that habit’s entries
        ]);

        setHabit(habit);
        setEntries({ [habit.id]: entries });
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, id]);

  const updateHabit = async (updatedHabit: Habit) => {
    try {
      setHabit(updatedHabit);
      await api.updateHabit(updatedHabit);
    } catch (e) {
      console.error(e);
      alert("Failed to update habit");
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      await api.deleteHabit(id);
    } catch (e) {
      console.error(e);
      alert("Failed to delete habit");
    }
  };

  const onToggle = async (habitId: string, date: string) => {
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

  const habitEntries = id && entries[id] ? entries[id] : [];

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const entryMap = useMemo(() => {
    const map = new Map<string, "completed" | "skipped" | "pending">();
    habitEntries.forEach((e) => map.set(e.date, e.status));
    return map;
  }, [habitEntries]);

  if (loading) <Loader />;

  if (!habit) {
    return <div className="p-8 text-center text-muted-foreground">Habit not found</div>;
  }

  const handleConfirmDelete = () => {
    deleteHabit(habit.id);
    router.push("/dashboard");
  };

  const streak = calculateStreak(habitEntries, getTodayDate());
  const completionCount = habitEntries.filter((e) => e.status === "completed").length;

  const handleYearChange = (delta: number) => {
    setCurrentYear((prev) => prev + delta);
  };

  const getScheduleText = () => {
    const time = formatTime(habit.targetTime);
    if (habit.goalType === "daily") return `Daily${time ? ` at ${time}` : ""}`;
    if (habit.goalType === "weekly") {
      const day = habit.targetDayOfWeek !== undefined ? DAYS_OF_WEEK[habit.targetDayOfWeek] : "Weekly";
      return `${day}s${time ? ` at ${time}` : ""}`;
    }
    if (habit.goalType === "monthly") {
      const day = habit.targetDayOfMonth ? getOrdinalSuffix(habit.targetDayOfMonth) : "Monthly";
      return `${day} of the month${time ? ` at ${time}` : ""}`;
    }
    return "";
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Navigation */}

      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center justify-center gap-2 px-4 py-2 text-white bg-primary hover:bg-primary/80 rounded-lg transition-colors text-sm font-medium ml-auto"
      >
        Back
      </button>

      {/* Hero Section */}
      <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: habit.color }} />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pl-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold tracking-tight">{habit.title}</h1>
              <span className="text-xs font-medium uppercase tracking-wider border border-border px-2 py-0.5 rounded text-muted-foreground">
                {habit.goalType}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Clock size={14} />
              <span>{getScheduleText()}</span>
            </div>

            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              {habit.description || "No description provided."}
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 text-orange-500 rounded-full text-sm font-medium border border-orange-500/20">
                <span className="text-lg">
                  <Flame size={24} fill="currentColor" />
                </span>
                {streak} Day Streak
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-500 rounded-full text-sm font-medium border border-blue-500/20">
                <span className="text-lg">
                  <Award size={24} fill="currentColor" />
                </span>
                {completionCount} Total Completions
              </div>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-sm font-medium"
            >
              <Edit size={16} /> Edit
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors text-sm font-medium"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>
      </div>

      {/* Year Navigation */}
      <div className="flex items-center justify-between bg-card border border-border p-4 rounded-xl">
        <button onClick={() => handleYearChange(-1)} className="p-2 hover:bg-muted rounded-full transition-colors">
          <PrevIcon size={20} />
        </button>
        <span className="text-xl font-bold font-mono">{currentYear}</span>
        <button onClick={() => handleYearChange(1)} className="p-2 hover:bg-muted rounded-full transition-colors">
          <NextIcon size={20} />
        </button>
      </div>

      {/* Year Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
        {Array.from({ length: 12 }).map((_, monthIndex) => (
          <MonthGrid
            key={monthIndex}
            year={currentYear}
            month={monthIndex}
            entryMap={entryMap}
            habit={habit}
            onToggle={onToggle}
          />
        ))}
      </div>

      <HabitModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={updateHabit}
        habitToEdit={habit}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Habit?"
        message={`Are you sure you want to delete "${habit.title}"? This action cannot be undone and all tracking data will be lost forever.`}
        confirmLabel="Delete Forever"
      />
    </div>
  );
};

// ----------------------------------------------------------------------
// Sub-component: Mini Month Grid
// ----------------------------------------------------------------------

interface MonthGridProps {
  year: number;
  month: number;
  entryMap: Map<string, "completed" | "skipped" | "pending">;
  habit: Habit;
  onToggle: (id: string, date: string, status: "completed" | "skipped" | "pending") => void;
}

const MonthGrid: React.FC<MonthGridProps> = ({ year, month, entryMap, habit, onToggle }) => {
  const monthName = new Date(year, month).toLocaleString("default", { month: "long" });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun

  const todayStr = getTodayDate();

  return (
    <div className="bg-card/50 border border-border rounded-xl p-4 flex flex-col h-full hover:border-primary/20 transition-colors">
      <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">{monthName}</h3>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
          <div key={d} className="text-[10px] text-center text-muted-foreground/50 font-medium">
            {d}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 flex-1 content-start">
        {/* Empty slots for start of month */}
        {Array.from({ length: startDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const status = entryMap.get(dateStr);
          const isToday = dateStr === todayStr;
          const isFuture = dateStr > todayStr;

          // --- Scheduling Logic ---
          // Determine if this specific date is actionable based on habit schedule
          const dateObj = new Date(year, month, day);
          let isScheduled = true;

          if (dateStr < habit.startDate) {
            isScheduled = false;
          }

          if (isScheduled) {
            if (habit.goalType === "weekly" && habit.targetDayOfWeek !== undefined) {
              // 0=Sun, 1=Mon...
              isScheduled = dateObj.getDay() === habit.targetDayOfWeek;
            } else if (habit.goalType === "monthly" && habit.targetDayOfMonth !== undefined) {
              isScheduled = day === habit.targetDayOfMonth;
            }
          }
          // --- Styling Logic ---
          let bgStyle = { backgroundColor: "transparent" };
          let className = "";
          let content: React.ReactNode = day;

          if (!isScheduled) {
            // Non-scheduled days (Ghost state)
            className = "text-muted-foreground/20 cursor-default text-[10px]";
            content = "•"; // Dot for inactive days
          } else {
            // Scheduled days
            className = "border border-border/50 hover:border-foreground/50";

            if (status === "completed") {
              bgStyle = { backgroundColor: habit.color };
              className = "border-transparent text-white shadow-sm shadow-black/20";
              content = <Check size={10} strokeWidth={4} />;
            } else if (status === "skipped") {
              className = "bg-red-500/10 border-red-500/30 text-red-500";
              content = <X size={10} strokeWidth={4} />;
            } else {
              // Pending
              content = day;
            }

            if (isToday) {
              className += " ring-1 ring-offset-1 ring-offset-card ring-foreground";
            }

            if (isFuture) {
              className = "opacity-20 cursor-default border-border/30";
            } else {
              className += " cursor-pointer hover:scale-110 active:scale-95";
            }
          }

          return (
            <button
              key={day}
              onClick={() => isScheduled && !isFuture && onToggle(habit.id, dateStr, "completed")}
              disabled={!isScheduled || isFuture}
              style={status === "completed" ? bgStyle : {}}
              className={`
                aspect-square rounded-sm flex items-center justify-center text-[10px] font-medium transition-all duration-200
                ${className}
              `}
              title={!isScheduled ? "Not scheduled for this day" : `${dateStr}: ${status || "pending"}`}
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default HabitDetails;
