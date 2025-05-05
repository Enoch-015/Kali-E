"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search, Download, Star, ExternalLink, Tag, Filter, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { toast } from "@/hooks/use-toast"

interface Plugin {
  id: string
  name: string
  description: string
  author: string
  rating: number
  downloads: number
  tags: string[]
  isInstalled: boolean
  isVerified: boolean
  version: string
  lastUpdated: Date
  icon: string
}

// Generate mock plugins
const generateMockPlugins = (): Plugin[] => {
  return [
    {
      id: "1",
      name: "Weather Forecast",
      description: "Get real-time weather forecasts and alerts for any location.",
      author: "Weather Labs",
      rating: 4.8,
      downloads: 25430,
      tags: ["weather", "forecast", "utility"],
      isInstalled: true,
      isVerified: true,
      version: "2.1.0",
      lastUpdated: new Date(Date.now() - 86400000 * 15), // 15 days ago
      icon: "🌤️",
    },
    {
      id: "2",
      name: "Language Translator",
      description: "Translate text between 50+ languages with high accuracy.",
      author: "Polyglot AI",
      rating: 4.6,
      downloads: 18920,
      tags: ["translation", "language", "utility"],
      isInstalled: false,
      isVerified: true,
      version: "3.0.2",
      lastUpdated: new Date(Date.now() - 86400000 * 5), // 5 days ago
      icon: "🌐",
    },
    {
      id: "3",
      name: "Smart Calendar",
      description: "Intelligent calendar management with scheduling suggestions and reminders.",
      author: "Productivity Tools Inc.",
      rating: 4.9,
      downloads: 32150,
      tags: ["calendar", "productivity", "scheduling"],
      isInstalled: true,
      isVerified: true,
      version: "1.5.3",
      lastUpdated: new Date(Date.now() - 86400000 * 10), // 10 days ago
      icon: "📅",
    },
    {
      id: "4",
      name: "News Summarizer",
      description: "Get concise summaries of the latest news from trusted sources.",
      author: "NewsDigest",
      rating: 4.5,
      downloads: 12780,
      tags: ["news", "summary", "information"],
      isInstalled: false,
      isVerified: true,
      version: "2.2.1",
      lastUpdated: new Date(Date.now() - 86400000 * 3), // 3 days ago
      icon: "📰",
    },
    {
      id: "5",
      name: "Recipe Finder",
      description: "Discover recipes based on ingredients you have or dietary preferences.",
      author: "Culinary AI",
      rating: 4.7,
      downloads: 15620,
      tags: ["food", "recipes", "cooking"],
      isInstalled: false,
      isVerified: false,
      version: "1.2.0",
      lastUpdated: new Date(Date.now() - 86400000 * 20), // 20 days ago
      icon: "🍳",
    },
    {
      id: "6",
      name: "Code Assistant",
      description: "Get coding help, explanations, and suggestions for multiple programming languages.",
      author: "DevTools Pro",
      rating: 4.9,
      downloads: 28450,
      tags: ["coding", "development", "programming"],
      isInstalled: true,
      isVerified: true,
      version: "3.1.4",
      lastUpdated: new Date(Date.now() - 86400000 * 7), // 7 days ago
      icon: "💻",
    },
    {
      id: "7",
      name: "Fitness Tracker",
      description: "Track workouts, get exercise recommendations, and monitor fitness goals.",
      author: "HealthTech Solutions",
      rating: 4.6,
      downloads: 19870,
      tags: ["fitness", "health", "tracking"],
      isInstalled: false,
      isVerified: true,
      version: "2.0.5",
      lastUpdated: new Date(Date.now() - 86400000 * 12), // 12 days ago
      icon: "🏋️",
    },
    {
      id: "8",
      name: "Movie Recommendations",
      description: "Get personalized movie and TV show recommendations based on your preferences.",
      author: "EntertainmentAI",
      rating: 4.7,
      downloads: 21340,
      tags: ["movies", "entertainment", "recommendations"],
      isInstalled: false,
      isVerified: false,
      version: "1.3.2",
      lastUpdated: new Date(Date.now() - 86400000 * 25), // 25 days ago
      icon: "🎬",
    },
  ]
}

export default function PluginsPage() {
  const router = useRouter()
  const [plugins, setPlugins] = useState<Plugin[]>(generateMockPlugins())
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Get all unique tags
  const allTags = Array.from(new Set(plugins.flatMap((plugin) => plugin.tags)))

  // Filter plugins based on active tab, search query, and selected tags
  const filteredPlugins = plugins.filter((plugin) => {
    // Filter by tab
    if (activeTab === "installed" && !plugin.isInstalled) return false
    if (activeTab === "verified" && !plugin.isVerified) return false

    // Filter by search query
    const matchesSearch =
      searchQuery === "" ||
      plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    // Filter by selected tags
    const matchesTags = selectedTags.length === 0 || selectedTags.every((tag) => plugin.tags.includes(tag))

    return matchesSearch && matchesTags
  })

  // Toggle plugin installation
  const toggleInstallation = (id: string) => {
    setPlugins(
      plugins.map((plugin) => {
        if (plugin.id === id) {
          const newState = !plugin.isInstalled

          // Show toast notification
          toast({
            title: newState ? "Plugin installed" : "Plugin uninstalled",
            description: `"${plugin.name}" has been ${newState ? "installed" : "uninstalled"}.`,
            duration: 3000,
          })

          return { ...plugin, isInstalled: newState }
        }
        return plugin
      }),
    )

    // Update selected plugin if it's the one being toggled
    if (selectedPlugin?.id === id) {
      setSelectedPlugin((prev) => (prev ? { ...prev, isInstalled: !prev.isInstalled } : null))
    }
  }

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  // Clear all selected tags
  const clearTags = () => {
    setSelectedTags([])
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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
            <h1 className="text-2xl font-bold">Plugin Marketplace</h1>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search plugins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-zinc-800/50 border-zinc-700 focus:border-white/50"
            />
          </div>

          <div className="flex gap-2">
            <Dialog>
              <Button variant="outline" className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50">
                <Filter className="h-4 w-4 mr-1" />
                Filter
                {selectedTags.length > 0 && <Badge className="ml-2 bg-white text-black">{selectedTags.length}</Badge>}
              </Button>
              <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                <DialogHeader>
                  <DialogTitle>Filter Plugins</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">Tags</h3>
                    {selectedTags.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearTags}
                        className="h-7 text-xs text-gray-400 hover:text-white"
                      >
                        Clear all
                      </Button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {allTags.map((tag) => (
                      <Button
                        key={tag}
                        variant="outline"
                        size="sm"
                        className={`h-7 text-xs ${
                          selectedTags.includes(tag)
                            ? "bg-white text-black hover:bg-gray-200"
                            : "bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50"
                        }`}
                        onClick={() => toggleTag(tag)}
                      >
                        {selectedTags.includes(tag) && <Check className="h-3 w-3 mr-1" />}
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
          <TabsList className="grid w-full grid-cols-3 bg-zinc-900/50 backdrop-blur-sm">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all duration-300"
            >
              All Plugins
            </TabsTrigger>
            <TabsTrigger
              value="installed"
              className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all duration-300"
            >
              Installed
            </TabsTrigger>
            <TabsTrigger
              value="verified"
              className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all duration-300"
            >
              Verified
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Plugin grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlugins.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-400">
              <p>No plugins found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredPlugins.map((plugin) => (
              <motion.div
                key={plugin.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-zinc-900/30 backdrop-blur-sm rounded-lg border border-zinc-800/50 hover:border-zinc-700/50 transition-all cursor-pointer"
                onClick={() => setSelectedPlugin(plugin)}
              >
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-lg bg-zinc-800/70 flex items-center justify-center text-2xl mr-3 flex-shrink-0">
                    {plugin.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">{plugin.name}</h3>
                      {plugin.isVerified && (
                        <Badge className="ml-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-blue-500/30">
                          Verified
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-gray-400 line-clamp-2 mt-1">{plugin.description}</p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center text-xs text-gray-400">
                        <div className="flex items-center mr-3">
                          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 mr-1" />
                          {plugin.rating}
                        </div>
                        <div className="flex items-center">
                          <Download className="h-3 w-3 mr-1" />
                          {formatNumber(plugin.downloads)}
                        </div>
                      </div>

                      <Button
                        variant={plugin.isInstalled ? "outline" : "default"}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleInstallation(plugin.id)
                        }}
                        className={`h-7 text-xs ${
                          plugin.isInstalled ? "bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50" : ""
                        }`}
                      >
                        {plugin.isInstalled ? "Uninstall" : "Install"}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Plugin detail dialog */}
        <Dialog open={!!selectedPlugin} onOpenChange={(open) => !open && setSelectedPlugin(null)}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
            {selectedPlugin && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center">
                    <span className="text-2xl mr-2">{selectedPlugin.icon}</span>
                    {selectedPlugin.name}
                    {selectedPlugin.isVerified && (
                      <Badge className="ml-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-blue-500/30">
                        Verified
                      </Badge>
                    )}
                  </DialogTitle>
                </DialogHeader>

                <div className="mt-4 space-y-4">
                  <p>{selectedPlugin.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {selectedPlugin.tags.map((tag) => (
                      <div key={tag} className="flex items-center text-xs bg-zinc-800/70 px-2 py-1 rounded-full">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Author</p>
                      <p>{selectedPlugin.author}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Version</p>
                      <p>{selectedPlugin.version}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Last Updated</p>
                      <p>{formatDate(selectedPlugin.lastUpdated)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Downloads</p>
                      <p>{formatNumber(selectedPlugin.downloads)}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(selectedPlugin.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-500"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm">{selectedPlugin.rating} / 5</span>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
                    <Button variant="outline" size="sm" className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Visit Website
                    </Button>

                    <Button
                      variant={selectedPlugin.isInstalled ? "outline" : "default"}
                      onClick={() => toggleInstallation(selectedPlugin.id)}
                      className={
                        selectedPlugin.isInstalled ? "bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50" : ""
                      }
                    >
                      {selectedPlugin.isInstalled ? "Uninstall" : "Install"}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </main>
  )
}
