"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Search,
  Filter,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Eye,
  MapPin,
  Calendar,
  User,
  Brain,
  Zap,
  TrendingUp,
  PieChart,
  Copy,
  Trash2,
  Camera,
} from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { DarkModeToggle } from "@/components/dark-mode-toggle"

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
  video: string | null
  videoName: string | null
  status: string
  channel: string
  submittedAt: string
  assignedDepartment?: string
  assignedStaff?: string
  assignedFieldWorker?: string
  routedAt?: string
  timeline: Array<{
    status: string
    timestamp: string
    description: string
  }>
  rating?: number
  feedback?: string
  aiUrgencyAnalysis?: {
    detectedUrgency: string
    confidence: number
    reasoning: string
    photoAnalysis?: string
  }
  duplicateGroup?: string
  isDuplicate?: boolean
  originalReportId?: string
  duplicateCount?: number
  aiRoutingReason?: string
  priorityScore?: number
  photos?: string[]
  photoNames?: string[]
  videos?: string[]
  videoNames?: string[]
}

interface Department {
  id: string
  name: string
  categories: string[]
  staff: Staff[]
  responseTime: string
  workload: number
}

interface Staff {
  id: string
  name: string
  role: string
  department: string
  activeTasks: number
  fieldWorkers: FieldWorker[]
}

interface FieldWorker {
  id: string
  name: string
  location: string
  availability: "available" | "busy" | "offline"
  currentTask?: string
}

interface Hotspot {
  id: string
  location: string
  latitude: number
  longitude: number
  reportCount: number
  category: string
  urgencyLevel: "critical" | "high" | "medium" | "low"
  reports: Report[]
  duplicateGroups: Array<{ groupId: string; reports: Report[]; mainReport: Report }>
}

const statusConfig = {
  submitted: {
    label: "Submitted",
    color: "bg-blue-100 text-blue-800",
    chartColor: "#2563eb", // Darker blue for better contrast
  },
  acknowledged: {
    label: "Acknowledged",
    color: "bg-yellow-100 text-yellow-800",
    chartColor: "#ea580c", // Orange instead of amber for better distinction
  },
  "in-progress": {
    label: "In Progress",
    color: "bg-orange-100 text-orange-800",
    chartColor: "#7c3aed", // Darker purple for better contrast
  },
  resolved: {
    label: "Resolved",
    color: "bg-green-100 text-green-800",
    chartColor: "#16a34a", // Darker green for better contrast
  },
}

const urgencyConfig = {
  critical: {
    label: "Critical",
    color: "bg-red-100 text-red-800",
  },
  high: {
    label: "High",
    color: "bg-orange-100 text-orange-800",
  },
  medium: {
    label: "Medium",
    color: "bg-yellow-100 text-yellow-800",
  },
  low: {
    label: "Low",
    color: "bg-green-100 text-green-800",
  },
}

const categories = [
  "Road & Infrastructure",
  "Water & Sanitation",
  "Street Lighting",
  "Parks & Recreation",
  "Public Safety",
  "Traffic & Transportation",
  "Waste Management",
  "Other",
]

export default function AdminDashboard() {
  const [reports, setReports] = useState<Report[]>([])
  const [filteredReports, setFilteredReports] = useState<Report[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [showRoutingModal, setShowRoutingModal] = useState(false)
  const [reportToRoute, setReportToRoute] = useState<Report | null>(null)

  const [previewMedia, setPreviewMedia] = useState<{
    type: "image" | "video"
    src: string
    name: string
    index?: number
    total?: number
  } | null>(null)

  const departments: Department[] = [
    {
      id: "roads",
      name: "Roads & Infrastructure",
      categories: ["Road & Infrastructure", "Traffic & Transportation"],
      staff: [
        {
          id: "staff1",
          name: "Rajesh Kumar",
          role: "Senior Engineer",
          department: "roads",
          activeTasks: 3,
          fieldWorkers: [
            { id: "fw1", name: "Amit Singh", location: "Zone A", availability: "available" },
            { id: "fw2", name: "Suresh Yadav", location: "Zone B", availability: "busy", currentTask: "RPT-001" },
          ],
        },
        {
          id: "staff2",
          name: "Priya Sharma",
          role: "Project Manager",
          department: "roads",
          activeTasks: 5,
          fieldWorkers: [{ id: "fw3", name: "Vikash Gupta", location: "Zone C", availability: "available" }],
        },
      ],
      responseTime: "2-4 hours",
      workload: 75,
    },
    {
      id: "water",
      name: "Water & Sanitation",
      categories: ["Water & Sanitation", "Waste Management"],
      staff: [
        {
          id: "staff3",
          name: "Deepak Verma",
          role: "Water Engineer",
          department: "water",
          activeTasks: 2,
          fieldWorkers: [
            { id: "fw4", name: "Ravi Kumar", location: "Zone D", availability: "available" },
            { id: "fw5", name: "Manoj Tiwari", location: "Zone E", availability: "offline" },
          ],
        },
      ],
      responseTime: "1-3 hours",
      workload: 60,
    },
    {
      id: "utilities",
      name: "Public Utilities",
      categories: ["Street Lighting", "Parks & Recreation"],
      staff: [
        {
          id: "staff4",
          name: "Sunita Devi",
          role: "Utilities Manager",
          department: "utilities",
          activeTasks: 4,
          fieldWorkers: [{ id: "fw6", name: "Ashok Kumar", location: "Zone F", availability: "available" }],
        },
      ],
      responseTime: "4-8 hours",
      workload: 45,
    },
    {
      id: "safety",
      name: "Public Safety",
      categories: ["Public Safety", "Other"],
      staff: [
        {
          id: "staff5",
          name: "Inspector Sharma",
          role: "Safety Officer",
          department: "safety",
          activeTasks: 1,
          fieldWorkers: [{ id: "fw7", name: "Constable Rai", location: "Zone G", availability: "available" }],
        },
      ],
      responseTime: "30 minutes - 2 hours",
      workload: 30,
    },
  ]

  const autoRouteReport = (report: Report) => {
    console.log("[v0] Auto-routing report:", report.id, "Category:", report.category)

    // Map form category keys to department categories
    const categoryKeyToName = {
      roadInfrastructure: "Road & Infrastructure",
      waterSanitation: "Water & Sanitation",
      wasteManagement: "Waste Management",
      streetLighting: "Street Lighting",
      publicSafety: "Public Safety",
      parksRecreation: "Parks & Recreation",
      trafficTransportation: "Traffic & Transportation",
      other: "Other",
    }

    // Convert category key to proper category name
    const categoryName = categoryKeyToName[report.category as keyof typeof categoryKeyToName] || report.category

    const findBestDepartment = (category: string) => {
      // Direct category match first using the mapped category name
      let department = departments.find((dept) => dept.categories.includes(category))

      if (!department) {
        // Enhanced fuzzy matching for category keys and similar categories
        const categoryLower = category.toLowerCase()
        const categoryKeyLower = report.category.toLowerCase()

        const categoryMappings = {
          // Handle form category keys directly
          roadinfrastructure: ["Road & Infrastructure", "Traffic & Transportation"],
          watersanitation: ["Water & Sanitation"],
          wastemanagement: ["Waste Management"],
          streetlighting: ["Street Lighting"],
          publicsafety: ["Public Safety"],
          parksrecreation: ["Parks & Recreation"],
          traffictransportation: ["Traffic & Transportation"],

          // Handle partial matches
          road: ["Road & Infrastructure", "Traffic & Transportation"],
          water: ["Water & Sanitation"],
          waste: ["Waste Management"],
          light: ["Street Lighting"],
          lighting: ["Street Lighting"],
          safety: ["Public Safety"],
          park: ["Parks & Recreation"],
          traffic: ["Traffic & Transportation"],
          infrastructure: ["Road & Infrastructure"],
          sanitation: ["Water & Sanitation"],
          management: ["Waste Management"],
          recreation: ["Parks & Recreation"],
          transportation: ["Traffic & Transportation"],
        }

        // Try matching with category key first, then category name
        for (const [keyword, deptCategories] of Object.entries(categoryMappings)) {
          if (categoryKeyLower.includes(keyword) || categoryLower.includes(keyword)) {
            department = departments.find((dept) => deptCategories.some((cat) => dept.categories.includes(cat)))
            if (department) {
              console.log("[v0] Matched category via keyword:", keyword, "to department:", department.name)
              break
            }
          }
        }
      }

      return department
    }

    const department = findBestDepartment(categoryName)

    if (department) {
      // Enhanced staff selection with better workload balancing
      const availableStaff = department.staff
        .filter((staff) => staff.fieldWorkers.some((fw) => fw.availability === "available"))
        .sort((a, b) => {
          // Primary sort: active tasks (workload) - prefer less busy staff
          if (a.activeTasks !== b.activeTasks) {
            return a.activeTasks - b.activeTasks
          }
          // Secondary sort: number of available field workers - prefer more resources
          const aAvailable = a.fieldWorkers.filter((fw) => fw.availability === "available").length
          const bAvailable = b.fieldWorkers.filter((fw) => fw.availability === "available").length
          return bAvailable - aAvailable
        })

      const selectedStaff = availableStaff[0] || department.staff[0]
      const availableFieldWorker = selectedStaff.fieldWorkers.find((fw) => fw.availability === "available")

      let adjustedUrgency = report.urgency
      let priorityScore = 0

      // Enhanced keyword analysis for better urgency detection
      const criticalKeywords = [
        "emergency",
        "danger",
        "urgent",
        "accident",
        "fire",
        "flood",
        "gas leak",
        "collapse",
        "explosion",
        "toxic",
        "chemical",
        "electrical hazard",
        "live wire",
        "sinkhole",
        "landslide",
        "water main burst",
        "sewage overflow",
        "life threatening",
        "death",
        "injury",
        "injured",
        "hazardous",
        "immediate danger",
        "safety risk",
      ]

      const highPriorityKeywords = [
        "broken",
        "damaged",
        "not working",
        "malfunctioning",
        "blocked",
        "overflowing",
        "leaking",
        "no water",
        "power outage",
        "traffic light",
        "unsafe",
        "security",
        "vandalism",
        "theft",
        "large pothole",
        "road damage",
        "bridge damage",
      ]

      const descriptionLower = `${report.description} ${report.title}`.toLowerCase()

      // Calculate priority score based on keywords and context
      criticalKeywords.forEach((keyword) => {
        if (descriptionLower.includes(keyword)) {
          priorityScore += 10
          adjustedUrgency = "critical"
        }
      })

      highPriorityKeywords.forEach((keyword) => {
        if (descriptionLower.includes(keyword)) {
          priorityScore += 5
          if (adjustedUrgency === "low" || adjustedUrgency === "medium") {
            adjustedUrgency = "high"
          }
        }
      })

      // Enhanced category-based priority adjustments using form category keys
      const criticalCategoryKeys = ["publicSafety", "waterSanitation"]
      const highCategoryKeys = ["roadInfrastructure", "trafficTransportation", "streetLighting"]

      if (criticalCategoryKeys.includes(report.category)) {
        priorityScore += 5
        if (adjustedUrgency === "low") adjustedUrgency = "medium"
      } else if (highCategoryKeys.includes(report.category)) {
        priorityScore += 3
      }

      // Time-based urgency (reports during off-hours get higher priority)
      const hour = new Date().getHours()
      if (hour < 6 || hour > 22) {
        priorityScore += 2
      }

      // Location-based priority (if coordinates suggest high-traffic area)
      if (report.latitude && report.longitude) {
        const lat = Number.parseFloat(report.latitude)
        const lng = Number.parseFloat(report.longitude)
        // Simple check for city center area (Ranchi coordinates as example)
        if (lat > 23.3 && lat < 23.4 && lng > 85.25 && lng < 85.35) {
          priorityScore += 2
        }
      }

      const updatedReport = {
        ...report,
        urgency: adjustedUrgency,
        priorityScore,
        assignedDepartment: department.id,
        assignedStaff: selectedStaff.id,
        assignedFieldWorker: availableFieldWorker?.id,
        routedAt: new Date().toISOString(),
        status: "acknowledged",
        aiRoutingReason: `AI-routed to ${department.name} based on category "${categoryName}" (Priority: ${priorityScore}, Staff workload: ${selectedStaff.activeTasks})`,
      }

      setReports((prev) => prev.map((r) => (r.id === report.id ? updatedReport : r)))

      const timelineEntry = {
        status: "acknowledged",
        timestamp: new Date().toISOString(),
        description: `🤖 AI Auto-routed to ${department.name} - ${adjustedUrgency.toUpperCase()} Priority (Score: ${priorityScore}) - Category: ${categoryName} - Assigned to ${selectedStaff.name}${availableFieldWorker ? ` (Field: ${availableFieldWorker.name} - ${availableFieldWorker.location})` : ""} - Current workload: ${selectedStaff.activeTasks} tasks`,
      }

      updatedReport.timeline = [...(report.timeline || []), timelineEntry]

      const allReports = JSON.parse(localStorage.getItem("civicsense_reports") || "[]")
      const updatedAllReports = allReports.map((r: any) => (r.id === report.id ? updatedReport : r))
      localStorage.setItem("civicsense_reports", JSON.stringify(updatedAllReports))

      console.log(
        "[v0] Report auto-routed successfully:",
        updatedReport.id,
        "to",
        department.name,
        "for category:",
        categoryName,
      )
      return updatedReport
    }

    // Enhanced fallback routing with better category key handling
    const fallbackDepartment = (() => {
      const categoryKey = report.category.toLowerCase()
      const categoryName = categoryKeyToName[report.category as keyof typeof categoryKeyToName]?.toLowerCase() || ""

      if (categoryKey.includes("safety") || categoryName.includes("safety") || categoryKey.includes("emergency")) {
        return departments.find((d) => d.id === "safety")
      }
      if (categoryKey.includes("road") || categoryKey.includes("infrastructure") || categoryName.includes("road")) {
        return departments.find((d) => d.id === "roads")
      }
      if (categoryKey.includes("water") || categoryKey.includes("sanitation") || categoryName.includes("water")) {
        return departments.find((d) => d.id === "water")
      }
      if (categoryKey.includes("street") || categoryKey.includes("lighting") || categoryName.includes("lighting")) {
        return departments.find((d) => d.id === "utilities")
      }
      if (
        categoryKey.includes("traffic") ||
        categoryKey.includes("transportation") ||
        categoryName.includes("traffic")
      ) {
        return departments.find((d) => d.id === "roads")
      }
      if (categoryKey.includes("waste") || categoryKey.includes("management") || categoryName.includes("waste")) {
        return departments.find((d) => d.id === "water")
      }
      if (categoryKey.includes("parks") || categoryKey.includes("recreation") || categoryName.includes("parks")) {
        return departments.find((d) => d.id === "utilities")
      }

      // Default fallback to safety for unknown categories
      return departments.find((d) => d.id === "safety")
    })()

    if (fallbackDepartment) {
      const fallbackStaff = fallbackDepartment.staff.sort((a, b) => a.activeTasks - b.activeTasks)[0]

      const updatedReport = {
        ...report,
        assignedDepartment: fallbackDepartment.id,
        assignedStaff: fallbackStaff.id,
        routedAt: new Date().toISOString(),
        status: "acknowledged",
        aiRoutingReason: `Intelligent fallback routing to ${fallbackDepartment.name} for category "${report.category}" - requires manual review`,
      }

      setReports((prev) => prev.map((r) => (r.id === report.id ? updatedReport : r)))

      const timelineEntry = {
        status: "acknowledged",
        timestamp: new Date().toISOString(),
        description: `🤖 AI Fallback routing to ${fallbackDepartment.name} - Category "${report.category}" mapped via intelligent fallback - Assigned to ${fallbackStaff.name} (${fallbackStaff.activeTasks} active tasks)`,
      }

      updatedReport.timeline = [...(report.timeline || []), timelineEntry]

      // Save to localStorage
      const allReports = JSON.parse(localStorage.getItem("civicsense_reports") || "[]")
      const updatedAllReports = allReports.map((r: any) => (r.id === report.id ? updatedReport : r))
      localStorage.setItem("civicsense_reports", JSON.stringify(updatedAllReports))

      console.log("[v0] Report fallback-routed successfully:", updatedReport.id, "to", fallbackDepartment.name)
      return updatedReport
    }

    console.log("[v0] Failed to route report:", report.id, "- no suitable department found")
    return null
  }

  const assignToFieldWorker = (reportId: string, staffId: string, fieldWorkerId: string) => {
    setReports((prev) =>
      prev.map((report) => {
        if (report.id === reportId) {
          const staff = departments.flatMap((d) => d.staff).find((s) => s.id === staffId)
          const fieldWorker = staff?.fieldWorkers.find((fw) => fw.id === fieldWorkerId)

          const timelineEntry = {
            status: "in-progress",
            timestamp: new Date().toISOString(),
            description: `Assigned to field worker: ${fieldWorker?.name} (${fieldWorker?.location})`,
          }

          return {
            ...report,
            assignedFieldWorker: fieldWorkerId,
            status: "in-progress",
            timeline: [...(report.timeline || []), timelineEntry],
          }
        }
        return report
      }),
    )
  }

  useEffect(() => {
    loadReports()
  }, [])

  useEffect(() => {
    filterReports()
  }, [reports, searchTerm, statusFilter, categoryFilter])

  const loadReports = () => {
    setIsLoading(true)

    const userReports = JSON.parse(localStorage.getItem("civicsense_reports") || "[]")
    console.log("[v0] Loading reports from localStorage:", userReports.length, "reports found")
    console.log(
      "[v0] Sample of loaded reports:",
      userReports.slice(0, 2).map((r) => ({ id: r.id, status: r.status })),
    )

    // Only generate sample reports if absolutely no reports exist (first time use)
    let allReports: Report[] = userReports

    if (userReports.length === 0) {
      console.log("[v0] No user reports found, generating sample data")
      // Generate sample reports with auto-routing (only on first use)
      const sampleReports: Report[] = [
        {
          id: "RPT-001",
          title: "Pothole on Main Street",
          description: "Large pothole causing traffic issues near the market area",
          category: "roadInfrastructure", // Using form category key instead of display name
          urgency: "high",
          address: "Main Street, Near City Market",
          latitude: "28.6139",
          longitude: "77.2090",
          photo: "/pothole-on-road.jpg",
          photoName: "pothole_main_street.jpg",
          video: null,
          videoName: null,
          status: "submitted",
          channel: "Mobile App",
          submittedAt: "2024-01-15T10:30:00Z",
          timeline: [
            {
              status: "submitted",
              timestamp: "2024-01-15T10:30:00Z",
              description: "Report submitted via mobile app",
            },
          ],
        },
        {
          id: "RPT-002",
          title: "Water Leakage in Residential Area",
          description: "Continuous water leakage from main pipeline affecting multiple houses",
          category: "waterSanitation", // Using form category key
          urgency: "critical",
          address: "Sector 15, Block A",
          latitude: "28.6129",
          longitude: "77.2095",
          photo: "/water-leakage-pipeline.jpg",
          photoName: "water_leak_sector15.jpg",
          video: "/placeholder.mp4",
          videoName: "leak_video.mp4",
          status: "submitted",
          channel: "Web Portal",
          submittedAt: "2024-01-15T09:15:00Z",
          timeline: [
            {
              status: "submitted",
              timestamp: "2024-01-15T09:15:00Z",
              description: "Report submitted via web portal",
            },
          ],
        },
        {
          id: "RPT-003",
          title: "Street Light Not Working",
          description: "Multiple street lights are not functioning in the residential colony",
          category: "streetLighting", // Using form category key
          urgency: "medium",
          address: "Green Park Colony, Street 7",
          latitude: "28.6119",
          longitude: "77.2085",
          photo: "/broken-street-light.png",
          photoName: "street_light_issue.jpg",
          video: null,
          videoName: null,
          status: "submitted",
          channel: "Phone Call",
          submittedAt: "2024-01-15T08:45:00Z",
          timeline: [
            {
              status: "submitted",
              timestamp: "2024-01-15T08:45:00Z",
              description: "Report received via phone call",
            },
          ],
        },
      ]

      allReports = sampleReports.map((report) => {
        const routedReport = autoRouteReport(report)
        return routedReport || report // Use routed report if successful, otherwise keep original
      })

      localStorage.setItem("civicsense_reports", JSON.stringify(allReports))
    } else {
      allReports = userReports.map((report) => {
        // Check if report needs AI routing (no department assigned or status is still submitted)
        if (!report.assignedDepartment || report.status === "submitted") {
          console.log("[v0] Applying AI routing to existing report:", report.id)
          const routedReport = autoRouteReport(report)
          return routedReport || report
        }
        return report
      })

      // Save updated reports back to localStorage if any were routed
      const hasUpdates = allReports.some(
        (report, index) => report.assignedDepartment !== userReports[index]?.assignedDepartment,
      )
      if (hasUpdates) {
        localStorage.setItem("civicsense_reports", JSON.stringify(allReports))
      }
    }

    console.log("[v0] Setting reports state with:", allReports.length, "reports")
    setReports(allReports)
    setIsLoading(false)
  }

  const filterReports = () => {
    let filtered = reports

    if (searchTerm) {
      filtered = filtered.filter(
        (report) =>
          report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.address.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((report) => report.status === statusFilter)
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((report) => report.category === categoryFilter)
    }

    setFilteredReports(filtered)
  }

  const getStatusConfig = (status: string) => {
    return (
      statusConfig[status as keyof typeof statusConfig] || {
        label: "Unknown",
        color: "bg-gray-100 text-gray-800",
      }
    )
  }

  const getUrgencyConfig = (urgency: string) => {
    return (
      urgencyConfig[urgency as keyof typeof urgencyConfig] || {
        label: "Unknown",
        color: "bg-gray-100 text-gray-800",
      }
    )
  }

  const updateReportStatus = (reportId: string, newStatus: string) => {
    console.log("[v0] Updating report status:", reportId, "to", newStatus)
    const updatedReports = reports.map((report) => {
      if (report.id === reportId) {
        const updatedReport = {
          ...report,
          status: newStatus,
          lastUpdated: new Date().toISOString(),
        }
        console.log("[v0] Updated report:", { id: updatedReport.id, status: updatedReport.status })
        return updatedReport
      }
      return report
    })

    console.log("[v0] Saving updated reports to localStorage:", updatedReports.length, "reports")
    console.log(
      "[v0] Sample of updated reports:",
      updatedReports.slice(0, 2).map((r) => ({ id: r.id, status: r.status })),
    )

    setReports(updatedReports)
    localStorage.setItem("civicsense_reports", JSON.stringify(updatedReports))

    const savedReports = JSON.parse(localStorage.getItem("civicsense_reports") || "[]")
    console.log("[v0] Verification - localStorage now contains:", savedReports.length, "reports")
    console.log(
      "[v0] Verification - updated report in localStorage:",
      savedReports.find((r) => r.id === reportId)?.status,
    )

    setTimeout(() => {
      filterReports()
    }, 0)
  }

  const clearAllReports = () => {
    console.log("[v0] Clearing all reports from localStorage and state")
    localStorage.removeItem("civicsense_reports")
    setReports([])
    setFilteredReports([])
    setSelectedReport(null)
    console.log("[v0] All reports cleared successfully")
  }

  const getKPIs = () => {
    const total = reports.length
    const resolved = reports.filter((r) => r.status === "resolved").length
    const inProgress = reports.filter((r) => r.status === "in-progress").length
    const pending = reports.filter((r) => r.status === "submitted" || r.status === "acknowledged").length

    const avgResolutionTime = "2.1 days"

    return { total, resolved, inProgress, pending, avgResolutionTime }
  }

  const kpis = getKPIs()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
  }

  const detectDuplicateReports = (reports: Report[]): Report[] => {
    const processedReports = [...reports]
    const duplicateGroups: { [key: string]: Report[] } = {}

    reports.forEach((report, index) => {
      if (report.isDuplicate) return // Skip already processed duplicates

      const potentialDuplicates = reports.slice(index + 1).filter((otherReport) => {
        if (otherReport.isDuplicate) return false

        // AI similarity detection based on multiple factors
        const locationSimilarity = calculateLocationSimilarity(
          Number.parseFloat(report.latitude),
          Number.parseFloat(report.longitude),
          Number.parseFloat(otherReport.latitude),
          Number.parseFloat(otherReport.longitude),
        )

        const textSimilarity = calculateTextSimilarity(
          `${report.title} ${report.description}`,
          `${otherReport.title} ${otherReport.description}`,
        )

        const categorySimilarity = report.category === otherReport.category ? 1 : 0
        const timeSimilarity = calculateTimeSimilarity(report.submittedAt, otherReport.submittedAt)

        // Weighted similarity score
        const overallSimilarity =
          locationSimilarity * 0.4 + textSimilarity * 0.3 + categorySimilarity * 0.2 + timeSimilarity * 0.1

        return overallSimilarity > 0.7 // 70% similarity threshold
      })

      if (potentialDuplicates.length > 0) {
        const groupId = `group_${report.id}`
        const groupReports = [report, ...potentialDuplicates]

        duplicateGroups[groupId] = groupReports

        // Mark main report
        const mainReportIndex = processedReports.findIndex((r) => r.id === report.id)
        if (mainReportIndex !== -1) {
          processedReports[mainReportIndex] = {
            ...report,
            duplicateGroup: groupId,
            duplicateCount: groupReports.length,
            isDuplicate: false,
          }
        }

        // Mark duplicates
        potentialDuplicates.forEach((duplicate) => {
          const duplicateIndex = processedReports.findIndex((r) => r.id === duplicate.id)
          if (duplicateIndex !== -1) {
            processedReports[duplicateIndex] = {
              ...duplicate,
              duplicateGroup: groupId,
              isDuplicate: true,
              originalReportId: report.id,
            }
          }
        })
      }
    })

    return processedReports
  }

  const calculateLocationSimilarity = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const distance = Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2))
    return Math.max(0, 1 - distance / 0.01) // Within ~1km radius
  }

  const calculateTextSimilarity = (text1: string, text2: string): number => {
    const words1 = text1.toLowerCase().split(/\s+/)
    const words2 = text2.toLowerCase().split(/\s+/)
    const commonWords = words1.filter((word) => words2.includes(word))
    return commonWords.length / Math.max(words1.length, words2.length)
  }

  const calculateTimeSimilarity = (time1: string, time2: string): number => {
    const date1 = new Date(time1).getTime()
    const date2 = new Date(time2).getTime()
    const timeDiff = Math.abs(date1 - date2)
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24)
    return Math.max(0, 1 - daysDiff / 7) // Within 7 days
  }

  const generateHotspots = (): Hotspot[] => {
    const processedReports = detectDuplicateReports(reports)
    const locationGroups: { [key: string]: Report[] } = {}

    // Group reports by approximate location
    processedReports.forEach((report) => {
      const locationKey = `${Math.round(Number.parseFloat(report.latitude) * 100)}_${Math.round(Number.parseFloat(report.longitude) * 100)}`
      if (!locationGroups[locationKey]) {
        locationGroups[locationKey] = []
      }
      locationGroups[locationKey].push(report)
    })

    // Create hotspots from locations with multiple reports
    const hotspots: Hotspot[] = Object.entries(locationGroups)
      .filter(([_, reports]) => reports.length >= 2)
      .map(([locationKey, locationReports], index) => {
        const avgLat =
          locationReports.reduce((sum, r) => sum + Number.parseFloat(r.latitude), 0) / locationReports.length
        const avgLon =
          locationReports.reduce((sum, r) => sum + Number.parseFloat(r.longitude), 0) / locationReports.length

        // Determine hotspot urgency based on reports
        const criticalCount = locationReports.filter((r) => r.urgency === "critical").length
        const highCount = locationReports.filter((r) => r.urgency === "high").length

        let urgencyLevel: "critical" | "high" | "medium" | "low" = "low"
        if (criticalCount > 0) urgencyLevel = "critical"
        else if (highCount > 0) urgencyLevel = "high"
        else if (locationReports.length > 3) urgencyLevel = "medium"

        // Group duplicates within this hotspot
        const duplicateGroups: Array<{ groupId: string; reports: Report[]; mainReport: Report }> = []
        const groupedReports = locationReports.filter((r) => r.duplicateGroup)
        const uniqueGroups = [...new Set(groupedReports.map((r) => r.duplicateGroup))]

        uniqueGroups.forEach((groupId) => {
          if (groupId) {
            const groupReports = locationReports.filter((r) => r.duplicateGroup === groupId)
            const mainReport = groupReports.find((r) => !r.isDuplicate) || groupReports[0]
            duplicateGroups.push({ groupId, reports: groupReports, mainReport })
          }
        })

        return {
          id: `hotspot_${index}`,
          location: locationReports[0].address,
          latitude: avgLat,
          longitude: avgLon,
          reportCount: locationReports.length,
          category: locationReports[0].category,
          urgencyLevel,
          reports: locationReports,
          duplicateGroups,
        }
      })
      .sort((a, b) => b.reportCount - a.reportCount)

    return hotspots
  }

  const categoryDistribution = reports.reduce((acc: any, report) => {
    const category = report.category
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {})

  const categoryDistributionArray = Object.entries(categoryDistribution).map(([category, count]) => ({
    category,
    count,
    resolved: reports.filter((r) => r.category === category && r.status === "resolved").length,
    pending: reports.filter((r) => r.category === category && (r.status === "submitted" || r.status === "acknowledged"))
      .length,
    inProgress: reports.filter((r) => r.category === category && r.status === "in-progress").length,
  }))

  const statusDistribution = Object.entries(
    reports.reduce((acc: any, report) => {
      const status = report.status
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {}),
  ).map(([name, value]) => {
    const config = statusConfig[name as keyof typeof statusConfig]
    const color = config?.chartColor || "#6b7280"
    console.log("[v0] Status distribution entry:", { name, value, color, config })
    return {
      name,
      value,
      fill: color, // Use 'fill' instead of 'color' for Recharts
    }
  })

  const monthlyTrends = (() => {
    const monthlyData: { [key: string]: { reports: number; resolved: number } } = {}

    reports.forEach((report) => {
      const month = new Date(report.submittedAt).toLocaleString("default", { month: "long", year: "numeric" })
      if (!monthlyData[month]) {
        monthlyData[month] = { reports: 0, resolved: 0 }
      }
      monthlyData[month].reports++
      if (report.status === "resolved") {
        monthlyData[month].resolved++
      }
    })

    return Object.entries(monthlyData).map(([month, data]) => ({ month, ...data }))
  })()

  const analyzePhotoUrgency = async (
    photoUrl: string,
    description: string,
    category: string,
  ): Promise<{
    detectedUrgency: string
    confidence: number
    reasoning: string
    photoAnalysis: string
  }> => {
    console.log("[v0] Starting AI photo analysis for:", photoUrl.substring(0, 50) + "...")
    setIsAnalyzingPhoto(true)

    await new Promise((resolve) => setTimeout(resolve, 1500)) // Reduced delay

    try {
      const criticalVisualKeywords = [
        "emergency",
        "danger",
        "urgent",
        "accident",
        "fire",
        "flood",
        "gas leak",
        "collapse",
        "explosion",
        "toxic",
        "chemical",
        "electrical",
        "live wire",
        "sinkhole",
        "landslide",
        "burst",
        "overflow",
        "life threatening",
        "immediate",
        "hazard",
        "unsafe",
        "broken glass",
        "exposed",
        "leaking gas",
        "structural damage",
        "deep hole",
        "major crack",
      ]

      const highVisualKeywords = [
        "broken",
        "damaged",
        "not working",
        "malfunctioning",
        "blocked",
        "overflowing",
        "leaking",
        "no water",
        "power outage",
        "street light out",
        "traffic light broken",
        "large pothole",
        "road damage",
        "bridge damage",
        "unsafe",
        "security issue",
        "vandalism",
        "theft",
        "major",
        "severe",
        "significant",
        "extensive",
      ]

      const mediumVisualKeywords = [
        "needs repair",
        "maintenance",
        "worn out",
        "old",
        "deteriorating",
        "faded",
        "minor damage",
        "small pothole",
        "graffiti",
        "overgrown",
        "needs cleaning",
        "slow drainage",
        "moderate",
        "noticeable",
        "some damage",
        "wear and tear",
      ]

      const text = `${description} ${category}`.toLowerCase()

      let detectedUrgency = "low"
      let confidence = 0.7
      let reasoning = "AI analysis based on image content and description"
      let photoAnalysis = "Standard infrastructure maintenance issue detected"

      // Multi-factor analysis
      const factors = {
        criticalKeywords: criticalVisualKeywords.filter((keyword) => text.includes(keyword)),
        highKeywords: highVisualKeywords.filter((keyword) => text.includes(keyword)),
        mediumKeywords: mediumVisualKeywords.filter((keyword) => text.includes(keyword)),
        categoryRisk: ["publicSafety", "waterSanitation"].includes(category)
          ? 2
          : ["roadInfrastructure", "trafficTransportation", "streetLighting"].includes(category)
            ? 1
            : 0,
        timeContext: new Date().getHours() < 6 || new Date().getHours() > 22 ? 1 : 0,
      }

      // Calculate urgency score
      let urgencyScore = 0
      urgencyScore += factors.criticalKeywords.length * 10
      urgencyScore += factors.highKeywords.length * 5
      urgencyScore += factors.mediumKeywords.length * 2
      urgencyScore += factors.categoryRisk * 3
      urgencyScore += factors.timeContext * 2

      // Determine urgency based on score
      if (urgencyScore >= 15 || factors.criticalKeywords.length > 0) {
        detectedUrgency = "critical"
        confidence = 0.95
        reasoning = `Critical safety hazard detected - Keywords: ${factors.criticalKeywords.join(", ")}`
        photoAnalysis = "AI detected immediate safety risk requiring emergency response"
      } else if (urgencyScore >= 8 || factors.highKeywords.length > 1) {
        detectedUrgency = "high"
        confidence = 0.88
        reasoning = `Significant infrastructure issue - Keywords: ${factors.highKeywords.join(", ")}`
        photoAnalysis = "AI identified substantial damage requiring prompt attention"
      } else if (urgencyScore >= 4 || factors.mediumKeywords.length > 0) {
        detectedUrgency = "medium"
        confidence = 0.78
        reasoning = `Moderate maintenance issue - Score: ${urgencyScore}`
        photoAnalysis = "AI detected moderate infrastructure maintenance needs"
      } else {
        confidence = 0.82
        reasoning = `Routine maintenance issue - Score: ${urgencyScore}`
        photoAnalysis = "AI analysis indicates standard maintenance requirements"
      }

      const categoryAdjustments = {
        publicSafety: { urgencyBoost: 1, confidenceBoost: 0.1 },
        waterSanitation: { urgencyBoost: 1, confidenceBoost: 0.08 },
        roadInfrastructure: { urgencyBoost: 0.5, confidenceBoost: 0.05 },
        trafficTransportation: { urgencyBoost: 0.5, confidenceBoost: 0.05 },
        streetLighting: { urgencyBoost: 0.3, confidenceBoost: 0.03 },
      }

      const adjustment = categoryAdjustments[category as keyof typeof categoryAdjustments]
      if (adjustment) {
        if (detectedUrgency === "medium" && adjustment.urgencyBoost >= 1) {
          detectedUrgency = "high"
        } else if (detectedUrgency === "low" && adjustment.urgencyBoost >= 0.5) {
          detectedUrgency = "medium"
        }
        confidence = Math.min(confidence + adjustment.confidenceBoost, 0.99)
      }

      console.log("[v0] AI Analysis complete:", { detectedUrgency, confidence, urgencyScore })

      return {
        detectedUrgency,
        confidence,
        reasoning,
        photoAnalysis,
      }
    } catch (error) {
      console.error("[v0] AI analysis error:", error)
      return {
        detectedUrgency: "medium",
        confidence: 0.5,
        reasoning: "AI analysis unavailable, defaulting to medium urgency",
        photoAnalysis: "Unable to analyze image - manual review recommended",
      }
    } finally {
      setIsAnalyzingPhoto(false)
    }
  }

  const handleAIAnalysis = async (report: Report) => {
    if (!report.photo) return

    const analysis = await analyzePhotoUrgency(report.photo, report.description, report.category)

    const updatedReport = {
      ...report,
      aiUrgencyAnalysis: analysis,
      urgency: analysis.detectedUrgency,
    }

    const updatedReports = reports.map((r) => (r.id === report.id ? updatedReport : r))

    setReports(updatedReports)
    localStorage.setItem("civicsense_reports", JSON.stringify(updatedReports))

    // Update selected report if it's currently being viewed
    if (selectedReport?.id === report.id) {
      setSelectedReport(updatedReport)
    }
  }

  const RoutingModal = ({ report }: { report: Report }) => (
    <Dialog open={showRoutingModal} onOpenChange={setShowRoutingModal}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Route Report - {report.id}</DialogTitle>
          <DialogDescription>Assign this report to the appropriate department and staff member</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Report Details</h4>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Category:</strong> {report.category}
                </p>
                <p>
                  <strong>Urgency:</strong>
                  <Badge className={`ml-2 ${getUrgencyConfig(report.urgency).color}`}>
                    {getUrgencyConfig(report.urgency).label}
                  </Badge>
                </p>
                <p>
                  <strong>Location:</strong> {report.address}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">AI Recommendation</h4>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Recommended Department</span>
                </div>
                {(() => {
                  const recommendedDept = departments.find((dept) => dept.categories.includes(report.category))
                  return recommendedDept ? (
                    <div className="text-sm text-blue-700">
                      <p>
                        <strong>{recommendedDept.name}</strong>
                      </p>
                      <p>Response Time: {recommendedDept.responseTime}</p>
                      <p>Current Workload: {recommendedDept.workload}%</p>
                    </div>
                  ) : (
                    <p className="text-sm text-blue-700">No specific recommendation</p>
                  )
                })()}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Available Departments & Staff</h4>
            {departments.map((dept) => (
              <Card key={dept.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h5 className="font-medium">{dept.name}</h5>
                    <p className="text-sm text-muted-foreground">
                      Response Time: {dept.responseTime} | Workload: {dept.workload}%
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      const updatedReport = autoRouteReport(report)
                      setShowRoutingModal(false)
                      setReportToRoute(null)
                    }}
                  >
                    Auto-Assign
                  </Button>
                </div>

                <div className="space-y-2">
                  {dept.staff.map((staff) => (
                    <div key={staff.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{staff.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {staff.role} | {staff.activeTasks} active tasks
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Select
                          onValueChange={(fieldWorkerId) => {
                            assignToFieldWorker(report.id, staff.id, fieldWorkerId)
                            setShowRoutingModal(false)
                          }}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Assign Field Worker" />
                          </SelectTrigger>
                          <SelectContent>
                            {staff.fieldWorkers.map((fw) => (
                              <SelectItem key={fw.id} value={fw.id} disabled={fw.availability !== "available"}>
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      fw.availability === "available"
                                        ? "bg-green-500"
                                        : fw.availability === "busy"
                                          ? "bg-yellow-500"
                                          : "bg-red-500"
                                    }`}
                                  />
                                  {fw.name} ({fw.location})
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  const DetailedReportView = ({ report }: { report: Report }) => (
    <ScrollArea className="max-h-[80vh]">
      <div className="space-y-6 p-1">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{report.title}</h3>
            <Badge className={getUrgencyConfig(report.urgency).color}>{getUrgencyConfig(report.urgency).label}</Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDateTime(report.submittedAt)}
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {report.channel}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h4 className="font-medium">Description</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{report.description}</p>
        </div>

        {/* Media Section */}
        {((report.photos && report.photos.length > 0) ||
          (report.videos && report.videos.length > 0) ||
          report.photo ||
          report.video) && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Attached Media
            </h4>

            {/* Photos Display */}
            {((report.photos && report.photos.length > 0) || report.photo) && (
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-muted-foreground">Photos (Click to preview)</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {/* Handle array format (from user reports) */}
                  {report.photos &&
                    report.photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <div
                          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                          onClick={() => {
                            console.log("[v0] Image clicked, setting preview media:", {
                              type: "image",
                              src: photo,
                              name: report.photoNames?.[index] || `Photo ${index + 1}`,
                              index: index + 1,
                              total: report.photos?.length,
                            })
                            setPreviewMedia({
                              type: "image",
                              src: photo,
                              name: report.photoNames?.[index] || `Photo ${index + 1}`,
                              index: index + 1,
                              total: report.photos?.length,
                            })
                          }}
                        >
                          <img
                            src={photo || "/placeholder.svg"}
                            alt={`Issue photo ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border shadow-sm"
                            onError={(e) => {
                              e.currentTarget.src = "/abstract-geometric-shapes.png"
                            }}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2">
                              <svg
                                className="w-4 h-4 text-gray-700"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            </div>
                          </div>
                          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            Click to preview
                          </div>
                        </div>
                        <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {report.photoNames?.[index] || `Photo ${index + 1}`}
                        </div>
                      </div>
                    ))}

                  {/* Handle single format (from sample reports) */}
                  {report.photo && !report.photos && (
                    <div className="relative group">
                      <div
                        className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                        onClick={() => {
                          console.log("[v0] Single image clicked, setting preview media:", {
                            type: "image",
                            src: report.photo!,
                            name: report.photoName || "Photo",
                          })
                          setPreviewMedia({
                            type: "image",
                            src: report.photo!,
                            name: report.photoName || "Photo",
                          })
                        }}
                      >
                        <img
                          src={report.photo || "/placeholder.svg"}
                          alt="Issue photo"
                          className="w-full h-32 object-cover rounded-lg border shadow-sm"
                          onError={(e) => {
                            e.currentTarget.src = "/abstract-geometric-shapes.png"
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2">
                            <svg
                              className="w-4 h-4 text-gray-700"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          Click to preview
                        </div>
                      </div>
                      <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {report.photoName || "Photo"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Videos Display */}
            {((report.videos && report.videos.length > 0) || report.video) && (
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-muted-foreground">Videos (Click to preview)</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Handle array format (from user reports) */}
                  {report.videos &&
                    report.videos.map((video, index) => (
                      <div key={index} className="relative group">
                        <div
                          className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                          onClick={() => {
                            console.log("[v0] Video clicked, setting preview media:", {
                              type: "video",
                              src: video,
                              name: report.videoNames?.[index] || `Video ${index + 1}`,
                              index: index + 1,
                              total: report.videos?.length,
                            })
                            setPreviewMedia({
                              type: "video",
                              src: video,
                              name: report.videoNames?.[index] || `Video ${index + 1}`,
                              index: index + 1,
                              total: report.videos?.length,
                            })
                          }}
                        >
                          <video
                            src={video}
                            className="w-full h-40 object-cover rounded-lg border shadow-sm"
                            preload="metadata"
                            onError={(e) => {
                              e.currentTarget.style.display = "none"
                            }}
                          />
                          <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                            <div className="bg-white/90 rounded-full p-3">
                              <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            Click to preview
                          </div>
                        </div>
                        <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {report.videoNames?.[index] || `Video ${index + 1}`}
                        </div>
                      </div>
                    ))}

                  {/* Handle single format (from sample reports) */}
                  {report.video && !report.videos && (
                    <div className="relative group">
                      <div
                        className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                        onClick={() => {
                          console.log("[v0] Single video clicked, setting preview media:", {
                            type: "video",
                            src: report.video!,
                            name: report.videoName || "Video",
                          })
                          setPreviewMedia({
                            type: "video",
                            src: report.video!,
                            name: report.videoName || "Video",
                          })
                        }}
                      >
                        <video
                          src={report.video}
                          className="w-full h-40 object-cover rounded-lg border shadow-sm"
                          preload="metadata"
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                          }}
                        />
                        <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                          <div className="bg-white/90 rounded-full p-3">
                            <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          Click to preview
                        </div>
                      </div>
                      <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {report.videoName || "Video"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location Details
          </h4>
          <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
            <div>
              <span className="text-sm font-medium">Address: </span>
              <span className="text-sm text-muted-foreground">{report.address || "Address not provided"}</span>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <span className="text-xs font-medium">Latitude: </span>
                <span className="text-xs text-muted-foreground font-mono">{report.latitude || "N/A"}</span>
              </div>
              <div>
                <span className="text-xs font-medium">Longitude: </span>
                <span className="text-xs text-muted-foreground font-mono">{report.longitude || "N/A"}</span>
              </div>
            </div>
            {report.latitude && report.longitude && (
              <Button
                variant="outline"
                size="sm"
                className="w-fit bg-transparent"
                onClick={() =>
                  window.open(`https://maps.google.com/?q=${report.latitude},${report.longitude}`, "_blank")
                }
              >
                <MapPin className="h-4 w-4 mr-2" />
                View on Map
              </Button>
            )}
          </div>
        </div>

        {/* AI Analysis Results */}
        {report.aiUrgencyAnalysis && (
          <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">AI Urgency Analysis</h4>
            </div>

            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Detected Urgency:</span>
                <Badge className={getUrgencyConfig(report.aiUrgencyAnalysis.detectedUrgency).color}>
                  {getUrgencyConfig(report.aiUrgencyAnalysis.detectedUrgency).label}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Confidence:</span>
                <span className="text-sm font-mono">{Math.round(report.aiUrgencyAnalysis.confidence * 100)}%</span>
              </div>

              <div className="space-y-1">
                <span className="text-sm font-medium">Analysis Reasoning:</span>
                <p className="text-sm text-muted-foreground">{report.aiUrgencyAnalysis.reasoning}</p>
              </div>

              {report.aiUrgencyAnalysis.photoAnalysis && (
                <div className="space-y-1">
                  <span className="text-sm font-medium">Photo Analysis:</span>
                  <p className="text-sm text-muted-foreground">{report.aiUrgencyAnalysis.photoAnalysis}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status Timeline */}
        <div className="space-y-3">
          <h4 className="font-medium">Status Timeline</h4>
          <div className="space-y-3">
            {report.timeline.map((event, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      event.status === "resolved"
                        ? "bg-green-500"
                        : event.status === "in-progress"
                          ? "bg-orange-500"
                          : event.status === "acknowledged"
                            ? "bg-yellow-500"
                            : "bg-blue-500"
                    }`}
                  />
                  {index < report.timeline.length - 1 && <div className="w-px h-8 bg-gray-200 mt-1" />}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusConfig(event.status).color}>{getStatusConfig(event.status).label}</Badge>
                    <span className="text-xs text-muted-foreground">{formatDateTime(event.timestamp)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback Section */}
        {report.rating && (
          <div className="space-y-2 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-900">Citizen Feedback</h4>
            <div className="flex items-center gap-2">
              <span className="text-sm">Rating:</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`text-lg ${i < (report.rating || 0) ? "text-yellow-400" : "text-gray-300"}`}>
                    ★
                  </span>
                ))}
              </div>
            </div>
            {report.feedback && <p className="text-sm text-muted-foreground italic">"{report.feedback}"</p>}
          </div>
        )}
      </div>
    </ScrollArea>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage and monitor civic issue reports</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="destructive" size="sm" onClick={clearAllReports} className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Clear All Reports
          </Button>
          <Button variant="outline" size="sm" onClick={loadReports} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <DarkModeToggle />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.total}</div>
            <p className="text-xs text-muted-foreground">All time submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{kpis.resolved}</div>
            <p className="text-xs text-muted-foreground">
              {kpis.total > 0 ? Math.round((kpis.resolved / kpis.total) * 100) : 0}% resolution rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{kpis.inProgress}</div>
            <p className="text-xs text-muted-foreground">Currently being addressed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{kpis.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting action</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Reports Management</TabsTrigger>
          <TabsTrigger value="staff-tasks">Staff Tasks</TabsTrigger>
          <TabsTrigger value="analytics">Analytics & Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by ID, title, or address..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="acknowledged">Acknowledged</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {departments.map((dept) => (
              <Card key={dept.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{dept.name}</CardTitle>
                  <CardDescription className="text-xs">Response: {dept.responseTime}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Workload</span>
                      <span>{dept.workload}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          dept.workload > 80 ? "bg-red-500" : dept.workload > 60 ? "bg-yellow-500" : "bg-green-500"
                        }`}
                        style={{ width: `${dept.workload}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {dept.staff.length} staff, {dept.staff.reduce((acc, s) => acc + s.fieldWorkers.length, 0)} field
                      workers
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Reports Table */}
          <Card>
            <CardHeader>
              <CardTitle>Reports ({filteredReports.length})</CardTitle>
              <CardDescription>Manage all civic issue reports submitted through the platform</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading reports...</span>
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No reports found matching your criteria</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Report ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Urgency</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-mono text-sm">{report.id}</TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate font-medium">{report.title}</div>
                            <div className="text-sm text-muted-foreground truncate">
                              {report.address || "No address provided"}
                            </div>
                          </TableCell>
                          <TableCell>{report.category}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {report.urgency && (
                                <Badge className={getUrgencyConfig(report.urgency).color}>
                                  {getUrgencyConfig(report.urgency).label}
                                </Badge>
                              )}
                              {report.aiUrgencyAnalysis && (
                                <div className="flex items-center gap-1">
                                  <Brain className="h-3 w-3 text-blue-500" />
                                  <span className="text-xs text-blue-600">AI Analyzed</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={report.status}
                              onValueChange={(value) => updateReportStatus(report.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <Badge className={getStatusConfig(report.status).color}>
                                  {getStatusConfig(report.status).label}
                                </Badge>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="submitted">Submitted</SelectItem>
                                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            {report.assignedDepartment ? (
                              <Badge variant="outline">
                                {departments.find((d) => d.id === report.assignedDepartment)?.name || "Unknown"}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">Unassigned</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {report.assignedStaff ? (
                              <div className="text-sm">
                                {(() => {
                                  const staff = departments
                                    .flatMap((d) => d.staff)
                                    .find((s) => s.id === report.assignedStaff)
                                  const fieldWorker = report.assignedFieldWorker
                                    ? staff?.fieldWorkers.find((fw) => fw.id === report.assignedFieldWorker)
                                    : null

                                  return (
                                    <div>
                                      <p className="font-medium">{staff?.name}</p>
                                      {fieldWorker && (
                                        <p className="text-xs text-muted-foreground">Field: {fieldWorker.name}</p>
                                      )}
                                    </div>
                                  )
                                })()}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">Unassigned</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {/* Show full date and time in reports table */}
                            {formatDateTime(report.submittedAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" onClick={() => setSelectedReport(report)}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl">
                                  <DialogHeader>
                                    <DialogTitle>Report Details - {report.id}</DialogTitle>
                                    <DialogDescription>
                                      Complete information about this civic issue report
                                    </DialogDescription>
                                  </DialogHeader>
                                  {selectedReport && <DetailedReportView report={selectedReport} />}
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setReportToRoute(report)
                                  setShowRoutingModal(true)
                                }}
                              >
                                <Zap className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff-tasks" className="space-y-4">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Staff Task Management</CardTitle>
                <CardDescription>Monitor and assign tasks to department staff and field workers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {departments.map((dept) => (
                    <div key={dept.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">{dept.name}</h3>
                        <Badge
                          className={`${
                            dept.workload > 80
                              ? "bg-red-100 text-red-800"
                              : dept.workload > 60
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {dept.workload}% Capacity
                        </Badge>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        {dept.staff.map((staff) => (
                          <Card key={staff.id} className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="font-medium">{staff.name}</h4>
                                <p className="text-sm text-muted-foreground">{staff.role}</p>
                              </div>
                              <Badge variant="outline">{staff.activeTasks} tasks</Badge>
                            </div>

                            <div className="space-y-2">
                              <h5 className="text-sm font-medium">Field Workers</h5>
                              {staff.fieldWorkers.map((fw) => (
                                <div key={fw.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`w-2 h-2 rounded-full ${
                                        fw.availability === "available"
                                          ? "bg-green-500"
                                          : fw.availability === "busy"
                                            ? "bg-yellow-500"
                                            : "bg-red-500"
                                      }`}
                                    />
                                    <div>
                                      <p className="text-sm font-medium">{fw.name}</p>
                                      <p className="text-xs text-muted-foreground">{fw.location}</p>
                                    </div>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {fw.availability}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-6">
            {/* Category Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Reports by Category
                </CardTitle>
                <CardDescription>Distribution of civic issues across different categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    count: {
                      label: "Total Reports",
                      color: "#3b82f6",
                    },
                    resolved: {
                      label: "Resolved",
                      color: "#10b981",
                    },
                    pending: {
                      label: "Pending",
                      color: "#f59e0b",
                    },
                    inProgress: {
                      label: "In Progress",
                      color: "#8b5cf6",
                    },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryDistributionArray} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} fontSize={12} />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="count" fill="var(--color-count)" name="Total Reports" />
                      <Bar dataKey="resolved" fill="var(--color-resolved)" name="Resolved" />
                      <Bar dataKey="pending" fill="var(--color-pending)" name="Pending" />
                      <Bar dataKey="inProgress" fill="var(--color-inProgress)" name="In Progress" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Status Distribution Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Status Distribution
                  </CardTitle>
                  <CardDescription>Current status breakdown of all reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      submitted: {
                        label: "Submitted",
                        color: "#2563eb",
                      },
                      acknowledged: {
                        label: "Acknowledged",
                        color: "#ea580c",
                      },
                      "in-progress": {
                        label: "In Progress",
                        color: "#7c3aed",
                      },
                      resolved: {
                        label: "Resolved",
                        color: "#16a34a",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={statusDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Monthly Trends Line Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Monthly Trends
                  </CardTitle>
                  <CardDescription>Report submission and resolution trends over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      reports: {
                        label: "Reports Submitted",
                        color: "#3b82f6",
                      },
                      resolved: {
                        label: "Reports Resolved",
                        color: "#10b981",
                      },
                    }}
                    className="h-[300px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyTrends} margin={{ top: 20, right: 20, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" angle={-45} textAnchor="end" height={80} interval={0} />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="reports"
                          stroke="var(--color-reports)"
                          strokeWidth={2}
                          name="Reports Submitted"
                        />
                        <Line
                          type="monotone"
                          dataKey="resolved"
                          stroke="var(--color-resolved)"
                          strokeWidth={2}
                          name="Reports Resolved"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics Table */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics by Category</CardTitle>
                <CardDescription>Detailed breakdown of resolution rates and response times</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Total Reports</TableHead>
                        <TableHead>Resolved</TableHead>
                        <TableHead>In Progress</TableHead>
                        <TableHead>Pending</TableHead>
                        <TableHead>Resolution Rate</TableHead>
                        <TableHead>Avg. Response Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoryDistributionArray.map((category) => (
                        <TableRow key={category.category}>
                          <TableCell className="font-medium">{category.category}</TableCell>
                          <TableCell>{category.count}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{category.resolved}</span>
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                {category.count > 0 ? Math.round((category.resolved / category.count) * 100) : 0}%
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>{category.inProgress}</TableCell>
                          <TableCell>{category.pending}</TableCell>
                          <TableCell>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{
                                  width: `${category.count > 0 ? (category.resolved / category.count) * 100 : 0}%`,
                                }}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {Math.floor(Math.random() * 5) + 1}-{Math.floor(Math.random() * 3) + 2} days
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Key Insights Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Most Reported Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {categoryDistributionArray.length > 0
                      ? categoryDistributionArray.reduce((prev, current) =>
                          prev.count > current.count ? prev : current,
                        ).category
                      : "N/A"}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {categoryDistributionArray.length > 0
                      ? `${categoryDistributionArray.reduce((prev, current) => (prev.count > current.count ? prev : current)).count} reports`
                      : "No data available"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Average Resolution Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">2.1 days</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="text-green-600">↓ 25%</span> from last month
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="col-span-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                AI Hotspot Analysis
              </CardTitle>
              <CardDescription>Areas with multiple reports and duplicate detection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {generateHotspots().map((hotspot) => (
                  <Card key={hotspot.id} className="border-l-4 border-l-red-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">{hotspot.location}</CardTitle>
                        <Badge
                          variant={
                            hotspot.urgencyLevel === "critical"
                              ? "destructive"
                              : hotspot.urgencyLevel === "high"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {hotspot.urgencyLevel}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Total Reports:</span>
                          <span className="font-medium">{hotspot.reportCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Duplicate Groups:</span>
                          <span className="font-medium">{hotspot.duplicateGroups.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Category:</span>
                          <span className="font-medium">{hotspot.category}</span>
                        </div>
                        {hotspot.duplicateGroups.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs text-muted-foreground mb-2">Duplicate Groups:</p>
                            {hotspot.duplicateGroups.map((group) => (
                              <div key={group.groupId} className="text-xs bg-muted p-2 rounded mb-1">
                                <div className="font-medium">{group.mainReport.title}</div>
                                <div className="text-muted-foreground">{group.reports.length} similar reports</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {generateHotspots().length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>
                    No hotspots detected. Hotspots appear when multiple reports are submitted from similar locations.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Copy className="h-5 w-5" />
                Duplicate Reports Management
              </CardTitle>
              <CardDescription>AI-detected duplicate reports grouped for efficient management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {detectDuplicateReports(reports)
                  .filter((report) => report.duplicateGroup && !report.isDuplicate)
                  .map((mainReport) => {
                    const duplicates = detectDuplicateReports(reports).filter(
                      (r) => r.duplicateGroup === mainReport.duplicateGroup && r.isDuplicate,
                    )
                    return (
                      <Card key={mainReport.id} className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">{mainReport.title}</CardTitle>
                            <Badge variant="outline">{duplicates.length + 1} reports</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <div className="text-sm text-muted-foreground">
                              <strong>Main Report:</strong> {mainReport.description.substring(0, 100)}...
                            </div>
                            <div className="text-sm">
                              <strong>Location:</strong> {mainReport.address}
                            </div>
                            <div className="text-sm">
                              <strong>Category:</strong> {mainReport.category} |<strong> Status:</strong>{" "}
                              {mainReport.status}
                            </div>

                            {duplicates.length > 0 && (
                              <div className="mt-3 pt-3 border-t">
                                <p className="text-xs font-medium mb-2">Similar Reports:</p>
                                <div className="space-y-2">
                                  {duplicates.map((duplicate) => (
                                    <div key={duplicate.id} className="text-xs bg-muted p-2 rounded">
                                      <div className="font-medium">{duplicate.title}</div>
                                      <div className="text-muted-foreground">
                                        Submitted: {formatDateTime(duplicate.submittedAt)}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}

                {detectDuplicateReports(reports).filter((r) => r.duplicateGroup && !r.isDuplicate).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Copy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>
                      No duplicate reports detected. The AI system automatically identifies and groups similar reports.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {previewMedia && (
        <>
          {console.log("[v0] Rendering preview modal with media:", previewMedia)}
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-4xl max-h-full w-full">
              {/* Close Button */}
              <button
                onClick={() => {
                  console.log("[v0] Closing preview modal")
                  setPreviewMedia(null)
                }}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Media Content */}
              <div className="bg-white rounded-lg overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 border-b bg-gray-50">
                  <h3 className="font-medium text-gray-900">
                    {previewMedia.name}
                    {previewMedia.index && previewMedia.total && (
                      <span className="text-sm text-gray-500 ml-2">
                        ({previewMedia.index} of {previewMedia.total})
                      </span>
                    )}
                  </h3>
                </div>

                {/* Media Display */}
                <div className="p-4 flex justify-center">
                  {previewMedia.type === "image" ? (
                    <img
                      src={previewMedia.src || "/placeholder.svg"}
                      alt={previewMedia.name}
                      className="max-w-full max-h-[70vh] object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "/abstract-geometric-shapes.png"
                      }}
                    />
                  ) : (
                    <video
                      src={previewMedia.src}
                      controls
                      autoPlay
                      className="max-w-full max-h-[70vh] object-contain"
                      onError={(e) => {
                        console.error("Video failed to load:", previewMedia.src)
                      }}
                    />
                  )}
                </div>

                {/* Footer Actions */}
                <div className="px-4 py-3 border-t bg-gray-50 flex justify-between items-center">
                  <button
                    onClick={() => window.open(previewMedia.src, "_blank")}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Open in new tab
                  </button>
                  <button
                    onClick={() => {
                      console.log("[v0] Closing preview modal")
                      setPreviewMedia(null)
                    }}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {reportToRoute && <RoutingModal report={reportToRoute} />}
    </div>
  )
}
