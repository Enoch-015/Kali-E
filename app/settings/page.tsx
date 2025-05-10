"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, LogOut, Plus, Trash2, Edit2, Server } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { motion } from "framer-motion"
import { toast } from "@/hooks/use-toast"
import { signOut } from "next-auth/react"



// Interface for MCP server configuration
interface MCPServer {
  id: string
  name: string
  url: string
  apiKey: string
  description: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("integrations")
  const [mcpServers, setMcpServers] = useState<MCPServer[]>([
    {
      id: "1",
      name: "Default MCP Server",
      url: "https://mcp.example.com",
      apiKey: "mcp_key_123456",
      description: "Default Model Control Protocol server for Kali-E",
    },
  ])
  const [isAddingServer, setIsAddingServer] = useState(false)
  const [isEditingServer, setIsEditingServer] = useState(false)
  const [currentServer, setCurrentServer] = useState<MCPServer | null>(null)
  const [newServer, setNewServer] = useState<Omit<MCPServer, "id">>({
    name: "",
    url: "",
    apiKey: "",
    description: "",
  })

  //Logout functionality
  const handleSignOut = async () => {
  await signOut({
    redirect: false,
  })
  router.push("/")
}


  const handleSave = () => {
    setIsSaving(true)
    // Simulate saving
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Settings saved",
        description: "Your settings have been saved successfully.",
        duration: 3000,
      })
      router.push("/assistant")
    }, 1000)
  }

  const handleAddServer = () => {
    if (!newServer.name || !newServer.url) {
      toast({
        title: "Missing information",
        description: "Server name and URL are required.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    const id = Date.now().toString()
    setMcpServers([...mcpServers, { ...newServer, id }])
    setNewServer({
      name: "",
      url: "",
      apiKey: "",
      description: "",
    })
    setIsAddingServer(false)

    toast({
      title: "Server added",
      description: `${newServer.name} has been added successfully.`,
      duration: 3000,
    })
  }

  const handleEditServer = () => {
    if (!currentServer || !currentServer.name || !currentServer.url) {
      toast({
        title: "Missing information",
        description: "Server name and URL are required.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    setMcpServers(mcpServers.map((server) => (server.id === currentServer.id ? currentServer : server)))
    setIsEditingServer(false)
    setCurrentServer(null)

    toast({
      title: "Server updated",
      description: `${currentServer.name} has been updated successfully.`,
      duration: 3000,
    })
  }

  const handleDeleteServer = (id: string) => {
    const serverToDelete = mcpServers.find((server) => server.id === id)
    setMcpServers(mcpServers.filter((server) => server.id !== id))

    toast({
      title: "Server removed",
      description: `${serverToDelete?.name} has been removed.`,
      duration: 3000,
    })
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/20 to-black pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/assistant")}
              className="mr-2 hover:bg-zinc-800/50 transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-white text-black hover:bg-gray-200 transition-all duration-300"
          >
            {isSaving ? (
              <>Saving...</>
            ) : (
              <>
                Save
                <Save className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </motion.div>

        <Tabs defaultValue="integrations" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6 p-1 bg-zinc-900/50 backdrop-blur-sm">
            <TabsTrigger
              value="integrations"
              className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all duration-300"
            >
              Integrations
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all duration-300"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all duration-300"
            >
              Preferences
            </TabsTrigger>
            <TabsTrigger
              value="mcp"
              className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all duration-300"
            >
              MCP Servers
            </TabsTrigger>
          </TabsList>

          <motion.div variants={container} initial="hidden" animate="show">
            <TabsContent value="integrations" className="space-y-6">
              <motion.div
                variants={item}
                className="space-y-4 p-6 bg-zinc-900/30 backdrop-blur-sm rounded-lg border border-zinc-800/50"
              >
                <h2 className="text-xl font-medium flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center mr-2">
                    <span className="text-green-500 text-lg">W</span>
                  </div>
                  WhatsApp
                </h2>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="text-gray-300">
                    WhatsApp Number
                  </Label>
                  <Input
                    id="whatsapp"
                    placeholder="+1 (555) 123-4567"
                    className="bg-zinc-800/50 border-zinc-700 focus:border-white/50 transition-all duration-300"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Enable WhatsApp integration</span>
                  <Switch />
                </div>
              </motion.div>

              <motion.div
                variants={item}
                className="space-y-4 p-6 bg-zinc-900/30 backdrop-blur-sm rounded-lg border border-zinc-800/50"
              >
                <h2 className="text-xl font-medium flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center mr-2">
                    <span className="text-blue-500 text-lg">E</span>
                  </div>
                  Email
                </h2>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="bg-zinc-800/50 border-zinc-700 focus:border-white/50 transition-all duration-300"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Enable email integration</span>
                  <Switch />
                </div>
              </motion.div>

              <motion.div
                variants={item}
                className="space-y-4 p-6 bg-zinc-900/30 backdrop-blur-sm rounded-lg border border-zinc-800/50"
              >
                <h2 className="text-xl font-medium flex items-center">
                  <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center mr-2">
                    <span className="text-purple-500 text-lg">C</span>
                  </div>
                  Calendar
                </h2>
                <div className="space-y-2">
                  <Label htmlFor="calendar" className="text-gray-300">
                    Calendar URL
                  </Label>
                  <Input
                    id="calendar"
                    placeholder="https://calendar.google.com/..."
                    className="bg-zinc-800/50 border-zinc-700 focus:border-white/50 transition-all duration-300"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Enable calendar integration</span>
                  <Switch />
                </div>
              </motion.div>

              <motion.div
                variants={item}
                className="space-y-4 p-6 bg-zinc-900/30 backdrop-blur-sm rounded-lg border border-zinc-800/50"
              >
                <h2 className="text-xl font-medium flex items-center">
                  <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center mr-2">
                    <span className="text-yellow-500 text-lg">A</span>
                  </div>
                  API Keys
                </h2>
                <div className="space-y-2">
                  <Label htmlFor="openai" className="text-gray-300">
                    OpenAI API Key
                  </Label>
                  <Input
                    id="openai"
                    type="password"
                    placeholder="sk-..."
                    className="bg-zinc-800/50 border-zinc-700 focus:border-white/50 transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="other-api" className="text-gray-300">
                    Other API Key
                  </Label>
                  <Input
                    id="other-api"
                    type="password"
                    placeholder="Enter API key"
                    className="bg-zinc-800/50 border-zinc-700 focus:border-white/50 transition-all duration-300"
                  />
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <motion.div
                variants={item}
                className="space-y-4 p-6 bg-zinc-900/30 backdrop-blur-sm rounded-lg border border-zinc-800/50"
              >
                <h2 className="text-xl font-medium">Personal Information</h2>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">
                    Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    className="bg-zinc-800/50 border-zinc-700 focus:border-white/50 transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-gray-300">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself"
                    className="bg-zinc-800/50 border-zinc-700 focus:border-white/50 transition-all duration-300 min-h-[100px]"
                  />
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <motion.div
                variants={item}
                className="space-y-4 p-6 bg-zinc-900/30 backdrop-blur-sm rounded-lg border border-zinc-800/50"
              >
                <h2 className="text-xl font-medium">Voice Assistant Preferences</h2>
                <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
                  <span className="text-gray-300">Enable voice feedback</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
                  <span className="text-gray-300">Save conversation history</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
                  <span className="text-gray-300">Enable notifications</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-300">Dark theme</span>
                  <Switch defaultChecked />
                </div>
              </motion.div>
            </TabsContent>

            {/* MCP Servers Tab */}
            <TabsContent value="mcp" className="space-y-6">
              <motion.div
                variants={item}
                className="space-y-4 p-6 bg-zinc-900/30 backdrop-blur-sm rounded-lg border border-zinc-800/50"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-medium">MCP Server Configurations</h2>
                  <Dialog open={isAddingServer} onOpenChange={setIsAddingServer}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Server
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                      <DialogHeader>
                        <DialogTitle>Add MCP Server</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="server-name" className="text-gray-300">
                            Server Name
                          </Label>
                          <Input
                            id="server-name"
                            value={newServer.name}
                            onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                            placeholder="My MCP Server"
                            className="bg-zinc-800/50 border-zinc-700 focus:border-white/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="server-url" className="text-gray-300">
                            Server URL
                          </Label>
                          <Input
                            id="server-url"
                            value={newServer.url}
                            onChange={(e) => setNewServer({ ...newServer, url: e.target.value })}
                            placeholder="https://mcp.example.com"
                            className="bg-zinc-800/50 border-zinc-700 focus:border-white/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="server-api-key" className="text-gray-300">
                            API Key
                          </Label>
                          <Input
                            id="server-api-key"
                            type="password"
                            value={newServer.apiKey}
                            onChange={(e) => setNewServer({ ...newServer, apiKey: e.target.value })}
                            placeholder="mcp_key_..."
                            className="bg-zinc-800/50 border-zinc-700 focus:border-white/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="server-description" className="text-gray-300">
                            Description
                          </Label>
                          <Textarea
                            id="server-description"
                            value={newServer.description}
                            onChange={(e) => setNewServer({ ...newServer, description: e.target.value })}
                            placeholder="Describe this MCP server..."
                            className="bg-zinc-800/50 border-zinc-700 focus:border-white/50 min-h-[80px]"
                          />
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                          <Button
                            variant="outline"
                            onClick={() => setIsAddingServer(false)}
                            className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50"
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleAddServer}>Add Server</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <p className="text-gray-400 text-sm">
                  Configure Model Control Protocol (MCP) servers that Kali-E can use to access tools and capabilities.
                </p>

                {/* Server List */}
                <div className="space-y-4 mt-6">
                  {mcpServers.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Server className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No MCP servers configured</p>
                      <p className="text-sm mt-1">Add a server to enable advanced capabilities</p>
                    </div>
                  ) : (
                    mcpServers.map((server) => (
                      <div
                        key={server.id}
                        className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50 transition-all hover:border-zinc-600/50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-zinc-700/50 flex items-center justify-center mr-2">
                              <Server className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <h3 className="font-medium">{server.name}</h3>
                              <p className="text-sm text-gray-400 truncate max-w-[200px]">{server.url}</p>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Dialog
                              open={isEditingServer && currentServer?.id === server.id}
                              onOpenChange={(open) => {
                                setIsEditingServer(open)
                                if (open) setCurrentServer(server)
                                else setCurrentServer(null)
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-zinc-700/50">
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                                <DialogHeader>
                                  <DialogTitle>Edit MCP Server</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 mt-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-server-name" className="text-gray-300">
                                      Server Name
                                    </Label>
                                    <Input
                                      id="edit-server-name"
                                      value={currentServer?.name || ""}
                                      onChange={(e) =>
                                        setCurrentServer((current) =>
                                          current ? { ...current, name: e.target.value } : null,
                                        )
                                      }
                                      placeholder="My MCP Server"
                                      className="bg-zinc-800/50 border-zinc-700 focus:border-white/50"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-server-url" className="text-gray-300">
                                      Server URL
                                    </Label>
                                    <Input
                                      id="edit-server-url"
                                      value={currentServer?.url || ""}
                                      onChange={(e) =>
                                        setCurrentServer((current) =>
                                          current ? { ...current, url: e.target.value } : null,
                                        )
                                      }
                                      placeholder="https://mcp.example.com"
                                      className="bg-zinc-800/50 border-zinc-700 focus:border-white/50"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-server-api-key" className="text-gray-300">
                                      API Key
                                    </Label>
                                    <Input
                                      id="edit-server-api-key"
                                      type="password"
                                      value={currentServer?.apiKey || ""}
                                      onChange={(e) =>
                                        setCurrentServer((current) =>
                                          current ? { ...current, apiKey: e.target.value } : null,
                                        )
                                      }
                                      placeholder="mcp_key_..."
                                      className="bg-zinc-800/50 border-zinc-700 focus:border-white/50"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-server-description" className="text-gray-300">
                                      Description
                                    </Label>
                                    <Textarea
                                      id="edit-server-description"
                                      value={currentServer?.description || ""}
                                      onChange={(e) =>
                                        setCurrentServer((current) =>
                                          current ? { ...current, description: e.target.value } : null,
                                        )
                                      }
                                      placeholder="Describe this MCP server..."
                                      className="bg-zinc-800/50 border-zinc-700 focus:border-white/50 min-h-[80px]"
                                    />
                                  </div>
                                  <div className="flex justify-end space-x-2 mt-4">
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setIsEditingServer(false)
                                        setCurrentServer(null)
                                      }}
                                      className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50"
                                    >
                                      Cancel
                                    </Button>
                                    <Button onClick={handleEditServer}>Save Changes</Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-red-900/20 hover:text-red-500"
                              onClick={() => handleDeleteServer(server.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-400">{server.description}</div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </TabsContent>
          </motion.div>
        </Tabs>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex justify-center"
        >
          <Button
            variant="outline"
            onClick={() => handleSignOut()}
            className="bg-zinc-900/50 border-zinc-700 hover:bg-zinc-800/70 text-white px-8"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </motion.div>
      </div>
    </main>
  )
}
