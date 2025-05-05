"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Plus,
  Search,
  Trash2,
  Star,
  StarOff,
  Mail,
  Send,
  Inbox,
  Archive,
  File,
  Paperclip,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"

interface Email {
  id: string
  from: {
    name: string
    email: string
  }
  to: {
    name: string
    email: string
  }[]
  subject: string
  body: string
  date: Date
  isRead: boolean
  isStarred: boolean
  folder: "inbox" | "sent" | "drafts" | "archive"
  hasAttachments: boolean
}

// Generate mock emails
const generateMockEmails = (): Email[] => {
  return [
    {
      id: "1",
      from: {
        name: "Alex Johnson",
        email: "alex.johnson@example.com",
      },
      to: [
        {
          name: "Me",
          email: "me@example.com",
        },
      ],
      subject: "Project Update: Q2 Roadmap",
      body: "Hi there,\n\nI wanted to share the latest updates on our Q2 roadmap. We've made significant progress on the key initiatives we discussed last month.\n\nHere are the highlights:\n- Feature A is now 80% complete\n- Feature B has been pushed to Q3 due to resource constraints\n- Feature C is ahead of schedule\n\nLet me know if you have any questions or concerns.\n\nBest regards,\nAlex",
      date: new Date(Date.now() - 3600000 * 2), // 2 hours ago
      isRead: false,
      isStarred: true,
      folder: "inbox",
      hasAttachments: true,
    },
    {
      id: "2",
      from: {
        name: "Sarah Miller",
        email: "sarah.miller@example.com",
      },
      to: [
        {
          name: "Me",
          email: "me@example.com",
        },
      ],
      subject: "Meeting Invitation: Design Review",
      body: "Hello,\n\nI'd like to invite you to our design review meeting scheduled for next Thursday at 2 PM. We'll be discussing the new UI components and getting feedback from the team.\n\nPlease let me know if you can attend.\n\nThanks,\nSarah",
      date: new Date(Date.now() - 86400000), // 1 day ago
      isRead: true,
      isStarred: false,
      folder: "inbox",
      hasAttachments: false,
    },
    {
      id: "3",
      from: {
        name: "Me",
        email: "me@example.com",
      },
      to: [
        {
          name: "David Chen",
          email: "david.chen@example.com",
        },
      ],
      subject: "Re: Quarterly Budget Review",
      body: "Hi David,\n\nThanks for sending over the budget documents. I've reviewed them and have a few questions:\n\n1. What's the reason for the increase in marketing spend?\n2. Can we reallocate some of the unused R&D budget to product development?\n\nLet's discuss these points in our next meeting.\n\nRegards,\nMe",
      date: new Date(Date.now() - 86400000 * 2), // 2 days ago
      isRead: true,
      isStarred: false,
      folder: "sent",
      hasAttachments: false,
    },
    {
      id: "4",
      from: {
        name: "Marketing Team",
        email: "marketing@example.com",
      },
      to: [
        {
          name: "Me",
          email: "me@example.com",
        },
      ],
      subject: "New Campaign Materials",
      body: "Hello team,\n\nAttached are the materials for our upcoming marketing campaign. Please review them by Friday and provide your feedback.\n\nThe campaign is scheduled to launch next Monday, so timely feedback is appreciated.\n\nBest,\nMarketing Team",
      date: new Date(Date.now() - 86400000 * 3), // 3 days ago
      isRead: true,
      isStarred: true,
      folder: "inbox",
      hasAttachments: true,
    },
    {
      id: "5",
      from: {
        name: "Me",
        email: "me@example.com",
      },
      to: [
        {
          name: "HR Department",
          email: "hr@example.com",
        },
      ],
      subject: "Vacation Request",
      body: "Dear HR,\n\nI would like to request vacation days from July 15 to July 25. I've already discussed this with my team lead, and they've approved.\n\nPlease let me know if you need any additional information.\n\nThank you,\nMe",
      date: new Date(Date.now() - 86400000 * 5), // 5 days ago
      isRead: true,
      isStarred: false,
      folder: "sent",
      hasAttachments: false,
    },
    {
      id: "6",
      from: {
        name: "System Administrator",
        email: "sysadmin@example.com",
      },
      to: [
        {
          name: "Me",
          email: "me@example.com",
        },
      ],
      subject: "Scheduled System Maintenance",
      body: "Important Notice:\n\nWe will be performing scheduled system maintenance this Saturday from 10 PM to 2 AM. During this time, all systems will be unavailable.\n\nPlease make sure to save your work and log out before the maintenance window.\n\nThank you for your understanding,\nSystem Administrator",
      date: new Date(Date.now() - 86400000 * 4), // 4 days ago
      isRead: true,
      isStarred: false,
      folder: "archive",
      hasAttachments: false,
    },
  ]
}

export default function EmailPage() {
  const router = useRouter()
  const [emails, setEmails] = useState<Email[]>(generateMockEmails())
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("inbox")
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [isComposing, setIsComposing] = useState(false)
  const [newEmail, setNewEmail] = useState({
    to: "",
    subject: "",
    body: "",
  })

  // Filter emails based on active tab and search query
  const filteredEmails = emails.filter((email) => {
    const matchesFolder = email.folder === activeTab
    const matchesSearch =
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.body.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesFolder && (searchQuery === "" || matchesSearch)
  })

  // Mark email as read
  const markAsRead = (id: string) => {
    setEmails(emails.map((email) => (email.id === id ? { ...email, isRead: true } : email)))
  }

  // Toggle starred status
  const toggleStarred = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()

    setEmails(
      emails.map((email) => {
        if (email.id === id) {
          return { ...email, isStarred: !email.isStarred }
        }
        return email
      }),
    )

    const email = emails.find((e) => e.id === id)
    if (email) {
      toast({
        title: email.isStarred ? "Removed from starred" : "Added to starred",
        description: `"${email.subject}" has been ${email.isStarred ? "removed from" : "added to"} starred.`,
        duration: 2000,
      })
    }
  }

  // Archive email
  const archiveEmail = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()

    setEmails(
      emails.map((email) => {
        if (email.id === id) {
          return { ...email, folder: "archive" }
        }
        return email
      }),
    )

    if (selectedEmail?.id === id) {
      setSelectedEmail(null)
    }

    const email = emails.find((e) => e.id === id)
    if (email) {
      toast({
        title: "Email archived",
        description: `"${email.subject}" has been moved to archive.`,
        duration: 3000,
      })
    }
  }

  // Delete email
  const deleteEmail = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()

    setEmails(emails.filter((email) => email.id !== id))

    if (selectedEmail?.id === id) {
      setSelectedEmail(null)
    }

    const email = emails.find((e) => e.id === id)
    if (email) {
      toast({
        title: "Email deleted",
        description: `"${email.subject}" has been deleted.`,
        duration: 3000,
      })
    }
  }

  // Send email
  const sendEmail = () => {
    if (!newEmail.to || !newEmail.subject) {
      toast({
        title: "Missing information",
        description: "Please provide recipient and subject.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    const id = Date.now().toString()
    const sentEmail: Email = {
      id,
      from: {
        name: "Me",
        email: "me@example.com",
      },
      to: [
        {
          name: newEmail.to,
          email: newEmail.to,
        },
      ],
      subject: newEmail.subject,
      body: newEmail.body,
      date: new Date(),
      isRead: true,
      isStarred: false,
      folder: "sent",
      hasAttachments: false,
    }

    setEmails([sentEmail, ...emails])
    setIsComposing(false)

    // Reset form
    setNewEmail({
      to: "",
      subject: "",
      body: "",
    })

    toast({
      title: "Email sent",
      description: `Your email to ${newEmail.to} has been sent.`,
      duration: 3000,
    })
  }

  // Format date for display
  const formatDate = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      // Today, show time
      return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    } else if (diffDays === 1) {
      return "Yesterday"
    } else if (diffDays < 7) {
      // Within a week, show day name
      return date.toLocaleDateString("en-US", { weekday: "short" })
    } else {
      // Older, show date
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
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
            <h1 className="text-2xl font-bold">Email</h1>
          </div>

          <Dialog open={isComposing} onOpenChange={setIsComposing}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Compose
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>Compose Email</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email-to">To</Label>
                  <Input
                    id="email-to"
                    value={newEmail.to}
                    onChange={(e) => setNewEmail({ ...newEmail, to: e.target.value })}
                    placeholder="recipient@example.com"
                    className="bg-zinc-800/50 border-zinc-700 focus:border-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-subject">Subject</Label>
                  <Input
                    id="email-subject"
                    value={newEmail.subject}
                    onChange={(e) => setNewEmail({ ...newEmail, subject: e.target.value })}
                    placeholder="Email subject"
                    className="bg-zinc-800/50 border-zinc-700 focus:border-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                    value={newEmail.body}
                    onChange={(e) => setNewEmail({ ...newEmail, body: e.target.value })}
                    placeholder="Write your message here..."
                    className="bg-zinc-800/50 border-zinc-700 focus:border-white/50 min-h-[200px]"
                  />
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsComposing(false)}
                    className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50"
                  >
                    Cancel
                  </Button>
                  <Button onClick={sendEmail}>
                    <Send className="h-4 w-4 mr-1" />
                    Send
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64">
            <Tabs
              defaultValue="inbox"
              value={activeTab}
              onValueChange={setActiveTab}
              orientation="vertical"
              className="w-full"
            >
              <TabsList className="flex flex-col h-auto bg-zinc-900/30 backdrop-blur-sm rounded-lg border border-zinc-800/50 p-2 space-y-1">
                <TabsTrigger
                  value="inbox"
                  className="justify-start px-3 py-2 data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all duration-300"
                >
                  <Inbox className="h-4 w-4 mr-2" />
                  Inbox
                  <span className="ml-auto bg-zinc-800 text-xs px-2 py-0.5 rounded-full">
                    {emails.filter((e) => e.folder === "inbox" && !e.isRead).length}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="sent"
                  className="justify-start px-3 py-2 data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all duration-300"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Sent
                </TabsTrigger>
                <TabsTrigger
                  value="drafts"
                  className="justify-start px-3 py-2 data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all duration-300"
                >
                  <File className="h-4 w-4 mr-2" />
                  Drafts
                </TabsTrigger>
                <TabsTrigger
                  value="archive"
                  className="justify-start px-3 py-2 data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all duration-300"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Email list and detail view */}
          <div className="flex-1">
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-800/50 border-zinc-700 focus:border-white/50"
              />
            </div>

            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="hidden">
                <TabsTrigger value="inbox">Inbox</TabsTrigger>
                <TabsTrigger value="sent">Sent</TabsTrigger>
                <TabsTrigger value="drafts">Drafts</TabsTrigger>
                <TabsTrigger value="archive">Archive</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-0">
                <div className="bg-zinc-900/30 backdrop-blur-sm rounded-lg border border-zinc-800/50 overflow-hidden">
                  {filteredEmails.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No emails found</p>
                      {activeTab === "inbox" && <p className="text-sm mt-1">Your inbox is empty</p>}
                      {activeTab === "sent" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsComposing(true)}
                          className="mt-2 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Compose Email
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-800/50">
                      {filteredEmails.map((email) => (
                        <div
                          key={email.id}
                          className={`p-4 cursor-pointer transition-all hover:bg-zinc-800/30 ${
                            !email.isRead ? "bg-zinc-800/20" : ""
                          } ${selectedEmail?.id === email.id ? "bg-zinc-800/40" : ""}`}
                          onClick={() => {
                            setSelectedEmail(email)
                            if (!email.isRead) {
                              markAsRead(email.id)
                            }
                          }}
                        >
                          <div className="flex items-start">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => toggleStarred(email.id, e)}
                              className="h-6 w-6 mr-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10"
                            >
                              {email.isStarred ? (
                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              ) : (
                                <StarOff className="h-4 w-4" />
                              )}
                            </Button>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="font-medium truncate">
                                  {email.folder === "sent" ? email.to[0].name || email.to[0].email : email.from.name}
                                </div>
                                <div className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                  {formatDate(email.date)}
                                </div>
                              </div>

                              <div className="flex items-center justify-between mt-1">
                                <div className={`truncate ${!email.isRead ? "font-medium" : "text-gray-400"}`}>
                                  {email.subject}
                                </div>

                                <div className="flex items-center ml-2">
                                  {email.hasAttachments && <Paperclip className="h-3 w-3 text-gray-400 mr-1" />}

                                  <div className="flex space-x-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={(e) => archiveEmail(email.id, e)}
                                      className="h-6 w-6 text-gray-400 hover:text-white hover:bg-zinc-700"
                                    >
                                      <Archive className="h-3 w-3" />
                                    </Button>

                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={(e) => deleteEmail(email.id, e)}
                                      className="h-6 w-6 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              <div className="text-xs text-gray-400 truncate mt-1">{email.body.split("\n")[0]}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Email detail view */}
                {selectedEmail && (
                  <div className="mt-6 bg-zinc-900/30 backdrop-blur-sm rounded-lg border border-zinc-800/50 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-medium">{selectedEmail.subject}</h2>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => archiveEmail(selectedEmail.id, e)}
                          className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50"
                        >
                          <Archive className="h-4 w-4 mr-1" />
                          Archive
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => deleteEmail(selectedEmail.id, e)}
                          className="bg-zinc-800/50 border-zinc-700 hover:bg-red-900/20 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mr-3">
                            <span className="text-lg font-medium">
                              {selectedEmail.folder === "sent"
                                ? selectedEmail.to[0].name.charAt(0)
                                : selectedEmail.from.name.charAt(0)}
                            </span>
                          </div>

                          <div>
                            <div className="font-medium">
                              {selectedEmail.folder === "sent"
                                ? `To: ${selectedEmail.to.map((t) => t.name || t.email).join(", ")}`
                                : selectedEmail.from.name}
                            </div>
                            <div className="text-sm text-gray-400">
                              {selectedEmail.folder === "sent"
                                ? selectedEmail.to.map((t) => t.email).join(", ")
                                : selectedEmail.from.email}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-sm text-gray-400">
                        {selectedEmail.date.toLocaleString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    <div className="whitespace-pre-line">{selectedEmail.body}</div>

                    {selectedEmail.hasAttachments && (
                      <div className="mt-6 pt-6 border-t border-zinc-800/50">
                        <h3 className="text-sm font-medium mb-3 flex items-center">
                          <Paperclip className="h-4 w-4 mr-1" />
                          Attachments
                        </h3>

                        <div className="flex flex-wrap gap-3">
                          <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50 flex items-center">
                            <File className="h-6 w-6 mr-2 text-gray-400" />
                            <div>
                              <div className="text-sm">document.pdf</div>
                              <div className="text-xs text-gray-400">245 KB</div>
                            </div>
                          </div>

                          <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50 flex items-center">
                            <File className="h-6 w-6 mr-2 text-gray-400" />
                            <div>
                              <div className="text-sm">presentation.pptx</div>
                              <div className="text-xs text-gray-400">1.2 MB</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </main>
  )
}
