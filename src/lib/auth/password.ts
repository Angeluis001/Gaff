import { compare, hash } from "bcryptjs"

export async function hashAdminPassword(password: string) {
  return hash(password, 12)
}

export async function verifyAdminPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash)
}
