"use client"

import { Home, Users, Package, Settings, LogOut } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import Image from "next/image"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Family Tree",
    url: "/familyTree",
    icon: Users,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: Package,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const [user, setUser] = useState<{ name: string; imageUrl?: string } | null>(null)
  const [showLogout, setShowLogout] = useState(false)

  useEffect(() => {
    let mounted = true
    const fetchUser = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        if (!token) return
        const res = await fetch('/api/user', { headers: { Authorization: `Bearer ${token}` } })
        if (!mounted) return
        if (res.status === 401 || res.status === 403) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token')
          }
          router.replace('/login')
          return
        }
        if (res.ok) {
          const data = await res.json()
          const u = data?.user
          setUser({ name: u?.name ?? "", imageUrl: u?.imageUrl })
        }
      } catch {
        // ignore
      }
    }
    fetchUser()
    return () => { mounted = false }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.replace('/login')
  }
  
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={isActive ? "bg-orange-200 text-orange-900 hover:bg-orange-300" : ""}
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div>
          <button
            className="w-full flex items-center gap-2 rounded-md p-2 bg-orange-50 text-orange-900 hover:bg-orange-100"
            onClick={() => setShowLogout((p) => !p)}
          >
            {
              <Image
                src={user?.imageUrl ?? "/next.svg"}
                alt={user?.name || "User"}
                width={24}
                height={24}
                className="h-6 w-6 rounded-full object-cover"
              />
            }
            <span className="truncate">{user?.name || "Account"}</span>
          </button>
          {showLogout && (
            <button
              onClick={handleLogout}
              className="mt-2 w-full flex items-center gap-2 rounded-md p-2 text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}