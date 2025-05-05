"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Check, Clock, Calendar, Tag, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { toast } from "@/hooks/use-toast"

interface Task {
  id: string
  title: string
  description: string
  dueDate: Date | null
  priority: "low" | "medium" | "high"
  completed: boolean
  tags: string[]
  createdAt: Date
}

// Generate mock tasks
const generateMockTasks = (): Task[] => {
  return [
    {
      id: "1",
      title: "Prepare presentation for client meeting",
      description: "Create slides for the quarterly review meeting",
      dueDate: new Date(Date.now() + 86400000 * 2), // 2 days from now
      priority: "high",
      completed: false,
      tags: ["work", "client"],
      createdAt: new Date(),
    },
    {
      id: "2",
      title: "Buy groceries",
      description: "Milk, eggs, bread, vegetables",
      dueDate: new Date(Date.now() + 86400000), // 1 day from now
      priority: "medium",
      completed: false,
      tags: ["personal", "shopping"],
      createdAt: new Date(Date.now() - 86400000), // 1 day ago
    },
    {
      id: "3",
      title: "Schedule dentist appointment",
      description: "Call Dr. Smith's office for a checkup",
      dueDate: new Date(Date.now() + 86400000 * 5), // 5 days from now
      priority: "low",
      completed: false,
      tags: ["health", "personal"],
      createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
    },
    {
      id: "4",
      title: "Review project proposal",
      description: "Go through the draft and provide feedback",
      dueDate: null,
      priority: "medium",
      completed: true,
      tags: ["work"],
      createdAt: new Date(Date.now() - 86400000 * 3), // 3 days ago
    },
  ]
}

export default function TasksPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>(generateMockTasks())
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [newTask, setNewTask] = useState<Omit<Task, "id" | "completed" | "createdAt">>({
    title: "",
    description: "",
    dueDate: null,
    priority: "medium",
    tags: [],
  })
  const [newTag, setNewTag] = useState("")

  // Filter tasks based on active tab
  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "all") return true
    if (activeTab === "completed") return task.completed
    if (activeTab === "pending") return !task.completed
    if (activeTab === "high") return task.priority === "high" && !task.completed
    return false
  })

  // Handle adding a new task
  const handleAddTask = () => {
    if (!newTask.title) {
      toast({
        title: "Missing information",
        description: "Please provide a task title.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    const id = Date.now().toString()
    setTasks([
      ...tasks,
      {
        ...newTask,
        id,
        completed: false,
        createdAt: new Date(),
      },
    ])
    setIsAddingTask(false)

    // Reset form
    setNewTask({
      title: "",
      description: "",
      dueDate: null,
      priority: "medium",
      tags: [],
    })

    toast({
      title: "Task added",
      description: `"${newTask.title}" has been added to your tasks.`,
      duration: 3000,
    })
  }

  // Toggle task completion
  const toggleTaskCompletion = (id: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))

    const task = tasks.find((t) => t.id === id)
    if (task) {
      toast({
        title: task.completed ? "Task marked as pending" : "Task completed",
        description: `"${task.title}" has been ${task.completed ? "marked as pending" : "marked as completed"}.`,
        duration: 2000,
      })
    }
  }

  // Delete task
  const deleteTask = (id: string) => {
    const task = tasks.find((t) => t.id === id)
    setTasks(tasks.filter((task) => task.id !== id))

    if (task) {
      toast({
        title: "Task deleted",
        description: `"${task.title}" has been deleted.`,
        duration: 3000,
      })
    }
  }

  // Add tag to new task
  const addTag = () => {
    if (!newTag.trim()) return
    if (newTask.tags.includes(newTag.trim())) {
      setNewTag("")
      return
    }

    setNewTask({
      ...newTask,
      tags: [...newTask.tags, newTag.trim()],
    })
    setNewTag("")
  }

  // Remove tag from new task
  const removeTag = (tag: string) => {
    setNewTask({
      ...newTask,
      tags: newTask.tags.filter((t) => t !== tag),
    })
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500 bg-red-500/10"
      case "medium":
        return "text-yellow-500 bg-yellow-500/10"
      case "low":
        return "text-green-500 bg-green-500/10"
      default:
        return "text-blue-500 bg-blue-500/10"
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-6">
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
            <h1 className="text-2xl font-bold">Tasks</h1>
          </div>

          <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="task-title">Task Title</Label>
                  <Input
                    id="task-title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="What needs to be done?"
                    className="bg-zinc-800/50 border-zinc-700 focus:border-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Add details about this task..."
                    className="bg-zinc-800/50 border-zinc-700 focus:border-white/50 min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input
                      type="date"
                      value={newTask.dueDate ? newTask.dueDate.toISOString().split("T")[0] : ""}
                      onChange={(e) =>
                        setNewTask({
                          ...newTask,
                          dueDate: e.target.value ? new Date(e.target.value) : null,
                        })
                      }
                      className="bg-zinc-800/50 border-zinc-700 focus:border-white/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value: "low" | "medium" | "high") => setNewTask({ ...newTask, priority: value })}
                    >
                      <SelectTrigger className="bg-zinc-800/50 border-zinc-700 focus:border-white/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag"
                      className="bg-zinc-800/50 border-zinc-700 focus:border-white/50 rounded-r-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addTag()
                        }
                      }}
                    />
                    <Button onClick={addTag} className="rounded-l-none">
                      Add
                    </Button>
                  </div>

                  {newTask.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newTask.tags.map((tag) => (
                        <div key={tag} className="bg-zinc-800 text-xs px-2 py-1 rounded-full flex items-center">
                          {tag}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeTag(tag)}
                            className="h-4 w-4 ml-1 hover:bg-zinc-700"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingTask(false)}
                    className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddTask}>Add Task</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
          <TabsList className="grid w-full grid-cols-4 bg-zinc-900/50 backdrop-blur-sm">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all duration-300"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all duration-300"
            >
              Pending
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all duration-300"
            >
              Completed
            </TabsTrigger>
            <TabsTrigger
              value="high"
              className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all duration-300"
            >
              High Priority
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Task list */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No tasks found</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingTask(true)}
                className="mt-2 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Task
              </Button>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 bg-zinc-900/30 backdrop-blur-sm rounded-lg border border-zinc-800/50 ${
                  task.completed ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleTaskCompletion(task.id)}
                    className={`h-6 w-6 rounded-full mr-3 flex-shrink-0 ${
                      task.completed
                        ? "bg-green-500/20 border-green-500/50 text-green-500"
                        : "bg-zinc-800/50 border-zinc-700"
                    }`}
                  >
                    {task.completed && <Check className="h-3 w-3" />}
                  </Button>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`font-medium ${task.completed ? "line-through text-gray-400" : ""}`}>
                          {task.title}
                        </h3>

                        {task.description && <p className="text-sm text-gray-400 mt-1">{task.description}</p>}
                      </div>

                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteTask(task.id)}
                          className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center mt-3 gap-2">
                      {task.dueDate && (
                        <div className="flex items-center text-xs bg-zinc-800/70 px-2 py-1 rounded-full">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(task.dueDate)}
                        </div>
                      )}

                      <div
                        className={`flex items-center text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </div>

                      {task.tags.map((tag) => (
                        <div key={tag} className="flex items-center text-xs bg-zinc-800/70 px-2 py-1 rounded-full">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
