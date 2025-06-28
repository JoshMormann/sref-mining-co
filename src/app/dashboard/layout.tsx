// FILE PATH: src/app/dashboard/layout.tsx
// This is the DASHBOARD LAYOUT for authenticated user pages

'use client'

import { useProtectedRoute } from '@/hooks/useProtectedRoute'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Pickaxe,
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Home,
  Folder,
  Star,
  Clock,
  TrendingUp,
  Users,
  Plus
} from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { useSupabase } from '@/app/providers'
import { FolderTree } from '@/components/folders/FolderTree'
import { NewCodeModal } from '@/components/sref/NewCodeModal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useSupabase()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Protect this route - redirect to login if not authenticated
  useProtectedRoute()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const sidebarItems = [
    { icon: Home, label: 'Operations Center', href: '/dashboard', active: true },
    { icon: Pickaxe, label: 'My Discoveries', href: '/dashboard/discoveries' },
    { icon: Star, label: 'Favorites', href: '/dashboard/favorites' },
    { icon: Clock, label: 'Recent Activity', href: '/dashboard/activity' },
    { icon: TrendingUp, label: 'Analytics', href: '/dashboard/analytics' },
    { icon: Users, label: 'Team', href: '/dashboard/team' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </Button>

          {/* Logo */}
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-mining rounded-lg">
              <Pickaxe className="w-5 h-5 text-white" />
            </div>
            <span className="hidden font-bold sm:inline-block">SREF Mining Co</span>
          </Link>

          {/* Search */}
          <div className="flex flex-1 items-center space-x-2">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search mining operations..."
                className="pl-8"
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* New Discovery Button */}
            <NewCodeModal>
              <Button size="sm" className="btn-primary-mining hidden sm:flex">
                <Plus className="w-4 h-4 mr-2" />
                New Discovery
              </Button>
            </NewCodeModal>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                3
              </Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.user_metadata?.full_name || 'Mining Engineer'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-72 transform border-r bg-background transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex h-full flex-col">
            {/* Mobile close button */}
            <div className="flex items-center justify-between p-4 lg:hidden">
              <span className="text-lg font-semibold">Navigation</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4">
              <div className="space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`
                        flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors
                        ${item.active 
                          ? 'bg-gradient-mining text-white' 
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }
                      `}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="mr-3 h-4 w-4" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>

              <div className="pt-4">
                <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Mining Sites
                </h3>
                <FolderTree />
              </div>
            </nav>

            {/* Bottom section */}
            <div className="border-t p-4">
              <div className="rounded-lg bg-gradient-mining p-3 text-white">
                <h4 className="text-sm font-semibold">Mining Efficiency</h4>
                <p className="text-xs opacity-90">Your operations are running at 94.2% efficiency</p>
                <div className="mt-2 h-2 rounded-full bg-white/20">
                  <div className="h-2 w-[94%] rounded-full bg-white"></div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-hidden">
          <div className="container mx-auto p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

