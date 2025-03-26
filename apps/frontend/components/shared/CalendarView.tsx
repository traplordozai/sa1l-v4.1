"use client"

// File: apps/frontend/components/shared/CalendarView.tsx
import { cn } from "@/lib/utils"
import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns"
import { useCallback, useState } from "react"
import Button from "../ui/Button"

interface Event {
  id: string
  title: string
  start: Date
  end: Date
  status?: "confirmed" | "pending" | "cancelled"
  colorClass?: string
}

interface CalendarViewProps {
  events?: Event[]
  onEventClick?: (event: Event) => void
  onDateClick?: (date: Date) => void
  onEventCreate?: (start: Date, end: Date) => void
  view?: "month" | "week" | "day"
  initialDate?: Date
  className?: string
}

export default function CalendarView({
  events = [],
  onEventClick,
  onDateClick,
  onEventCreate,
  view: initialView = "month",
  initialDate = new Date(),
  className,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(initialDate)
  const [view, setView] = useState<"month" | "week" | "day">(initialView)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Handle navigation
  const prevPeriod = useCallback(() => {
    if (view === "month") {
      setCurrentDate(subMonths(currentDate, 1))
    } else if (view === "week") {
      setCurrentDate(addDays(currentDate, -7))
    } else if (view === "day") {
      setCurrentDate(addDays(currentDate, -1))
    }
  }, [currentDate, view])

  const nextPeriod = useCallback(() => {
    if (view === "month") {
      setCurrentDate(addMonths(currentDate, 1))
    } else if (view === "week") {
      setCurrentDate(addDays(currentDate, 7))
    } else if (view === "day") {
      setCurrentDate(addDays(currentDate, 1))
    }
  }, [currentDate, view])

  const goToToday = useCallback(() => {
    setCurrentDate(new Date())
  }, [])

  // Event handling
  const handleDateClick = useCallback(
    (date: Date) => {
      setSelectedDate(date)
      if (onDateClick) {
        onDateClick(date)
      }
    },
    [onDateClick],
  )

  const handleEventClick = useCallback(
    (event: Event) => {
      if (onEventClick) {
        onEventClick(event)
      }
    },
    [onEventClick],
  )

  // Month view rendering
  const renderMonthView = useCallback(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)

    const dateFormat = "d"
    const rows = []

    let days = []
    let day = startDate
    let formattedDate = ""

    // Header with weekday names
    const weekdays = []
    const dayFormat = "EEE"
    for (let i = 0; i < 7; i++) {
      weekdays.push(
        <div key={`header-${i}`} className="text-center font-medium py-2">
          {format(addDays(startOfWeek(new Date()), i), dayFormat)}
        </div>,
      )
    }

    // Calendar days
    while (day <= monthEnd) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat)
        const cloneDay = day
        const dayEvents = events.filter((event) => isSameDay(event.start, cloneDay))

        days.push(
          <div
            key={day.toString()}
            className={cn(
              "min-h-[80px] border p-1",
              !isSameMonth(day, monthStart) && "bg-gray-100 text-gray-400",
              isSameDay(day, new Date()) && "bg-blue-50 border-blue-200",
              isSameDay(day, selectedDate as Date) && "border-westernPurple border-2",
              "cursor-pointer hover:bg-gray-50",
            )}
            onClick={() => handleDateClick(cloneDay)}
          >
            <div className="text-right p-1">{formattedDate}</div>
            <div className="overflow-y-auto max-h-[60px]">
              {dayEvents.map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    "text-xs p-1 mb-1 rounded truncate",
                    event.colorClass || "bg-westernPurple text-white",
                    event.status === "cancelled" && "opacity-50 line-through",
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEventClick(event)
                  }}
                >
                  {event.title}
                </div>
              ))}
            </div>
          </div>,
        )
        day = addDays(day, 1)
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>,
      )
      days = []
    }

    return (
      <div>
        <div className="grid grid-cols-7 border-b">{weekdays}</div>
        {rows}
      </div>
    )
  }, [currentDate, events, selectedDate, handleDateClick, handleEventClick])

  // Week view rendering
  const renderWeekView = useCallback(() => {
    const weekStart = startOfWeek(currentDate)
    const dateFormat = "EEE d"
    const days = []
    const timeSlots = []

    // Create time slots (hourly from 8am to 8pm)
    for (let hour = 8; hour < 20; hour++) {
      timeSlots.push(
        <div key={`time-${hour}`} className="text-right pr-2 py-4 text-sm text-gray-500">
          {hour > 12 ? `${hour - 12}pm` : hour === 12 ? "12pm" : `${hour}am`}
        </div>,
      )
    }

    // Create days of the week
    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i)
      const dayEvents = events.filter((event) => isSameDay(event.start, day))

      days.push(
        <div key={`day-${i}`} className="flex flex-col">
          <div
            className={cn(
              "p-2 text-center border-b font-medium",
              isSameDay(day, new Date()) && "bg-blue-50",
              isSameDay(day, selectedDate as Date) && "border-westernPurple border-b-2",
            )}
            onClick={() => handleDateClick(day)}
          >
            {format(day, dateFormat)}
          </div>
          <div className="flex-1 relative">
            {dayEvents.map((event) => {
              const startHour = event.start.getHours() + event.start.getMinutes() / 60
              const endHour = event.end.getHours() + event.end.getMinutes() / 60
              const top = ((startHour - 8) / 12) * 100 // 12 hours displayed (8am to 8pm)
              const height = ((endHour - startHour) / 12) * 100

              return (
                <div
                  key={event.id}
                  className={cn(
                    "absolute left-0 right-0 mx-1 p-1 text-xs rounded overflow-hidden",
                    event.colorClass || "bg-westernPurple text-white",
                    event.status === "cancelled" && "opacity-50 line-through",
                  )}
                  style={{
                    top: `${top}%`,
                    height: `${height}%`,
                    minHeight: "20px",
                  }}
                  onClick={() => handleEventClick(event)}
                >
                  {event.title}
                </div>
              )
            })}
            {/* Time slots dividers */}
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={`divider-${i}`}
                className="absolute w-full border-t border-gray-100"
                style={{ top: `${(i / 12) * 100}%` }}
              />
            ))}
          </div>
        </div>,
      )
    }

    return (
      <div className="flex h-[600px]">
        <div className="w-16 pt-10 border-r">{timeSlots}</div>
        <div className="grid grid-cols-7 flex-1">{days}</div>
      </div>
    )
  }, [currentDate, events, selectedDate, handleDateClick, handleEventClick])

  // Day view rendering
  const renderDayView = useCallback(() => {
    const dayEvents = events.filter((event) => isSameDay(event.start, currentDate))
    const dateFormat = "EEEE, MMMM d"
    const timeSlots = []

    // Create time slots (hourly from 8am to 8pm)
    for (let hour = 8; hour < 20; hour++) {
      const hourEvents = dayEvents.filter((event) => {
        const eventHour = event.start.getHours()
        return eventHour === hour
      })

      timeSlots.push(
        <div key={`hour-${hour}`} className="flex border-t">
          <div className="w-16 text-right pr-2 py-4 text-sm text-gray-500">
            {hour > 12 ? `${hour - 12}pm` : hour === 12 ? "12pm" : `${hour}am`}
          </div>
          <div className="flex-1 py-2 min-h-[60px]">
            {hourEvents.map((event) => (
              <div
                key={event.id}
                className={cn(
                  "p-2 mb-1 rounded",
                  event.colorClass || "bg-westernPurple text-white",
                  event.status === "cancelled" && "opacity-50 line-through",
                )}
                onClick={() => handleEventClick(event)}
              >
                <div className="font-medium">{event.title}</div>
                <div className="text-xs">
                  {format(event.start, "h:mm a")} - {format(event.end, "h:mm a")}
                </div>
              </div>
            ))}
          </div>
        </div>,
      )
    }

    return (
      <div>
        <div className="text-xl font-medium py-4 text-center">{format(currentDate, dateFormat)}</div>
        {timeSlots}
      </div>
    )
  }, [currentDate, events, handleEventClick])

  // Render appropriate view
  const renderView = useCallback(() => {
    switch (view) {
      case "month":
        return renderMonthView()
      case "week":
        return renderWeekView()
      case "day":
        return renderDayView()
      default:
        return renderMonthView()
    }
  }, [view, renderMonthView, renderWeekView, renderDayView])

  return (
    <div className={cn("bg-white rounded-lg shadow", className)}>
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex space-x-4">
          <Button variant="outline" onClick={prevPeriod}>
            ←
          </Button>
          <Button variant="outline" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" onClick={nextPeriod}>
            →
          </Button>
        </div>
        <h2 className="text-xl font-semibold">
          {view === "month" && format(currentDate, "MMMM yyyy")}
          {view === "week" && `Week of ${format(startOfWeek(currentDate), "MMM d")}`}
          {view === "day" && format(currentDate, "MMMM d, yyyy")}
        </h2>
        <div className="flex space-x-2">
          <Button variant={view === "month" ? "primary" : "outline"} size="sm" onClick={() => setView("month")}>
            Month
          </Button>
          <Button variant={view === "week" ? "primary" : "outline"} size="sm" onClick={() => setView("week")}>
            Week
          </Button>
          <Button variant={view === "day" ? "primary" : "outline"} size="sm" onClick={() => setView("day")}>
            Day
          </Button>
        </div>
      </div>
      <div className="p-4">{renderView()}</div>
    </div>
  )
}

