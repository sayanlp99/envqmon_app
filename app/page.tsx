"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, Home, Users, Zap, TrendingUp } from "lucide-react"
import Link from "next/link"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const [stats, setStats] = useState({
    activeDevices: 0,
    totalHomes: 0,
    totalRooms: 0,
  })

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (token && userData) {
      setUser(JSON.parse(userData))
    } else {
      router.push("/auth/login")
    }
    setLoading(false)
  }, [router])

  useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token")

      // Fetch devices
      const devicesResponse = await fetch(`${API_BASE_URL}/devices`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Fetch homes
      const homesResponse = await fetch(`${API_BASE_URL}/homes`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Fetch rooms
      const roomsResponse = await fetch(`${API_BASE_URL}/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (devicesResponse.ok && homesResponse.ok && roomsResponse.ok) {
        const devices = await devicesResponse.json()
        const homes = await homesResponse.json()
        const rooms = await roomsResponse.json()

        // Count active devices by checking their latest data
        let activeCount = 0
        for (const device of devices) {
          try {
            const dataResponse = await fetch(`${API_BASE_URL}/data/latest/${device.device_id}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            if (dataResponse.ok) {
              const deviceData = await dataResponse.json()
              const lastUpdate = Number.parseInt(deviceData.recorded_at) * 1000
              const now = Date.now()
              if (now - lastUpdate <= 20000) {
                // 20 seconds threshold
                activeCount++
              }
            }
          } catch {
            // Device not active if no data or error
          }
        }

        setStats({
          activeDevices: activeCount,
          totalHomes: homes.length,
          totalRooms: rooms.length,
        })
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back, {user.name}!</h1>
          <p className="text-gray-600">Monitor your environment with real-time IoT data</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dashboard</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Monitor</div>
              <p className="text-xs text-muted-foreground">Real-time environmental data</p>
              <Link href="/dashboard">
                <Button className="w-full mt-4 bg-transparent" variant="outline">
                  View Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Homes</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Manage</div>
              <p className="text-xs text-muted-foreground">Your homes and rooms</p>
              <Link href="/homes">
                <Button className="w-full mt-4 bg-transparent" variant="outline">
                  Manage Homes
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Devices</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Control</div>
              <p className="text-xs text-muted-foreground">IoT devices and sensors</p>
              <Link href="/devices">
                <Button className="w-full mt-4 bg-transparent" variant="outline">
                  View Devices
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Analytics</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Analyze</div>
              <p className="text-xs text-muted-foreground">Historical data trends</p>
              <Link href="/analytics">
                <Button className="w-full mt-4 bg-transparent" variant="outline">
                  View Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>

          {user.role === "admin" && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Admin</div>
                <p className="text-xs text-muted-foreground">Manage system users</p>
                <Link href="/admin/users">
                  <Button className="w-full mt-4 bg-transparent" variant="outline">
                    Manage Users
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Overview of your environment monitoring system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Active Devices</span>
                  <span className="text-2xl font-bold text-green-600">{stats.activeDevices}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Monitored Homes</span>
                  <span className="text-2xl font-bold text-blue-600">{stats.totalHomes}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Rooms</span>
                  <span className="text-2xl font-bold text-purple-600">{stats.totalRooms}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current status of your monitoring system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">System Health</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Data Collection</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Alerts</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-yellow-600">0 Active</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
