"use client"

// File: apps/frontend/hooks/features/useUndo.ts
import { useCallback, useState } from "react"

/**
 * A hook that provides undo and redo functionality for a state value
 *
 * @param initialState The initial state value
 * @returns Object with current state, set function, undo, redo, and statuses
 */
export function useUndo<T>(initialState: T) {
  // State to track history and current position
  const [history, setHistory] = useState<T[]>([initialState])
  const [index, setIndex] = useState(0)

  // Set a new state and add it to history
  const set = useCallback(
    (newState: T | ((prev: T) => T)) => {
      setHistory((prev) => {
        const currentState = prev[index]
        const updatedState = typeof newState === "function" ? (newState as (prev: T) => T)(currentState) : newState

        // Only add to history if the state changed
        if (JSON.stringify(currentState) === JSON.stringify(updatedState)) {
          return prev
        }

        // Remove any future states and add the new state
        const newHistory = prev.slice(0, index + 1)
        return [...newHistory, updatedState]
      })

      setIndex((prev) => prev + 1)
    },
    [index],
  )

  // Undo to the previous state
  const undo = useCallback(() => {
    if (index > 0) {
      setIndex((prev) => prev - 1)
    }
  }, [index])

  // Redo to the next state
  const redo = useCallback(() => {
    if (index < history.length - 1) {
      setIndex((prev) => prev + 1)
    }
  }, [index, history.length])

  // Reset the history
  const reset = useCallback(() => {
    setHistory([initialState])
    setIndex(0)
  }, [initialState])

  return {
    state: history[index],
    set,
    undo,
    redo,
    reset,
    canUndo: index > 0,
    canRedo: index < history.length - 1,
    history,
    historyIndex: index,
  }
}

