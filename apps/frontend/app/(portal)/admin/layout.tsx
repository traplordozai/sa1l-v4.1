import { Shell } from "@/components/layout/Shell"
import "@/styles/tailwind.css"
import type { ReactNode } from "react"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <Shell>{children}</Shell>
}

