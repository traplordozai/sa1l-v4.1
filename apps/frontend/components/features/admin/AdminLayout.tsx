// File: apps/frontend/components/features/admin/AdminLayout.tsx
"use client"

import { useHasPermission } from "@/hooks/utils/useHasPermission"
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  KeyIcon,
  ServerIcon,
  UsersIcon,
} from "@heroicons/react/24/outline"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()

  // Navigation items with permission checks
  const navItems = [
    {
      href: "/admin/users",
      label: "Users",
      icon: UsersIcon,
      permission: "view_users",
    },
    {
      href: "/admin/roles",
      label: "Roles",
      icon: KeyIcon,
      permission: "view_roles",
    },
    {
      href: "/admin/content",
      label: "Content",
      icon: DocumentDuplicateIcon,
      permission: "view_content",
    },
    {
      href: "/admin/analytics",
      label: "Analytics",
      icon: ChartBarIcon,
      permission: "view_analytics",
    },
    {
      href: "/admin/logs",
      label: "Logs",
      icon: ClipboardDocumentListIcon,
      permission: "view_logs",
    },
    {
      href: "/admin/status",
      label: "Status",
      icon: ServerIcon,
      permission: "view_status",
    },
    {
      href: "/admin/settings",
      label: "Settings",
      icon: Cog6ToothIcon,
      permission: "manage_settings",
    },
  ]

  // Filter nav items by permission
  const filteredNavItems = navItems.filter((item) => !item.permission || useHasPermission(item.permission))

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-westernPurple text-white">
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-deepFocus">
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = pathname?.startsWith(item.href)
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md group ${
                    isActive ? "bg-orchid text-white" : "text-white hover:bg-westernPurple-700 hover:bg-opacity-75"
                  }`}
                >
                  <Icon
                    className={`mr-3 flex-shrink-0 h-6 w-6 ${
                      isActive ? "text-white" : "text-white group-hover:text-white"
                    }`}
                    aria-hidden="true"
                  />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

