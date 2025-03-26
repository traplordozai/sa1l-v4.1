"use client"

import { useEffect, useRef, ReactNode } from "react"
import { useIntersectionObserver } from "@/hooks/utils/useIntersectionObserver"

interface InfiniteScrollProps {
  children: ReactNode
  loadMore: () => void
  hasMore: boolean
  loader?: ReactNode
  endMessage?: ReactNode
  threshold?: number
  rootMargin?: string
  className?: string
}

/**
 * Component that triggers a callback when the user scrolls to the bottom of the content
 */
export default function InfiniteScroll({
  children,
  loadMore,
  hasMore,
  loader = <div className="py-4 text-center">Loading more items...</div>,
  endMessage = <div className="py-4 text-center">No more items to load</div>,
  threshold = 0.5,
  rootMargin = "100px",
  className = "",
}: InfiniteScrollProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const entry = useIntersectionObserver(loadMoreRef, { threshold, rootMargin })

  useEffect(() => {
    if (entry?.isIntersecting && hasMore) {
      loadMore()
    }
  }, [entry?.isIntersecting, hasMore, loadMore])

  return (
    <div className={className}>
      {children}

      {/* Sentinel element that triggers loading more content */}
      <div ref={loadMoreRef}>{hasMore ? loader : endMessage}</div>
    </div>
  )
}

