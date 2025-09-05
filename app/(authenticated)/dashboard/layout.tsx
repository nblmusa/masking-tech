"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  Settings, 
  History, 
  Palette,
  Menu,
  X,
  LogOut
} from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview and statistics"
  },
  {
    name: "Studio",
    href: "/dashboard/studio",
    icon: Palette,
    description: "Advanced image editing"
  },
  {
    name: "History",
    href: "/dashboard/history",
    icon: History,
    description: "View processed images"
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Account preferences"
  }
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      })
      
      router.push("/")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-950/50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo/Brand */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-800">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                MaskingTech
              </span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/dashboard" && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-blue-50 bg-blue-950/50 text-blue-300 border-r-2 border-blue-600"
                      : "text-gray-700 text-gray-300 hover:bg-gray-800 hover:text-gray-900 hover:text-gray-100"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      isActive
                        ? "text-blue-400"
                        : "text-gray-400 group-hover:text-gray-500 group-hover:text-gray-400"
                    )}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500 text-gray-400 hidden lg:block">
                      {item.description}
                    </div>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-800 p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-700 text-gray-300 hover:bg-gray-800"
              onClick={handleSignOut}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content wrapper */}
      <div className="lg:pl-64 h-full overflow-auto">
        {/* Mobile header */}
        <div className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-gray-800 bg-white bg-gray-900 px-4 shadow-sm lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1 text-sm font-semibold leading-6 text-gray-900 text-gray-100">
            Dashboard
          </div>
        </div>

        {/* Page content */}
        <main className="h-full">
          {children}
        </main>
      </div>
    </div>
  )
}

// Simple Shield icon component since it's not imported
function Shield(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}
