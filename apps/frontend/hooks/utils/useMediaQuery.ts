"use client"

// File: apps/frontend/hooks/utils/useMediaQuery.ts
import { useState, useEffect } from "react"

/**
 * Custom hook for detecting if a media query matches
 * @param query The media query to match against
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Initialize with null to avoid hydration mismatch
  const [matches, setMatches] = useState<boolean>(false)

  useEffect(() => {
    // Set initial value on client side
    const media = window.matchMedia(query)
    setMatches(media.matches)

    // Define listener function
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Add listener
    media.addEventListener("change", listener)

    // Clean up
    return () => {
      media.removeEventListener("change", listener)
    }
  }, [query])

  return matches
}

/**
 * Predefined media query hooks for common breakpoints
 */

export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 639px)")
}

export function useIsTablet(): boolean {
  return useMediaQuery("(min-width: 640px) and (max-width: 1023px)")
}

export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)")
}

export function useIsLargeDesktop(): boolean {
  return useMediaQuery("(min-width: 1280px)")
}

export function useIsDarkMode(): boolean {
  return useMediaQuery("(prefers-color-scheme: dark)")
}

export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)")
}

