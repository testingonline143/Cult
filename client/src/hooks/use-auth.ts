import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@shared/models/auth";

async function fetchAppUser(): Promise<User | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const response = await fetch("/api/auth/user", {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (response.status === 401) return null;
  if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
  return response.json();
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchAppUser,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    });
    return () => subscription.unsubscribe();
  }, [queryClient]);

  const logout = async () => {
    await supabase.auth.signOut();
    queryClient.setQueryData(["/api/auth/user"], null);
  };

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
    logout,
    isLoggingOut: false,
  };
}
