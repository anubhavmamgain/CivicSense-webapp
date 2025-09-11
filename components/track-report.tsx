"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  MapPin,
  Calendar,
  Camera,
  MessageSquare,
  CheckCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Star,
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface Report {
  id: string
  title: string
  description: string
  category: string
  urgency: string
  address: string
  latitude: string
  longitude: string
  photo: string | null
  photoName: string | null
  status: string
  channel: string
  submittedAt: string
  timeline: Array<{
    status: string
    timestamp: string
    description: string
  }>
  rating?: number
  feedback?: string
}

interface TrackReportProps {
  onShowRating?: (reportId: string) => void
}

export default function TrackReport({ onShowRating }: TrackReportProps) {
  const { t } = useLanguage()

  const [reportId, setReportId] = useState("")
  const [report, setReport] = useState<Report | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const statusConfig = {
    submitted: {
      label: t("submitted"),
      color: "bg-blue-100 text-blue-800",
      icon: <Clock className="h-4 w-4" />,
      description: t("submittedDescription"),
    },
    acknowledged: {
      label: t("acknowledged"),
      color: "bg-yellow-100 text-yellow-800",
      icon: <CheckCircle className="h-4 w-4" />,
      description: t("acknowledgedDescription"),
    },
    "in-progress": {
      label: t("inProgress"),
      color: "bg-orange-100 text-orange-800",
      icon: <RefreshCw className="h-4 w-4" />,
      description: t("inProgressDescription"),
    },
    resolved: {
      label: t("resolved"),
      color: "bg-green-100 text-green-800",
      icon: <CheckCircle className="h-4 w-4" />,
      description: t("resolvedDescription"),
    },
  }

  const urgencyConfig = {
    low: { label: t("low"), color: "bg-green-100 text-green-800" },
    medium: { label: t("medium"), color: "bg-yellow-100 text-yellow-800" },
    high: { label: t("high"), color: "bg-orange-100 text-orange-800" },
    critical: { label: t("critical"), color: "bg-red-100 text-red-800" },
  }

  const getStatusConfig = (status: string) => {
    return (
      statusConfig[status as keyof typeof statusConfig] || {
        label: status,
        color: "bg-gray-100 text-gray-800",
        icon: <Clock className="h-4 w-4" />,
        description: "Status update",
      }
    )
  }

  const getUrgencyConfig = (urgency: string) => {
    return (
      urgencyConfig[urgency as keyof typeof urgencyConfig] || {
        label: urgency,
        color: "bg-gray-100 text-gray-800",
      }
    )
  }

  const searchReport = async () => {
    if (!reportId.trim()) {
      setError(t("pleaseEnterReportId"))
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const existingReports = JSON.parse(localStorage.getItem("civicsense_reports") || "[]")
      const foundReport = existingReports.find((r: Report) => r.id === reportId.trim())

      if (foundReport) {
        setReport(foundReport)
      } else {
        setError(t("reportNotFound"))
        setReport(null)
      }
    } catch (error) {
      setError(t("errorSearchingReport"))
      setReport(null)
    } finally {
      setIsSearching(false)
    }
  }

  const simulateNextStatus = async () => {
    if (!report) return

    const statusFlow = ["submitted", "acknowledged", "in-progress", "resolved"]
    const currentIndex = statusFlow.indexOf(report.status)

    if (currentIndex < statusFlow.length - 1) {
      const nextStatus = statusFlow[currentIndex + 1]
      const updatedReport = {
        ...report,
        status: nextStatus,
        timeline: [
          ...report.timeline,
          {
            status: nextStatus,
            timestamp: new Date().toISOString(),
            description: getStatusConfig(nextStatus).description,
          },
        ],
      }

      // Update localStorage
      const existingReports = JSON.parse(localStorage.getItem("civicsense_reports") || "[]")
      const updatedReports = existingReports.map((r: Report) => (r.id === report.id ? updatedReport : r))
      localStorage.setItem("civicsense_reports", JSON.stringify(updatedReports))

      setReport(updatedReport)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            {t("trackYourReport")}
          </CardTitle>
          <CardDescription>{t("trackReportDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="reportId" className="sr-only">
                {t("reportId")}
              </Label>
              <Input
                id="reportId"
                placeholder={t("reportIdPlaceholder")}
                value={reportId}
                onChange={(e) => setReportId(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && searchReport()}
              />
            </div>
            <Button onClick={searchReport} disabled={isSearching}>
              {isSearching ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  {t("searching")}
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  {t("search")}
                </>
              )}
            </Button>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Details */}
      {report && (
        <div className="space-y-6">
          {/* Status Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Report #{report.id}
                    <Badge className={getStatusConfig(report.status).color}>
                      {getStatusConfig(report.status).icon}
                      {getStatusConfig(report.status).label}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="mt-2">{getStatusConfig(report.status).description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  {report.status !== "resolved" && (
                    <Button onClick={simulateNextStatus} variant="outline" size="sm">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      {t("simulateNextStatus")}
                    </Button>
                  )}
                  {report.status === "resolved" && !report.rating && onShowRating && (
                    <Button onClick={() => onShowRating(report.id)} variant="outline" size="sm">
                      <Star className="h-4 w-4 mr-2" />
                      {t("rateResolution")}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Rating Display */}
          {report.rating && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("yourRating")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= report.rating! ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({report.rating}/5 {t("stars")})
                  </span>
                </div>
                {report.feedback && <p className="text-sm text-muted-foreground">{report.feedback}</p>}
              </CardContent>
            </Card>
          )}

          {/* Report Information */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("reportDetails")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">{t("title")}</Label>
                  <p className="text-sm font-medium">{report.title}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">{t("description")}</Label>
                  <p className="text-sm">{report.description}</p>
                </div>

                <div className="flex gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">{t("category")}</Label>
                    <p className="text-sm">{report.category}</p>
                  </div>
                  {report.urgency && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">{t("urgency")}</Label>
                      <Badge className={getUrgencyConfig(report.urgency).color}>
                        {getUrgencyConfig(report.urgency).label}
                      </Badge>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">{t("submittedVia")}</Label>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm capitalize">{report.channel}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">{t("submittedOn")}</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{formatDate(report.submittedAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("locationAndMedia")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.address && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">{t("address")}</Label>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-primary" />
                      <p className="text-sm">{report.address}</p>
                    </div>
                  </div>
                )}

                {report.latitude && report.longitude && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">{t("coordinates")}</Label>
                    <p className="text-sm font-mono">
                      {Number.parseFloat(report.latitude).toFixed(6)}, {Number.parseFloat(report.longitude).toFixed(6)}
                    </p>
                  </div>
                )}

                {report.photo && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">{t("photoEvidence")}</Label>
                    <div className="mt-2">
                      <img
                        src={report.photo || "/placeholder.svg"}
                        alt="Report evidence"
                        className="w-full max-w-sm h-48 object-cover rounded-lg border"
                      />
                      {report.photoName && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Camera className="h-3 w-3" />
                          {report.photoName}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("progressTimeline")}</CardTitle>
              <CardDescription>{t("timelineDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.timeline.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          getStatusConfig(event.status).color
                        }`}
                      >
                        {getStatusConfig(event.status).icon}
                      </div>
                      {index < report.timeline.length - 1 && <div className="h-8 w-px bg-border mt-2" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{getStatusConfig(event.status).label}</h4>
                        <span className="text-sm text-muted-foreground">{formatDate(event.timestamp)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
