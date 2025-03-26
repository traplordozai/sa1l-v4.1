"use client"

import type React from "react"

import { useState, useCallback, type FormEvent } from "react"
import { z } from "zod"

interface FormOptions<T> {
  initialValues: T
  onSubmit: (values: T) => void | Promise<void>
  validationSchema?: z.ZodType<T>
  onError?: (error: Error) => void
}

/**
 * Custom hook for form handling with validation
 */
export function useForm<T extends Record<string, any>>({
  initialValues,
  onSubmit,
  validationSchema,
  onError,
}: FormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target

      setValues((prev) => ({
        ...prev,
        [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
      }))

      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }))

      // Clear error when field is changed
      if (errors[name as keyof T]) {
        setErrors((prev) => ({
          ...prev,
          [name]: undefined,
        }))
      }
    },
    [errors],
  )

  const setValue = useCallback((name: keyof T, value: any) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }))

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }))
  }, [])

  const validateField = useCallback(
    (name: keyof T) => {
      if (!validationSchema) return true

      try {
        // Create a partial schema for just this field
        const fieldSchema = z.object({ [name]: validationSchema.shape[name] })
        fieldSchema.parse({ [name]: values[name] })

        // Clear error if validation passes
        setErrors((prev) => ({
          ...prev,
          [name]: undefined,
        }))

        return true
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldError = error.errors.find((err) => err.path[0] === name)

          if (fieldError) {
            setErrors((prev) => ({
              ...prev,
              [name]: fieldError.message,
            }))
          }
        }

        return false
      }
    },
    [validationSchema, values],
  )

  const validateForm = useCallback(() => {
    if (!validationSchema) return true

    try {
      validationSchema.parse(values)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof T, string>> = {}

        error.errors.forEach((err) => {
          const field = err.path[0] as keyof T
          newErrors[field] = err.message
        })

        setErrors(newErrors)
      }

      return false
    }
  }, [validationSchema, values])

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = e.target

      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }))

      validateField(name as keyof T)
    },
    [validateField],
  )

  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      if (e) e.preventDefault()

      setIsSubmitted(true)

      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Record<keyof T, boolean>,
      )
      setTouched(allTouched)

      const isValid = validateForm()

      if (!isValid) return

      setIsSubmitting(true)

      try {
        await onSubmit(values)
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        onError?.(err)
      } finally {
        setIsSubmitting(false)
      }
    },
    [values, validateForm, onSubmit, onError],
  )

  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitted(false)
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isSubmitted,
    handleChange,
    handleBlur,
    handleSubmit,
    setValue,
    resetForm,
    validateField,
    validateForm,
  }
}