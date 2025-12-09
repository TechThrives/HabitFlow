"use client";

import { useAuth } from "@/context/AuthProvider";
import { useRouter } from "next/navigation";
import { Loader } from "./Loader";

export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) return <Loader />;

  if (user) {
    router.replace("/dashboard");
    return <Loader />;
  }

  return <>{children}</>;
};
