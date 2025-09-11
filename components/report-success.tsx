"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Copy, Share2, ArrowLeft } from "lucide-react"
import { useState } from "react"

interface ReportSuccessProps {
  reportId: string
  onBackToForm: () => void
  onTrackReport: () => void
}

export default function ReportSuccess({ reportId, onBackToForm, onTrackReport }: ReportSuccessProps) {
  const [copied, setCopied] = useState(false)
  const [shareStatus, setShareStatus] = useState<"idle" | "sharing" | "copied" | "error">("idle")

  const copyReportId = async () => {
    try {
      await navigator.clipboard.writeText(reportId)
      setCopied(true)
      setShareStatus("copied")
      setTimeout(() => {
        setCopied(false)
        setShareStatus("idle")
      }, 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
      setShareStatus("error")
      setTimeout(() => setShareStatus("idle"), 2000)
    }
  }

  const shareReport = async () => {
    if (!navigator.share) {
      console.log("[v0] Web Share API not supported, falling back to copy")
      copyReportId()
      return
    }

    if (!window.isSecureContext) {
      console.log("[v0] Not in secure context, falling back to copy")
      copyReportId()
      return
    }

    setShareStatus("sharing")

    try {
      const shareData = {
        title: "CivicSense Report",
        text: `I've reported a civic issue. Track it with ID: ${reportId}`,
        url: window.location.href,
      }

      if (navigator.canShare && !navigator.canShare(shareData)) {
        console.log("[v0] Share data not supported, falling back to copy")
        copyReportId()
        return
      }

      await navigator.share(shareData)
      console.log("[v0] Share successful")
      setShareStatus("idle")
    } catch (error) {
      console.error("Error sharing:", error)

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          console.log("[v0] User cancelled share")
          setShareStatus("idle")
          return
        } else if (error.name === "NotAllowedError") {
          console.log("[v0] Share permission denied, falling back to copy")
        } else {
          console.log("[v0] Share failed with error:", error.name, "falling back to copy")
        }
      }

      copyReportId()
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-green-600">Report Submitted Successfully!</CardTitle>
          <CardDescription className="text-base">
            Thank you for helping improve your community. Your report has been received and will be reviewed by local
            authorities.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report ID */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="text-sm text-muted-foreground mb-2">Your Report ID</div>
            <div className="flex items-center justify-center gap-2">
              <code className="text-lg font-mono font-bold text-primary">{reportId}</code>
              <Button variant="ghost" size="sm" onClick={copyReportId} className="h-8 w-8 p-0">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {copied && <div className="text-sm text-green-600 mt-1">Copied to clipboard!</div>}
            <div className="text-sm text-muted-foreground mt-2">Save this ID to track your report's progress</div>
          </div>

          {/* Next Steps */}
          <div className="text-left bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your report will be reviewed within 24 hours</li>
              <li>• Local authorities will be notified automatically</li>
              <li>• You'll receive updates as the issue progresses</li>
              <li>• Track your report anytime using the ID above</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={onTrackReport} className="flex items-center gap-2">
              Track This Report
            </Button>
            <Button
              variant="outline"
              onClick={shareReport}
              className="flex items-center gap-2 bg-transparent"
              disabled={shareStatus === "sharing"}
            >
              <Share2 className="h-4 w-4" />
              {shareStatus === "sharing"
                ? "Sharing..."
                : shareStatus === "copied"
                  ? "Copied!"
                  : shareStatus === "error"
                    ? "Copy Failed"
                    : "Share Report"}
            </Button>
            <Button variant="ghost" onClick={onBackToForm} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Report Another Issue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
