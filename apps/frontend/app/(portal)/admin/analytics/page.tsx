"use client"

import AdminLayout from "../../../../../../../archive13628-pm/apps/frontend/components/features/admin/AdminLayout"
import { useToast } from "../../../../components/ui/Toast"
import { trpc } from "../../../../../../../archive13628-pm/apps/frontend/utils/trpc"

interface VisitData {
  path: string
  _count: number
}

export default function AdminAnalyticsPage() {
  const { showToast } = useToast()
  const { data: visits, isLoading, error } = trpc.analytics.visitsByPath.useQuery<VisitData[]>()

  if (error) {
    showToast("Error loading analytics", "error")
  }

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-4">📈 Page Visits</h1>
      {isLoading && (
        <div className="animate-spin border-t-2 border-white border-solid h-6 w-6 rounded-full mx-auto my-4" />
      )}
      {error && <p className="text-red-500">Error loading analytics</p>}

      <ul className="space-y-2">
        {visits?.map((v: VisitData) => (
          <li key={v.path} className="bg-deepFocus p-4 text-white rounded">
            <strong>{v.path}</strong>: {v._count}
          </li>
        ))}
      </ul>
    </AdminLayout>
  )
}

