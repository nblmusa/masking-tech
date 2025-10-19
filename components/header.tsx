"use client"

import { Button } from "@/components/ui/button"
import { Shield, Menu, User, Settings, LogOut, ChevronDown, CreditCard, Gauge, Upload } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from '@/lib/supabase-client'
import { useState, useEffect } from "react"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function Header() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  useEffect(() => {
    const getUser = async () => {
      try {
        if(!supabase){
          console.log('Supabase client not initialized')
          return
        }
        const { data: { user }, error } = await supabase?.auth?.getUser()
        console.log('User:', user)
        if (error) throw error
        setUser(user)
      } catch (error) {
        console.error('Error checking auth status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          setUser(session?.user ?? null)
          router.refresh()
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          router.refresh()
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [pathname, router, supabase])

  async function handleSignOut() {
    try {
      setIsLoading(true)
      await supabase.auth.signOut()
      setUser(null)
      toast({
        title: "Success",
        description: "You have been signed out successfully.",
      })
      router.push('/')
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const navigation = [
    { name: 'About', href: '/about' },
    ...(!user ? [{ name: 'Pricing', href: '/pricing' }] : []),
    { name: 'Blog', href: '/blog' },
    { name: 'Docs', href: '/docs' },
    ...(user ? [
      // { name: 'Dashboard', href: '/dashboard' }
    ] : []),
  ]

  // Show different header for logged-in users on public pages
  if (user) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 max-w-7xl mx-auto items-center justify-between">
            <div className="flex items-center gap-6">
              <Link 
                href="/" 
                className="flex items-center gap-2.5 transition-all duration-300 hover:opacity-90 group"
              >
                 <div className="h-[40px] w-[40px] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Image
                  src="/images/logo.png"
                  alt="MaskingTech Logo"
                  width={100}
                  height={100}
                  className="object-cover"
                />
              </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                  MaskingTech
                </span>
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  href="/about"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  About
                </Link>
                <Link
                  href="/pricing"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pricing
                </Link>
                <Link
                  href="/blog"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Blog
                </Link>
                <Link
                  href="/docs"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Docs
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">{user.email}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center gap-2">
                        <Gauge className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/upload" className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Upload Images
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/billing" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Billing
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-400">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 p-2 border-b">
                      <User className="h-4 w-4" />
                      <span className="text-sm font-medium">{user.email}</span>
                    </div>
                    <nav className="flex flex-col gap-2">
                      <SheetClose asChild>
                        <Link
                          href="/dashboard"
                          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md"
                        >
                          Dashboard
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/upload"
                          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md"
                        >
                          Upload Images
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/settings"
                          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md"
                        >
                          Settings
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/billing"
                          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md"
                        >
                          Billing
                        </Link>
                      </SheetClose>
                    </nav>
                    <div className="flex flex-col gap-2 pt-4 border-t">
                      <SheetClose asChild>
                        <Button 
                          variant="ghost" 
                          onClick={handleSignOut}
                          className="justify-start text-red-400"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </Button>
                      </SheetClose>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 max-w-7xl mx-auto items-center justify-between">
          <div className="flex items-center gap-6">
            <Link 
              href="/" 
              className="flex items-center gap-2.5 transition-all duration-300 hover:opacity-90 group"
            >
               {/* bg-gradient-to-br from-blue-600 to-indigo-600 */}
              <div className="h-[40px] w-[40px] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Image
                  src="/images/logo.png"
                  alt="MaskingTech Logo"
                  className="object-cover"
                  width={100}
                  height={100}
                />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                MaskingTech
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/signup">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col gap-4">
                  <nav className="flex flex-col gap-2">
                    {navigation.map((item) => (
                      <SheetClose key={item.name} asChild>
                        <Link
                          href={item.href}
                          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md"
                        >
                          {item.name}
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>
                  <div className="flex flex-col gap-2 pt-4 border-t">
                    <SheetClose asChild>
                      <Button variant="ghost" asChild className="justify-start">
                        <Link href="/login">Sign In</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild className="justify-start">
                        <Link href="/signup">Get Started</Link>
                      </Button>
                    </SheetClose>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}