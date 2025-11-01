import { LoginForm } from "@/components/login-form"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>
}) {
  const params = await searchParams
  const showSuccess = params?.reset === "success"

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 py-8 sm:py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2">Payroll Manager</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Sign in to your account</p>
        </div>
        {showSuccess && (
          <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 text-sm p-3 rounded">
            Password reset successful! You can now login with your new password.
          </div>
        )}
        <LoginForm />
      </div>
    </main>
  )
}
