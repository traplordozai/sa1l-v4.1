"use client"

import AdminLayout from "@/components/features/admin/AdminLayout"
import { useState } from "react"

export default function StudentDocumentsPage() {
  const [uploads, setUploads] = useState<any[]>([])

  const handleUpload = (e: any) => {
    const uploaded = Array.from(e.target.files).map((file: any) => ({
      name: file.name,
      version: 1,
      status: "Pending",
      uploadedAt: new Date().toLocaleString(),
    }))
    setUploads((prev) => [...uploaded, ...prev])
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">📂 My Documents</h1>
      <input type="file" multiple onChange={handleUpload} className="mb-4" />

      <ul className="space-y-2 text-white">
        {uploads.map((doc, i) => (
          <li key={i} className="bg-deepFocus p-4 rounded space-y-1">
            <div className="flex justify-between items-center">
              <strong>{doc.name}</strong>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  doc.status === "Approved"
                    ? "bg-green-600"
                    : doc.status === "Rejected"
                      ? "bg-red-600"
                      : "bg-yellow-500"
                }`}
              >
                {doc.status}
              </span>
            </div>
            <div className="text-xs text-gray-300">Version: {doc.version}</div>
            <div className="text-xs text-gray-300">Uploaded: {doc.uploadedAt}</div>
          </li>
        ))}
      </ul>
    </AdminLayout>
  )
}

