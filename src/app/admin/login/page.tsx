import { AdminLoginForm } from "./ui/AdminLoginForm"
import { ensureBootstrapAdminUser } from "@/lib/auth/bootstrap"

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  await ensureBootstrapAdminUser()

  const callbackUrl = Array.isArray(searchParams?.callbackUrl)
    ? searchParams?.callbackUrl[0]
    : searchParams?.callbackUrl
  const error = Array.isArray(searchParams?.error) ? searchParams?.error[0] : searchParams?.error

  return <AdminLoginForm callbackUrl={callbackUrl ?? "/admin"} error={error ?? null} />
}
