"use client"

import AdminLayout from "@/components/features/admin/AdminLayout"
import { useState } from "react"

const submissions = [
  {
    id: "sub1",
    student: "Jane Doe",
    title: "Research Brief",
    file: "brief.pdf",
    score: null,
    feedback: "",
  },
  {
    id: "sub2",
    student: "John Smith",
    title: "Case Study",
    file: "case.pdf",
    score: 85,
    feedback: "Solid work!",
  },
]

export default function FacultyReviews() {
  const [subs, setSubs] = useState(submissions)

  const updateFeedback = (id: string, feedback: string, score: number) => {
    setSubs((prev) => prev.map((s) => (s.id === id ? { ...s, feedback, score } : s)))
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">📁 Deliverables Review</h1>

      <ul className="space-y-4 text-white">
        {subs.map((s) => (
          <li key={s.id} className="bg-deepFocus p-4 rounded space-y-2">
            <div className="flex justify-between">
              <div>
                <strong>{s.title}</strong> by {s.student}
              </div>
              <a href={"/uploads/" + s.file} className="underline text-sky-400" target="_blank" rel="noreferrer">
                View
              </a>
            </div>
            <div className="space-y-1">
              <textarea
                placeholder="Feedback..."
                className="text-black p-2 rounded w-full"
                value={s.feedback}
                onChange={(e) => updateFeedback(s.id, e.target.value, s.score || 0)}
              />
              <input
                type="number"
                placeholder="Score"
                className="p-2 text-black rounded w-full"
                value={s.score || ""}
                onChange={(e) => updateFeedback(s.id, s.feedback, Number(e.target.value))}
              />
            </div>
          </li>
        ))}
      </ul>
    </AdminLayout>
  )
}

