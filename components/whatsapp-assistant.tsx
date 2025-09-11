"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, Send, X, Phone, Video, MoreVertical, ChevronUp } from "lucide-react"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
}

interface WhatsAppAssistantProps {
  isOpen: boolean
  onToggle: () => void
}

export default function WhatsAppAssistant({ isOpen, onToggle }: WhatsAppAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content:
        "Hi! 👋 Welcome to CivicSense WhatsApp Bot!\n\nI can help you:\n• Report civic issues 📝\n• Track your reports 📍\n• Get help and support 💬\n\nJust type what you need!",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [showScrollButtons, setShowScrollButtons] = useState(false)
  const [canScrollUp, setCanScrollUp] = useState(false)
  const [canScrollDown, setCanScrollDown] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const scrollToTop = () => {
    messagesContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
      const isScrollable = scrollHeight > clientHeight + 10 // Add buffer
      const isAtTop = scrollTop <= 10
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10

      setCanScrollUp(isScrollable && !isAtTop)
      setCanScrollDown(isScrollable && !isAtBottom)
      setShowScrollButtons(isScrollable && (!isAtTop || !isAtBottom))
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) {
      let timeoutId: NodeJS.Timeout
      const debouncedHandleScroll = () => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(handleScroll, 50)
      }

      container.addEventListener("scroll", debouncedHandleScroll)
      // Check initial state after a short delay
      setTimeout(handleScroll, 100)

      return () => {
        container.removeEventListener("scroll", debouncedHandleScroll)
        clearTimeout(timeoutId)
      }
    }
  }, [messages, isOpen])

  const generateReportId = () => {
    const prefix = "R"
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `${prefix}-${timestamp}${random}`
  }

  const createReportFromChat = (description: string, location?: string) => {
    const reportId = generateReportId()
    const reportData = {
      id: reportId,
      title: description.length > 50 ? description.substring(0, 50) + "..." : description,
      description: description,
      category: "Other",
      urgency: "medium",
      address: location || "Location provided via WhatsApp",
      latitude: "",
      longitude: "",
      photo: null,
      photoName: null,
      status: "submitted",
      channel: "whatsapp",
      submittedAt: new Date().toISOString(),
      timeline: [
        {
          status: "submitted",
          timestamp: new Date().toISOString(),
          description: "Report submitted via WhatsApp assistant",
        },
      ],
    }

    const existingReports = JSON.parse(localStorage.getItem("civicsense_reports") || "[]")
    existingReports.push(reportData)
    localStorage.setItem("civicsense_reports", JSON.stringify(existingReports))

    return reportId
  }

  const findReport = (reportId: string) => {
    const existingReports = JSON.parse(localStorage.getItem("civicsense_reports") || "[]")
    return existingReports.find((r: any) => r.id === reportId)
  }

  const processMessage = async (userMessage: string) => {
    const message = userMessage.toLowerCase().trim()

    if (message.includes("help") || message.includes("hi") || message.includes("hello")) {
      return `🤖 *CivicSense Guide Bot*

I can help you navigate the website! 🌟

🏠 *Website Navigation*
Type: "home" - Go to main page
Type: "report form" - Learn reporting process
Type: "tracking" - How to track reports

📚 *Feature Guides*
Type: "how to report" - Step-by-step guide
Type: "photo upload" - How to add photos
Type: "map guide" - Using interactive map

🔐 *Account Help*
Type: "login help" - Login instructions
Type: "sign up" - Create new account

🎯 *Quick Tour*
Type: "tour" - Full website walkthrough

Just tell me what you need help with! 😊`
    }

    if (message.includes("track") || message.includes("tracking")) {
      return `📍 *Report Tracking Guide*

To track your reports:

*Step 1:* Click "Track Report" in navigation 🧭
*Step 2:* Enter your Report ID (starts with R-) 🔢
*Step 3:* View real-time status updates 📊

*Status Types:*
✅ Submitted - Report received
🔄 Under Review - Being evaluated  
🚧 In Progress - Work started
✅ Resolved - Issue fixed

*Find Report ID:*
• On confirmation screen after submitting
• In email/SMS notifications 📧

*Tip:* Save your Report ID for easy tracking! 💡

Need help finding the tracking page? 🤔`
    }

    if (message.includes("report") || message.includes("how to report")) {
      return `📝 *How to Report Issues*

*Step-by-Step Process:*

*1️⃣ Navigate to Report Form*
Click "Report Issue" button on homepage

*2️⃣ Fill Required Details*
• Issue title & description ✍️
• Select category (Road, Water, etc.) 📋
• Choose urgency level ⚡

*3️⃣ Add Location*
• Click on interactive map 🗺️
• Or type address manually 📍

*4️⃣ Upload Photos*
• Required for verification 📸
• Multiple photos recommended 📷

*5️⃣ Submit & Get ID*
• Receive unique Report ID 🎫
• Save for tracking purposes 💾

*Pro Tips:*
• Clear photos = faster resolution 🚀
• Detailed descriptions help authorities 📝
• Check location accuracy on map ✅

Ready to start reporting? 🤔`
    }

    if (message.includes("status") || message.includes("tour") || message.includes("guide me")) {
      return `🎯 *CivicSense Website Tour*

*🏠 Homepage Features:*
• Hero section with quick actions
• Statistics dashboard 📊
• Feature highlights ⭐
• Success stories 🏆

*📝 Report Section:*
• Interactive form builder
• Smart map integration 🗺️
• Photo upload system 📸
• Category selection 📋

*📍 Tracking Section:*
• Real-time status updates ⏱️
• Progress timeline 📈
• Notification system 🔔
• History tracking 📚

*🤖 AI Assistants:*
• Web chat assistant (like me!) 💬
• WhatsApp bot integration 📱

*Navigation Tips:*
• Use top menu for quick access 🧭
• Mobile hamburger menu 📱
• Breadcrumb navigation 🍞

Where would you like to explore first? 🚀`
    }

    if (message.includes("contact") || message.includes("login") || message.includes("sign up")) {
      if (message.includes("login") || message.includes("sign up")) {
        return `🔐 *Login & Account Guide*

*🚪 How to Login:*
1. Click "Login" in top navigation
2. Choose your method:
   • 📱 Mobile OTP (recommended)
   • 📧 Email & Password

*📝 Creating New Account:*
• Sign up option available on login page
• Only for regular users (not admin)
• Quick verification process

*🔑 Login Tips:*
• Mobile OTP is fastest for new users
• Keep login details secure 🔒
• Remember to logout on shared devices

*👤 User vs Admin:*
• Users: Report & track issues
• Admins: Manage & resolve reports

*Need help getting to login page?* 🤔

Type "navigate login" for step-by-step directions! 🧭`
      }

      return `📞 *Getting Help & Support*

*🌐 Website Navigation:*
• Use top menu for main sections
• Mobile users: tap hamburger menu 📱
• Breadcrumbs show your location 🍞

*🆘 Need Assistance?*
• Use this chat for instant help 💬
• AI assistants available 24/7 🤖
• Multi-language support 🌍

*📚 Self-Help Resources:*
• Feature guides in chat
• Step-by-step tutorials
• Interactive walkthroughs

*🚨 Emergency Issues:*
For urgent safety matters, contact local emergency services directly!

*What can I help you with?*
• Website navigation 🧭
• Feature explanations 📖
• Account assistance 👤
• Reporting guidance 📝

Just ask! 😊`
    }

    if (message.includes("photo") || message.includes("map") || message.includes("features")) {
      if (message.includes("photo")) {
        return `📸 *Photo Upload Guide*

*📱 How to Add Photos:*
1. Go to Report Form
2. Find "Photo Upload" section
3. Click "Choose Photos" button
4. Select from your device 📁
5. Preview before submitting ✅

*📷 Photo Tips:*
• Good lighting is key 💡
• Show issue clearly 🎯
• Multiple angles help 📐
• JPG/PNG formats work best 💾

*⚠️ Important:*
Photos are REQUIRED for all reports!
They help authorities understand issues better 🔍

*Having upload issues?*
• Check file size (max 10MB) 📏
• Ensure stable internet 📶
• Try different photo format 🔄

Need help navigating to report form? 🤔`
      }

      if (message.includes("map")) {
        return `🗺️ *Interactive Map Guide*

*🎯 How to Use Map:*
1. Navigate to Report Form
2. Find map section 📍
3. Click exact location of issue
4. Marker will appear 📌
5. Confirm location accuracy ✅

*🔧 Map Features:*
• Zoom in/out with controls 🔍
• Drag to pan around 👆
• Click to place marker 📍
• Real-time location detection 📡

*💡 Pro Tips:*
• Zoom in for precise location 🎯
• Double-check marker placement ✅
• Use satellite view if needed 🛰️
• Address auto-fills from map 📝

*🚫 Map Not Working?*
• Enable location permissions 📱
• Check internet connection 📶
• Try refreshing page 🔄

Ready to try the map? 🗺️`
      }

      return `🌟 *CivicSense Features*

*🗺️ Smart Location:*
• Interactive map selection
• GPS auto-detection 📡
• Address verification ✅

*📱 Multi-Platform:*
• Web interface 💻
• WhatsApp integration 📱
• Mobile responsive 📲

*🔍 Smart Tracking:*
• Real-time updates ⏱️
• Status notifications 🔔
• Progress history 📈

*🤖 AI Powered:*
• Instant chat support 💬
• Multi-language help 🌍
• 24/7 availability ⏰

*📊 Analytics:*
• Community statistics 📈
• Resolution tracking 📋
• Impact measurement 🎯

Which feature interests you most? 🤔`
    }

    return `🤔 I didn't quite understand that.

*🧭 Try these navigation commands:*
• "home" - Go to homepage
• "report form" - Learn how to report
• "tracking" - Track your reports
• "tour" - Full website walkthrough

*📚 Or ask about features:*
• "photo upload" - How to add photos
• "map guide" - Using the map
• "login help" - Account assistance

*💡 Quick Tips:*
• Be specific about what you need
• Ask about any website feature
• I'm here to guide you! 😊

What would you like help with? 🌟`
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const messageContent = inputValue.trim()

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: messageContent,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    setTimeout(async () => {
      const response = await processMessage(messageContent)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1200)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-6 right-24 h-14 w-14 rounded-full shadow-lg z-50 bg-green-500 hover:bg-green-600"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-6 right-24 w-96 h-[500px] shadow-xl z-50 flex flex-col overflow-hidden">
      {/* WhatsApp-style header */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-green-600 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base">CivicSense Bot</CardTitle>
            <div className="text-xs opacity-90">Online</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-white hover:bg-green-700 p-1">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-green-700 p-1">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-green-700 p-1">
            <MoreVertical className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-white hover:bg-red-500 hover:text-white p-2 ml-2 rounded-full transition-all duration-200 border-2 border-transparent hover:border-red-300 bg-red-600/20 hover:bg-red-500"
            title="Close chat"
          >
            <X className="h-6 w-6 font-bold" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 bg-green-50 relative">
        {/* Messages */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-3"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="whatsapp-bg" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse"%3E%3Cpath d="M0 0h100v100H0z" fill="%23f0f2f5"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100" height="100" fill="url(%23whatsapp-bg)"/%3E%3C/svg%3E")',
          }}
        >
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 shadow-sm ${
                  message.type === "user"
                    ? "bg-green-500 text-white rounded-br-none"
                    : "bg-white text-gray-800 rounded-bl-none"
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                <div className={`text-xs mt-1 ${message.type === "user" ? "text-green-100" : "text-gray-500"}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 rounded-lg rounded-bl-none px-3 py-2 max-w-[80%] shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {canScrollUp && (
          <div className="absolute right-4 bottom-24 z-10">
            <Button
              variant="secondary"
              size="sm"
              onClick={scrollToTop}
              className="h-10 w-10 p-0 bg-green-500 hover:bg-green-600 shadow-lg border-2 border-white text-white rounded-full transition-all duration-200 hover:scale-110"
              title="Scroll to top"
            >
              <ChevronUp className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Input */}
        <div className="bg-white border-t p-4">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 rounded-full border-gray-300"
            />
            <Button
              onClick={handleSendMessage}
              size="icon"
              disabled={!inputValue.trim()}
              className="rounded-full bg-green-500 hover:bg-green-600"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
