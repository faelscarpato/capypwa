"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Star, Share } from "lucide-react"

interface SwipeableCardProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onDelete?: () => void
  onFavorite?: () => void
  onShare?: () => void
  className?: string
  disabled?: boolean
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  onDelete,
  onFavorite,
  onShare,
  className = "",
  disabled = false,
}: SwipeableCardProps) {
  const [translateX, setTranslateX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const currentX = useRef(0)

  const threshold = 80
  const maxSwipe = 120

  useEffect(() => {
    const card = cardRef.current
    if (!card || disabled) return

    const handleTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX
      setIsDragging(true)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return

      currentX.current = e.touches[0].clientX
      const deltaX = currentX.current - startX.current
      const clampedDelta = Math.max(-maxSwipe, Math.min(maxSwipe, deltaX))

      setTranslateX(clampedDelta)
      setShowActions(Math.abs(clampedDelta) > threshold)
    }

    const handleTouchEnd = () => {
      if (!isDragging) return

      const deltaX = currentX.current - startX.current

      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight()
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft()
        }
      }

      setTranslateX(0)
      setIsDragging(false)
      setShowActions(false)
      startX.current = 0
      currentX.current = 0
    }

    const handleMouseDown = (e: MouseEvent) => {
      startX.current = e.clientX
      setIsDragging(true)
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      currentX.current = e.clientX
      const deltaX = currentX.current - startX.current
      const clampedDelta = Math.max(-maxSwipe, Math.min(maxSwipe, deltaX))

      setTranslateX(clampedDelta)
      setShowActions(Math.abs(clampedDelta) > threshold)
    }

    const handleMouseUp = () => {
      if (!isDragging) return

      const deltaX = currentX.current - startX.current

      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight()
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft()
        }
      }

      setTranslateX(0)
      setIsDragging(false)
      setShowActions(false)
      startX.current = 0
      currentX.current = 0
    }

    // Touch events
    card.addEventListener("touchstart", handleTouchStart, { passive: false })
    card.addEventListener("touchmove", handleTouchMove, { passive: false })
    card.addEventListener("touchend", handleTouchEnd)

    // Mouse events for desktop testing
    card.addEventListener("mousedown", handleMouseDown)
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      card.removeEventListener("touchstart", handleTouchStart)
      card.removeEventListener("touchmove", handleTouchMove)
      card.removeEventListener("touchend", handleTouchEnd)
      card.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, onSwipeLeft, onSwipeRight, disabled])

  return (
    <div className="relative overflow-hidden">
      {/* Action buttons background */}
      <div className="absolute inset-0 flex items-center justify-between px-4">
        {/* Right actions (shown when swiping left) */}
        <div
          className={`flex items-center space-x-2 transition-opacity duration-200 ${
            translateX < -threshold ? "opacity-100" : "opacity-0"
          }`}
        >
          {onDelete && (
            <Button size="sm" variant="destructive" onClick={onDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Left actions (shown when swiping right) */}
        <div
          className={`flex items-center space-x-2 transition-opacity duration-200 ${
            translateX > threshold ? "opacity-100" : "opacity-0"
          }`}
        >
          {onFavorite && (
            <Button size="sm" variant="outline" onClick={onFavorite}>
              <Star className="w-4 h-4" />
            </Button>
          )}
          {onShare && (
            <Button size="sm" variant="outline" onClick={onShare}>
              <Share className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Main card */}
      <Card
        ref={cardRef}
        className={`relative z-10 transition-transform duration-200 cursor-grab active:cursor-grabbing ${className} ${
          isDragging ? "shadow-lg" : ""
        }`}
        style={{
          transform: `translateX(${translateX}px)`,
        }}
      >
        {children}
      </Card>
    </div>
  )
}
