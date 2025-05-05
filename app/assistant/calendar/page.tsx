"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, ChevronLeft, ChevronRight, MoreHorizontal, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"

// Mock calendar data
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

interface CalendarEvent {
  id: string
  title: string
  date: Date
  startTime: string
  endTime: string
  description: string
  location: string
  color: string
}

// Generate some mock events
const generateMockEvents = (): CalendarEvent[] => {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  return [
    {
      id: "1",
      title: "Team Meeting",
      date: new Date(year, month, today.getDate() + 1),
      startTime: "10:00",
      endTime: "11:00",
      description: "Weekly team sync to discuss project progress",
      location: "Conference Room A",
      color: "#4f46e5",
    },
    {
      id: "2",
      title: "Lunch with Alex",
      date: new Date(year, month, today.getDate()),
      startTime: "12:30",
      endTime: "13:30",
      description: "Discuss partnership opportunities",
      location: "Cafe Nero",
      color: "#16a34a",
    },
    {
      id: "3",
      title: "Product Demo",
      date: new Date(year, month, today.getDate() + 2),
      startTime: "15:00",
      endTime: "16:00",
      description: "Present new features to the client",
      location: "Virtual - Zoom",
      color: "#ea580c",
    },
    {
      id: "4",
      title: "Dentist Appointment",
      date: new Date(year, month, today.getDate() + 5),
      startTime: "09:00",
      endTime: "10:00",
      description: "Regular checkup",
      location: "Dental Clinic",
      color: "#be123c",
    },
  ]
}

export default function CalendarPage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>(generateMockEvents())
  const [isAddingEvent, setIsAddingEvent] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [newEvent, setNewEvent] = useState<Omit<CalendarEvent, "id">>({
    title: "",
    date: new Date(),
    startTime: "09:00",
    endTime: "10:00",
    description: "",
    location: "",
    color: "#4f46e5",
  })

  // Get calendar grid data
  const getCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // First day of the month
    const firstDay = new Date(year, month, 1)
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0)

    // Get the day of the week for the first day (0-6, where 0 is Sunday)
    const firstDayOfWeek = firstDay.getDay()

    // Calculate days from previous month to show
    const daysFromPrevMonth = firstDayOfWeek

    // Calculate total days to show (previous month days + current month days)
    const totalDays = daysFromPrevMonth + lastDay.getDate()

    // Calculate rows needed (ceil to ensure we have enough rows)
    const rows = Math.ceil(totalDays / 7)

    // Generate calendar days
    const calendarDays: (Date | null)[] = []

    // Add days from previous month
    const prevMonth = new Date(year, month, 0)
    const prevMonthDays = prevMonth.getDate()

    for (let i = prevMonthDays - daysFromPrevMonth + 1; i <= prevMonthDays; i++) {
      calendarDays.push(new Date(year, month - 1, i))
    }

    // Add days from current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      calendarDays.push(new Date(year, month, i))
    }

    // Add days from next month to fill the grid
    const remainingDays = rows * 7 - calendarDays.length

    for (let i = 1; i <= remainingDays; i++) {
      calendarDays.push(new Date(year, month + 1, i))
    }

    return calendarDays
  }

  // Check if a date has events
  const getEventsForDate = (date: Date) => {
    return events.filter(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear(),
    )
  }

  // Navigate to previous month
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Handle adding a new event
  const handleAddEvent = () => {
    if (!newEvent.title) {
      toast({
        title: "Missing information",
        description: "Please provide an event title.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    const id = Date.now().toString()
    setEvents([...events, { ...newEvent, id }])
    setIsAddingEvent(false)

    // Reset form
    setNewEvent({
      title: "",
      date: new Date(),
      startTime: "09:00",
      endTime: "10:00",
      description: "",
      location: "",
      color: "#4f46e5",
    })

    toast({
      title: "Event added",
      description: `"${newEvent.title}" has been added to your calendar.`,
      duration: 3000,
    })
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  // Check if date is in current month
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/assistant")}
              className="mr-2 hover:bg-zinc-800/50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Calendar</h1>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50"
            >
              Today
            </Button>

            <Dialog open={isAddingEvent} onOpenChange={setIsAddingEvent}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                <DialogHeader>
                  <DialogTitle>Add New Event</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="event-title">Event Title</Label>
                    <Input
                      id="event-title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      placeholder="Meeting with team"
                      className="bg-zinc-800/50 border-zinc-700 focus:border-white/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={newEvent.date.toISOString().split("T")[0]}
                        onChange={(e) =>
                          setNewEvent({
                            ...newEvent,
                            date: new Date(e.target.value),
                          })
                        }
                        className="bg-zinc-800/50 border-zinc-700 focus:border-white/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Color</Label>
                      <Select
                        value={newEvent.color}
                        onValueChange={(value) => setNewEvent({ ...newEvent, color: value })}
                      >
                        <SelectTrigger className="bg-zinc-800/50 border-zinc-700 focus:border-white/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800">
                          <SelectItem value="#4f46e5">Blue</SelectItem>
                          <SelectItem value="#16a34a">Green</SelectItem>
                          <SelectItem value="#ea580c">Orange</SelectItem>
                          <SelectItem value="#be123c">Red</SelectItem>
                          <SelectItem value="#7e22ce">Purple</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={newEvent.startTime}
                        onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                        className="bg-zinc-800/50 border-zinc-700 focus:border-white/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        value={newEvent.endTime}
                        onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                        className="bg-zinc-800/50 border-zinc-700 focus:border-white/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      placeholder="Conference Room A"
                      className="bg-zinc-800/50 border-zinc-700 focus:border-white/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      placeholder="Event details..."
                      className="bg-zinc-800/50 border-zinc-700 focus:border-white/50 min-h-[80px]"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingEvent(false)}
                      className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddEvent}>Add Event</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Calendar navigation */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevMonth}
              className="h-8 w-8 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextMonth}
              className="h-8 w-8 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="bg-zinc-900/30 backdrop-blur-sm rounded-lg border border-zinc-800/50 overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-zinc-800/50">
            {DAYS.map((day) => (
              <div key={day} className="py-2 text-center text-sm font-medium text-gray-400">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7">
            {getCalendarDays().map((date, index) => {
              if (!date) return <div key={index} className="h-24 p-1 border-b border-r border-zinc-800/50" />

              const dateEvents = getEventsForDate(date)
              const isCurrentMonthDay = isCurrentMonth(date)

              return (
                <div
                  key={index}
                  className={`h-24 p-1 border-b border-r border-zinc-800/50 relative ${
                    !isCurrentMonthDay ? "opacity-40" : ""
                  }`}
                  onClick={() => {
                    setSelectedDate(date)
                    setNewEvent({
                      ...newEvent,
                      date: date,
                    })
                    setIsAddingEvent(true)
                  }}
                >
                  <div
                    className={`
                    w-6 h-6 flex items-center justify-center rounded-full text-sm
                    ${isToday(date) ? "bg-white text-black" : ""}
                  `}
                  >
                    {date.getDate()}
                  </div>

                  <div className="mt-1 space-y-1 overflow-y-auto max-h-[calc(100%-1.5rem)]">
                    {dateEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className="text-xs px-1 py-0.5 rounded truncate"
                        style={{ backgroundColor: `${event.color}30`, color: event.color }}
                      >
                        {event.startTime} {event.title}
                      </div>
                    ))}

                    {dateEvents.length > 3 && (
                      <div className="text-xs text-gray-400 px-1">+{dateEvents.length - 3} more</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming events */}
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Upcoming Events</h3>

          <div className="space-y-3">
            {events
              .filter((event) => event.date >= new Date())
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .slice(0, 5)
              .map((event) => (
                <div
                  key={event.id}
                  className="p-4 bg-zinc-900/30 backdrop-blur-sm rounded-lg border border-zinc-800/50 flex items-start"
                >
                  <div
                    className="w-12 h-12 rounded-lg flex flex-col items-center justify-center mr-4 flex-shrink-0"
                    style={{ backgroundColor: `${event.color}20`, color: event.color }}
                  >
                    <CalendarIcon className="h-5 w-5 mb-1" />
                    <span className="text-xs font-medium">{event.date.getDate()}</span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-gray-400">
                          {formatDate(event.date)} • {event.startTime} - {event.endTime}
                        </p>
                      </div>

                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>

                    {event.location && <p className="text-sm mt-1">📍 {event.location}</p>}

                    {event.description && <p className="text-sm text-gray-400 mt-2">{event.description}</p>}
                  </div>
                </div>
              ))}

            {events.filter((event) => event.date >= new Date()).length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <p>No upcoming events</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingEvent(true)}
                  className="mt-2 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Event
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
