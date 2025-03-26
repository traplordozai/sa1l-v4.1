import AdminLayout from "@/components/features/admin/AdminLayout"

export default function OrgScheduler() {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">📅 Interview Scheduler</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-deepFocus p-4 rounded text-white">
          <h2 className="text-lg font-bold mb-2">🗓 Calendar View</h2>
          <div className="bg-white text-black rounded p-4 h-64">[Calendar Placeholder]</div>
        </div>
        <div className="bg-deepFocus p-4 rounded text-white">
          <h2 className="text-lg font-bold mb-2">⏰ Time Slots</h2>
          <ul className="text-sm space-y-2">
            <li>10:00 AM - Jane Doe</li>
            <li>11:30 AM - Pending</li>
            <li>2:00 PM - Sam Lee</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  )
}

