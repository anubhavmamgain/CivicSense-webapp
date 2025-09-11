"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, Send, X, Bot, User, Search, HelpCircle, ChevronUp, ChevronDown, Languages } from "lucide-react"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
}

interface WebAssistantProps {
  isOpen: boolean
  onToggle: () => void
}

const translations = {
  en: {
    title: "CivicSense Assistant",
    placeholder: "Type your message...",
    help: "Help",
    status: "Status",
    welcome:
      'Hello! I\'m your CivicSense assistant. I can help you report issues, track reports, or answer questions. Try saying "help" to see what I can do!',
    loginResponse: `🔐 **Login Guide**

To login:

1️⃣ **Look for the "Login" button** in the navigation bar (top right)
2️⃣ **Two options available:**
   • 📱 Mobile OTP - Login with phone number
   • 📧 Email - Login with email and password

3️⃣ **New users:** Sign up option is also available

**Tip:** If you\'re new, Mobile OTP is the easiest option!

Would you like me to guide you to the login page?`,
    reportCreated: "✅ **Report Created Successfully!**",
    reportError: "❌ **Error Creating Report**",
    contactInfo: `🌟 **Key Features**

**🗺️ Interactive Map**
• Click to select location
• Zoom in/out
• Real-time location

**📱 Multi-Channel Reporting**
• Web interface
• WhatsApp bot
• Mobile friendly

**🔍 Smart Tracking**
• Real-time updates
• Status notifications
• Progress history

**🤖 AI Assistance**
• 24/7 support
• Multi-language support
• Instant guidance

Which feature would you like to know about?`,
  },
  hi: {
    title: "सिविकसेंस सहायक",
    placeholder: "अपना संदेश टाइप करें...",
    help: "सहायता",
    status: "स्थिति",
    welcome:
      'नमस्ते! मैं आपका सिविकसेंस सहायक हूं। मैं आपको समस्याओं की रिपोर्ट करने, रिपोर्ट ट्रैक करने या प्रश्नों के उत्तर देने में मदद कर सकता हूं। "सहायता" कहकर देखें कि मैं क्या कर सकता हूं!',
    loginResponse: `🔐 **लॉगिन गाइड**

लॉगिन करने के लिए:

1️⃣ **नेवीगेशन बार में "लॉगिन" बटन खोजें** (ऊपरी दाएं कोने में)
2️⃣ **दो विकल्प उपलब्ध हैं:**
   • 📱 मोबाइल OTP - फोन नंबर से लॉगिन
   • 📧 ईमेल - ईमेल और पासवर्ड से लॉगिन

3️⃣ **नए उपयोगकर्ता:** साइन अप विकल्प भी उपलब्ध है

**सुझाव:** यदि आप पहली बार हैं, तो मोबाइल OTP सबसे आसान है!

क्या आपको लॉगिन पेज पर जाने में मदद चाहिए?`,
    reportCreated: "✅ **रिपोर्ट सफलतापूर्वक बनाई गई!**",
    reportError: "❌ **रिपोर्ट बनाने में त्रुटि**",
    contactInfo: `🌟 **मुख्य फीचर्स**

**🗺️ इंटरैक्टिव मैप**
• क्लिक करके स्थान चुनें
• ज़ूम इन/आउट करें
• रियल-टाइम लोकेशन

**📱 मल्टी-चैनल रिपोर्टिंग**
• वेब इंटरफेस
• व्हाट्सऐप बॉट
• मोबाइल फ्रेंडली

**🔍 स्मार्ट ट्रैकिंग**
• रियल-टाइम अपडेट
• स्टेटस नोटिफिकेशन
• प्रगति हिस्ट्री

**🤖 AI असिस्टेंस**
• 24/7 सहायता
• बहुभाषी सपोर्ट
• इंस्टेंट गाइडेंस

कौन सा फीचर जानना चाहते हैं?`,
  },
}

export default function WebAssistant({ isOpen, onToggle }: WebAssistantProps) {
  const [language, setLanguage] = useState<"en" | "hi">("en")
  const t = translations[language]

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content: t.welcome,
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

  useEffect(() => {
    setMessages([
      {
        id: "1",
        type: "assistant",
        content: t.welcome,
        timestamp: new Date(),
      },
    ])
  }, [language, t.welcome])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const scrollToTop = () => {
    messagesContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
      const isScrollable = scrollHeight > clientHeight + 10
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
    try {
      const reportId = generateReportId()
      const reportData = {
        id: reportId,
        title: description.length > 50 ? description.substring(0, 50) + "..." : description,
        description: description,
        category: "Other",
        urgency: "medium",
        address: location || "Location provided via chat",
        latitude: "",
        longitude: "",
        photo: null,
        photoName: null,
        status: "submitted",
        channel: "web-chat",
        submittedAt: new Date().toISOString(),
        timeline: [
          {
            status: "submitted",
            timestamp: new Date().toISOString(),
            description: "Report submitted via web assistant",
          },
        ],
      }

      const existingReports = JSON.parse(localStorage.getItem("civicReports") || "[]")
      existingReports.push(reportData)
      localStorage.setItem("civicReports", JSON.stringify(existingReports))

      return reportId
    } catch (error) {
      console.error("[v0] Error creating report:", error)
      return null
    }
  }

  const findReport = (reportId: string) => {
    try {
      const existingReports = JSON.parse(localStorage.getItem("civicReports") || "[]")
      return existingReports.find((r: any) => r.id === reportId)
    } catch (error) {
      console.error("[v0] Error finding report:", error)
      return null
    }
  }

  const processMessage = async (userMessage: string) => {
    const message = userMessage.toLowerCase().trim()

    if (message.includes("help") || message.includes("सहायता")) {
      return language === "hi"
        ? `🤖 **सिविकसेंस गाइड**

मैं आपकी इनमें मदद कर सकता हूं:

🏠 **वेबसाइट नेवीगेशन**
• "होम" - मुख्य पृष्ठ पर जाएं
• "रिपोर्ट फॉर्म" - समस्या रिपोर्ट करने का तरीका जानें
• "ट्रैकिंग" - अपनी रिपोर्ट कैसे ट्रैक करें

📚 **फीचर गाइड**
• "कैसे रिपोर्ट करें" - रिपोर्टिंग प्रक्रिया की जानकारी
• "फोटो अपलोड" - फोटो कैसे जोड़ें
• "मैप उपयोग" - मैप कैसे इस्तेमाल करें

🔐 **खाता सहायता**
• "लॉगिन" - लॉगिन विकल्पों के बारे में जानें
• "साइन अप" - नया खाता कैसे बनाएं

बस बताएं कि आपको क्या जानना है!`
        : `🤖 **CivicSense Guide**

I can help you with:

🏠 **Website Navigation**
• "home" - Go to main page
• "report form" - Learn how to report issues
• "tracking" - How to track your reports

📚 **Feature Guide**
• "how to report" - Step-by-step reporting process
• "photo upload" - How to add photos
• "map usage" - How to use the interactive map

🔐 **Account Help**
• "login" - Learn about login options
• "sign up" - How to create a new account

Just tell me what you\'d like to know!`
    }

    if (message.includes("login") || message.includes("लॉगिन") || message.includes("authenticate")) {
      return t.loginResponse
    }

    if (message.includes("track") || message.includes("ट्रैक") || message.includes("tracking")) {
      return language === "hi"
        ? `📍 **रिपोर्ट ट्रैकिंग गाइड**

अपनी रिपोर्ट ट्रैक करने के लिए:

1️⃣ **नेवीगेशन में "ट्रैक रिपोर्ट" पर क्लिक करें**
2️⃣ **अपनी रिपोर्ट आईडी दर्ज करें** (R- से शुरू होती है)
3️⃣ **रियल-टाइम स्टेटस देखें:**
   • जमा किया गया ✅
   • समीक्षा में 🔄
   • प्रगति में 🚧
   • हल हो गया ✅

**रिपोर्ट आईडी कहां मिलेगी:**
• रिपोर्ट जमा करने के बाद स्क्रीन पर
• ईमेल/SMS नोटिफिकेशन में

क्या आपको ट्रैकिंग पेज पर जाने में मदद चाहिए?`
        : `📍 **Report Tracking Guide**

To track your reports:

1️⃣ **Click "Track Report" in navigation**
2️⃣ **Enter your Report ID** (starts with R-)
3️⃣ **View real-time status:**
   • Submitted ✅
   • Under Review 🔄
   • In Progress 🚧
   • Resolved ✅

**Where to find Report ID:**
• On screen after submitting report
• In email/SMS notifications

Would you like me to guide you to the tracking page?`
    }

    if (message.includes("report") || message.includes("रिपोर्ट") || message.includes("how to report")) {
      return language === "hi"
        ? `📝 **रिपोर्ट करने का गाइड**

समस्या रिपोर्ट करने के लिए:

1️⃣ **"रिपोर्ट इश्यू" बटन पर क्लिक करें** (होम पेज पर या नेवीगेशन में)

2️⃣ **फॉर्म भरें:**
   • समस्या का शीर्षक
   • विस्तृत विवरण
   • श्रेणी चुनें (सड़क, पानी, बिजली, आदि)
   • तात्कालिकता स्तर

3️⃣ **स्थान जोड़ें:**
   • मैप पर क्लिक करें
   • या पता टाइप करें

4️⃣ **फोटो अपलोड करें** (आवश्यक)

5️⃣ **सबमिट करें और रिपोर्ट आईडी प्राप्त करें**

**सुझाव:** स्पष्ट फोटो और विस्तृत विवरण तेज़ समाधान में मदद करते हैं!

क्या आपको रिपोर्ट फॉर्म पर जाने में मदद चाहिए?`
        : `📝 **How to Report Guide**

To report an issue:

1️⃣ **Click "Report Issue" button** (on home page or navigation)

2️⃣ **Fill the form:**
   • Issue title
   • Detailed description
   • Select category (Road, Water, Electricity, etc.)
   • Urgency level

3️⃣ **Add location:**
   • Click on the map
   • Or type the address

4️⃣ **Upload photos** (required)

5️⃣ **Submit and get Report ID**

**Tip:** Clear photos and detailed descriptions help faster resolution!

Would you like me to guide you to the report form?`
    }

    if (
      message.includes("status") ||
      message.includes("स्थिति") ||
      message.includes("tour") ||
      message.includes("guide me")
    ) {
      return language === "hi"
        ? `🎯 **वेबसाइट टूर**

**मुख्य सेक्शन:**

🏠 **होम पेज**
• सिविकसेंस के बारे में जानकारी
• मुख्य फीचर्स
• आंकड़े और सफलता की कहानियां

📝 **रिपोर्ट सेक्शन**
• इंटरैक्टिव फॉर्म
• मैप इंटीग्रेशन
• फोटो अपलोड

📍 **ट्रैकिंग सेक्शन**
• रियल-टाइम अपडेट
• प्रगति ट्रैकिंग
• स्टेटस हिस्ट्री

🤖 **AI असिस्टेंट्स**
• वेब चैट (यह मैं हूं!)
• व्हाट्सऐप बॉट

**नेवीगेशन टिप्स:**
• टॉप मेनू का उपयोग करें
• मोबाइल पर हैमबर्गर मेनू देखें

कहां से शुरू करना चाहते हैं?`
        : `🎯 **Website Tour**

**Main Sections:**

🏠 **Home Page**
• Information about CivicSense
• Key features overview
• Statistics and success stories

📝 **Report Section**
• Interactive form
• Map integration
• Photo upload

📍 **Tracking Section**
• Real-time updates
• Progress tracking
• Status history

🤖 **AI Assistants**
• Web chat (that\'s me!)
• WhatsApp bot

**Navigation Tips:**
• Use the top menu
• Look for hamburger menu on mobile

Where would you like to start?`
    }

    if (
      message.includes("contact") ||
      message.includes("संपर्क") ||
      message.includes("features") ||
      message.includes("photo upload")
    ) {
      if (message.includes("photo") || message.includes("फोटो")) {
        return language === "hi"
          ? `📸 **फोटो अपलोड गाइड**

फोटो जोड़ने के लिए:

1️⃣ **रिपोर्ट फॉर्म में "फोटो अपलोड" सेक्शन खोजें**
2️⃣ **"फोटो चुनें" बटन पर क्लिक करें**
3️⃣ **अपने डिवाइस से फोटो सेलेक्ट करें**
4️⃣ **प्रीव्यू देखें और कन्फर्म करें**

**बेहतर फोटो के लिए टिप्स:**
• अच्छी रोशनी में लें
• समस्या को स्पष्ट रूप से दिखाएं
• कई एंगल से फोटो लें
• JPG या PNG फॉर्मेट का उपयोग करें

**नोट:** फोटो अपलोड करना आवश्यक है - यह अधिकारियों को समस्या को बेहतर समझने में मदद करता है!`
          : `📸 **Photo Upload Guide**

To add photos:

1️⃣ **Find "Photo Upload" section in report form**
2️⃣ **Click "Choose Photos" button**
3️⃣ **Select photos from your device**
4️⃣ **Preview and confirm**

**Tips for better photos:**
• Take in good lighting
• Show the issue clearly
• Take multiple angles
• Use JPG or PNG format

**Note:** Photo upload is required - it helps authorities understand the issue better!`
      }

      return t.contactInfo
    }

    return language === "hi"
      ? `🤔 मुझे यकीन नहीं है कि इसमें कैसे मदद करूं। यहां कुछ चीजें हैं जो आप कोशिश कर सकते हैं:

**नेवीगेशन सहायता:**
• "होम" - मुख्य पृष्ठ पर जाएं
• "रिपोर्ट फॉर्म" - समस्या रिपोर्ट करने का तरीका
• "ट्रैकिंग" - अपनी रिपोर्ट कैसे ट्रैक करें

**फीचर गाइड:**
• "फोटो अपलोड" - फोटो कैसे जोड़ें
• "मैप उपयोग" - मैप कैसे इस्तेमाल करें
• "लॉगिन" - खाता कैसे बनाएं

**सामान्य सहायता:**
• "टूर" - पूरी वेबसाइट का गाइड
• "फीचर्स" - सभी सुविधाओं की जानकारी

आप क्या जानना चाहते हैं?`
      : `🤔 I\'m not sure how to help with that. Here are some things you can try:

**Navigation Help:**
• "home" - Go to main page
• "report form" - How to report issues
• "tracking" - How to track reports

**Feature Guide:**
• "photo upload" - How to add photos
• "map usage" - How to use the map
• "login" - How to create account

**General Help:**
• "tour" - Full website guide
• "features" - All feature information

What would you like to know?`
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
      try {
        const response = await processMessage(messageContent)
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: response,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])
      } catch (error) {
        console.error("[v0] Error processing message:", error)
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: "Sorry, I encountered an error processing your message. Please try again.",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setIsTyping(false)
      }
    }, 800)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return (
      <Button onClick={onToggle} className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50" size="icon">
        <MessageCircle className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-xl z-50 flex flex-col max-h-[calc(100vh-3rem)]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-primary text-primary-foreground rounded-t-lg flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bot className="h-5 w-5" />
          {t.title}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === "en" ? "hi" : "en")}
            className="text-primary-foreground hover:bg-primary-foreground/20"
            title={language === "en" ? "Switch to Hindi" : "Switch to English"}
          >
            <Languages className="h-4 w-4" />
            <span className="ml-1 text-xs">{language === "en" ? "हि" : "EN"}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 relative min-h-0">
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
          style={{ maxHeight: "calc(100% - 120px)" }}
        >
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 break-words ${
                  message.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.type === "assistant" && <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                  {message.type === "user" && <User className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                  <div className="text-sm whitespace-pre-wrap break-words">{message.content}</div>
                </div>
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted text-foreground rounded-lg px-3 py-2 max-w-[85%]">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-current rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-current rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {showScrollButtons && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-1 z-10">
            {canScrollUp && (
              <Button
                variant="secondary"
                size="sm"
                onClick={scrollToTop}
                className="h-8 w-8 p-0 bg-background/95 backdrop-blur-sm shadow-lg border hover:bg-accent"
                title="Scroll to top"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            )}
            {canScrollDown && (
              <Button
                variant="secondary"
                size="sm"
                onClick={scrollToBottom}
                className="h-8 w-8 p-0 bg-background/95 backdrop-blur-sm shadow-lg border hover:bg-accent"
                title="Scroll to bottom"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        <div className="border-t p-4 flex-shrink-0 bg-background">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t.placeholder}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} size="icon" disabled={!inputValue.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={() => setInputValue(language === "hi" ? "सहायता" : "help")}>
              <HelpCircle className="h-3 w-3 mr-1" />
              {t.help}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setInputValue(language === "hi" ? "स्थिति" : "status")}>
              <Search className="h-3 w-3 mr-1" />
              {t.status}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
