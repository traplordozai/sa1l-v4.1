"use client"

import { useState, useEffect, useRef, RefObject } from 'react';

interface IntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

/**
 * Custom hook for detecting when an element is visible in the viewport
 * @param elementRef Reference to the element to observe
 * @param options IntersectionObserver options with additional freezeOnceVisible option
 * @returns IntersectionObserverEntry or undefined
 */
export function useIntersectionObserver<T extends Element>(
  elementRef: RefObject<T>,
  {
    threshold = 0,
    root = null,
    rootMargin = '0%',
    freezeOnceVisible = false,
  }: IntersectionObserverOptions = {}
): IntersectionObserverEntry | undefined {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  
  const frozen = useRef(false);

  const updateEntry = ([entry]: IntersectionObserverEntry[]): void => {
    setEntry(entry);
    
    // If the element is visible and we want to freeze the result,
    // set the frozen ref to true
    if (freezeOnceVisible && entry.isIntersecting) {
      frozen.current = true;
    }
  };

  useEffect(() => {
    const node = elementRef?.current;
    
    // Only observe if we have a node and it's not frozen
    if (!node || frozen.current) return;
    
    const observer = new IntersectionObserver(updateEntry, {
      threshold,
      root,
      rootMargin,
    });
    
    observer.observe(node);
    
    return () => {
      observer.disconnect();
    };
    
    // Ensure we re-create the observer when the dependencies change
  }, [elementRef, threshold, root, rootMargin, freezeOnceVisible]);

  return entry;
}

/**
 * Simplified hook that returns just the isIntersecting value
 */
export function useIsVisible<T extends Element>(
  elementRef: RefObject<T>,
  options?: IntersectionObserverOptions
): boolean {
  const entry = useIntersectionObserver(elementRef, options);
  return entry?.isIntersecting ?? false;
}

