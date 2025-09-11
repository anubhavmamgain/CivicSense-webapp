"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  MapPin,
  MessageSquare,
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  LogOut,
  User,
  Shield,
} from "lucide-react"
import ReportForm from "@/components/report-form"
import ReportSuccess from "@/components/report-success"
import TrackReport from "@/components/track-report"
import AdminDashboard from "@/components/admin-dashboard"
import WebAssistant from "@/components/web-assistant"
import WhatsAppAssistant from "@/components/whatsapp-assistant"
import DarkModeToggle from "@/components/dark-mode-toggle"
import LanguageToggle from "@/components/language-toggle"
import NotificationToast from "@/components/notification-toast"
import RatingModal from "@/components/rating-modal"
import CivicLogo from "@/components/civic-logo"
import { useLanguage } from "@/contexts/language-context"

export default function HomePage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [currentView, setCurrentView] = useState("home")
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null)
  const [isWebAssistantOpen, setIsWebAssistantOpen] = useState(false)
  const [isWhatsAppAssistantOpen, setIsWhatsAppAssistantOpen] = useState(false)
  const [userSession, setUserSession] = useState<{
    phoneNumber?: string
    email?: string
    role?: "user" | "admin"
    isAuthenticated: boolean
  } | null>(null)
  const [notification, setNotification] = useState<{
    message: string
    type: "success" | "error" | "info"
    isVisible: boolean
  }>({
    message: "",
    type: "success",
    isVisible: false,
  })
  const [ratingModal, setRatingModal] = useState<{ isOpen: boolean; reportId: string }>({
    isOpen: false,
    reportId: "",
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const session = localStorage.getItem("civicsense_user_session")
      if (session) {
        setUserSession(JSON.parse(session))
      } else {
        router.push("/login")
      }
    }
  }, [router])

  if (!userSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    )
  }

  const handleLoginSuccess = (method: string, identifier: string, role?: "user" | "admin") => {
    const session = {
      [method === "mobile" ? "phoneNumber" : "email"]: identifier,
      role: role || "user",
      loginTime: new Date().toISOString(),
      isAuthenticated: true,
    }
    setUserSession(session)
    setCurrentView("home")
    setNotification({
      message: `Successfully logged in as ${role || "user"} with ${method === "mobile" ? "mobile number" : "email"}!`,
      type: "success",
      isVisible: true,
    })
  }

  const handleLogout = () => {
    localStorage.removeItem("civicsense_user_session")
    setUserSession(null)
    setNotification({
      message: "Successfully logged out!",
      type: "info",
      isVisible: true,
    })
    router.push("/login")
  }

  const handleReportSuccess = (reportId: string) => {
    setSubmittedReportId(reportId)
    setCurrentView("report-success")
    setNotification({
      message: "Report submitted successfully! You'll receive updates on its progress.",
      type: "success",
      isVisible: true,
    })
  }

  const handleBackToForm = () => {
    setSubmittedReportId(null)
    setCurrentView("report")
  }

  const handleTrackReport = () => {
    setCurrentView("track")
  }

  const handleSubmitRating = (rating: number, feedback: string) => {
    const reports = JSON.parse(localStorage.getItem("civicReports") || "[]")
    const updatedReports = reports.map((report: any) =>
      report.id === ratingModal.reportId ? { ...report, rating, feedback } : report,
    )
    localStorage.setItem("civicReports", JSON.stringify(updatedReports))

    setNotification({
      message: "Thank you for your feedback! Your rating has been recorded.",
      type: "success",
      isVisible: true,
    })
  }

  const showRatingModal = (reportId: string) => {
    setRatingModal({ isOpen: true, reportId })
  }

  const features = [
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: t("multiChannelReporting"),
      description: t("multiChannelDescription"),
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: t("smartLocationDetection"),
      description: t("smartLocationDescription"),
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: t("communityDriven"),
      description: t("communityDrivenDescription"),
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: t("realTimeTracking"),
      description: t("realTimeTrackingDescription"),
    },
  ]

  const stats = [
    { label: t("issuesReported"), value: "0", icon: <AlertTriangle className="h-5 w-5" /> },
    { label: t("issuesResolved"), value: "0", icon: <CheckCircle className="h-5 w-5" /> },
    { label: t("avgResolutionTime"), value: `0 ${t("days")}`, icon: <Clock className="h-5 w-5" /> },
    { label: t("activeCommunities"), value: "0", icon: <Users className="h-5 w-5" /> },
  ]

  const renderContent = () => {
    switch (currentView) {
      case "report":
        return (
          <section className="py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
                  {t("reportCivicIssue")}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground text-pretty">{t("reportFormDescription")}</p>
              </div>
              <ReportForm onSubmitSuccess={handleReportSuccess} />
            </div>
          </section>
        )
      case "report-success":
        return (
          <section className="py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <ReportSuccess
                reportId={submittedReportId!}
                onBackToForm={handleBackToForm}
                onTrackReport={handleTrackReport}
              />
            </div>
          </section>
        )
      case "track":
        return (
          <section className="py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
                  {t("trackYourReport")}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground text-pretty">{t("trackReportDescription")}</p>
              </div>
              <TrackReport onShowRating={showRatingModal} />
            </div>
          </section>
        )
      case "admin":
        return (
          <section className="py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <AdminDashboard />
            </div>
          </section>
        )
      default:
        return (
          <>
            {/* Hero Section */}
            <section className="relative py-20 sm:py-32">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                  <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl text-balance">
                    {t("heroTitle")}
                    <span className="text-primary"> {t("heroTitleHighlight")}</span>
                  </h1>
                  <p className="mt-6 text-lg leading-8 text-muted-foreground text-pretty">{t("heroDescription")}</p>
                  <div className="mt-10 flex items-center justify-center gap-x-6">
                    <Button size="lg" onClick={() => setCurrentView("report")} className="px-8 py-3 text-base">
                      {t("reportAnIssue")}
                    </Button>
                    {userSession?.role === "admin" && (
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setCurrentView("admin")}
                        className="px-8 py-3 text-base"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        {t("adminDashboard")}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-muted/50">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center p-6">
                      <div className="flex items-center justify-center mb-2 text-primary">{stat.icon}</div>
                      <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section className="py-20">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center mb-16">
                  <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
                    {t("keyFeatures")}
                  </h2>
                  <p className="mt-4 text-lg text-muted-foreground text-pretty">{t("keyFeaturesDescription")}</p>
                </div>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                  {features.map((feature, index) => (
                    <Card key={index} className="relative overflow-hidden">
                      <CardHeader>
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                          {feature.icon}
                        </div>
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base">{feature.description}</CardDescription>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 bg-muted/50">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center mb-16">
                  <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
                    {t("howItWorks")}
                  </h2>
                  <p className="mt-4 text-lg text-muted-foreground text-pretty">{t("howItWorksDescription")}</p>
                </div>
                <div className="grid gap-8 md:grid-cols-3">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-xl font-bold mx-auto mb-4">
                      1
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{t("report")}</h3>
                    <p className="text-muted-foreground">{t("reportDescription")}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-xl font-bold mx-auto mb-4">
                      2
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{t("track")}</h3>
                    <p className="text-muted-foreground">{t("trackDescription")}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-xl font-bold mx-auto mb-4">
                      3
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{t("resolve")}</h3>
                    <p className="text-muted-foreground">{t("resolveDescription")}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <Card className="bg-primary text-primary-foreground">
                  <CardContent className="py-16 text-center">
                    <h2 className="text-3xl font-bold mb-4 text-balance">{t("readyToMakeDifference")}</h2>
                    <p className="text-lg mb-8 text-primary-foreground/90 text-pretty">{t("ctaDescription")}</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        size="lg"
                        variant="secondary"
                        onClick={() => setCurrentView("report")}
                        className="px-8 py-3 text-base text-slate-100 bg-black"
                      >
                        {t("reportFirstIssue")}
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => setCurrentView("track")}
                        className="px-8 py-3 text-base border-primary-foreground/20 hover:bg-primary-foreground/10 text-slate-100 bg-black"
                      >
                        {t("trackExistingReport")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          </>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <CivicLogo size="md" onClick={() => setCurrentView("home")} />
            </div>
            <div className="hidden md:flex items-center space-x-6 ml-8">
              <button
                onClick={() => setCurrentView("home")}
                className={`text-sm font-medium transition-colors hover:text-primary ${currentView === "home" ? "text-primary" : "text-muted-foreground"}`}
              >
                {t("home")}
              </button>
              <button
                onClick={() => setCurrentView("report")}
                className={`text-sm font-medium transition-colors hover:text-primary ${currentView === "report" || currentView === "report-success" ? "text-primary" : "text-muted-foreground"}`}
              >
                {t("reportIssue")}
              </button>
              <button
                onClick={() => setCurrentView("track")}
                className={`text-sm font-medium transition-colors hover:text-primary ${currentView === "track" ? "text-primary" : "text-muted-foreground"}`}
              >
                {t("trackReport")}
              </button>
              {userSession?.role === "admin" && (
                <button
                  onClick={() => setCurrentView("admin")}
                  className={`text-sm font-medium transition-colors hover:text-primary ${currentView === "admin" ? "text-primary" : "text-muted-foreground"}`}
                >
                  {t("admin")}
                </button>
              )}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-foreground">
                  {userSession.role === "admin" ? (
                    <Shield className="h-4 w-4 text-orange-500" />
                  ) : (
                    <User className="h-4 w-4 text-blue-500" />
                  )}
                  <span className="text-foreground">{userSession.phoneNumber || userSession.email}</span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      userSession.role === "admin"
                        ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    }`}
                  >
                    {userSession.role === "admin" ? t("admin") : t("user")}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("logout")}
                </Button>
              </div>
              <LanguageToggle />
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </nav>

      {renderContent()}

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container px-4 sm:px-6 lg:px-8 py-12 border-0 mx-auto my-36">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <CivicLogo size="md" onClick={() => setCurrentView("home")} />
            </div>
            <div className="text-sm text-muted-foreground">{t("footerText")}</div>
          </div>
        </div>
      </footer>

      <WebAssistant isOpen={isWebAssistantOpen} onToggle={() => setIsWebAssistantOpen(!isWebAssistantOpen)} />
      <WhatsAppAssistant
        isOpen={isWhatsAppAssistantOpen}
        onToggle={() => setIsWhatsAppAssistantOpen(!isWhatsAppAssistantOpen)}
      />

      <NotificationToast
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={() => setNotification((prev) => ({ ...prev, isVisible: false }))}
      />

      <RatingModal
        isOpen={ratingModal.isOpen}
        onClose={() => setRatingModal({ isOpen: false, reportId: "" })}
        reportId={ratingModal.reportId}
        onSubmitRating={handleSubmitRating}
      />
    </div>
  )
}
