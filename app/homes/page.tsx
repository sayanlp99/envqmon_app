"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Plus, MapPin, Calendar, Loader2 } from "lucide-react"
import { HomeIcon as HomeType } from "lucide-react" // Renamed to avoid redeclaration

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

interface Home {
  home_id: string
  home_name: string
  address: string | null
  user_id: string
  createdAt: string
  updatedAt: string
}

interface Room {
  room_id: string
  room_name: string
  home_id: string
  user_id: string
  type: string | null
  createdAt: string
  updatedAt: string
}

export default function HomesPage() {
  const [homes, setHomes] = useState<Home[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showRoomDialog, setShowRoomDialog] = useState(false)
  const [selectedHomeId, setSelectedHomeId] = useState("")

  // Form states
  const [homeName, setHomeName] = useState("")
  const [homeAddress, setHomeAddress] = useState("")
  const [roomName, setRoomName] = useState("")

  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/login")
      return
    }
    fetchHomes()
    fetchRooms()
  }, [router])

  // Replace the fetchHomes function
  const fetchHomes = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/homes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setHomes(data)
      } else {
        setError("Failed to fetch homes")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  // Replace the fetchRooms function
  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/rooms`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setRooms(data)
      }
    } catch (err) {
      console.error("Failed to fetch rooms")
    }
  }

  // Replace the createHome function
  const createHome = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("token")
      const user = JSON.parse(localStorage.getItem("user") || "{}")

      const response = await fetch(`${API_BASE_URL}/homes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          home_name: homeName,
          address: homeAddress || null,
          user_id: user.user_id,
        }),
      })

      if (response.ok) {
        setSuccess("Home created successfully!")
        setHomeName("")
        setHomeAddress("")
        setShowCreateDialog(false)
        fetchHomes()
      } else {
        const data = await response.json()
        setError(data.message || "Failed to create home")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setCreating(false)
    }
  }

  // Replace the createRoom function
  const createRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("token")
      const user = JSON.parse(localStorage.getItem("user") || "{}")

      const response = await fetch(`${API_BASE_URL}/rooms`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          room_name: roomName,
          home_id: selectedHomeId,
          user_id: user.user_id,
        }),
      })

      if (response.ok) {
        setSuccess("Room created successfully!")
        setRoomName("")
        setShowRoomDialog(false)
        fetchRooms()
      } else {
        const data = await response.json()
        setError(data.message || "Failed to create room")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setCreating(false)
    }
  }

  const getRoomsForHome = (homeId: string) => {
    return rooms.filter((room) => room.home_id === homeId)
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
            <h1 className="text-3xl font-bold text-gray-900">Homes & Rooms</h1>
            <p className="text-gray-600">Manage your monitored locations</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Home
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Home</DialogTitle>
                <DialogDescription>Add a new home to start monitoring its environment.</DialogDescription>
              </DialogHeader>
              <form onSubmit={createHome} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="homeName">Home Name</Label>
                  <Input
                    id="homeName"
                    placeholder="e.g., Main House, Office"
                    value={homeName}
                    onChange={(e) => setHomeName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="homeAddress">Address (Optional)</Label>
                  <Textarea
                    id="homeAddress"
                    placeholder="Enter the full address"
                    value={homeAddress}
                    onChange={(e) => setHomeAddress(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={creating}>
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Home
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

        {homes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <HomeType className="h-12 w-12 text-gray-400 mb-4" /> {/* Updated to use HomeType */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Homes Found</h3>
              <p className="text-gray-600 text-center mb-4">
                Create your first home to start organizing your monitoring locations.
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Home
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {homes.map((home) => {
              const homeRooms = getRoomsForHome(home.home_id)
              return (
                <Card key={home.home_id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <HomeType className="h-5 w-5" /> {/* Updated to use HomeType */}
                        <span>{home.home_name}</span>
                      </CardTitle>
                      <Badge variant="outline">{homeRooms.length} rooms</Badge>
                    </div>
                    {home.address && (
                      <CardDescription className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{home.address}</span>
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Created: {new Date(home.createdAt).toLocaleDateString()}</span>
                        </span>
                      </div>

                      {homeRooms.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Rooms:</h4>
                          <div className="flex flex-wrap gap-1">
                            {homeRooms.map((room) => (
                              <Badge key={room.room_id} variant="secondary" className="text-xs">
                                {room.room_name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                        onClick={() => {
                          setSelectedHomeId(home.home_id)
                          setShowRoomDialog(true)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Room
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        <Dialog open={showRoomDialog} onOpenChange={setShowRoomDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Room</DialogTitle>
              <DialogDescription>Add a new room to the selected home.</DialogDescription>
            </DialogHeader>
            <form onSubmit={createRoom} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roomName">Room Name</Label>
                <Input
                  id="roomName"
                  placeholder="e.g., Living Room, Bedroom, Kitchen"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={creating}>
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Room
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
