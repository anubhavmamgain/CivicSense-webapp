"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Smartphone, Shield, User, UserCheck } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface MobileLoginProps {
  onLoginSuccess: (phoneNumber: string, role: "user" | "admin") => void
  onBack: () => void
}

export default function MobileLogin({ onLoginSuccess, onBack }: MobileLoginProps) {
  const { t } = useLanguage()

  const [step, setStep] = useState<"role" | "phone">("role")
  const [selectedRole, setSelectedRole] = useState<"user" | "admin">("user")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const ADMIN_PHONE = "90844 63472"

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    if (cleaned.length <= 10) {
      const match = cleaned.match(/^(\d{5})(\d{5})$/)
      if (match) {
        return `${match[1]} ${match[2]}`
      }
    }
    return cleaned
  }

  const validatePhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "")
    return cleaned.length === 10 && /^[6-9]\d{9}$/.test(cleaned)
  }

  const handleLogin = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      setError(t("mobile.invalidPhoneNumber"))
      return
    }

    setIsLoading(true)
    setError("")

    const isAdminPhone = phoneNumber === ADMIN_PHONE
    const finalRole = isAdminPhone ? "admin" : selectedRole

    try {
      // Simulate login process
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log(`[v0] Direct login for phone: ${phoneNumber} as ${finalRole}`)

      const userSession = {
        phoneNumber: phoneNumber,
        role: finalRole,
        loginTime: new Date().toISOString(),
        isAuthenticated: true,
      }
      localStorage.setItem("civicsense_user_session", JSON.stringify(userSession))

      onLoginSuccess(phoneNumber, finalRole)
      setIsLoading(false)
    } catch (error: any) {
      console.error("[v0] Login error:", error)
      setError("Failed to login. Please try again.")
      setIsLoading(false)
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhoneNumber(formatted)
    setError("")
  }

  if (step === "role") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto mb-4">
            <UserCheck className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">{t("mobile.selectLoginType")}</CardTitle>
          <CardDescription>{t("mobile.selectLoginDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={selectedRole === "user" ? "default" : "outline"}
              onClick={() => setSelectedRole("user")}
              className="h-20 flex-col"
            >
              <User className="h-6 w-6 mb-2" />
              <span>{t("mobile.user")}</span>
            </Button>
            <Button
              variant={selectedRole === "admin" ? "default" : "outline"}
              onClick={() => setSelectedRole("admin")}
              className="h-20 flex-col"
            >
              <Shield className="h-6 w-6 mb-2" />
              <span>{t("mobile.admin")}</span>
            </Button>
          </div>

          <div className="space-y-3">
            <Button onClick={() => setStep("phone")} className="w-full">
              {t("mobile.continueAs")} {selectedRole === "user" ? t("mobile.user") : t("mobile.admin")}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto mb-4">
          <Smartphone className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl">{t("mobile.mobileLogin")}</CardTitle>
        <CardDescription>{t("mobile.mobileLoginDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone">{t("mobile.mobileNumber")}</Label>
          <div className="flex">
            <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted text-muted-foreground">
              +91
            </div>
            <Input
              id="phone"
              type="tel"
              placeholder="98765 43210"
              value={phoneNumber}
              onChange={handlePhoneChange}
              maxLength={11}
              className="rounded-l-none"
            />
          </div>
        </div>

        {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

        <div className="space-y-3">
          <Button onClick={handleLogin} className="w-full" disabled={isLoading || !validatePhoneNumber(phoneNumber)}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
