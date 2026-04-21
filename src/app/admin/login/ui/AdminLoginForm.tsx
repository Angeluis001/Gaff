"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function AdminLoginForm({
  callbackUrl,
  error,
}: {
  callbackUrl: string
  error: string | null
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState<string | null>(
    error ? "The email or password was not recognized." : null
  )

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
        <Card className="w-full max-w-md border-white/10 bg-white/5">
          <CardHeader className="space-y-3">
            <p className="text-xs uppercase tracking-[0.24em] text-white/45">Secure access</p>
            <CardTitle className="font-heading text-4xl text-white">Admin Login</CardTitle>
            <CardDescription className="text-white/60">
              Enter the GAFF operations console with your admin credentials.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault()
                setMessage(null)
                startTransition(async () => {
                  const result = await signIn("credentials", {
                    email,
                    password,
                    callbackUrl,
                    redirect: false,
                  })

                  if (!result?.ok || !result.url) {
                    setMessage("The email or password was not recognized.")
                    return
                  }

                  router.push(result.url)
                })
              }}
            >
              <label className="block space-y-2">
                <span className="text-sm text-white/70">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-primary/50"
                  placeholder="admin@gaffallfishingloscabos.com"
                  autoComplete="email"
                  required
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm text-white/70">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-primary/50"
                  placeholder="Password"
                  autoComplete="current-password"
                  required
                />
              </label>
              {message ? (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                  {message}
                </div>
              ) : null}
              <Button className="w-full" disabled={isPending} type="submit">
                {isPending ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
