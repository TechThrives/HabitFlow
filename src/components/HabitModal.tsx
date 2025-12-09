"use client";

import React, { useState, useEffect } from "react";
import { X, Lock } from "lucide-react";
import { Habit, COLORS, getTodayDate, DAYS_OF_WEEK } from "@/types";

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: Habit) => void;
  habitToEdit?: Habit;
}

export const HabitModal: React.FC<HabitModalProps> = ({ isOpen, onClose, onSave, habitToEdit }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goalType, setGoalType] = useState<"daily" | "weekly" | "monthly">("daily");
  const [color, setColor] = useState(COLORS[5]); // Default blue
  const [startDate, setStartDate] = useState(getTodayDate());

  // New scheduling state
  const [targetTime, setTargetTime] = useState("09:00");
  const [targetDayOfWeek, setTargetDayOfWeek] = useState(1); // Monday
  const [targetDayOfMonth, setTargetDayOfMonth] = useState(1); // 1st

  useEffect(() => {
    if (habitToEdit) {
      setTitle(habitToEdit.title);
      setDescription(habitToEdit.description || "");
      setGoalType(habitToEdit.goalType);
      setColor(habitToEdit.color);
      setStartDate(habitToEdit.startDate);
      setTargetTime(habitToEdit.targetTime || "09:00");
      setTargetDayOfWeek(habitToEdit.targetDayOfWeek ?? 1);
      setTargetDayOfMonth(habitToEdit.targetDayOfMonth || 1);
    } else {
      // Reset defaults
      setTitle("");
      setDescription("");
      setGoalType("daily");
      setColor(COLORS[5]);
      setStartDate(getTodayDate());
      setTargetTime("09:00");
      setTargetDayOfWeek(1);
      setTargetDayOfMonth(1);
    }
  }, [habitToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (!startDate) return;

    const habit: Habit = {
      id: habitToEdit?.id || crypto.randomUUID(),
      title,
      description,
      goalType,
      color,
      startDate,
      createdAt: habitToEdit?.createdAt || Date.now(),
      targetTime,
      targetDayOfWeek: goalType === "weekly" ? targetDayOfWeek : undefined,
      targetDayOfMonth: goalType === "monthly" ? targetDayOfMonth : undefined,
    };

    onSave(habit);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden scale-in-95 animate-in duration-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
          <h2 className="text-lg font-semibold">{habitToEdit ? "Edit Habit" : "New Habit"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Read 30 mins"
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Motivation or details"
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 relative">
            {/* Edit Lock Overlay for Schedule */}
            {habitToEdit && (
              <div className="absolute inset-0 z-10 bg-card/60 backdrop-blur-[1px] border border-border/50 rounded-xl flex items-center justify-center">
                <div className="bg-card border border-border px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock size={12} />
                  <span>Schedule locked</span>
                </div>
              </div>
            )}

            <div className={habitToEdit ? "opacity-40 pointer-events-none" : ""}>
              <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Frequency</label>
              <div className="flex flex-col gap-1 bg-input p-1 rounded-lg border border-border">
                {["daily", "weekly", "monthly"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    disabled={!!habitToEdit}
                    onClick={() => setGoalType(type as any)}
                    className={`py-1.5 px-3 text-sm rounded-md capitalize transition-all text-left ${
                      goalType === type
                        ? "bg-primary text-primary-foreground shadow-sm font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className={`space-y-4 ${habitToEdit ? "opacity-40 pointer-events-none" : ""}`}>
              {/* Time Input - Always visible */}
              <div>
                <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Time</label>
                <input
                  type="time"
                  disabled={!!habitToEdit}
                  value={targetTime}
                  onChange={(e) => setTargetTime(e.target.value)}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              {/* Weekly Day Selector */}
              {goalType === "weekly" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Day of Week</label>
                  <select
                    value={targetDayOfWeek}
                    disabled={!!habitToEdit}
                    onChange={(e) => setTargetDayOfWeek(Number(e.target.value))}
                    className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  >
                    {DAYS_OF_WEEK.map((day, index) => (
                      <option key={day} value={index}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Monthly Day Selector */}
              {goalType === "monthly" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Day of Month</label>
                  <select
                    value={targetDayOfMonth}
                    disabled={!!habitToEdit}
                    onChange={(e) => setTargetDayOfMonth(Number(e.target.value))}
                    className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <option key={day} value={day}>
                        {day}
                        {day === 1 ? "st" : day === 2 ? "nd" : day === 3 ? "rd" : "th"}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    color === c ? "border-border-primary scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-blue-600 text-white font-medium py-2.5 rounded-lg transition-colors mt-4"
          >
            {habitToEdit ? "Save Changes" : "Create Habit"}
          </button>
        </form>
      </div>
    </div>
  );
};
