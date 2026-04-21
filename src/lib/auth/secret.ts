const FALLBACK_NEXTAUTH_SECRET = "gaff-admin-preview-secret"

export function getAdminAuthSecret() {
  return process.env.NEXTAUTH_SECRET?.trim() || process.env.AUTH_SECRET?.trim() || FALLBACK_NEXTAUTH_SECRET
}
