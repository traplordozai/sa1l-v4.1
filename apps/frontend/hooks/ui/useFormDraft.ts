"use client"

// File: apps/frontend/hooks/features/useFormDraft.ts
import { useEffect, useState } from "react"
import { useLocalStorage } from "../utils/useLocalStorage"

/**
 * A hook that synchronizes form state with localStorage for persistence
 * across refreshes or navigation away from the page
 *
 * @param key The localStorage key to store the form data under
 * @param initialData The initial form data
 * @returns Object with form data, update function, and clear function
 */
export function useFormDraft<T extends Record<string, any>>(key: string, initialData: T) {
  const [draftKey] = useState(`form_draft_${key}`)
  const [draft, setDraft] = useLocalStorage<T>(draftKey, initialData)
  const [initialDataHash, setInitialDataHash] = useState("")

  // Create a simple hash of the initial data to detect changes
  useEffect(() => {
    const hash = JSON.stringify(initialData)
    setInitialDataHash(hash)

    // If initial data changes significantly, update the draft
    if (hash !== initialDataHash) {
      setDraft(initialData)
    }
  }, [initialData, setDraft, initialDataHash])

  // Function to update a field in the form
  const updateField = <K extends keyof T>(fieldName: K, value: T[K]) => {
    setDraft((prev) => ({
      ...prev,
      [fieldName]: value,
    }))
  }

  // Function to clear the draft from localStorage
  const clearDraft = () => {
    localStorage.removeItem(draftKey)
    setDraft(initialData)
  }

  // Function to check if form has unsaved changes
  const isDirty = () => {
    return JSON.stringify(draft) !== initialDataHash
  }

  return {
    data: draft,
    updateField,
    clearDraft,
    isDirty,
    setData: setDraft,
  }
}

