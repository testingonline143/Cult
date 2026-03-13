import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useCallback, useEffect, useRef } from "react";

/**
 * Opens the Replit OAuth flow in a small popup window.
 *
 * Why a popup instead of a full-page redirect?
 * The app may run inside the Replit workspace preview (an iframe).
 * Replit's OAuth consent page sets X-Frame-Options headers that prevent it
 * from loading inside an iframe, so a direct redirect would escape to the
 * top-level browser frame and break the preview context.
 * A popup window sidesteps this entirely: OAuth completes in the popup,
 * the popup broadcasts an auth-complete message via BroadcastChannel,
 * and the parent receives it and refreshes its auth state — all without
 * leaving the preview frame.
 *
 * Falls back to a regular redirect if the popup is blocked.
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

      cleanup();

      if (typeof BroadcastChannel === "undefined") {
        window.location.href = loginUrl;
        return;
      }

      const bc = new BroadcastChannel("cultfam_auth");
      channelRef.current = bc;

      bc.onmessage = (e) => {
        if (e.data?.type !== "cultfam_auth_complete") return;

        cleanup();

        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });

        const dest: string = e.data.returnTo || "/home";
        navigate(dest);
      };

      const width = 500;
      const height = 680;
      const left = Math.max(0, (window.screen.width - width) / 2);
      const top = Math.max(0, (window.screen.height - height) / 2);
      const features = `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`;

      const popup = window.open(loginUrl, "cultfam_login", features);

      if (!popup || popup.closed) {
        cleanup();
        window.location.href = loginUrl;
        return;
      }

      pollRef.current = setInterval(async () => {
        if (popup.closed) {
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
        }
      }, 500);
    },
    [queryClient, navigate, cleanup]
  );

  return { login };
}
