import { Suspense } from "react"
import ResetPasswordContent from "@/components/reset-password-content"

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Suspense fallback={<div className="text-center text-muted-foreground">Loading...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  )
}
