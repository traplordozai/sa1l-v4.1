"use client"

import AdminLayout from "@/components/features/admin/AdminLayout"

const milestones = [
  {
    title: "Submit Draft",
    due: "2025-04-10",
    status: "Complete",
    reflection: "Research was challenging but rewarding.",
    feedback: "Great start. Focus your conclusion.",
  },
  {
    title: "Final Presentation",
    due: "2025-05-15",
    status: "Pending",
    reflection: "",
    feedback: "",
  },
]

export default function StudentSupervisionPage() {
  const total = milestones.length
  const complete = milestones.filter((m) => m.status === "Complete").length
  const percent = Math.floor((complete / total) * 100)

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">📘 My Milestones</h1>

      <div className="mb-6 text-white">
        <div className="text-sm mb-1">Progress: {percent}%</div>
        <div className="h-3 w-full bg-white/20 rounded">
          <div className="h-full bg-green-500 rounded" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <ul className="space-y-4 text-white">
        {milestones.map((m, i) => (
          <li key={i} className="bg-deepFocus p-4 rounded space-y-2">
            <div className="flex justify-between items-center">
              <strong>{m.title}</strong>
              <span
                className={`text-xs px-2 py-1 rounded ${m.status === "Complete" ? "bg-green-600" : "bg-yellow-500"}`}
              >
                {m.status}
              </span>
            </div>
            <div className="text-xs text-gray-300">Due: {m.due}</div>
            <p className="text-sm mt-2">{m.reflection || "🕒 Reflection pending..."}</p>
            {m.feedback && <p className="text-xs text-sky-300 mt-1 italic">Mentor: “{m.feedback}”</p>}
          </li>
        ))}
      </ul>
    </AdminLayout>
  )
}

