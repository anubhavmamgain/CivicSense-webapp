"use client"

import { CheckCircle, X } from "lucide-react"
import { useEffect, useState } from "react"

interface NotificationToastProps {
  message: string
  type?: "success" | "error" | "info"
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export default function NotificationToast({
  message,
  type = "success",
  isVisible,
  onClose,
  duration = 5000,
}: NotificationToastProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  const bgColor =
    type === "success"
      ? "bg-green-50 border-green-200"
      : type === "error"
        ? "bg-red-50 border-red-200"
        : "bg-blue-50 border-blue-200"

  const textColor = type === "success" ? "text-green-800" : type === "error" ? "text-red-800" : "text-blue-800"

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${isAnimating ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`}
    >
      <div className={`flex items-center gap-3 p-4 rounded-lg border shadow-lg ${bgColor} ${textColor} max-w-sm`}>
        <CheckCircle className="h-5 w-5 flex-shrink-0" />
        <p className="text-sm font-medium">{message}</p>
        <button onClick={onClose} className="ml-auto flex-shrink-0 hover:opacity-70">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
