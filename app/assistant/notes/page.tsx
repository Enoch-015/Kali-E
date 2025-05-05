"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Search, Trash2, Edit, Save, X, Clock, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

// Generate mock notes
const generateMockNotes = (): Note[] => {
  return [
    {
      id: "1",
      title: "Meeting Notes: Project Kickoff",
      content:
        "- Discussed project timeline\n- Assigned roles and responsibilities\n- Set up weekly check-ins\n- Next steps: Create project plan by Friday",
      tags: ["work", "meeting"],
      createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
      updatedAt: new Date(Date.now() - 86400000 * 2),
    },
    {
      id: "2",
      title: "Recipe: Pasta Carbonara",
      content:
        "Ingredients:\n- 200g spaghetti\n- 100g pancetta\n- 2 large eggs\n- 50g pecorino cheese\n- 50g parmesan\n- Freshly ground black pepper\n\nInstructions:\n1. Cook pasta al dente\n2. Fry pancetta until crispy\n3. Mix eggs and cheese in a bowl\n4. Combine everything while pasta is hot",
      tags: ["recipe", "food", "dinner"],
      createdAt: new Date(Date.now() - 86400000 * 5), // 5 days ago
      updatedAt: new Date(Date.now() - 86400000 * 3), // 3 days ago
    },
    {
      id: "3",
      title: "Book Recommendations",
      content:
        "Fiction:\n- The Midnight Library by Matt Haig\n- Project Hail Mary by Andy Weir\n- Klara and the Sun by Kazuo Ishiguro\n\nNon-fiction:\n- Atomic Habits by James Clear\n- Four Thousand Weeks by Oliver Burkeman",
      tags: ["books", "reading"],
      createdAt: new Date(Date.now() - 86400000 * 10), // 10 days ago
      updatedAt: new Date(Date.now() - 86400000 * 10),
    },
    {
      id: "4",
      title: "Gift Ideas",
      content:
        "Mom:\n- Scented candles\n- Cookbook\n- Spa voucher\n\nDad:\n- Wireless headphones\n- Grilling accessories\n- History book\n\nSister:\n- Jewelry\n- Art supplies\n- Concert tickets",
      tags: ["personal", "shopping"],
      createdAt: new Date(Date.now() - 86400000 * 15), // 15 days ago
      updatedAt: new Date(Date.now() - 86400000 * 15),
    },
  ]
}

export default function NotesPage() {
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>(generateMockNotes())
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [newNote, setNewNote] = useState<Omit<Note, "id" | "createdAt" | "updatedAt">>({
    title: "",
    content: "",
    tags: [],
  })
  const [newTag, setNewTag] = useState("")
  const [editedNote, setEditedNote] = useState<Note | null>(null)

  // Filter notes based on search query
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // Handle adding a new note
  const handleAddNote = () => {
    if (!newNote.title) {
      toast({
        title: "Missing information",
        description: "Please provide a note title.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    const now = new Date()
    const id = Date.now().toString()
    const createdNote = {
      ...newNote,
      id,
      createdAt: now,
      updatedAt: now,
    }

    setNotes([createdNote, ...notes])
    setIsAddingNote(false)
    setSelectedNote(createdNote)

    // Reset form
    setNewNote({
      title: "",
      content: "",
      tags: [],
    })

    toast({
      title: "Note created",
      description: `"${newNote.title}" has been created.`,
      duration: 3000,
    })
  }

  // Start editing a note
  const startEditingNote = () => {
    if (selectedNote) {
      setEditedNote({ ...selectedNote })
      setIsEditing(true)
    }
  }

  // Save edited note
  const saveEditedNote = () => {
    if (!editedNote) return

    const updatedNote = {
      ...editedNote,
      updatedAt: new Date(),
    }

    setNotes(notes.map((note) => (note.id === updatedNote.id ? updatedNote : note)))

    setSelectedNote(updatedNote)
    setIsEditing(false)
    setEditedNote(null)

    toast({
      title: "Note updated",
      description: `"${updatedNote.title}" has been updated.`,
      duration: 3000,
    })
  }

  // Delete note
  const deleteNote = (id: string) => {
    const noteToDelete = notes.find((note) => note.id === id)

    setNotes(notes.filter((note) => note.id !== id))

    if (selectedNote?.id === id) {
      setSelectedNote(null)
      setIsEditing(false)
    }

    if (noteToDelete) {
      toast({
        title: "Note deleted",
        description: `"${noteToDelete.title}" has been deleted.`,
        duration: 3000,
      })
    }
  }

  // Add tag to new note
  const addTag = (isForNewNote: boolean) => {
    if (!newTag.trim()) return

    if (isForNewNote) {
      if (newNote.tags.includes(newTag.trim())) {
        setNewTag("")
        return
      }

      setNewNote({
        ...newNote,
        tags: [...newNote.tags, newTag.trim()],
      })
    } else if (editedNote) {
      if (editedNote.tags.includes(newTag.trim())) {
        setNewTag("")
        return
      }

      setEditedNote({
        ...editedNote,
        tags: [...editedNote.tags, newTag.trim()],
      })
    }

    setNewTag("")
  }

  // Remove tag
  const removeTag = (tag: string, isForNewNote: boolean) => {
    if (isForNewNote) {
      setNewNote({
        ...newNote,
        tags: newNote.tags.filter((t) => t !== tag),
      })
    } else if (editedNote) {
      setEditedNote({
        ...editedNote,
        tags: editedNote.tags.filter((t) => t !== tag),
      })
    }
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Get note preview (first few lines)
  const getNotePreview = (content: string) => {
    const lines = content.split("\n").filter((line) => line.trim())
    if (lines.length === 0) return ""

    if (lines.length === 1) {
      return lines[0].length > 100 ? lines[0].substring(0, 100) + "..." : lines[0]
    }

    return lines.slice(0, 2).join("\n") + (lines.length > 2 ? "..." : "")
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
            <h1 className="text-2xl font-bold">Notes</h1>
          </div>

          <Dialog open={isAddingNote} onOpenChange={setIsAddingNote}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New Note
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Note</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="note-title">Title</Label>
                  <Input
                    id="note-title"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    placeholder="Note title"
                    className="bg-zinc-800/50 border-zinc-700 focus:border-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    placeholder="Write your note here..."
                    className="bg-zinc-800/50 border-zinc-700 focus:border-white/50 min-h-[200px]"
                  />
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
                          addTag(true)
                        }
                      }}
                    />
                    <Button onClick={() => addTag(true)} className="rounded-l-none">
                      Add
                    </Button>
                  </div>

                  {newNote.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newNote.tags.map((tag) => (
                        <div key={tag} className="bg-zinc-800 text-xs px-2 py-1 rounded-full flex items-center">
                          {tag}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeTag(tag, true)}
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
                    onClick={() => setIsAddingNote(false)}
                    className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddNote}>Create Note</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Notes list */}
          <div className="w-full md:w-1/3">
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-800/50 border-zinc-700 focus:border-white/50"
              />
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-200px)]">
              {filteredNotes.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>No notes found</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddingNote(true)}
                    className="mt-2 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create Note
                  </Button>
                </div>
              ) : (
                filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    className={`p-4 bg-zinc-900/30 backdrop-blur-sm rounded-lg border cursor-pointer transition-all hover:bg-zinc-800/30 ${
                      selectedNote?.id === note.id ? "border-white/30 bg-zinc-800/30" : "border-zinc-800/50"
                    }`}
                    onClick={() => {
                      setSelectedNote(note)
                      setIsEditing(false)
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{note.title}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNote(note.id)
                        }}
                        className="h-6 w-6 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    <p className="text-sm text-gray-400 mt-1 whitespace-pre-line line-clamp-2">
                      {getNotePreview(note.content)}
                    </p>

                    <div className="flex items-center mt-3 text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(note.updatedAt)}
                    </div>

                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.tags.slice(0, 3).map((tag) => (
                          <div key={tag} className="bg-zinc-800/70 text-xs px-2 py-0.5 rounded-full">
                            {tag}
                          </div>
                        ))}
                        {note.tags.length > 3 && (
                          <div className="bg-zinc-800/70 text-xs px-2 py-0.5 rounded-full">+{note.tags.length - 3}</div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Note detail view */}
          <div className="w-full md:w-2/3 bg-zinc-900/30 backdrop-blur-sm rounded-lg border border-zinc-800/50 p-6">
            {selectedNote ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  {isEditing ? (
                    <Input
                      value={editedNote?.title || ""}
                      onChange={(e) => setEditedNote((prev) => (prev ? { ...prev, title: e.target.value } : null))}
                      className="text-xl font-bold bg-zinc-800/50 border-zinc-700 focus:border-white/50"
                    />
                  ) : (
                    <h2 className="text-xl font-bold">{selectedNote.title}</h2>
                  )}

                  <div className="flex space-x-2">
                    {isEditing ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsEditing(false)
                            setEditedNote(null)
                          }}
                          className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50"
                        >
                          Cancel
                        </Button>
                        <Button size="sm" onClick={saveEditedNote}>
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={startEditingNote}
                        className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center text-sm text-gray-400 mb-6">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Created: {formatDate(selectedNote.createdAt)}
                  </div>
                  <div className="mx-2">•</div>
                  <div>Updated: {formatDate(selectedNote.updatedAt)}</div>
                </div>

                {isEditing ? (
                  <Textarea
                    value={editedNote?.content || ""}
                    onChange={(e) => setEditedNote((prev) => (prev ? { ...prev, content: e.target.value } : null))}
                    className="bg-zinc-800/50 border-zinc-700 focus:border-white/50 min-h-[300px] mb-4"
                  />
                ) : (
                  <div className="whitespace-pre-line mb-6">{selectedNote.content}</div>
                )}

                {isEditing ? (
                  <div className="mt-4">
                    <Label className="text-sm text-gray-400">Tags</Label>
                    <div className="flex mt-1">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag"
                        className="bg-zinc-800/50 border-zinc-700 focus:border-white/50 rounded-r-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addTag(false)
                          }
                        }}
                      />
                      <Button onClick={() => addTag(false)} className="rounded-l-none">
                        Add
                      </Button>
                    </div>

                    {editedNote && editedNote.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {editedNote.tags.map((tag) => (
                          <div key={tag} className="bg-zinc-800 text-xs px-2 py-1 rounded-full flex items-center">
                            {tag}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeTag(tag, false)}
                              className="h-4 w-4 ml-1 hover:bg-zinc-700"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  selectedNote.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedNote.tags.map((tag) => (
                        <div key={tag} className="flex items-center text-xs bg-zinc-800/70 px-2 py-1 rounded-full">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </div>
                      ))}
                    </div>
                  )
                )}
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <p className="mb-2">Select a note to view or edit</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingNote(true)}
                  className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create Note
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
