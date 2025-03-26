"use client"

// File: apps/frontend/hooks/features/useWalkthrough.ts
import { useCallback, useEffect, useState } from "react"
import { useLocalStorage } from "../utils/useLocalStorage"

interface WalkthroughStep {
  id: string
  title: string
  content: string
  elementId?: string
  placement?: "top" | "right" | "bottom" | "left"
}

interface WalkthroughOptions {
  key: string
  steps: WalkthroughStep[]
  autoStart?: boolean
  dismissible?: boolean
  onComplete?: () => void
  onDismiss?: () => void
}

/**
 * A hook that provides step-by-step walkthrough functionality
 *
 * @param options Configuration options for the walkthrough
 * @returns Object for controlling the walkthrough
 */
export function useWalkthrough({
  key,
  steps,
  autoStart = false,
  dismissible = true,
  onComplete,
  onDismiss,
}: WalkthroughOptions) {
  // Track whether this walkthrough has been completed
  const [completed, setCompleted] = useLocalStorage(`walkthrough_${key}_completed`, false)
  // Track whether the walkthrough is active
  const [active, setActive] = useState(autoStart && !completed)
  // Current step index
  const [stepIndex, setStepIndex] = useState(0)

  // Activate the walkthrough
  const start = useCallback(() => {
    setActive(true)
    setStepIndex(0)
  }, [])

  // Move to the next step
  const next = useCallback(() => {
    if (stepIndex < steps.length - 1) {
      setStepIndex((prev) => prev + 1)
    } else {
      // Complete the walkthrough
      setActive(false)
      setCompleted(true)
      if (onComplete) {
        onComplete()
      }
    }
  }, [stepIndex, steps.length, setCompleted, onComplete])

  // Move to the previous step
  const prev = useCallback(() => {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1)
    }
  }, [stepIndex])

  // Dismiss the walkthrough
  const dismiss = useCallback(() => {
    if (dismissible) {
      setActive(false)
      if (onDismiss) {
        onDismiss()
      }
    }
  }, [dismissible, onDismiss])

  // Reset the walkthrough
  const reset = useCallback(() => {
    setCompleted(false)
    setStepIndex(0)
  }, [setCompleted])

  // Handle element scrolling
  useEffect(() => {
    if (active && steps[stepIndex]?.elementId) {
      const element = document.getElementById(steps[stepIndex].elementId!)
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        })
      }
    }
  }, [active, stepIndex, steps])

  return {
    active,
    currentStep: steps[stepIndex],
    stepIndex,
    totalSteps: steps.length,
    progress: (stepIndex + 1) / steps.length,
    start,
    next,
    prev,
    dismiss,
    reset,
    completed,
  }
}

