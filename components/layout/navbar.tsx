"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Activity, Home, LogOut, Users, Zap, TrendingUp } from "lucide-react"
import Link from "next/link"

export function Navbar() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/auth/login")
  }

  if (!user || pathname.startsWith("/auth")) {
    return null
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <Activity className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">EnvQMon</span>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/homes"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname.startsWith("/homes") ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Homes
              </Link>
              <Link
                href="/devices"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname.startsWith("/devices") ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Devices
              </Link>
              <Link
                href="/analytics"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname.startsWith("/analytics") ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Analytics
              </Link>
              {user.role === "admin" && (
                <Link
                  href="/admin/users"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname.startsWith("/admin") ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  Admin
                </Link>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user.name}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="cursor-pointer">
                  <Activity className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/homes" className="cursor-pointer">
                  <Home className="mr-2 h-4 w-4" />
                  Homes
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/devices" className="cursor-pointer">
                  <Zap className="mr-2 h-4 w-4" />
                  Devices
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/analytics" className="cursor-pointer">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Analytics
                </Link>
              </DropdownMenuItem>
              {user.role === "admin" && (
                <DropdownMenuItem asChild>
                  <Link href="/admin/users" className="cursor-pointer">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
