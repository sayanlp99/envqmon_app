"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Zap, Plus, Wifi, Loader2, Activity } from "lucide-react"
// Remove the api import and revert to original fetch calls
// 1. Remove the import line: `import { api, ApiError } from "@/lib/api"`

const API_BASE_URL = "process.env.NEXT_PUBLIC_API_BASE_URL"

interface Device {
  device_id: string
  device_name: string
  device_imei: string
  is_active: boolean
  user_id: string
  createdAt: string
  updatedAt: string
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [deviceStatuses, setDeviceStatuses] = useState<Record<string, boolean>>({})

  // Form states
  const [deviceName, setDeviceName] = useState("")
  const [deviceImei, setDeviceImei] = useState("")

  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/login")
      return
    }
    fetchDevices()
  }, [router])

  const checkDeviceStatus = async (deviceId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/data/latest/${deviceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        const lastUpdate = Number.parseInt(data.recorded_at) * 1000
        const now = Date.now()
        return now - lastUpdate <= 20000 // 20 seconds threshold
      }
      return false
    } catch {
      return false
    }
  }

  // Replace the fetchDevices function
  const fetchDevices = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/devices`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setDevices(data)

        // Check status for each device
        const statuses: Record<string, boolean> = {}
        for (const device of data) {
          statuses[device.device_id] = await checkDeviceStatus(device.device_id)
        }
        setDeviceStatuses(statuses)
      } else {
        setError("Failed to fetch devices")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  // Replace the createDevice function
  const createDevice = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("token")
      const user = JSON.parse(localStorage.getItem("user") || "{}")

      const response = await fetch(`${API_BASE_URL}/devices`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          device_name: deviceName,
          device_imei: deviceImei,
          user_id: user.user_id,
        }),
      })

      if (response.ok) {
        setSuccess("Device created successfully!")
        setDeviceName("")
        setDeviceImei("")
        setShowCreateDialog(false)
        fetchDevices()
      } else {
        const data = await response.json()
        setError(data.message || "Failed to create device")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Devices</h1>
            <p className="text-gray-600">Manage your IoT monitoring devices</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Device
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Device</DialogTitle>
                <DialogDescription>Register a new IoT device for environmental monitoring.</DialogDescription>
              </DialogHeader>
              <form onSubmit={createDevice} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deviceName">Device Name</Label>
                  <Input
                    id="deviceName"
                    placeholder="e.g., Living Room Sensor, Office Monitor"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deviceImei">Device IMEI</Label>
                  <Input
                    id="deviceImei"
                    placeholder="Enter device IMEI number"
                    value={deviceImei}
                    onChange={(e) => setDeviceImei(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={creating}>
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Device
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {devices.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Zap className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Devices Found</h3>
              <p className="text-gray-600 text-center mb-4">
                Add your first IoT device to start monitoring environmental data.
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Device
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map((device) => (
              <Card key={device.device_id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="h-5 w-5" />
                      <span>{device.device_name}</span>
                    </CardTitle>
                    <Badge variant={device.is_active ? "default" : "secondary"}>
                      {device.is_active ? (
                        <>
                          <Activity className="h-3 w-3 mr-1" />
                          Active
                        </>
                      ) : (
                        "Inactive"
                      )}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center space-x-1">
                    <Wifi className="h-4 w-4" />
                    <span className="font-mono text-xs">{device.device_imei}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Device ID:</span>
                        <span className="font-mono text-xs">{device.device_id.slice(0, 8)}...</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Status:</span>
                        <div className="flex items-center space-x-1">
                          <div
                            className={`w-2 h-2 rounded-full ${deviceStatuses[device.device_id] ? "bg-green-500" : "bg-red-500"}`}
                          ></div>
                          <span className={deviceStatuses[device.device_id] ? "text-green-600" : "text-red-600"}>
                            {deviceStatuses[device.device_id] ? "Online" : "Offline"}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Added:</span>
                        <span>{new Date(device.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                        onClick={() => router.push(`/dashboard?device=${device.device_id}`)}
                      >
                        <Activity className="h-4 w-4 mr-2" />
                        View Data
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
