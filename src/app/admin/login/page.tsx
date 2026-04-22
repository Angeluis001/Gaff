import { AdminLoginForm } from "./ui/AdminLoginForm"
import { ensureBootstrapAdminUser } from "@/lib/auth/bootstrap"

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  await ensureBootstrapAdminUser()

  const resolved = await searchParams
  const callbackUrl = Array.isArray(resolved?.callbackUrl)
    ? resolved?.callbackUrl[0]
    : resolved?.callbackUrl
  const error = Array.isArray(resolved?.error) ? resolved?.error[0] : resolved?.error

  return <AdminLoginForm callbackUrl={callbackUrl ?? "/admin"} error={error ?? null} />
}
