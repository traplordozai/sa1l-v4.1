"use client"

import AdminLayout from "@/components/features/admin/AdminLayout"
import {
  DragDropContext,
  Draggable,
  type DraggableProvided,
  Droppable,
  type DroppableProvided,
} from "@hello-pangea/dnd"
import { useState } from "react"

const initial = [
  {
    id: "1",
    title: "Submit Draft",
    due: "2025-04-10",
    status: "Pending",
    reflection: "",
  },
  {
    id: "2",
    title: "Final Presentation",
    due: "2025-05-15",
    status: "Complete",
    reflection: "It went well.",
  },
]

export default function FacultySupervisionPage() {
  const [milestones, setMilestones] = useState(initial)

  const onDragEnd = (result: any) => {
    if (!result.destination) return
    const items = Array.from(milestones)
    const [reordered] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reordered)
    setMilestones(items)
  }

  const update = (id: string, updates: any) =>
    setMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)))

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">🧭 Milestones & Reflections</h1>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="milestones">
          {(provided: DroppableProvided) => (
            <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-4 text-white">
              {milestones.map((m, i) => (
                <Draggable key={m.id} draggableId={m.id} index={i}>
                  {(provided: DraggableProvided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="bg-deepFocus p-4 rounded space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <strong>{m.title}</strong>
                          <div className="text-xs text-gray-300">Due: {m.due}</div>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            m.status === "Complete" ? "bg-green-600" : "bg-yellow-500"
                          }`}
                        >
                          {m.status}
                        </span>
                      </div>
                      <textarea
                        className="text-black p-2 rounded w-full"
                        placeholder="Student reflection..."
                        value={m.reflection}
                        onChange={(e) => update(m.id, { reflection: e.target.value })}
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={() => update(m.id, { status: "Complete" })}
                          className="px-3 py-1 bg-westernPurple text-white rounded"
                        >
                          Mark Complete
                        </button>
                      </div>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </AdminLayout>
  )
}

