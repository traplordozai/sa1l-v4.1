"use client"

// File: apps/frontend/components/shared/ProgressVisualizer.tsx
import { cn } from "@/lib/utils"
import { useMemo } from "react"

interface Milestone {
  id: string
  title: string
  position: number
  completed: boolean
}

interface ProgressVisualizerProps {
  label?: string
  percent: number
  showLabel?: boolean
  colorMode?: "simple" | "gradient"
  size?: "sm" | "md" | "lg"
  milestones?: Milestone[]
  className?: string
}

export default function ProgressVisualizer({
  label,
  percent,
  showLabel = true,
  colorMode = "simple",
  size = "md",
  milestones = [],
  className,
}: ProgressVisualizerProps) {
  // Round the percentage to 1 decimal place
  const roundedPercent = Math.round(percent * 10) / 10

  // Determine the color based on percent completion
  const getBarColor = useMemo(() => {
    // For simple color mode
    if (colorMode === "simple") {
      if (percent >= 100) return "bg-green-500"
      if (percent >= 70) return "bg-green-400"
      if (percent >= 50) return "bg-yellow-400"
      if (percent >= 30) return "bg-yellow-500"
      return "bg-red-500"
    }

    // For gradient color mode
    return "bg-gradient-to-r from-red-500 via-yellow-400 to-green-500"
  }, [percent, colorMode])

  // Determine height based on size
  const heightClass = useMemo(() => {
    switch (size) {
      case "sm":
        return "h-1"
      case "lg":
        return "h-4"
      default:
        return "h-2"
    }
  }, [size])

  // Sort milestones by position
  const sortedMilestones = useMemo(() => {
    return [...milestones].sort((a, b) => a.position - b.position)
  }, [milestones])

  return (
    <div className={className}>
      {/* Label */}
      {showLabel && (
        <div className="flex justify-between text-sm mb-1">
          <span>{label}</span>
          <span>{roundedPercent}%</span>
        </div>
      )}

      {/* Progress bar */}
      <div className="relative">
        {/* Background track */}
        <div className={cn("w-full rounded-full bg-gray-200 overflow-hidden", heightClass)}>
          {/* Colored progress bar */}
          <div
            className={cn("rounded-full transition-all duration-500", getBarColor)}
            style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
          />
        </div>

        {/* Milestones */}
        {sortedMilestones.length > 0 && (
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {sortedMilestones.map((milestone) => {
              const position = `${milestone.position}%`

              return (
                <div key={milestone.id} className="absolute top-0 -translate-x-1/2" style={{ left: position }}>
                  {/* Milestone marker */}
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full border-2 border-white",
                      milestone.completed ? "bg-green-500" : "bg-gray-400",
                    )}
                    title={milestone.title}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Milestone labels (for larger sizes) */}
      {size === "lg" && sortedMilestones.length > 0 && (
        <div className="relative mt-2 text-xs text-gray-600">
          {sortedMilestones.map((milestone) => (
            <div
              key={milestone.id}
              className="absolute -translate-x-1/2 whitespace-nowrap"
              style={{ left: `${milestone.position}%` }}
            >
              {milestone.title}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Simplified component for when you just need a basic progress bar
export function SimpleProgressBar({
  percent,
  className,
}: {
  percent: number
  className?: string
}) {
  return (
    <div className={cn("w-full bg-gray-200 rounded-full h-2 overflow-hidden", className)}>
      <div
        className={cn(
          "h-full rounded-full",
          percent >= 100
            ? "bg-green-500"
            : percent >= 70
              ? "bg-green-400"
              : percent >= 50
                ? "bg-yellow-400"
                : percent >= 30
                  ? "bg-yellow-500"
                  : "bg-red-500",
        )}
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  )
}

