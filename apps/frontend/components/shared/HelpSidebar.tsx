// File: apps/frontend/components/HelpSidebar.tsx
"use client"

import { QuestionMarkCircleIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { useState } from "react"

export default function HelpSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 right-4 z-40 bg-westernPurple text-white p-3 rounded-full shadow-lg hover:bg-orchid transition-colors"
        aria-label={open ? "Close help" : "Open help"}
      >
        <QuestionMarkCircleIcon className="h-6 w-6" />
      </button>

      {open && (
        <aside className="fixed top-0 right-0 w-80 h-full bg-white text-black z-50 p-4 shadow-lg overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">Help & Resources</h2>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-full hover:bg-gray-100"
              aria-label="Close help sidebar"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <section>
              <h3 className="font-medium text-lg mb-2">Quick Help</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use the sidebar to navigate between sections</li>
                <li>
                  Press <kbd className="px-2 py-0.5 bg-gray-100 rounded">Cmd+K</kbd> to open the command bar
                </li>
                <li>Click on items to view details or edit</li>
                <li>Use bulk actions to work with multiple items</li>
              </ul>
            </section>

            <section>
              <h3 className="font-medium text-lg mb-2">FAQ</h3>
              <div className="space-y-2">
                <details className="bg-gray-50 p-2 rounded">
                  <summary className="cursor-pointer font-medium">How do I create a new user?</summary>
                  <p className="mt-2 pl-2 text-sm">
                    Navigate to the Users section and click the "New User" button. Fill out the form with the required
                    information and click "Create User".
                  </p>
                </details>

                <details className="bg-gray-50 p-2 rounded">
                  <summary className="cursor-pointer font-medium">How do permissions work?</summary>
                  <p className="mt-2 pl-2 text-sm">
                    Permissions are assigned to roles, and users are assigned roles. This allows for granular access
                    control across the application.
                  </p>
                </details>

                <details className="bg-gray-50 p-2 rounded">
                  <summary className="cursor-pointer font-medium">Can I customize the dashboard?</summary>
                  <p className="mt-2 pl-2 text-sm">
                    Currently, dashboard customization is not available. This feature is planned for a future release.
                  </p>
                </details>
              </div>
            </section>

            <section>
              <h3 className="font-medium text-lg mb-2">Contact Support</h3>
              <p className="text-sm">
                Need more help? Contact our support team at{" "}
                <a href="mailto:support@sail.example.com" className="text-westernPurple hover:underline">
                  support@sail.example.com
                </a>
                .
              </p>
            </section>
          </div>
        </aside>
      )}
    </>
  )
}

