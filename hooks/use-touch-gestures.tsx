"use client"

import { useEffect, useRef, useState } from "react"

interface TouchGestureOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onTap?: () => void
  onLongPress?: () => void
  onPullToRefresh?: () => void
  threshold?: number
  longPressDelay?: number
}

export function useTouchGestures(options: TouchGestureOptions) {
  const elementRef = useRef<HTMLElement>(null)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  const [isPullToRefresh, setIsPullToRefresh] = useState(false)

  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onLongPress,
    onPullToRefresh,
    threshold = 50,
    longPressDelay = 500,
  } = options

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      setTouchStart({ x: touch.clientX, y: touch.clientY })
      setTouchEnd(null)

      // Start long press timer
      if (onLongPress) {
        const timer = setTimeout(() => {
          onLongPress()
          setLongPressTimer(null)
        }, longPressDelay)
        setLongPressTimer(timer)
      }

      // Check for pull to refresh (only at top of page)
      if (onPullToRefresh && window.scrollY === 0 && touch.clientY < 100) {
        setIsPullToRefresh(true)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0]
      setTouchEnd({ x: touch.clientX, y: touch.clientY })

      // Cancel long press on move
      if (longPressTimer) {
        clearTimeout(longPressTimer)
        setLongPressTimer(null)
      }

      // Handle pull to refresh
      if (isPullToRefresh && touchStart) {
        const deltaY = touch.clientY - touchStart.y
        if (deltaY > 100) {
          // Visual feedback could be added here
          e.preventDefault()
        }
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart || !touchEnd) {
        // Simple tap
        if (onTap && !longPressTimer) {
          onTap()
        }
        return
      }

      // Cancel long press timer
      if (longPressTimer) {
        clearTimeout(longPressTimer)
        setLongPressTimer(null)
      }

      const deltaX = touchEnd.x - touchStart.x
      const deltaY = touchEnd.y - touchStart.y

      // Handle pull to refresh
      if (isPullToRefresh && deltaY > 100 && Math.abs(deltaX) < 50) {
        if (onPullToRefresh) {
          onPullToRefresh()
        }
        setIsPullToRefresh(false)
        return
      }

      // Determine swipe direction
      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY)
      const isVerticalSwipe = Math.abs(deltaY) > Math.abs(deltaX)

      if (isHorizontalSwipe && Math.abs(deltaX) > threshold) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight()
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft()
        }
      } else if (isVerticalSwipe && Math.abs(deltaY) > threshold) {
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown()
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp()
        }
      } else if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && onTap) {
        // Small movement, consider it a tap
        onTap()
      }

      setTouchStart(null)
      setTouchEnd(null)
      setIsPullToRefresh(false)
    }

    element.addEventListener("touchstart", handleTouchStart, { passive: false })
    element.addEventListener("touchmove", handleTouchMove, { passive: false })
    element.addEventListener("touchend", handleTouchEnd, { passive: false })

    return () => {
      element.removeEventListener("touchstart", handleTouchStart)
      element.removeEventListener("touchmove", handleTouchMove)
      element.removeEventListener("touchend", handleTouchEnd)

      if (longPressTimer) {
        clearTimeout(longPressTimer)
      }
    }
  }, [
    touchStart,
    touchEnd,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onLongPress,
    onPullToRefresh,
    threshold,
    longPressDelay,
    longPressTimer,
    isPullToRefresh,
  ])

  return elementRef
}
