"use client"

import { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  Bell, 
  CreditCard,
  Settings,
  Key
} from "lucide-react"

interface SettingsLayoutProps {
  children: ReactNode
}

const sidebarNavItems = [
  {
    title: "Account",
    href: "/settings",
    icon: User,
  },
  {
    title: "Notifications",
    href: "/settings/notifications",
    icon: Bell,
  },

  {
    title: "API Keys",
    href: "/settings/api-keys",
    icon: Key,
  },
  {
    title: "Billing",
    href: "/settings/billing",
    icon: CreditCard,
  },
]

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        
        <Separator className="my-6" />

        <div className="space-y-6">
          {/* Top Navigation Tabs */}
          <nav className="border-b border-border">
            <div className="flex flex-wrap gap-0 -mb-px">
              {sidebarNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium transition-colors hover:text-foreground border-b-2 border-transparent",
                    pathname === item.href
                      ? "text-foreground border-primary bg-background"
                      : "text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              ))}
            </div>
          </nav>
          
          {/* Main Content */}
          <div className="max-w-4xl">{children}</div>
        </div>
      </div>
    </div>
  )
} 