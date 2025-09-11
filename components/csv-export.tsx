"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface Report {
  id: string
  title: string
  description: string
  category: string
  urgency: string
  address: string
  latitude?: number
  longitude?: number
  photo?: string
  status: string
  channel: string
  timestamp: string
  rating?: number
  feedback?: string
}

interface CSVExportProps {
  reports: Report[]
  filename?: string
}

export default function CSVExport({ reports, filename = "civic-reports" }: CSVExportProps) {
  const exportToCSV = () => {
    if (reports.length === 0) {
      alert("No reports to export")
      return
    }

    const headers = [
      "Report ID",
      "Title",
      "Description",
      "Category",
      "Urgency",
      "Address",
      "Latitude",
      "Longitude",
      "Status",
      "Channel",
      "Submitted Date",
      "Rating",
      "Feedback",
    ]

    const csvContent = [
      headers.join(","),
      ...reports.map((report) =>
        [
          `"${report.id}"`,
          `"${report.title.replace(/"/g, '""')}"`,
          `"${report.description.replace(/"/g, '""')}"`,
          `"${report.category}"`,
          `"${report.urgency}"`,
          `"${report.address.replace(/"/g, '""')}"`,
          report.latitude || "",
          report.longitude || "",
          `"${report.status}"`,
          `"${report.channel}"`,
          `"${new Date(report.timestamp).toLocaleString()}"`,
          report.rating || "",
          `"${(report.feedback || "").replace(/"/g, '""')}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", `${filename}-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button onClick={exportToCSV} variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
      <Download className="h-4 w-4" />
      Export CSV
    </Button>
  )
}
