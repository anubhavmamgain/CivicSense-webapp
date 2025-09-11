"use client"
import MobileLogin from "./mobile-login"

interface LoginOptionsProps {
  onLoginSuccess: (method: string, identifier: string, role?: "user" | "admin") => void
}

export default function LoginOptions({ onLoginSuccess }: LoginOptionsProps) {
  const handleMobileLoginSuccess = (phoneNumber: string, role: "user" | "admin") => {
    onLoginSuccess("mobile", phoneNumber, role)
  }

  return <MobileLogin onLoginSuccess={handleMobileLoginSuccess} onBack={() => {}} />
}
