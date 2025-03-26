import AdminLayout from "@/components/features/admin/AdminLayout"

export default function OrgDashboard() {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">📊 Organization Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-deepFocus p-4 rounded text-white">
          <div className="text-lg font-bold">🎓 Students</div>
          <div className="text-3xl">12</div>
        </div>
        <div className="bg-deepFocus p-4 rounded text-white">
          <div className="text-lg font-bold">📅 Interviews</div>
          <div className="text-3xl">5 Scheduled</div>
        </div>
        <div className="bg-deepFocus p-4 rounded text-white">
          <div className="text-lg font-bold">📁 Deliverables</div>
          <div className="text-3xl">8 Pending</div>
        </div>
      </div>

      <div className="bg-white rounded p-4 text-black">
        <h2 className="font-bold text-lg mb-2">🕒 Recent Activity</h2>
        <ul className="text-sm space-y-1">
          <li>John Doe submitted a resume.</li>
          <li>Interview with Jane scheduled for 10:00 AM.</li>
          <li>Reviewed final report from Sam Lee.</li>
        </ul>
      </div>
    </AdminLayout>
  )
}

