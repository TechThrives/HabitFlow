"use client";

import React, { useState } from "react";
import { supabase } from "@/services/supabase";
import { BadgeCheck, Mail, Lock, Loader2, AlertCircle, User, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export const SignUp: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!firstName.trim() || !lastName.trim()) {
        throw new Error("First name and last name are required.");
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });
      if (error) throw error;

      // Check session, if auto-confirmed go to dashboard, else alert
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.push("/dashboard");
      } else {
        alert("Registration successful! Please check your email to verify your account.");
        router.push("/signin");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-in fade-in duration-500">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <BadgeCheck className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Create an account</h2>
          <p className="mt-2 text-muted-foreground">Start tracking your habits today.</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 shadow-xl">
          <form onSubmit={handleSignUp} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-500 text-sm">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    required
                    className="w-full bg-input border border-border rounded-lg pl-9 pr-3 py-2.5 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none transition-all text-sm"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Last Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-input border border-border rounded-lg px-3 py-2.5 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none transition-all text-sm"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-muted-foreground w-5 h-5" />
                <input
                  type="email"
                  required
                  className="w-full bg-input border border-border rounded-lg pl-10 pr-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none transition-all"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-muted-foreground w-5 h-5" />
                <input
                  type="password"
                  required
                  className="w-full bg-input border border-border rounded-lg pl-10 pr-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-blue-600 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign Up
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account?</span>
            <Link href="/signin" className="ml-2 font-medium text-primary hover:underline focus:outline-none">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
