"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { RefreshCw } from "lucide-react"

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void
  children: React.ReactNode
  threshold?: number
  disabled?: boolean
}

export function PullToRefresh({ onRefresh, children, threshold = 80, disabled = false }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [canRefresh, setCanRefresh] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const currentY = useRef(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container || disabled) return

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY > 0) return
      startY.current = e.touches[0].clientY
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (window.scrollY > 0 || isRefreshing) return

      currentY.current = e.touches[0].clientY
      const distance = currentY.current - startY.current

      if (distance > 0) {
        e.preventDefault()
        const pullDist = Math.min(distance * 0.5, threshold * 1.5)
        setPullDistance(pullDist)
        setCanRefresh(pullDist >= threshold)
      }
    }

    const handleTouchEnd = async () => {
      if (canRefresh && !isRefreshing) {
        setIsRefreshing(true)
        try {
          await onRefresh()
        } catch (error) {
          console.error("[PullToRefresh] Refresh failed:", error)
        } finally {
          setIsRefreshing(false)
        }
      }

      setPullDistance(0)
      setCanRefresh(false)
      startY.current = 0
      currentY.current = 0
    }

    container.addEventListener("touchstart", handleTouchStart, { passive: false })
    container.addEventListener("touchmove", handleTouchMove, { passive: false })
    container.addEventListener("touchend", handleTouchEnd)

    return () => {
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchmove", handleTouchMove)
      container.removeEventListener("touchend", handleTouchEnd)
    }
  }, [canRefresh, isRefreshing, onRefresh, threshold, disabled])

  const refreshIndicatorOpacity = Math.min(pullDistance / threshold, 1)
  const refreshIndicatorScale = Math.min(pullDistance / threshold, 1)

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Pull to refresh indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center z-10 transition-transform duration-200"
        style={{
          transform: `translateY(${Math.max(pullDistance - threshold, -threshold)}px)`,
          opacity: refreshIndicatorOpacity,
        }}
      >
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-full bg-background border shadow-lg ${
            canRefresh ? "bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800" : ""
          }`}
          style={{
            transform: `scale(${refreshIndicatorScale})`,
          }}
        >
          <RefreshCw
            className={`w-6 h-6 ${
              canRefresh ? "text-purple-600" : "text-muted-foreground"
            } ${isRefreshing ? "animate-spin" : ""}`}
          />
        </div>
      </div>

      {/* Content */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: `translateY(${pullDistance}px)`,
        }}
      >
        {children}
      </div>
    </div>
  )
}
