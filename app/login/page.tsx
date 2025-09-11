"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { MapPin, MessageSquare, TrendingUp, CheckCircle, Clock, Heart, Target } from "lucide-react"
import LoginOptions from "@/components/login-options"
import DarkModeToggle from "@/components/dark-mode-toggle"
import LanguageToggle from "@/components/language-toggle"
import NotificationToast from "@/components/notification-toast"
import CivicLogo from "@/components/civic-logo"
import { useLanguage } from "@/contexts/language-context"

export default function LoginPage() {
  const router = useRouter()
  const { t } = useLanguage()

  const [notification, setNotification] = useState<{
    message: string
    type: "success" | "error" | "info"
    isVisible: boolean
  }>({
    message: "",
    type: "success",
    isVisible: false,
  })

  const handleLoginSuccess = (method: string, identifier: string, role?: "user" | "admin") => {
    const session = {
      [method === "mobile" ? "phoneNumber" : "email"]: identifier,
      role: role || "user",
      loginTime: new Date().toISOString(),
      isAuthenticated: true,
    }

    localStorage.setItem("civicsense_user_session", JSON.stringify(session))

    setNotification({
      message: `Successfully logged in as ${role || "user"}!`,
      type: "success",
      isVisible: true,
    })

    // Redirect to home page after successful login
    setTimeout(() => {
      router.push("/")
    }, 1500)
  }

  const faqs = [
    {
      question: t("faq.reportIssue.question"),
      answer: t("faq.reportIssue.answer"),
    },
    {
      question: t("faq.security.question"),
      answer: t("faq.security.answer"),
    },
    {
      question: t("faq.resolution.question"),
      answer: t("faq.resolution.answer"),
    },
    {
      question: t("faq.tracking.question"),
      answer: t("faq.tracking.answer"),
    },
    {
      question: t("faq.issueTypes.question"),
      answer: t("faq.issueTypes.answer"),
    },
    {
      question: t("faq.account.question"),
      answer: t("faq.account.answer"),
    },
    {
      question: t("faq.whatsapp.question"),
      answer: t("faq.whatsapp.answer"),
    },
    {
      question: t("faq.afterSubmit.question"),
      answer: t("faq.afterSubmit.answer"),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <CivicLogo size="lg" onClick={() => router.push("/")} />
            </div>
            <div className="flex items-center space-x-4">
              <LanguageToggle />
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl text-balance">
              {t("login.welcome")} <span className="text-primary">CivicSense</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground text-pretty">{t("login.subtitle")}</p>
          </div>

          {/* Login Section - Now at the top */}
          <div className="mx-auto max-w-2xl mb-16">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{t("login.title")}</CardTitle>
                <CardDescription>{t("login.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <LoginOptions onLoginSuccess={handleLoginSuccess} />
              </CardContent>
            </Card>
          </div>

          {/* About Section */}
          <div className="mb-12">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">{t("about.title")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("about.subtitle")}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5 text-primary" />
                    {t("about.mission.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground leading-relaxed">{t("about.mission.description")}</p>
                </CardContent>
              </Card>

              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Heart className="h-5 w-5 text-primary" />
                    {t("about.values.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-muted-foreground">{t("about.values.transparency")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-muted-foreground">{t("about.values.empowerment")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-muted-foreground">{t("about.values.technology")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    {t("about.features.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">{t("about.features.reporting")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">{t("about.features.location")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">{t("about.features.tracking")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground">{t("faq.title")}</h2>
              <p className="mt-2 text-muted-foreground">{t("faq.subtitle")}</p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                      <AccordionContent className="text-foreground leading-relaxed">{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <NotificationToast
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={() => setNotification((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  )
}
