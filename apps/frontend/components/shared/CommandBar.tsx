"use client"

// File: apps/frontend/components/shared/CommandBar.tsx
import { useHasPermission } from "@/hooks/utils/useHasPermission"
import { Combobox, Dialog, Transition } from "@headlessui/react"
import { useRouter } from "next/navigation"
import { Fragment, useCallback, useEffect, useMemo, useState } from "react"

interface Command {
  id: string
  category: string
  title: string
  shortcut?: string
  action: () => void
  requiredPermission?: string
}

export default function CommandBar() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  // Initialize commands
  const commands = useMemo<Command[]>(
    () => [
      // Navigation commands
      {
        id: "goto-admin",
        category: "Navigation",
        title: "Go to Admin Dashboard",
        shortcut: "G A",
        action: () => router.push("/admin"),
        requiredPermission: "access_admin",
      },
      {
        id: "goto-users",
        category: "Navigation",
        title: "Go to Users",
        shortcut: "G U",
        action: () => router.push("/admin/users"),
        requiredPermission: "manage_users",
      },
      {
        id: "goto-content",
        category: "Navigation",
        title: "Go to Content",
        shortcut: "G C",
        action: () => router.push("/admin/content"),
        requiredPermission: "manage_content",
      },
      {
        id: "goto-roles",
        category: "Navigation",
        title: "Go to Roles",
        shortcut: "G R",
        action: () => router.push("/admin/roles"),
        requiredPermission: "manage_roles",
      },
      {
        id: "goto-faculty",
        category: "Navigation",
        title: "Go to Faculty Dashboard",
        shortcut: "G F",
        action: () => router.push("/faculty/dashboard"),
        requiredPermission: "access_faculty",
      },
      {
        id: "goto-student",
        category: "Navigation",
        title: "Go to Student Dashboard",
        shortcut: "G S",
        action: () => router.push("/student/dashboard"),
        requiredPermission: "access_student",
      },
      {
        id: "goto-org",
        category: "Navigation",
        title: "Go to Organization Dashboard",
        shortcut: "G O",
        action: () => router.push("/org/dashboard"),
        requiredPermission: "access_org",
      },

      // Action commands
      {
        id: "create-user",
        category: "Actions",
        title: "Create New User",
        shortcut: "N U",
        action: () => router.push("/admin/users?action=create"),
        requiredPermission: "create_users",
      },
      {
        id: "create-content",
        category: "Actions",
        title: "Create New Content",
        shortcut: "N C",
        action: () => router.push("/admin/content?action=create"),
        requiredPermission: "create_content",
      },
      {
        id: "create-role",
        category: "Actions",
        title: "Create New Role",
        shortcut: "N R",
        action: () => router.push("/admin/roles?action=create"),
        requiredPermission: "create_roles",
      },
      {
        id: "logout",
        category: "Actions",
        title: "Logout",
        shortcut: "L",
        action: () => router.push("/auth/logout"),
      },

      // Settings commands
      {
        id: "toggle-theme",
        category: "Settings",
        title: "Toggle Dark Mode",
        shortcut: "T D",
        action: () => document.documentElement.classList.toggle("dark"),
      },
      {
        id: "my-profile",
        category: "Settings",
        title: "My Profile",
        shortcut: "M P",
        action: () => router.push("/profile"),
      },
    ],
    [router],
  )

  // Filter commands based on permissions
  const filteredCommands = useMemo(() => {
    return commands.filter((command) => {
      if (!command.requiredPermission) return true
      return useHasPermission(command.requiredPermission)
    })
  }, [commands])

  // Filter commands based on search query
  const searchResults = useMemo(() => {
    if (!query) return filteredCommands

    const searchTerms = query.toLowerCase().split(" ")
    return filteredCommands.filter((command) =>
      searchTerms.every(
        (term) =>
          command.title.toLowerCase().includes(term) ||
          command.category.toLowerCase().includes(term) ||
          command.shortcut?.toLowerCase().includes(term),
      ),
    )
  }, [filteredCommands, query])

  // Group commands by category
  const groupedCommands = useMemo(() => {
    return searchResults.reduce(
      (acc, command) => {
        ;(acc[command.category] = acc[command.category] || []).push(command)
        return acc
      },
      {} as Record<string, Command[]>,
    )
  }, [searchResults])

  // Keyboard shortcut handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Toggle command palette
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }

      // Execute shortcut if Command Bar is closed
      if (!open && e.altKey) {
        const shortcutPressed = `${e.key}`
        const matchingCommand = filteredCommands.find(
          (command) =>
            command.shortcut?.split(" ")[command.shortcut.split(" ").length - 1].toLowerCase() ===
            shortcutPressed.toLowerCase(),
        )

        if (matchingCommand) {
          e.preventDefault()
          matchingCommand.action()
        }
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, filteredCommands])

  const executeCommand = useCallback((command: Command) => {
    command.action()
    setOpen(false)
  }, [])

  return (
    <>
      <button
        className="fixed bottom-4 left-4 z-10 p-2 bg-white rounded-full shadow-md text-gray-500 hover:text-gray-700"
        onClick={() => setOpen(true)}
        aria-label="Open Command Bar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M3 3a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm1 4h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8a1 1 0 011-1zm0 4h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <Transition show={open} as={Fragment}>
        <Dialog onClose={() => setOpen(false)} className="fixed inset-0 z-50 overflow-y-auto p-4 pt-[20vh]">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500/75" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Combobox
              as="div"
              className="mx-auto max-w-xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5 transition-all"
              onChange={(command: Command) => executeCommand(command)}
            >
              <div className="relative">
                <svg
                  className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
                <Combobox.Input
                  className="h-12 w-full border-0 bg-transparent pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:ring-0 sm:text-sm"
                  placeholder="Search commands..."
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              {Object.entries(groupedCommands).length > 0 ? (
                <Combobox.Options static className="max-h-72 scroll-py-2 overflow-y-auto py-2 text-sm text-gray-800">
                  {Object.entries(groupedCommands).map(([category, commands]) => (
                    <div key={category}>
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500">{category}</div>
                      {commands.map((command) => (
                        <Combobox.Option
                          key={command.id}
                          value={command}
                          className={({ active }) =>
                            `px-4 py-2 cursor-default flex items-center justify-between ${
                              active ? "bg-westernPurple text-white" : ""
                            }`
                          }
                        >
                          {({ active }) => (
                            <>
                              <span>{command.title}</span>
                              {command.shortcut && (
                                <span className={`text-xs ${active ? "text-white/70" : "text-gray-400"}`}>
                                  {command.shortcut}
                                </span>
                              )}
                            </>
                          )}
                        </Combobox.Option>
                      ))}
                    </div>
                  ))}
                </Combobox.Options>
              ) : (
                <div className="py-14 px-6 text-center sm:px-14">
                  <svg
                    className="mx-auto h-6 w-6 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <p className="mt-4 text-sm text-gray-500">No commands found for "{query}"</p>
                </div>
              )}
            </Combobox>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  )
}

