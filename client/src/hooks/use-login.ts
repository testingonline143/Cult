import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useCallback, useEffect, useRef } from "react";

/**
 * Opens the Replit OAuth flow in a small popup window.
 *
 * The popup completes OAuth and broadcasts an auth-complete message via
 * BroadcastChannel. The parent receives it, refreshes auth, and navigates.
 *
 * Two fallback layers:
 * 1. If BroadcastChannel fails silently, a poll detects popup close and
 *    refetches auth + navigates if the user is now authenticated.
 * 2. If the popup is blocked entirely, falls back to a full-page redirect.
 *    The server detects this (no popup=1 flag) and does a simple 302
 *    redirect to the destination after OAuth completes.
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const channelRef = useRef<BroadcastChannel | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.close();
      channelRef.current = null;
    }
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const login = useCallback(
    (returnTo = "/home") => {
      const loginUrl = `/api/login?returnTo=${encodeURIComponent(returnTo)}`;
      const popupUrl = `${loginUrl}&popup=1`;

      cleanup();

      if (typeof BroadcastChannel === "undefined") {
        window.location.href = loginUrl;
        return;
      }

      const bc = new BroadcastChannel("cultfam_auth");
      channelRef.current = bc;

      bc.onmessage = async (e) => {
        if (e.data?.type !== "cultfam_auth_complete") return;

        cleanup();

        const dest: string = e.data.returnTo || "/home";
        try {
          await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
        } catch {
          // ignore
        }
        navigate(dest);
      };

      const width = 500;
      const height = 680;
      const left = Math.max(0, (window.screen.width - width) / 2);
      const top = Math.max(0, (window.screen.height - height) / 2);
      const features = `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`;

      const popup = window.open(popupUrl, "cultfam_login", features);

      if (!popup || popup.closed) {
        cleanup();
        window.location.href = loginUrl;
        return;
      }

      pollRef.current = setInterval(async () => {
        if (!popup.closed) return;
        cleanup();

        try {
          await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
          const user = queryClient.getQueryData(["/api/auth/user"]);
          if (user) {
            navigate(returnTo);
          }
        } catch (err) {
          console.warn("[use-login] popup-close auth refresh failed", err);
        }
      }, 500);
    },
    [queryClient, navigate, cleanup]
  );

  return { login };
}
