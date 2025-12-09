"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Check, Flame, X, Circle, Clock, Calendar } from "lucide-react";
import { Habit, HabitEntry, getTodayDate, calculateStreak, formatTime, DAYS_OF_WEEK, getOrdinalSuffix } from "@/types";

interface HabitCardProps {
  habit: Habit;
  entries: HabitEntry[];
  onToggle: (id: string, date: string, status: "completed" | "skipped" | "pending") => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, entries, onToggle }) => {
  const router = useRouter();
  const today = getTodayDate();
  const todayEntry = entries.find((e) => e.date === today);
  const streak = calculateStreak(entries, today);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(habit.id, today, "completed"); // The parent handles the state rotation
  };

  const getStatusIcon = () => {
    if (todayEntry?.status === "completed") return <Check className="w-6 h-6 text-white" />;
    if (todayEntry?.status === "skipped") return <X className="w-6 h-6 text-white" />;
    return <Circle className="w-6 h-6 text-muted-foreground opacity-50" />;
  };

  const getButtonColor = () => {
    if (todayEntry?.status === "completed") return "bg-green-500 border-green-500";
    if (todayEntry?.status === "skipped") return "bg-red-500 border-red-500";
    return "bg-transparent border-muted-foreground/30 hover:border-primary/50";
  };

  const getScheduleLabel = () => {
    const time = formatTime(habit.targetTime);

    if (habit.goalType === "daily") {
      return time ? `Daily at ${time}` : "Daily";
    }

    if (habit.goalType === "weekly") {
      const dayName = habit.targetDayOfWeek !== undefined ? DAYS_OF_WEEK[habit.targetDayOfWeek] : "Weekly";
      return time ? `${dayName}s at ${time}` : `${dayName}s`;
    }

    if (habit.goalType === "monthly") {
      const daySuffix = habit.targetDayOfMonth ? getOrdinalSuffix(habit.targetDayOfMonth) : "Monthly";
      return time ? `${daySuffix} at ${time}` : `${daySuffix}`;
    }

    return "Anytime";
  };

  return (
    <div
      onClick={() => router.push(`/dashboard/${habit.id}`)}
      className="group relative bg-card border border-border rounded-xl p-5 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 cursor-pointer flex items-center justify-between"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ backgroundColor: habit.color }}></div>

      <div className="flex-1 min-w-0 pr-4 ml-2">
        <h3 className="font-semibold text-lg truncate text-foreground group-hover:text-primary transition-colors">
          {habit.title}
        </h3>
        {habit.description && <p className="text-sm text-muted-foreground truncate mb-1">{habit.description}</p>}

        <div className="flex flex-col gap-1.5 mt-2">
          {/* Schedule Badge */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock size={12} className="text-primary/70" />
            <span className="font-medium">{getScheduleLabel()}</span>
          </div>

          {/* Streak Badge */}
          {streak > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-orange-500">
              <Flame size={12} fill="currentColor" />
              <span className="font-medium">{streak} day streak</span>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleToggle}
        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 active:scale-90 ${getButtonColor()}`}
        title="Toggle status"
      >
        {getStatusIcon()}
      </button>
    </div>
  );
};
