export function extractCloudinaryPublicId(value: string) {
  const trimmed = value.trim()

  if (!trimmed) return ""
  if (!trimmed.includes("res.cloudinary.com")) return trimmed

  const uploadMarker = "/upload/"
  const uploadIndex = trimmed.indexOf(uploadMarker)
  if (uploadIndex === -1) return trimmed

  const afterUpload = trimmed.slice(uploadIndex + uploadMarker.length)
  const segments = afterUpload.split("/").filter(Boolean)

  while (segments.length > 0) {
    const first = segments[0]
    if (/^v\d+$/.test(first)) {
      segments.shift()
      break
    }
    if (first.includes(",") || first.includes("_")) {
      segments.shift()
      continue
    }
    break
  }

  return segments.join("/").replace(/\.[a-zA-Z0-9]+$/, "")
}

export function isAbsoluteUrl(value: string) {
  return /^https?:\/\//i.test(value)
}

export function normalizeCloudinaryImageValue(value: string, cloudName?: string) {
  const trimmed = value.trim()
  if (!trimmed) return ""

  if (isAbsoluteUrl(trimmed)) {
    return trimmed
  }

  const versionedMatch = trimmed.match(/v\d+\/.+$/)
  if (versionedMatch && cloudName) {
    return `https://res.cloudinary.com/${cloudName}/image/upload/${versionedMatch[0]}`
  }

  return trimmed
}

export function buildCloudinaryImageUrl(publicId: string, cloudName?: string) {
  const normalizedId = extractCloudinaryPublicId(publicId)
  if (!normalizedId || !cloudName) return null

  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${normalizedId}`
}

export function normalizeCloudinaryMediaValue(
  value: string,
  resourceType: "image" | "video",
  cloudName?: string
) {
  const trimmed = value.trim()
  if (!trimmed) return ""

  if (isAbsoluteUrl(trimmed)) {
    return trimmed
  }

  const versionedMatch = trimmed.match(/v\d+\/.+$/)
  if (versionedMatch && cloudName) {
    return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${versionedMatch[0]}`
  }

  return trimmed
}

export function buildCloudinaryAssetUrl(
  publicId: string,
  resourceType: "image" | "video",
  cloudName?: string,
  transformations?: string
) {
  const normalizedId = extractCloudinaryPublicId(publicId)
  if (!normalizedId || !cloudName) return null

  const transformSegment = transformations ? `${transformations}/` : ""
  return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${transformSegment}${normalizedId}`
}
