"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/app/hooks/use-auth"
import { createBrowserClient } from "@/lib/supabaseClient"
import { 
  Plus, 
  Copy, 
  Check, 
  Wifi, 
  WifiOff, 
  MapPin, 
  Key,
  Clock,
  Trash2,
  Download,
  Globe,
  Shield,
  Settings as SettingsIcon,
  Calendar,
  DollarSign,
  FileText,
  LogOut,
  Monitor,
  Smartphone
} from "lucide-react"

interface BiometricDevice {
  id: string
  name: string
  deviceId: string
  location: string
  apiKey: string
  status: "connected" | "disconnected"
  lastSync: string
  registeredDate: string
}

export default function SettingsPage() {
  const { user, updateEmail, updatePassword, updateName } = useAuth()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [devices, setDevices] = useState<BiometricDevice[]>([])
  const [isLoadingDevices, setIsLoadingDevices] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAddingDevice, setIsAddingDevice] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    deviceId: "",
    location: "",
  })
  
  // Account Settings dialogs
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false)
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newName, setNewName] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [emailError, setEmailError] = useState("")
  const [nameError, setNameError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [isNameLoading, setIsNameLoading] = useState(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)

  // Payroll System Configuration
  const [payrollPeriod, setPayrollPeriod] = useState("monthly")
  const [payDate, setPayDate] = useState("15")
  const [overtimeRate, setOvertimeRate] = useState("1.25")
  const [isSavingPayrollConfig, setIsSavingPayrollConfig] = useState(false)

  // Time Zone Settings
  const [timezone, setTimezone] = useState("Asia/Manila")
  const [isSavingTimezone, setIsSavingTimezone] = useState(false)

  // Login History
  const [loginHistory, setLoginHistory] = useState<Array<{
    id: string
    session_id: string | null
    date: string
    time: string
    ipAddress: string
    device: string
    location: string
    status: "success" | "failed"
    login_at: string
    logout_at: string | null
    isCurrentSession?: boolean
  }>>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [isLoggingOutSession, setIsLoggingOutSession] = useState<string | null>(null)

  // Data Export
  const [isExporting, setIsExporting] = useState(false)
  const [exportType, setExportType] = useState<string>("")

  // Load login history from database
  const loadLoginHistory = async () => {
    if (!user?.id) {
      setIsLoadingHistory(false)
      return
    }

    setIsLoadingHistory(true)
    try {
      const supabase = createBrowserClient()
      
      // Get current session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setIsLoadingHistory(false)
        return
      }

      // Store current session ID prefix for comparison
      const currentSessionIdPrefix = session.access_token.substring(0, 20)

      // Fetch login history directly from Supabase (has authenticated session)
      const { data, error } = await supabase
        .from("login_history")
        .select("*")
        .eq("user_id", user.id)
        .order("login_at", { ascending: false })
        .limit(50)

      if (error) {
        throw new Error(error.message || "Failed to fetch login history")
      }
      
      // Transform database data to match UI format
      const transformedHistory = (data || []).map((item: any) => {
        const loginDate = new Date(item.login_at)
        const sessionIdPrefix = item.session_id?.substring(0, 20) || ""
        const isCurrentSession = sessionIdPrefix === currentSessionIdPrefix && !item.logout_at
        
        return {
          id: item.id,
          session_id: item.session_id,
          date: loginDate.toLocaleDateString(),
          time: loginDate.toLocaleTimeString(),
          ipAddress: item.ip_address || "unknown",
          device: item.device_name || item.device_type || "Unknown Device",
          location: item.location || "Unknown",
          status: item.status || "success",
          login_at: item.login_at,
          logout_at: item.logout_at,
          isCurrentSession,
        }
      })

      setLoginHistory(transformedHistory)
    } catch (error: any) {
      console.error("Error loading login history:", error)
      toast({
        title: "Error loading login history",
        description: "Failed to load login history. Please try again.",
        variant: "destructive",
      })
      // Set empty array on error
      setLoginHistory([])
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // Handle logout from specific session
  const handleLogoutSession = async (sessionId: string, historyId: string) => {
    if (!user?.id || !sessionId) return

    setIsLoggingOutSession(historyId)
    try {
      const supabase = createBrowserClient()
      
      // Get current session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error("No active session")
      }

      // Update logout_at directly using Supabase (has authenticated session)
      const { error } = await supabase
        .from("login_history")
        .update({
          logout_at: new Date().toISOString(),
        })
        .eq("session_id", sessionId)
        .eq("user_id", user.id)

      if (error) {
        throw new Error(error.message || "Failed to logout session")
      }

      // Update local state - mark as logged out
      setLoginHistory(prev => 
        prev.map(item => 
          item.id === historyId 
            ? { ...item, logout_at: new Date().toISOString() }
            : item
        )
      )

      toast({
        title: "Session logged out",
        description: "This session has been terminated successfully.",
      })
    } catch (error: any) {
      console.error("Error logging out session:", error)
      toast({
        title: "Error logging out session",
        description: error.message || "Failed to logout session. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoggingOutSession(null)
    }
  }

  // Load saved settings on mount
  useEffect(() => {
    // Load payroll config from localStorage
    const savedPayrollPeriod = localStorage.getItem("payroll_period") || "monthly"
    const savedPayDate = localStorage.getItem("payroll_pay_date") || "15"
    const savedOvertimeRate = localStorage.getItem("payroll_overtime_rate") || "1.25"
    setPayrollPeriod(savedPayrollPeriod)
    setPayDate(savedPayDate)
    setOvertimeRate(savedOvertimeRate)

    // Load timezone from localStorage
    const savedTimezone = localStorage.getItem("timezone") || "Asia/Manila"
    setTimezone(savedTimezone)

    // Load login history
    loadLoginHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle payroll config save
  const handleSavePayrollConfig = async () => {
    setIsSavingPayrollConfig(true)
    try {
      // Save to localStorage (in real app, save to database)
      localStorage.setItem("payroll_period", payrollPeriod)
      localStorage.setItem("payroll_pay_date", payDate)
      localStorage.setItem("payroll_overtime_rate", overtimeRate)
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      toast({
        title: "Payroll settings saved",
        description: "Your payroll configuration has been updated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error saving settings",
        description: error.message || "Failed to save payroll configuration.",
        variant: "destructive",
      })
    } finally {
      setIsSavingPayrollConfig(false)
    }
  }

  // Handle timezone save
  const handleSaveTimezone = async () => {
    setIsSavingTimezone(true)
    try {
      localStorage.setItem("timezone", timezone)
      await new Promise(resolve => setTimeout(resolve, 300))
      
      toast({
        title: "Timezone updated",
        description: `Timezone has been set to ${timezone}.`,
      })
    } catch (error: any) {
      toast({
        title: "Error saving timezone",
        description: error.message || "Failed to save timezone.",
        variant: "destructive",
      })
    } finally {
      setIsSavingTimezone(false)
    }
  }

  // Handle data export
  const handleExportData = async (type: "employees" | "payroll" | "dtr" | "all") => {
    setIsExporting(true)
    setExportType(type)
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // In real app, this would generate CSV/Excel file
      const filename = `payroll_export_${type}_${new Date().toISOString().split("T")[0]}.csv`
      
      toast({
        title: "Export completed",
        description: `${filename} has been generated. Download will start shortly.`,
      })
      
      // Simulate download
      const blob = new Blob(["Mock export data"], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message || "Failed to export data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
      setExportType("")
    }
  }

  // Fetch devices from database
  useEffect(() => {
    const fetchDevices = async () => {
      if (!user?.id) {
        setIsLoadingDevices(false)
        return
      }

      try {
        const supabase = createBrowserClient()
        const { data, error } = await supabase
          .from('biometric_devices')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching devices:', error)
          toast({
            title: "Error loading devices",
            description: "Failed to load your devices. Please try again.",
            variant: "destructive",
          })
          return
        }

        // Transform database data to match BiometricDevice interface
        const transformedDevices: BiometricDevice[] = (data || []).map((device: any) => ({
          id: device.id,
          name: device.name,
          deviceId: device.device_id,
          location: device.location,
          apiKey: device.api_key,
          status: device.status as "connected" | "disconnected",
          lastSync: device.last_sync || "Never",
          registeredDate: device.registered_date || new Date().toISOString().split("T")[0],
        }))

        setDevices(transformedDevices)
      } catch (error: any) {
        console.error('Error fetching devices:', error)
        toast({
          title: "Error loading devices",
          description: "An unexpected error occurred.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingDevices(false)
      }
    }

    fetchDevices()
  }, [user?.id, toast])

  const handleCopyApiKey = (apiKey: string, deviceId: string) => {
    navigator.clipboard.writeText(apiKey)
    setCopiedKey(deviceId)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const generateApiKey = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
    const segments = Array.from({ length: 8 }, () => 
      Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
    )
    return `sk_live_${segments.join("")}`
  }

  const handleAddDevice = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to add devices.",
        variant: "destructive",
      })
      return
    }

    if (!formData.name || !formData.deviceId || !formData.location) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields.",
        variant: "destructive",
      })
      return
    }

    setIsAddingDevice(true)
    try {
      const supabase = createBrowserClient()
      const apiKey = generateApiKey()
      const deviceIdUpper = formData.deviceId.toUpperCase()

      // Check if device ID already exists for this user
      const { data: existingDevice } = await supabase
        .from('biometric_devices')
        .select('id')
        .eq('user_id', user.id)
        .eq('device_id', deviceIdUpper)
        .maybeSingle()

      if (existingDevice) {
        toast({
          title: "Device ID already exists",
          description: "You already have a device with this ID. Please use a different one.",
          variant: "destructive",
        })
        setIsAddingDevice(false)
        return
      }

      // Insert new device
      const { data, error } = await supabase
        .from('biometric_devices')
        .insert({
          user_id: user.id,
          name: formData.name.trim(),
          device_id: deviceIdUpper,
          location: formData.location.trim(),
          api_key: apiKey,
          status: 'disconnected',
          last_sync: 'Never',
          registered_date: new Date().toISOString().split("T")[0],
        })
        .select()
        .single()

      if (error) {
        console.error('Error adding device:', error)
        toast({
          title: "Error adding device",
          description: error.message || "Failed to add device. Please try again.",
          variant: "destructive",
        })
        return
      }

      // Add to local state
      const newDevice: BiometricDevice = {
        id: data.id,
        name: data.name,
        deviceId: data.device_id,
        location: data.location,
        apiKey: data.api_key,
        status: data.status as "connected" | "disconnected",
        lastSync: data.last_sync || "Never",
        registeredDate: data.registered_date || new Date().toISOString().split("T")[0],
      }

      setDevices([newDevice, ...devices])
      setFormData({ name: "", deviceId: "", location: "" })
      setIsDialogOpen(false)
      
      toast({
        title: "Device added",
        description: "Your device has been successfully registered.",
      })
    } catch (error: any) {
      console.error('Error adding device:', error)
      toast({
        title: "Error adding device",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAddingDevice(false)
    }
  }

  const handleDeleteDevice = async (deviceId: string) => {
    // Open confirmation dialog instead of using confirm()
    setDeviceToDelete(deviceId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteDevice = async () => {
    if (!deviceToDelete) return

    try {
      const supabase = createBrowserClient()
      const { error } = await supabase
        .from('biometric_devices')
        .delete()
        .eq('id', deviceToDelete)
        .eq('user_id', user?.id) // Extra security: ensure user owns the device

      if (error) {
        console.error('Error deleting device:', error)
        toast({
          title: "Error deleting device",
          description: "Failed to delete device. Please try again.",
          variant: "destructive",
        })
        return
      }

      // Remove from local state
      setDevices(devices.filter(d => d.id !== deviceToDelete))
      
      toast({
        title: "Device removed",
        description: "The device has been successfully removed.",
      })

      // Close dialog and reset
      setIsDeleteDialogOpen(false)
      setDeviceToDelete(null)
    } catch (error: any) {
      console.error('Error deleting device:', error)
      toast({
        title: "Error deleting device",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Helper function to format password last changed date
  const getPasswordLastChanged = (): string => {
    if (!user?.passwordChangedAt) {
      return "Never"
    }
    
    const changedDate = new Date(user.passwordChangedAt)
    const now = new Date()
    const diffInMs = now.getTime() - changedDate.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) {
      return "Today"
    } else if (diffInDays === 1) {
      return "1 day ago"
    } else if (diffInDays < 30) {
      return `${diffInDays} days ago`
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30)
      return `${months} ${months === 1 ? "month" : "months"} ago`
    } else {
      const years = Math.floor(diffInDays / 365)
      return `${years} ${years === 1 ? "year" : "years"} ago`
    }
  }

  // Email validation
  const validateEmail = (email: string): string | null => {
    if (!email) {
      return "Email is required"
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address"
    }
    if (email === user?.email) {
      return "New email must be different from current email"
    }
    return null
  }

  // Password validation
  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters"
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter"
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter"
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number"
    }
    return null
  }

  // Name validation
  const validateName = (name: string): string | null => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      return "Name is required"
    }
    if (trimmedName.length < 2) {
      return "Name must be at least 2 characters"
    }
    if (trimmedName.length > 100) {
      return "Name must be less than 100 characters"
    }
    if (trimmedName === user?.name) {
      return "New name must be different from current name"
    }
    return null
  }

  // Handle name change
  const handleNameChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setNameError("")
    
    const validationError = validateName(newName)
    if (validationError) {
      setNameError(validationError)
      return
    }

    setIsNameLoading(true)
    try {
      await updateName(newName)
      toast({
        title: "Name updated",
        description: "Your name has been successfully updated.",
      })
      setIsNameDialogOpen(false)
      setNewName("")
    } catch (error: any) {
      setNameError(error.message || "Failed to update name. Please try again.")
    } finally {
      setIsNameLoading(false)
    }
  }

  // Handle email change
  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError("")
    
    const validationError = validateEmail(newEmail)
    if (validationError) {
      setEmailError(validationError)
      return
    }

    setIsEmailLoading(true)
    try {
      await updateEmail(newEmail)
      toast({
        title: "Email change requested",
        description: "A confirmation email has been sent to your new email address. Please check your inbox and confirm the change to complete the process.",
      })
      setIsEmailDialogOpen(false)
      setNewEmail("")
    } catch (error: any) {
      setEmailError(error.message || "Failed to update email. Please try again.")
    } finally {
      setIsEmailLoading(false)
    }
  }

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")
    
    // Validate current password
    if (!currentPassword) {
      setPasswordError("Current password is required")
      return
    }
    
    // Validate new password
    const passwordValidationError = validatePassword(newPassword)
    if (passwordValidationError) {
      setPasswordError(passwordValidationError)
      return
    }

    // Check password match
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }

    // Check if new password is different from current
    if (newPassword === currentPassword) {
      setPasswordError("New password must be different from current password")
      return
    }

    setIsPasswordLoading(true)
    try {
      await updatePassword(newPassword, currentPassword)
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      })
      setIsPasswordDialogOpen(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      setPasswordError(error.message || "Failed to update password. Please try again.")
    } finally {
      setIsPasswordLoading(false)
    }
  }

  // Reset form when dialog closes
  useEffect(() => {
    if (!isEmailDialogOpen) {
      setNewEmail("")
      setEmailError("")
    }
  }, [isEmailDialogOpen])

  useEffect(() => {
    if (!isNameDialogOpen) {
      setNewName("")
      setNameError("")
    }
  }, [isNameDialogOpen])

  useEffect(() => {
    if (!isPasswordDialogOpen) {
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setPasswordError("")
    }
  }, [isPasswordDialogOpen])

  // Handle email confirmation callback
  useEffect(() => {
    const emailConfirmed = searchParams.get('emailConfirmed')
    const code = searchParams.get('code')
    const type = searchParams.get('type')
    const hash = typeof window !== 'undefined' ? window.location.hash : ''

    // Check for code in hash fragments (Supabase sometimes uses hash)
    const hashParams = new URLSearchParams(hash.substring(1))
    const hashCode = hashParams.get('code') || hashParams.get('access_token')
    const hashType = hashParams.get('type')

    const actualCode = code || hashCode
    const actualType = type || hashType || 'email_change'

    if (emailConfirmed === 'true' && actualCode) {
      // Process the email confirmation code
      const processEmailConfirmation = async () => {
        try {
          const supabase = createBrowserClient()
          
          // Wait for Supabase SSR to process the redirect and establish session
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // First, always check if session is already established
          // Supabase might have already processed the email change automatically
          let currentSession = await supabase.auth.getSession()
          
          // Try multiple times to get session (Supabase needs time to process)
          let attempts = 0
          while (!currentSession.data.session && attempts < 3) {
            await new Promise(resolve => setTimeout(resolve, 300))
            currentSession = await supabase.auth.getSession()
            attempts++
          }
          
          if (currentSession.data.session?.user) {
            // Session exists - email change is already processed!
            const newEmail = currentSession.data.session.user.email
            setSuccessMessage(`Your email address has been successfully updated to ${newEmail || 'your new email'}.`)
            setIsSuccessDialogOpen(true)
            
            // Clean up URL params and hash
            const url = new URL(window.location.href)
            url.searchParams.delete('emailConfirmed')
            url.searchParams.delete('code')
            url.searchParams.delete('type')
            url.hash = ''
            window.history.replaceState({}, '', url.toString())
            return
          }

          // If no session yet, try to exchange code for session
          // Method 1: Try exchangeCodeForSession (PKCE flow - most common)
          try {
            const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(actualCode)
            
            if (!exchangeError && exchangeData.session) {
              // Success - email change confirmed
              const newEmail = exchangeData.session.user.email || exchangeData.user?.email
              setSuccessMessage(`Your email address has been successfully updated to ${newEmail || 'your new email'}.`)
              setIsSuccessDialogOpen(true)
              
              // Clean up URL params and hash
              const url = new URL(window.location.href)
              url.searchParams.delete('emailConfirmed')
              url.searchParams.delete('code')
              url.searchParams.delete('type')
              url.hash = ''
              window.history.replaceState({}, '', url.toString())
              return
            }
          } catch (exchangeErr) {
            // Exchange failed, try verifyOtp next
          }

          // Method 2: If exchangeCodeForSession didn't work, the code might already be processed
          // Check session one more time
          const finalSessionCheck = await supabase.auth.getSession()
          if (finalSessionCheck.data.session?.user) {
            const newEmail = finalSessionCheck.data.session.user.email
            setSuccessMessage(`Your email address has been successfully updated to ${newEmail || 'your new email'}.`)
            setIsSuccessDialogOpen(true)
            
            // Clean up URL params and hash
            const url = new URL(window.location.href)
            url.searchParams.delete('emailConfirmed')
            url.searchParams.delete('code')
            url.searchParams.delete('type')
            url.hash = ''
            window.history.replaceState({}, '', url.toString())
            return
          }

          // If we still don't have a session, show error
          toast({
            title: "Email confirmation failed",
            description: "Unable to confirm email change. The link may have expired or already been used. Please try changing your email again.",
            variant: "destructive",
          })

          // Clean up URL params and hash
          const url = new URL(window.location.href)
          url.searchParams.delete('emailConfirmed')
          url.searchParams.delete('code')
          url.searchParams.delete('type')
          url.hash = ''
          window.history.replaceState({}, '', url.toString())
        } catch (error: any) {
          // If error occurs but session might exist, check one more time
          try {
            const supabase = createBrowserClient()
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
              // Session exists - email change succeeded!
              setSuccessMessage(`Your email address has been successfully updated to ${session.user.email || 'your new email'}.`)
              setIsSuccessDialogOpen(true)
            } else {
              toast({
                title: "Email confirmation error",
                description: error.message || "An error occurred while confirming your email.",
                variant: "destructive",
              })
            }
          } catch (checkError) {
            toast({
              title: "Email confirmation error",
              description: error.message || "An error occurred while confirming your email.",
              variant: "destructive",
            })
          }
        }
      }

      processEmailConfirmation()
    } else if (emailConfirmed === 'true') {
      // Email was already confirmed (auto-confirmed by Supabase)
      // Check current session to get updated email
      const checkUpdatedEmail = async () => {
        const supabase = createBrowserClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user?.email) {
          setSuccessMessage(`Your email address has been successfully updated to ${session.user.email}.`)
        } else {
          setSuccessMessage("Your email address has been successfully updated.")
        }
        setIsSuccessDialogOpen(true)
      }
      
      checkUpdatedEmail()

      // Clean up URL params
      const url = new URL(window.location.href)
      url.searchParams.delete('emailConfirmed')
      url.hash = ''
      window.history.replaceState({}, '', url.toString())
    }

    // Handle errors from callback
    const error = searchParams.get('error')
    if (error && (actualType === 'email_change' || type === 'email_change')) {
      toast({
        title: "Email confirmation failed",
        description: searchParams.get('error_description') || error || "Unable to confirm email change.",
        variant: "destructive",
      })

      // Clean up URL params
      const url = new URL(window.location.href)
      url.searchParams.delete('error')
      url.searchParams.delete('error_code')
      url.searchParams.delete('error_description')
      url.searchParams.delete('type')
      url.hash = ''
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams, toast])

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Manage your account and system preferences.</p>
      </div>

      <div className="space-y-6">
        {/* Account Settings */}
        <Card className="bg-card border border-border rounded-xl p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4">Account Settings</h2>
          <div className="space-y-4">
            {/* Name Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-background rounded-lg">
              <div>
                <p className="font-medium text-foreground">Full Name</p>
                <p className="text-sm text-muted-foreground">{user?.name || "Not set"}</p>
              </div>
              <Dialog open={isNameDialogOpen} onOpenChange={setIsNameDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="text-primary w-full sm:w-auto">
                    Change
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Change Full Name</DialogTitle>
                    <DialogDescription>
                      Enter your new full name.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleNameChange}>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-name">Current Name</Label>
                        <Input
                          id="current-name"
                          type="text"
                          value={user?.name || "Not set"}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-name">New Name</Label>
                        <Input
                          id="new-name"
                          type="text"
                          placeholder="Enter your full name"
                          value={newName}
                          onChange={(e) => {
                            setNewName(e.target.value)
                            setNameError("")
                          }}
                          required
                          disabled={isNameLoading}
                          minLength={2}
                          maxLength={100}
                        />
                        {nameError && (
                          <p className="text-sm text-destructive">{nameError}</p>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsNameDialogOpen(false)}
                        disabled={isNameLoading}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isNameLoading || !newName.trim()}>
                        {isNameLoading ? "Updating..." : "Update Name"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Email Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-background rounded-lg">
              <div>
                <p className="font-medium text-foreground">Account Email</p>
                <p className="text-sm text-muted-foreground">{user?.email || "Loading..."}</p>
              </div>
              <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="text-primary w-full sm:w-auto">
                    Change
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Change Email Address</DialogTitle>
                    <DialogDescription>
                      Enter your new email address. You'll receive a confirmation email to verify the change.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleEmailChange}>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-email">Current Email</Label>
                        <Input
                          id="current-email"
                          type="email"
                          value={user?.email || ""}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-email">New Email</Label>
                        <Input
                          id="new-email"
                          type="email"
                          placeholder="new@email.com"
                          value={newEmail}
                          onChange={(e) => {
                            setNewEmail(e.target.value)
                            setEmailError("")
                          }}
                          required
                          disabled={isEmailLoading}
                        />
                      </div>
                      {emailError && (
                        <div className="text-sm text-destructive">{emailError}</div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEmailDialogOpen(false)}
                        disabled={isEmailLoading}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isEmailLoading || !newEmail}>
                        {isEmailLoading ? "Updating..." : "Update Email"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Password Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-background rounded-lg">
              <div>
                <p className="font-medium text-foreground">Password</p>
                <p className="text-sm text-muted-foreground">Last changed {getPasswordLastChanged()}</p>
              </div>
              <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="text-primary w-full sm:w-auto">
                    Update
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Update Password</DialogTitle>
                    <DialogDescription>
                      Enter your new password. Make sure it's strong and secure.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handlePasswordChange}>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input
                          id="current-password"
                          type="password"
                          placeholder="Enter your current password"
                          value={currentPassword}
                          onChange={(e) => {
                            setCurrentPassword(e.target.value)
                            setPasswordError("")
                          }}
                          required
                          disabled={isPasswordLoading}
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter your current password to confirm this change.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value)
                            setPasswordError("")
                          }}
                          required
                          disabled={isPasswordLoading}
                        />
                        <p className="text-xs text-muted-foreground">
                          Must be at least 8 characters with uppercase, lowercase, and a number.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value)
                            setPasswordError("")
                          }}
                          required
                          disabled={isPasswordLoading}
                        />
                      </div>
                      {passwordError && (
                        <div className="text-sm text-destructive">{passwordError}</div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsPasswordDialogOpen(false)}
                        disabled={isPasswordLoading}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isPasswordLoading || !currentPassword || !newPassword || !confirmPassword}>
                        {isPasswordLoading ? "Updating..." : "Update Password"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </Card>

        {/* Success Dialog for Email Change */}
        <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                Email Changed Successfully
              </DialogTitle>
              <DialogDescription>
                {successMessage || "Your email address has been successfully updated."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setIsSuccessDialogOpen(false)} className="w-full sm:w-auto">
                Got it
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Biometric Devices Section */}
        <Card className="bg-card border border-border rounded-xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-foreground mb-1">Biometric Devices</h2>
              <p className="text-sm text-muted-foreground">Manage and register biometric devices for attendance tracking.</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 w-full sm:w-auto">
                  <Plus className="w-4 h-4" />
                  Add Device
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Register New Biometric Device</DialogTitle>
                  <DialogDescription>
                    Add a new biometric device to your system. A unique API key will be generated automatically.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="device-name">Device Name</Label>
                    <Input
                      id="device-name"
                      placeholder="e.g., Main Office Entrance"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="device-id">Device ID</Label>
                    <Input
                      id="device-id"
                      placeholder="e.g., DEVICE-001"
                      value={formData.deviceId}
                      onChange={(e) => setFormData({ ...formData, deviceId: e.target.value.toUpperCase() })}
                    />
                    <p className="text-xs text-muted-foreground">Unique identifier from your biometric device</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="device-location">Location</Label>
                    <Input
                      id="device-location"
                      placeholder="e.g., Ground Floor, Main Building"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isAddingDevice}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddDevice} disabled={!formData.name || !formData.deviceId || !formData.location || isAddingDevice}>
                    {isAddingDevice ? "Adding..." : "Register Device"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {isLoadingDevices ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading devices...</p>
            </div>
          ) : devices.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-muted rounded-full">
                  <WifiOff className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">No devices registered</p>
                  <p className="text-sm text-muted-foreground mb-4">Get started by adding your first biometric device.</p>
                  <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Your First Device
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {devices.map((device) => (
                <Card key={device.id} className="bg-background border border-border rounded-lg p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-start gap-3 mb-2">
                            <h3 className="font-semibold text-foreground text-base sm:text-lg">{device.name}</h3>
                            <Badge 
                              variant={device.status === "connected" ? "default" : "secondary"}
                              className="gap-1"
                            >
                              {device.status === "connected" ? (
                                <>
                                  <Wifi className="w-3 h-3" />
                                  Connected
                                </>
                              ) : (
                                <>
                                  <WifiOff className="w-3 h-3" />
                                  Disconnected
                                </>
                              )}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{device.deviceId}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive shrink-0"
                          onClick={() => handleDeleteDevice(device.id)}
                          title="Remove device"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Location</p>
                            <p className="text-sm font-medium text-foreground">{device.location}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Clock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Last Sync</p>
                            <p className="text-sm font-medium text-foreground">{device.lastSync}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Key className="w-4 h-4 text-muted-foreground" />
                          <Label className="text-xs text-muted-foreground">API Key</Label>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1 px-3 py-2 bg-muted/50 rounded-md border border-border">
                            <code className="text-xs text-foreground font-mono break-all">
                              {device.apiKey}
                            </code>
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleCopyApiKey(device.apiKey, device.id)}
                            className="shrink-0"
                            title="Copy API key"
                          >
                            {copiedKey === device.id ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Use this API key when configuring your biometric device webhook URL.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* Delete Device Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Delete Device</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove this device? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false)
                  setDeviceToDelete(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteDevice}
              >
                Delete Device
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preferences */}
        <Card className="bg-card border border-border rounded-xl p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4">Preferences</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 p-4 bg-background rounded-lg cursor-pointer hover:bg-muted/30 transition-colors">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <div>
                <p className="font-medium text-foreground">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive updates about payroll processing</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-4 bg-background rounded-lg cursor-pointer hover:bg-muted/30 transition-colors">
              <input type="checkbox" className="w-4 h-4" />
              <div>
                <p className="font-medium text-foreground">Weekly Reports</p>
                <p className="text-sm text-muted-foreground">Get summary reports every Monday</p>
              </div>
            </label>
          </div>
        </Card>

        {/* Payroll System Configuration */}
        <Card className="bg-card border border-border rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <SettingsIcon className="w-5 h-5 text-primary" />
            <h2 className="text-base sm:text-lg font-semibold text-foreground">Payroll System Configuration</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">Configure payroll computation rules and settings.</p>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="payroll-period">Payroll Period</Label>
              <Select value={payrollPeriod} onValueChange={setPayrollPeriod}>
                <SelectTrigger id="payroll-period" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi-weekly">Bi-weekly (Every 2 weeks)</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="semi-monthly">Semi-monthly (15th & End of month)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">How often payroll is processed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pay-date">Default Pay Date</Label>
              <Select value={payDate} onValueChange={setPayDate}>
                <SelectTrigger id="pay-date" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <SelectItem key={day} value={day.toString()}>
                      {day === 1 ? `${day}st` : day === 2 ? `${day}nd` : day === 3 ? `${day}rd` : `${day}th`} of month
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Default day of month when employees are paid</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="overtime-rate">Overtime Rate Multiplier</Label>
              <Select value={overtimeRate} onValueChange={setOvertimeRate}>
                <SelectTrigger id="overtime-rate" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1.25">1.25x (25% premium - Standard)</SelectItem>
                  <SelectItem value="1.5">1.5x (50% premium)</SelectItem>
                  <SelectItem value="2.0">2.0x (Double time)</SelectItem>
                  <SelectItem value="1.0">1.0x (Regular rate)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Multiplier for overtime hours calculation</p>
            </div>

            <Button 
              onClick={handleSavePayrollConfig} 
              disabled={isSavingPayrollConfig}
              className="w-full sm:w-auto"
            >
              {isSavingPayrollConfig ? "Saving..." : "Save Payroll Configuration"}
            </Button>
          </div>
        </Card>

        {/* Time Zone Settings */}
        <Card className="bg-card border border-border rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="text-base sm:text-lg font-semibold text-foreground">Time Zone Settings</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">Set your organization's time zone for accurate attendance tracking.</p>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Time Zone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="timezone" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Manila">Asia/Manila (Philippines - UTC+8)</SelectItem>
                  <SelectItem value="Asia/Singapore">Asia/Singapore (UTC+8)</SelectItem>
                  <SelectItem value="Asia/Hong_Kong">Asia/Hong Kong (UTC+8)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Asia/Tokyo (Japan - UTC+9)</SelectItem>
                  <SelectItem value="Asia/Seoul">Asia/Seoul (South Korea - UTC+9)</SelectItem>
                  <SelectItem value="America/New_York">America/New York (UTC-5)</SelectItem>
                  <SelectItem value="America/Los_Angeles">America/Los Angeles (UTC-8)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (UTC+0)</SelectItem>
                  <SelectItem value="Europe/Paris">Europe/Paris (UTC+1)</SelectItem>
                  <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">This affects all time records and attendance tracking</p>
            </div>

            <div className="p-4 bg-background rounded-lg border border-border">
              <p className="text-sm font-medium text-foreground mb-1">Current Time</p>
              <p className="text-lg font-semibold text-primary">
                {new Date().toLocaleString("en-US", { 
                  timeZone: timezone,
                  dateStyle: "full",
                  timeStyle: "long"
                })}
              </p>
            </div>

            <Button 
              onClick={handleSaveTimezone} 
              disabled={isSavingTimezone}
              className="w-full sm:w-auto"
            >
              {isSavingTimezone ? "Saving..." : "Save Time Zone"}
            </Button>
          </div>
        </Card>

        {/* Security - Login History */}
        <Card className="bg-card border border-border rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-base sm:text-lg font-semibold text-foreground">Security - Login History</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">View recent login activity and account access history.</p>
          
          {isLoadingHistory ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading login history...</p>
            </div>
          ) : loginHistory.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <p className="text-muted-foreground">No login history available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {loginHistory.map((login) => {
                const isCurrentSession = login.isCurrentSession || false
                const isLoggingOut = isLoggingOutSession === login.id
                
                return (
                  <div 
                    key={login.id} 
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-background rounded-lg border border-border"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        {login.device.toLowerCase().includes("iphone") || 
                         login.device.toLowerCase().includes("android") || 
                         login.device.toLowerCase().includes("mobile") ? (
                          <Smartphone className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Monitor className="w-4 h-4 text-muted-foreground" />
                        )}
                        <p className="font-medium text-foreground">{login.device}</p>
                        <Badge variant={login.status === "success" ? "default" : "destructive"} className="text-xs">
                          {login.status === "success" ? "Success" : "Failed"}
                        </Badge>
                        {isCurrentSession && (
                          <Badge variant="outline" className="text-xs">
                            Current Session
                          </Badge>
                        )}
                        {login.logout_at && (
                          <Badge variant="secondary" className="text-xs">
                            Logged Out
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <span>{login.date} at {login.time}</span>
                        <span>IP: {login.ipAddress}</span>
                        <span>{login.location}</span>
                      </div>
                    </div>
                    {login.session_id && !login.logout_at && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        disabled={isLoggingOut || isCurrentSession}
                        onClick={() => login.session_id && handleLogoutSession(login.session_id, login.id)}
                      >
                        {isLoggingOut ? (
                          <>
                            <Spinner className="w-4 h-4 mr-2" />
                            Logging out...
                          </>
                        ) : (
                          <>
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Data Export & Backup */}
        <Card className="bg-card border border-border rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Download className="w-5 h-5 text-primary" />
            <h2 className="text-base sm:text-lg font-semibold text-foreground">Data Export & Backup</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">Export employee data, payroll records, and time records for backup or reporting.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => handleExportData("employees")}
              disabled={isExporting && exportType === "employees"}
              className="flex flex-col items-start gap-3 p-4 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">Export Employees</p>
                  <p className="text-xs text-muted-foreground">All employee records</p>
                </div>
              </div>
              {isExporting && exportType === "employees" && (
                <p className="text-xs text-primary">Exporting...</p>
              )}
            </button>

            <button
              onClick={() => handleExportData("payroll")}
              disabled={isExporting && exportType === "payroll"}
              className="flex flex-col items-start gap-3 p-4 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">Export Payroll</p>
                  <p className="text-xs text-muted-foreground">Payroll computation records</p>
                </div>
              </div>
              {isExporting && exportType === "payroll" && (
                <p className="text-xs text-primary">Exporting...</p>
              )}
            </button>

            <button
              onClick={() => handleExportData("dtr")}
              disabled={isExporting && exportType === "dtr"}
              className="flex flex-col items-start gap-3 p-4 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">Export DTR</p>
                  <p className="text-xs text-muted-foreground">Daily time records</p>
                </div>
              </div>
              {isExporting && exportType === "dtr" && (
                <p className="text-xs text-primary">Exporting...</p>
              )}
            </button>

            <button
              onClick={() => handleExportData("all")}
              disabled={isExporting && exportType === "all"}
              className="flex flex-col items-start gap-3 p-4 bg-background rounded-lg border-2 border-primary/50 hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Download className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">Export All Data</p>
                  <p className="text-xs text-muted-foreground">Complete system backup</p>
                </div>
              </div>
              {isExporting && exportType === "all" && (
                <p className="text-xs text-primary">Exporting all data...</p>
              )}
            </button>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Note:</strong> Exports are generated in CSV format and include all records up to the current date. 
              Large exports may take several minutes to process.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
