"use client"

import AdminLayout from "@/components/features/admin/AdminLayout"
import { useHasPermission } from "@/hooks/utils/useHasPermission"
import { useState } from "react"

interface Task {
  id: string
  title: string
  dueDate: string
  status: "pending" | "in_progress" | "completed"
}

interface Student {
  id: string
  name: string
  program: string
  status: string
}

export default function FacultyDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "students" | "tasks">("overview")
  const canViewStudents = useHasPermission("view_students")
  const canManageTasks = useHasPermission("manage_tasks")

  // Mock data - in a real app, this would come from an API
  const tasks: Task[] = [
    {
      id: "1",
      title: "Review Thesis Draft",
      dueDate: "2024-04-15",
      status: "pending",
    },
    {
      id: "2",
      title: "Grade Assignments",
      dueDate: "2024-04-10",
      status: "in_progress",
    },
    {
      id: "3",
      title: "Department Meeting",
      dueDate: "2024-04-20",
      status: "completed",
    },
  ]

  const students: Student[] = [
    {
      id: "1",
      name: "John Doe",
      program: "Computer Science",
      status: "Active",
    },
    {
      id: "2",
      name: "Jane Smith",
      program: "Data Science",
      status: "On Leave",
    },
    { id: "3", name: "Bob Wilson", program: "Cybersecurity", status: "Active" },
  ]

  const stats = {
    activeStudents: 45,
    pendingTasks: 12,
    upcomingMeetings: 3,
    recentSubmissions: 8,
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">📋 Faculty Dashboard</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 rounded ${activeTab === "overview" ? "bg-indigo-600 text-white" : "bg-gray-100"}`}
            >
              Overview
            </button>
            {canViewStudents && (
              <button
                onClick={() => setActiveTab("students")}
                className={`px-4 py-2 rounded ${activeTab === "students" ? "bg-indigo-600 text-white" : "bg-gray-100"}`}
              >
                Students
              </button>
            )}
            {canManageTasks && (
              <button
                onClick={() => setActiveTab("tasks")}
                className={`px-4 py-2 rounded ${activeTab === "tasks" ? "bg-indigo-600 text-white" : "bg-gray-100"}`}
              >
                Tasks
              </button>
            )}
          </div>
        </div>

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Active Students</h3>
              <p className="text-3xl text-indigo-600">{stats.activeStudents}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Pending Tasks</h3>
              <p className="text-3xl text-yellow-500">{stats.pendingTasks}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Upcoming Meetings</h3>
              <p className="text-3xl text-green-500">{stats.upcomingMeetings}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Recent Submissions</h3>
              <p className="text-3xl text-blue-500">{stats.recentSubmissions}</p>
            </div>
          </div>
        )}

        {activeTab === "students" && canViewStudents && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{student.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{student.program}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          student.status === "Active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "tasks" && canManageTasks && (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{task.title}</h3>
                  <p className="text-sm text-gray-500">Due: {task.dueDate}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    task.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : task.status === "in_progress"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {task.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

