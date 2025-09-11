"use client"

import type React from "react"

import { useState, useRef, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Camera, Upload, Loader2, Video, X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface ReportFormProps {
  onSubmitSuccess: (reportId: string) => void
}

export default function ReportForm({ onSubmitSuccess }: ReportFormProps) {
  const { t } = useLanguage()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    address: "",
    latitude: "",
    longitude: "",
    urgency: "", // Added urgency field to form data
  })
  const [photos, setPhotos] = useState<File[]>([])
  const [photosPreviews, setPhotosPreviews] = useState<string[]>([])
  const [videos, setVideos] = useState<File[]>([])
  const [videosPreviews, setVideosPreviews] = useState<string[]>([])
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [mapCenter, setMapCenter] = useState({ lat: 23.3441, lng: 85.3096 }) // Default to Ranchi, Jharkhand
  const [zoom, setZoom] = useState(12) // Reduced initial zoom for better state view
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false) // Added drag state for pan functionality
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null) // Track drag start position
  const mapRef = useRef<HTMLDivElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const categories = [
    { key: "roadInfrastructure", label: t("roadInfrastructure") },
    { key: "waterSanitation", label: t("waterSanitation") },
    { key: "wasteManagement", label: t("wasteManagement") },
    { key: "streetLighting", label: t("streetLighting") },
    { key: "publicSafety", label: t("publicSafety") },
    { key: "parksRecreation", label: t("parksRecreation") },
    { key: "trafficTransportation", label: t("trafficTransportation") },
    { key: "other", label: t("other") },
  ]

  const tileCalculations = useMemo(() => {
    const deg2rad = (deg: number) => deg * (Math.PI / 180)
    const rad2deg = (rad: number) => rad * (180 / Math.PI)

    const latLngToTile = (lat: number, lng: number, zoom: number) => {
      const x = Math.floor(((lng + 180) / 360) * Math.pow(2, zoom))
      const y = Math.floor(
        ((1 - Math.log(Math.tan(deg2rad(lat)) + 1 / Math.cos(deg2rad(lat))) / Math.PI) / 2) * Math.pow(2, zoom),
      )
      return { x, y }
    }

    const tileToLatLng = (x: number, y: number, zoom: number) => {
      const lng = (x / Math.pow(2, zoom)) * 360 - 180
      const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, zoom)
      const lat = rad2deg(Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))))
      return { lat, lng }
    }

    const pixelToLatLng = (
      pixelX: number,
      pixelY: number,
      mapWidth: number,
      mapHeight: number,
      center: { lat: number; lng: number },
      zoom: number,
    ) => {
      // Calculate degrees per pixel at current zoom level
      const degreesPerPixelLat = 180 / (256 * Math.pow(2, zoom))
      const degreesPerPixelLng = 360 / (256 * Math.pow(2, zoom))

      // Calculate offset from center in pixels
      const offsetX = pixelX - mapWidth / 2
      const offsetY = pixelY - mapHeight / 2

      // Convert to lat/lng offset
      const latOffset = -offsetY * degreesPerPixelLat
      const lngOffset = offsetX * degreesPerPixelLng

      return {
        lat: center.lat + latOffset,
        lng: center.lng + lngOffset,
      }
    }

    const latLngToPixel = (
      lat: number,
      lng: number,
      mapWidth: number,
      mapHeight: number,
      center: { lat: number; lng: number },
      zoom: number,
    ) => {
      // Calculate degrees per pixel at current zoom level
      const degreesPerPixelLat = 180 / (256 * Math.pow(2, zoom))
      const degreesPerPixelLng = 360 / (256 * Math.pow(2, zoom))

      // Calculate lat/lng offset from center
      const latOffset = lat - center.lat
      const lngOffset = lng - center.lng

      // Convert to pixel offset
      const offsetX = lngOffset / degreesPerPixelLng
      const offsetY = -latOffset / degreesPerPixelLat

      return {
        x: mapWidth / 2 + offsetX,
        y: mapHeight / 2 + offsetY,
      }
    }

    return { latLngToTile, tileToLatLng, pixelToLatLng, latLngToPixel }
  }, [])

  const handleMapClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (isDragging) {
        return
      }

      const rect = event.currentTarget.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      const mapWidth = rect.width
      const mapHeight = rect.height

      const position = tileCalculations.pixelToLatLng(x, y, mapWidth, mapHeight, mapCenter, zoom)

      const precisePosition = {
        lat: Number(position.lat.toFixed(8)),
        lng: Number(position.lng.toFixed(8)),
      }

      setMarkerPosition(precisePosition)
      setFormData((prev) => ({
        ...prev,
        latitude: precisePosition.lat.toString(),
        longitude: precisePosition.lng.toString(),
      }))

      reverseGeocode(precisePosition.lat, precisePosition.lng)
    },
    [mapCenter, zoom, tileCalculations, isDragging],
  )

  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    setDragStart({ x: event.clientX, y: event.clientY })
    setIsDragging(false)
  }, [])

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!dragStart) return

      const deltaX = event.clientX - dragStart.x
      const deltaY = event.clientY - dragStart.y
      const dragThreshold = 5 // Increased drag threshold to prevent accidental drags

      if (Math.abs(deltaX) > dragThreshold || Math.abs(deltaY) > dragThreshold) {
        setIsDragging(true)

        const pixelsPerDegree = (256 * Math.pow(2, zoom)) / 360
        const latChange = deltaY / pixelsPerDegree
        const lngChange = -deltaX / pixelsPerDegree

        setMapCenter((prev) => ({
          lat: Math.max(-85, Math.min(85, prev.lat + latChange)),
          lng: ((prev.lng + lngChange + 180) % 360) - 180,
        }))

        setDragStart({ x: event.clientX, y: event.clientY })
      }
    },
    [dragStart, zoom],
  )

  const handleMouseUp = useCallback(() => {
    setDragStart(null)
    setTimeout(() => setIsDragging(false), 10)
  }, [])

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          signal: controller.signal,
          headers: {
            "User-Agent": "CivicSense-App/1.0",
          },
        },
      )

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data && data.display_name) {
        setFormData((prev) => ({
          ...prev,
          address: data.display_name,
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          address: `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        }))
      }
    } catch (error) {
      console.log("[v0] Geocoding error:", error)
      setFormData((prev) => ({
        ...prev,
        address: `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      }))
    }
  }

  const renderMap = useCallback(() => {
    if (!mapRef.current) return null

    const mapWidth = mapRef.current.clientWidth || 600
    const mapHeight = 320

    const centerTile = tileCalculations.latLngToTile(mapCenter.lat, mapCenter.lng, zoom)

    const tilesX = Math.ceil(mapWidth / 256) + 1
    const tilesY = Math.ceil(mapHeight / 256) + 1

    const startTileX = centerTile.x - Math.floor(tilesX / 2)
    const startTileY = centerTile.y - Math.floor(tilesY / 2)

    const offsetX = mapWidth / 2 - (centerTile.x - startTileX) * 256
    const offsetY = mapHeight / 2 - (centerTile.y - startTileY) * 256

    const tiles = []
    for (let x = 0; x < tilesX; x++) {
      for (let y = 0; y < tilesY; y++) {
        const tileX = startTileX + x
        const tileY = startTileY + y

        if (tileX >= 0 && tileY >= 0 && tileX < Math.pow(2, zoom) && tileY < Math.pow(2, zoom)) {
          tiles.push(
            <img
              key={`${tileX}-${tileY}-${zoom}`}
              src={`https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png`}
              alt=""
              className="absolute select-none pointer-events-none"
              style={{
                left: offsetX + x * 256,
                top: offsetY + y * 256,
                width: 256,
                height: 256,
              }}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.opacity = "0.3"
              }}
            />,
          )
        }
      }
    }

    let markerElement = null
    if (markerPosition) {
      const markerPixel = tileCalculations.latLngToPixel(
        markerPosition.lat,
        markerPosition.lng,
        mapWidth,
        mapHeight,
        mapCenter,
        zoom,
      )

      markerElement = (
        <div
          className="absolute z-10 transform -translate-x-1/2 -translate-y-full pointer-events-none"
          style={{
            left: markerPixel.x,
            top: markerPixel.y,
          }}
        >
          <div className="relative">
            <MapPin className="h-8 w-8 text-red-500 drop-shadow-lg" fill="currentColor" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full border border-red-500"></div>
          </div>
        </div>
      )
    }

    return (
      <div className="relative overflow-hidden bg-gray-100" style={{ width: mapWidth, height: mapHeight }}>
        {tiles}
        {markerElement}
      </div>
    )
  }, [mapCenter, zoom, markerPosition, tileCalculations])

  const detectUrgency = (title: string, description: string, category: string): string => {
    const text = `${title} ${description}`.toLowerCase()

    // Critical urgency keywords - immediate danger/emergency
    const criticalKeywords = [
      "emergency",
      "urgent",
      "dangerous",
      "hazardous",
      "life threatening",
      "death",
      "injury",
      "injured",
      "gas leak",
      "fire",
      "explosion",
      "collapsed",
      "collapse",
      "flooding",
      "flood",
      "electrical hazard",
      "live wire",
      "exposed wire",
      "sinkhole",
      "landslide",
      "toxic",
      "poison",
      "chemical spill",
      "water main burst",
      "sewage overflow",
      "immediate danger",
      "safety risk",
      "accident prone",
    ]

    // High urgency keywords - serious issues needing quick attention
    const highKeywords = [
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
      "pothole large",
      "road damage",
      "bridge damage",
      "unsafe",
      "security issue",
      "vandalism",
      "theft",
    ]

    // Medium urgency keywords - moderate issues
    const mediumKeywords = [
      "needs repair",
      "maintenance required",
      "worn out",
      "old",
      "deteriorating",
      "faded",
      "minor damage",
      "small pothole",
      "noise complaint",
      "littering",
      "graffiti",
      "overgrown",
      "needs cleaning",
      "slow drainage",
    ]

    // Category-based urgency modifiers
    const criticalCategories = ["Public Safety", "Water & Sanitation"]
    const highCategories = ["Road & Infrastructure", "Traffic & Transportation", "Street Lighting"]

    // Check for critical keywords
    if (criticalKeywords.some((keyword) => text.includes(keyword))) {
      return "critical"
    }

    // Check for high urgency keywords or critical categories with issues
    if (
      highKeywords.some((keyword) => text.includes(keyword)) ||
      (criticalCategories.includes(category) && text.includes("not working"))
    ) {
      return "high"
    }

    // Check for medium urgency keywords or high priority categories
    if (mediumKeywords.some((keyword) => text.includes(keyword)) || highCategories.includes(category)) {
      return "medium"
    }

    // Default to low urgency
    return "low"
  }

  const handleInputChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value }

    // Auto-detect urgency when title, description, or category changes
    if (field === "title" || field === "description" || field === "category") {
      const detectedUrgency = detectUrgency(
        field === "title" ? value : newFormData.title,
        field === "description" ? value : newFormData.description,
        field === "category" ? value : newFormData.category,
      )
      newFormData.urgency = detectedUrgency
    }

    setFormData(newFormData)
  }

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      setPhotos((prev) => [...prev, ...files])

      files.forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          setPhotosPreviews((prev) => [...prev, e.target?.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      setVideos((prev) => [...prev, ...files])

      files.forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          setVideosPreviews((prev) => [...prev, e.target?.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
    setPhotosPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const removeVideo = (index: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== index))
    setVideosPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const getCurrentLocation = () => {
    setIsGettingLocation(true)
    setLocationError(null)

    if (!navigator.geolocation) {
      setLocationError(t("geolocationNotSupported"))
      setIsGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setFormData((prev) => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        }))

        const newCenter = { lat: latitude, lng: longitude }
        setMapCenter(newCenter)
        setMarkerPosition(newCenter)

        reverseGeocode(latitude, longitude)
        setIsGettingLocation(false)
      },
      (error) => {
        setLocationError(t("unableToRetrieveLocation"))
        setIsGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    )
  }

  const generateReportId = () => {
    const prefix = "R"
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `${prefix}-${timestamp}${random}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!formData.title || !formData.description || !formData.category) {
      alert(t("fillRequiredFields"))
      setIsSubmitting(false)
      return
    }

    if (photos.length === 0) {
      alert(t("atLeastOnePhoto"))
      setIsSubmitting(false)
      return
    }

    if (!formData.latitude || !formData.longitude) {
      alert(t("selectLocationOnMapError"))
      setIsSubmitting(false)
      return
    }

    try {
      const reportId = generateReportId()
      const currentDateTime = new Date()
      const reportData = {
        id: reportId,
        ...formData,
        urgency: formData.urgency || "low",
        photos: photosPreviews,
        photoNames: photos.map((p) => p.name),
        videos: videosPreviews,
        videoNames: videos.map((v) => v.name),
        status: "submitted",
        channel: "web",
        submittedAt: currentDateTime.toISOString(),
        submittedDate: currentDateTime.toLocaleDateString(),
        submittedTime: currentDateTime.toLocaleTimeString(),
        timeline: [
          {
            status: "submitted",
            timestamp: currentDateTime.toISOString(),
            description: `Report submitted on ${currentDateTime.toLocaleDateString()} at ${currentDateTime.toLocaleTimeString()}`,
          },
        ],
      }

      const existingReports = JSON.parse(localStorage.getItem("civicsense_reports") || "[]")
      existingReports.push(reportData)
      localStorage.setItem("civicsense_reports", JSON.stringify(existingReports))

      await new Promise((resolve) => setTimeout(resolve, 1500))

      onSubmitSuccess(reportId)
    } catch (error) {
      console.error("Error submitting report:", error)
      alert(t("errorSubmittingReport"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 1, 19))
  }, [])

  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 1, 3))
  }, [])

  const resetMap = useCallback(() => {
    setMapCenter({ lat: 23.3441, lng: 85.3096 }) // Ranchi, Jharkhand
    setZoom(12)
    setMarkerPosition(null)
    setFormData((prev) => ({
      ...prev,
      latitude: "",
      longitude: "",
      address: "",
    }))
  }, [])

  const urgencyConfig = {
    low: { label: t("low"), color: "bg-green-100 text-green-800", icon: "🟢" },
    medium: { label: t("medium"), color: "bg-yellow-100 text-yellow-800", icon: "🟡" },
    high: { label: t("high"), color: "bg-orange-100 text-orange-800", icon: "🟠" },
    critical: { label: t("critical"), color: "bg-red-100 text-red-800", icon: "🔴" },
  }

  const getUrgencyConfig = (urgency: string) => {
    return urgencyConfig[urgency as keyof typeof urgencyConfig] || urgencyConfig.low
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {t("reportCivicIssue")}
          </CardTitle>
          <CardDescription>{t("reportFormDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">{t("issueTitle")} *</Label>
              <Input
                id="title"
                placeholder={t("issueTitlePlaceholder")}
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t("detailedDescription")} *</Label>
              <Textarea
                id="description"
                placeholder={t("detailedDescriptionPlaceholder")}
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">{t("category")} *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.key} value={category.key}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>{t("location")} *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="flex items-center gap-2 bg-transparent"
                >
                  {isGettingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                  {isGettingLocation ? t("gettingLocation") : t("useMyLocation")}
                </Button>
              </div>

              {locationError && (
                <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">{locationError}</div>
              )}

              <div className="space-y-2">
                <Label>{t("selectLocationOnMap")} *</Label>
                <div className="border rounded-lg overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between p-3 bg-muted border-b">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{t("interactiveMap")}</span>
                      <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded">
                        Jharkhand, India
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={zoomIn}
                        className="h-8 w-8 p-0 hover:bg-primary hover:text-primary-foreground transition-colors bg-transparent"
                        title={t("zoomIn")}
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={zoomOut}
                        className="h-8 w-8 p-0 hover:bg-primary hover:text-primary-foreground transition-colors bg-transparent"
                        title={t("zoomOut")}
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={resetMap}
                        className="h-8 w-8 p-0 hover:bg-primary hover:text-primary-foreground transition-colors bg-transparent"
                        title={t("resetToJharkhand")}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div
                    ref={mapRef}
                    className={`w-full h-80 relative bg-gray-100 touch-pan-x touch-pan-y select-none transition-all duration-100 ${
                      isDragging ? "cursor-grabbing" : "cursor-crosshair hover:cursor-grab"
                    }`}
                    onClick={handleMapClick}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    style={{
                      minHeight: "320px",
                      touchAction: "pan-x pan-y",
                      overscrollBehavior: "contain",
                    }}
                  >
                    {renderMap()}
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {t("zoom")}: {zoom}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{t("clickToPlace")}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">{t("address")}</Label>
                <Input
                  id="address"
                  placeholder={t("addressPlaceholder")}
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  readOnly
                />
              </div>

              {formData.latitude && formData.longitude && (
                <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                  <strong>{t("coordinates")}:</strong> {Number.parseFloat(formData.latitude).toFixed(8)},{" "}
                  {Number.parseFloat(formData.longitude).toFixed(8)}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Label>{t("photosRequired")}</Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => photoInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  {t("addPhotos")}
                </Button>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                {photos.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {photos.length} {photos.length > 1 ? t("photosSelected") : t("photoSelected")}
                  </span>
                )}
              </div>

              {photosPreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photosPreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview || "/placeholder.svg"}
                        alt={`Issue photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Label>{t("videosOptional")}</Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => videoInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Video className="h-4 w-4" />
                  {t("addVideos")}
                </Button>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleVideoChange}
                  className="hidden"
                />
                {videos.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {videos.length} {videos.length > 1 ? t("videosSelected") : t("videoSelected")}
                  </span>
                )}
              </div>

              {videosPreviews.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {videosPreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <video src={preview} className="w-full h-32 object-cover rounded-lg border" controls />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeVideo(index)}
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                        {videos[index]?.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmitting} className="px-8">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {t("submittingReport")}
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    {t("submitReport")}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
