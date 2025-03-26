"use client"

import { useState, useEffect } from "react"
import { useLocalStorage } from "@/hooks/utils/useLocalStorage"

interface MobileAppBannerProps {
  appName?: string
  appDescription?: string
  iosAppStoreUrl?: string
  androidPlayStoreUrl?: string
  dismissFor?: number // Days to dismiss the banner for
}

/**
 * Banner promoting the mobile app version
 */
export default function MobileAppBanner({
  appName = "Western University",
  appDescription = "Get the best experience with our mobile app",
  iosAppStoreUrl = "https://apps.apple.com/app/id123456789",
  androidPlayStoreUrl = "https://play.google.com/store/apps/details?id=com.western.app",
  dismissFor = 30, // 30 days
}: MobileAppBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useLocalStorage("mobile-app-banner-dismissed", false);
  const [dismissedAt, setDismissedAt] = useLocalStorage<number | null>("mobile-app-banner-dismissed-at", null);
  
  // Detect if user is on a mobile device
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  
  // Detect platform
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other");

  useEffect(() => {
    // Check if the banner should be shown
    const shouldShowBanner

