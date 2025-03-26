"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  placeholder?: "blur" | "empty"
  blurDataURL?: string
  onLoad?: () => void
  fallbackSrc?: string
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  placeholder = "empty",
  blurDataURL,
  onLoad,
  fallbackSrc,
}: OptimizedImageProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [imageSrc, setImageSrc] = useState(src)

  // Reset state when src changes
  useEffect(() => {
    setLoading(true)
    setError(false)
    setImageSrc(src)
  }, [src])

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {loading && <div className="absolute inset-0 bg-gray-100 animate-pulse" />}
      <Image
        src={error && fallbackSrc ? fallbackSrc : imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={cn("transition-opacity duration-300", loading ? "opacity-0" : "opacity-100")}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onLoad={() => {
          setLoading(false)
          onLoad?.()
        }}
        onError={() => {
          setError(true)
          if (fallbackSrc && imageSrc !== fallbackSrc) {
            setImageSrc(fallbackSrc)
          } else {
            setLoading(false)
          }
        }}
      />
    </div>
  )
}