import { Suspense } from "react"
import { ResetPasswordForm } from "@/components/reset-password-form"

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 py-8 sm:py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2">Set New Password</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Enter your new password below.
          </p>
        </div>
        <Suspense fallback={
          <div className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  )
}

