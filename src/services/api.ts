import { Habit, HabitEntry } from "@/types";
import { supabase } from "./supabase";

// ----------------------------------------------------------------------
// SUPABASE API IMPLEMENTATION
// ----------------------------------------------------------------------

interface ApiService {
  getHabits: () => Promise<Habit[]>;
  getHabit: (id: string) => Promise<Habit>;
  getEntriesByHabit: (id: string) => Promise<HabitEntry[]>;
  saveHabit: (habit: Habit) => Promise<Habit>;
  updateHabit: (habit: Habit) => Promise<Habit>;
  deleteHabit: (id: string) => Promise<void>;
  getAllEntries: () => Promise<HabitEntry[]>;
  saveEntry: (entry: HabitEntry) => Promise<HabitEntry>;
  deleteEntry: (habitId: string, date: string) => Promise<void>;
}

export const api: ApiService = {
  async getHabits() {
    // Supabase automatically filters by user_id if RLS is set up
    const { data, error } = await supabase.from("habits").select("*").order("createdAt", { ascending: true });

    if (error) {
      console.error("Error fetching habits:", error);
      return [];
    }

    // Map database columns to camelCase if needed, but we assume 1:1 mapping for simplicity
    return data.map((h: any) => ({
      ...h,
      startDate: h.startDate || new Date(h.createdAt).toISOString().split("T")[0], // Fallback
    })) as Habit[];
  },

  async getHabit(id: string) {
    const { data, error } = await supabase.from("habits").select("*").eq("id", id).single();

    if (error) throw error;
    return {
      ...data,
      startDate: data.startDate || new Date(data.createdAt).toISOString().split("T")[0],
    } as Habit;
  },

  async getEntriesByHabit(id: string) {
    const { data, error } = await supabase.from("entries").select("*").eq("habitId", id);

    if (error) {
      console.error("Error fetching habit entries:", error);
      return [];
    }
    return data as HabitEntry[];
  },

  async saveHabit(habit) {
    const user = (await supabase.auth.getUser()).data.user;

    if (!user) throw new Error("User not authenticated");

    const habitPayload = {
      ...habit,
      user_id: user.id,
    };

    const { data, error } = await supabase.from("habits").insert(habitPayload).select().single();

    if (error) throw error;
    return data as Habit;
  },

  async updateHabit(habit) {
    const { data, error } = await supabase
      .from("habits")
      .update({
        title: habit.title,
        description: habit.description,
        color: habit.color,
        startDate: habit.startDate,
      })
      .eq("id", habit.id)
      .select()
      .single();

    if (error) throw error;
    return data as Habit;
  },

  async deleteHabit(id) {
    const { error } = await supabase.from("habits").delete().eq("id", id);

    if (error) throw error;
  },

  async getAllEntries() {
    const { data, error } = await supabase.from("entries").select("*");

    if (error) {
      console.error("Error fetching entries:", error);
      return [];
    }
    return data as HabitEntry[];
  },

  async saveEntry(entry) {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error("User not authenticated");

    // Upsert: Insert or Update if exists
    const { data, error } = await supabase
      .from("entries")
      .upsert(
        {
          habitId: entry.habitId,
          date: entry.date,
          status: entry.status,
          user_id: user.id,
        },
        { onConflict: "habitId, date" }
      ) // Requires a composite unique constraint on (habitId, date)
      .select()
      .single();

    if (error) throw error;
    return data as HabitEntry;
  },

  async deleteEntry(habitId, date) {
    const { error } = await supabase.from("entries").delete().match({ habitId, date });

    if (error) throw error;
  },
};
