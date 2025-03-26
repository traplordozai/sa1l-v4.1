"use client"

import { useRef, useState, useEffect, type ReactNode } from "react"
import { useInView } from "react-intersection-observer"

interface VirtualizedListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  itemHeight: number
  overscan?: number
  className?: string
  onEndReached?: () => void
  endReachedThreshold?: number
}

export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight,
  overscan = 5,
  className = "",
  onEndReached,
  endReachedThreshold = 0.8,
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 })

  // Set up intersection observer for infinite loading
  const { ref: endRef } = useInView({
    threshold: endReachedThreshold,
    onChange: (inView) => {
      if (inView && onEndReached) {
        onEndReached()
      }
    },
  })

  useEffect(() => {
    const updateVisibleRange = () => {
      if (!containerRef.current) return

      const { scrollTop, clientHeight } = containerRef.current
      const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
      const end = Math.min(items.length, Math.ceil((scrollTop + clientHeight) / itemHeight) + overscan)

      setVisibleRange({ start, end })
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("scroll", updateVisibleRange)
      window.addEventListener("resize", updateVisibleRange)
      updateVisibleRange()
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", updateVisibleRange)
        window.removeEventListener("resize", updateVisibleRange)
      }
    }
  }, [items.length, itemHeight, overscan])

  const visibleItems = items.slice(visibleRange.start, visibleRange.end)
  const totalHeight = items.length * itemHeight
  const offsetY = visibleRange.start * itemHeight

  return (
    <div ref={containerRef} className={`overflow-auto relative ${className}`} style={{ height: "100%" }}>
      <div style={{ height: totalHeight, position: "relative" }}>
        <div style={{ position: "absolute", top: offsetY, left: 0, right: 0 }}>
          {visibleItems.map((item, index) => (
            <div key={index} style={{ height: itemHeight }}>
              {renderItem(item, visibleRange.start + index)}
            </div>
          ))}
        </div>
      </div>
      <div ref={endRef} style={{ height: 1 }} />
    </div>
  )
}