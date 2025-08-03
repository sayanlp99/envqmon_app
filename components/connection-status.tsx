"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { WifiOff, RefreshCw } from "lucide-react"

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [showOfflineAlert, setShowOfflineAlert] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowOfflineAlert(false)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflineAlert(true)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Check initial connection status
    setIsOnline(navigator.onLine)
    if (!navigator.onLine) {
      setShowOfflineAlert(true)
    }

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (!showOfflineAlert) return null

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Alert variant="destructive">
        <WifiOff className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>No internet connection</span>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="ml-2">
            <RefreshCw className="h-3 w-3" />
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  )
}
