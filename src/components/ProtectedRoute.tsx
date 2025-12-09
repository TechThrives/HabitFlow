"use client";

import { useAuth } from "@/context/AuthProvider";
import { useRouter } from "next/navigation";
import { Loader } from "./Loader";

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) return <Loader />;

  if (!user) {
    router.replace("/signin");
    return <Loader />;
  }

  return <>{children}</>;
};
