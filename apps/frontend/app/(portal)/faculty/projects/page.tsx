"use client"

import AdminLayout from "@/components/features/admin/AdminLayout"
import { useState } from "react"

const mockProjects = [
  {
    id: "p1",
    title: "Legal Research Platform",
    status: "Active",
    student: "Jane Doe",
  },
  { id: "p2", title: "AI Brief Analyzer", status: "Pending", student: null },
]

export default function FacultyProjectsPage() {
  const [projects, setProjects] = useState(mockProjects)

  const assign = (pid: string, student: string) => {
    setProjects((prev) => prev.map((p) => (p.id === pid ? { ...p, student, status: "Active" } : p)))
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">📈 Projects</h1>

      <ul className="space-y-4 text-white">
        {projects.map((proj) => (
          <li key={proj.id} className="bg-deepFocus p-4 rounded space-y-1">
            <div className="flex justify-between">
              <strong>{proj.title}</strong>
              <span
                className={`text-xs px-2 py-1 rounded ${proj.status === "Active" ? "bg-green-600" : "bg-yellow-500"}`}
              >
                {proj.status}
              </span>
            </div>
            <div className="text-sm">
              Assigned to:{" "}
              {proj.student || (
                <select onChange={(e) => assign(proj.id, e.target.value)} className="text-black ml-1">
                  <option value="">Select</option>
                  <option value="Jane Doe">Jane Doe</option>
                  <option value="John Smith">John Smith</option>
                </select>
              )}
              {proj.student && <span className="ml-1">{proj.student}</span>}
            </div>
          </li>
        ))}
      </ul>
    </AdminLayout>
  )
}

