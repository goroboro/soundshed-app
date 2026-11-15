import { useEffect, useState } from "react";

/**
 * Single mobile/desktop breakpoint, shared with css/mobile.css.
 * Keep the two in sync when changing.
 */
export const MOBILE_QUERY = "(max-width: 900px)";

/** Returns true when the current viewport is in the mobile range. */
export function isMobileViewport(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia(MOBILE_QUERY).matches
  );
}

/**
 * React hook that re-renders the consumer when the viewport crosses the
 * mobile/desktop breakpoint.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(isMobileViewport());

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
