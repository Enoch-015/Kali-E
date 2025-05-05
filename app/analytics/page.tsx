"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Clock, BarChart2, PieChart, TrendingUp, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Mock data for analytics
const generateMockData = () => {
  // Usage data - last 30 days
  const usageData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))

    return {
      date: date.toISOString().split("T")[0],
      interactions: Math.floor(Math.random() * 30) + 5,
      duration: Math.floor(Math.random() * 20) + 5,
    }
  })

  // Feature usage data
  const featureData = [
    { name: "Voice Commands", usage: 42 },
    { name: "Calendar", usage: 28 },
    { name: "Tasks", usage: 19 },
    { name: "Notes", usage: 15 },
    { name: "Email", usage: 11 },
    { name: "Weather Plugin", usage: 8 },
    { name: "Translator Plugin", usage: 5 },
  ]

  // Time of day data
  const timeOfDayData = [
    { time: "Morning (6AM-12PM)", usage: 35 },
    { time: "Afternoon (12PM-6PM)", usage: 40 },
    { time: "Evening (6PM-12AM)", usage: 20 },
    { time: "Night (12AM-6AM)", usage: 5 },
  ]

  return {
    usageData,
    featureData,
    timeOfDayData,
    totalInteractions: usageData.reduce((sum, day) => sum + day.interactions, 0),
    averageDuration: Math.round(usageData.reduce((sum, day) => sum + day.duration, 0) / usageData.length),
    activeStreak: 12,
    topCommand: "Set a reminder for tomorrow's meeting",
  }
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [timeRange, setTimeRange] = useState("30d")
  const data = generateMockData()

  // Get max value for scaling charts
  const maxInteractions = Math.max(...data.usageData.map((d) => d.interactions))
  const maxFeatureUsage = Math.max(...data.featureData.map((d) => d.usage))
  const maxTimeOfDayUsage = Math.max(...data.timeOfDayData.map((d) => d.usage))

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
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
            <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          </div>

          <div className="flex items-center space-x-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px] bg-zinc-800/50 border-zinc-700">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Tabs - Fixed: Moved TabsContent inside the Tabs component */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-zinc-900/50 backdrop-blur-sm mb-6">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all duration-300"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="usage"
              className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all duration-300"
            >
              Usage Patterns
            </TabsTrigger>
            <TabsTrigger
              value="features"
              className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all duration-300"
            >
              Feature Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-zinc-900/30 backdrop-blur-sm border-zinc-800/50">
                <CardHeader className="pb-2">
                  <CardDescription>Total Interactions</CardDescription>
                  <CardTitle className="text-2xl">{data.totalInteractions}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-gray-400 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    <span>12% increase from last period</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/30 backdrop-blur-sm border-zinc-800/50">
                <CardHeader className="pb-2">
                  <CardDescription>Average Session Duration</CardDescription>
                  <CardTitle className="text-2xl">{data.averageDuration} min</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-gray-400 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Based on your last 30 sessions</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/30 backdrop-blur-sm border-zinc-800/50">
                <CardHeader className="pb-2">
                  <CardDescription>Active Streak</CardDescription>
                  <CardTitle className="text-2xl">{data.activeStreak} days</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-gray-400 flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>Keep it up!</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/30 backdrop-blur-sm border-zinc-800/50">
                <CardHeader className="pb-2">
                  <CardDescription>Most Used Feature</CardDescription>
                  <CardTitle className="text-lg truncate">{data.featureData[0].name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-gray-400 flex items-center">
                    <BarChart2 className="h-3 w-3 mr-1" />
                    <span>{data.featureData[0].usage} uses in the last 30 days</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Usage chart */}
            <Card className="bg-zinc-900/30 backdrop-blur-sm border-zinc-800/50">
              <CardHeader>
                <CardTitle>Daily Usage</CardTitle>
                <CardDescription>Number of interactions per day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <div className="flex h-full items-end space-x-2">
                    {data.usageData.map((day) => (
                      <div key={day.date} className="group relative flex h-full w-full flex-col justify-end">
                        <div
                          className="bg-gradient-to-t from-white to-white/70 rounded-t-sm w-full transition-all hover:bg-white/90"
                          style={{ height: `${(day.interactions / maxInteractions) * 100}%` }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 -mb-6 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-center">
                          {formatDate(day.date)}
                          <br />
                          {day.interactions} interactions
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top commands */}
            <Card className="bg-zinc-900/30 backdrop-blur-sm border-zinc-800/50">
              <CardHeader>
                <CardTitle>Top Commands</CardTitle>
                <CardDescription>Your most frequently used voice commands</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center mr-3">
                        <span>1</span>
                      </div>
                      <div>
                        <p className="font-medium">{data.topCommand}</p>
                        <p className="text-xs text-gray-400">Used 15 times</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center mr-3">
                        <span>2</span>
                      </div>
                      <div>
                        <p className="font-medium">What's the weather today?</p>
                        <p className="text-xs text-gray-400">Used 12 times</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center mr-3">
                        <span>3</span>
                      </div>
                      <div>
                        <p className="font-medium">Add a note about project ideas</p>
                        <p className="text-xs text-gray-400">Used 9 times</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage Patterns Tab */}
          <TabsContent value="usage" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Time of day usage */}
              <Card className="bg-zinc-900/30 backdrop-blur-sm border-zinc-800/50">
                <CardHeader>
                  <CardTitle>Time of Day Usage</CardTitle>
                  <CardDescription>When you use Kali-E the most</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <div className="flex h-full items-end space-x-12 justify-center">
                      {data.timeOfDayData.map((timeSlot) => (
                        <div key={timeSlot.time} className="group relative flex h-full w-24 flex-col justify-end">
                          <div
                            className="bg-gradient-to-t from-white to-white/70 rounded-t-sm w-full transition-all hover:bg-white/90"
                            style={{ height: `${(timeSlot.usage / maxTimeOfDayUsage) * 100}%` }}
                          />
                          <div className="mt-2 text-xs text-center">
                            {timeSlot.time.split(" ")[0]}
                            <br />
                            {timeSlot.usage}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Session duration */}
              <Card className="bg-zinc-900/30 backdrop-blur-sm border-zinc-800/50">
                <CardHeader>
                  <CardTitle>Session Duration</CardTitle>
                  <CardDescription>Length of your interactions with Kali-E</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <div className="flex h-full items-end space-x-2">
                      {data.usageData.map((day) => (
                        <div key={day.date} className="group relative flex h-full w-full flex-col justify-end">
                          <div
                            className="bg-gradient-to-t from-blue-400 to-blue-300 rounded-t-sm w-full transition-all hover:opacity-90"
                            style={{ height: `${(day.duration / 20) * 100}%` }}
                          />
                          <div className="absolute bottom-0 left-0 right-0 -mb-6 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-center">
                            {formatDate(day.date)}
                            <br />
                            {day.duration} min
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly pattern */}
              <Card className="bg-zinc-900/30 backdrop-blur-sm border-zinc-800/50 md:col-span-2">
                <CardHeader>
                  <CardTitle>Weekly Usage Pattern</CardTitle>
                  <CardDescription>Your usage pattern throughout the week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] w-full">
                    <div className="flex h-full items-end space-x-12 justify-center">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                        const height = 30 + Math.random() * 70
                        return (
                          <div key={day} className="group relative flex h-full w-16 flex-col justify-end">
                            <div
                              className="bg-gradient-to-t from-purple-500 to-purple-300 rounded-t-sm w-full transition-all hover:opacity-90"
                              style={{ height: `${height}%` }}
                            />
                            <div className="mt-2 text-sm text-center">{day}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Feature Analytics Tab */}
          <TabsContent value="features" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Feature usage */}
              <Card className="bg-zinc-900/30 backdrop-blur-sm border-zinc-800/50">
                <CardHeader>
                  <CardTitle>Feature Usage</CardTitle>
                  <CardDescription>Most used features and plugins</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.featureData.map((feature) => (
                      <div key={feature.name} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{feature.name}</span>
                          <span className="text-sm text-gray-400">{feature.usage} uses</span>
                        </div>
                        <div className="w-full bg-zinc-800 rounded-full h-2">
                          <div
                            className="bg-white rounded-full h-2"
                            style={{ width: `${(feature.usage / maxFeatureUsage) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Feature distribution */}
              <Card className="bg-zinc-900/30 backdrop-blur-sm border-zinc-800/50">
                <CardHeader>
                  <CardTitle>Feature Distribution</CardTitle>
                  <CardDescription>Percentage breakdown of feature usage</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                  <div className="relative h-[250px] w-[250px]">
                    <PieChart className="h-full w-full text-gray-400" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-lg font-medium">7</p>
                        <p className="text-xs text-gray-400">Features Used</p>
                      </div>
                    </div>
                  </div>

                  <div className="ml-6 space-y-2">
                    {data.featureData.map((feature, index) => {
                      const colors = [
                        "bg-white",
                        "bg-blue-400",
                        "bg-green-400",
                        "bg-yellow-400",
                        "bg-purple-400",
                        "bg-red-400",
                        "bg-pink-400",
                      ]
                      return (
                        <div key={feature.name} className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]} mr-2`} />
                          <span className="text-xs">{feature.name}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Feature growth */}
              <Card className="bg-zinc-900/30 backdrop-blur-sm border-zinc-800/50 md:col-span-2">
                <CardHeader>
                  <CardTitle>Feature Adoption Over Time</CardTitle>
                  <CardDescription>How your feature usage has evolved</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] w-full">
                    {/* This would be a line chart in a real implementation */}
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <p>Feature adoption trends would be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
