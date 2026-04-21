export type SearchParams = Record<string, string | string[] | undefined> | undefined

export function getSearchParamValue(searchParams: SearchParams, key: string) {
  const value = searchParams?.[key]
  return Array.isArray(value) ? value[0] : value
}

export function getSearchParamNumber(searchParams: SearchParams, key: string, fallback = 1) {
  const parsed = Number(getSearchParamValue(searchParams, key))
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}
