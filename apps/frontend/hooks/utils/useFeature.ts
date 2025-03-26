"use client"

import { useEffect, useState } from "react"

export function useFeature(flag: string) {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const flags = JSON.parse(localStorage.getItem("features") || "{}")
    setEnabled(Boolean(flags[flag]))
  }, [flag])

  return enabled
}

