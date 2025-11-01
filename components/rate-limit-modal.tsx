"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle } from "lucide-react"

interface RateLimitModalProps {
  isOpen: boolean
  remainingSeconds: number
  type: "login" | "signup"
  totalCooldownSeconds?: number
}

export function RateLimitModal({
  isOpen,
  remainingSeconds,
  type,
  totalCooldownSeconds = 60,
}: RateLimitModalProps) {
  const actionType = type === "login" ? "login" : "signup"

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle className="text-xl">
              Too Many {actionType === "login" ? "Login" : "Signup"} Attempts
            </DialogTitle>
          </div>
          <DialogDescription className="pt-2 text-base">
            Too many {actionType} attempts. Please wait{" "}
            <span className="font-semibold text-foreground">
              {remainingSeconds} seconds
            </span>{" "}
            before trying again.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-destructive transition-all duration-1000 ease-linear"
              style={{
                width: `${((totalCooldownSeconds - remainingSeconds) / totalCooldownSeconds) * 100}%`,
              }}
            />
          </div>
          <div className="mt-3 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2">
              <span className="text-sm text-muted-foreground">
                Time remaining:
              </span>
              <span className="text-lg font-mono font-semibold tabular-nums text-foreground">
                {remainingSeconds}s
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

