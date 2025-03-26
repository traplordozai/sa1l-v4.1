"use client"

import { useState, useEffect } from "react"

/**
 * Custom hook for persisting state in localStorage
 * @param key The localStorage key to store the value under
 * @param initialValue The initial value (or function that returns the initial value)
 * @returns A stateful value and a function to update it
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T)
): [T, (value: T | ((val: T) => T)) => void] {
  // Get from local storage then parse stored json or return initialValue
  const readValue = (): T => {
    // Prevent build error "window is undefined" but keep working
    if (typeof window === "undefined") {
      return initialValue instanceof Function ? initialValue() : initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue instanceof Function ? initialValue() : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue instanceof Function ? initialValue() : initialValue
    }
  }

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(readValue)

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value

      // Save state
      setStoredValue(valueToStore)

      // Save to local storage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))

        // Dispatch a custom event so other instances can update
        window.dispatchEvent(new Event("local-storage"))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  // Listen for changes to this localStorage key in other documents
  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue())
    }

    // this only works for other documents, not the current one
    window.addEventListener("storage", handleStorageChange)
    // this is a custom event, triggered in setValue
    window.addEventListener("local-storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("local-storage", handleStorageChange)
    }
  }, [key])

  return [storedValue, setValue]
}

