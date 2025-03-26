"use client"

import React from "react"

import { memo, type ComponentType, type FC } from "react"

/**
 * Enhanced memo HOC that provides better debugging in React DevTools
 * by preserving the original component name
 */
export function memoWithDisplayName<T extends object>(
  Component: ComponentType<T>,
  propsAreEqual?: (prevProps: Readonly<T>, nextProps: Readonly<T>) => boolean,
): FC<T> {
  const MemoizedComponent = memo(Component, propsAreEqual)

  // Preserve the original display name for better debugging
  MemoizedComponent.displayName = `Memo(${Component.displayName || Component.name || "Component"})`

  return MemoizedComponent
}

/**
 * Utility to create a stable callback reference that doesn't change
 * unless its dependencies change
 */
export function createStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: React.DependencyList,
): T {
  // This is just a type wrapper around useCallback for consistent usage
  return React.useCallback(callback, dependencies) as T
}