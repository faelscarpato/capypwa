"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { WifiOff, Wifi } from "lucide-react"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine
      setIsOnline(online)

      if (!online) {
        setShowIndicator(true)
      } else {
        // Show "back online" message briefly
        if (!isOnline) {
          setShowIndicator(true)
          setTimeout(() => setShowIndicator(false), 3000)
        }
      }
    }

    // Set initial status
    updateOnlineStatus()

    // Listen for online/offline events
    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
    }
  }, [isOnline])

  if (!showIndicator) return null

  return (
    <Card
      className={`fixed top-20 left-4 right-4 p-3 z-50 ${
        isOnline
          ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
          : "bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800"
      }`}
    >
      <div className="flex items-center space-x-2">
        {isOnline ? <Wifi className="w-5 h-5 text-green-600" /> : <WifiOff className="w-5 h-5 text-orange-600" />}
        <span
          className={`text-sm font-medium ${
            isOnline ? "text-green-800 dark:text-green-200" : "text-orange-800 dark:text-orange-200"
          }`}
        >
          {isOnline ? "Conectado novamente" : "Modo offline - algumas funcionalidades podem estar limitadas"}
        </span>
      </div>
    </Card>
  )
}
