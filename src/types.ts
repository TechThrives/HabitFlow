export interface Habit {
  id: string;
  user_id?: string;
  title: string;
  description?: string;
  goalType: "daily" | "weekly" | "monthly";
  color: string;
  startDate: string; // ISO Date string YYYY-MM-DD
  createdAt: number;

  // Scheduling fields
  targetTime: string; // 24h format "HH:mm"
  targetDayOfWeek?: number; // 0-6 (Sunday-Saturday) for Weekly
  targetDayOfMonth?: number; // 1-31 for Monthly
}

export interface HabitEntry {
  habitId: string;
  date: string; // YYYY-MM-DD
  status: "completed" | "skipped" | "pending";
}

export const COLORS = [
  "#ef4444", // Red
  "#f97316", // Orange
  "#eab308", // Yellow
  "#22c55e", // Green
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#8b5cf6", // Violet
  "#d946ef", // Fuchsia
];

export const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const formatTime = (time?: string) => {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return time;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
};

export const getOrdinalSuffix = (i: number) => {
  const j = i % 10,
    k = i % 100;
  if (j === 1 && k !== 11) {
    return i + "st";
  }
  if (j === 2 && k !== 12) {
    return i + "nd";
  }
  if (j === 3 && k !== 13) {
    return i + "rd";
  }
  return i + "th";
};

export const getTodayDate = () => {
  const d = new Date();
  return d.toISOString().split("T")[0];
};

export const calculateStreak = (entries: HabitEntry[], today: string): number => {
  if (!entries || entries.length === 0) return 0;

  // Sort entries by date descending
  const sorted = [...entries].filter((e) => e.status === "completed").sort((a, b) => b.date.localeCompare(a.date));

  if (sorted.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date(today);

  // Check if today is completed
  const hasToday = sorted.some((e) => e.date === today);

  // If not completed today, start checking from yesterday
  if (!hasToday) {
    currentDate.setDate(currentDate.getDate() - 1);
  }

  while (true) {
    const dateStr = currentDate.toISOString().split("T")[0];
    const hasEntry = sorted.some((e) => e.date === dateStr);

    if (hasEntry) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};
