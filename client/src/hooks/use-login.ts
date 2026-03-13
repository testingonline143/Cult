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
 * the popup posts a message back to the opener, and the opener refreshes
 * its auth state — all without leaving the preview frame.
 *
 * Falls back to a regular redirect if the popup is blocked.
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const popupRef = useRef<Window | null>(null);
  const listenerRef = useRef<((e: MessageEvent) => void) | null>(null);

  useEffect(() => {
    return () => {
      if (listenerRef.current) {
        window.removeEventListener("message", listenerRef.current);
      }
    };
  }, []);

  const login = useCallback(
    (returnTo = "/home") => {
      const loginUrl = `/api/login?returnTo=${encodeURIComponent(returnTo)}`;

      const width = 500;
      const height = 680;
      const left = Math.max(0, (window.screen.width - width) / 2);
      const top = Math.max(0, (window.screen.height - height) / 2);
      const features = `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`;

      const popup = window.open(loginUrl, "cultfam_login", features);

      if (!popup || popup.closed) {
        // Popup blocked — fall back to full-page redirect
        window.location.href = loginUrl;
        return;
      }

      popupRef.current = popup;

      // Remove any previous listener
      if (listenerRef.current) {
        window.removeEventListener("message", listenerRef.current);
      }

      const handler = (e: MessageEvent) => {
        if (e.origin !== window.location.origin) return;
        if (e.data?.type !== "cultfam_auth_complete") return;

        window.removeEventListener("message", handler);
        listenerRef.current = null;

        // Re-fetch auth state so the UI updates immediately
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });

        const dest: string = e.data.returnTo || "/home";
        navigate(dest);
      };

      listenerRef.current = handler;
      window.addEventListener("message", handler);
    },
    [queryClient, navigate]
  );

  return { login };
}
