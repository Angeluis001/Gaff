const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
})

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
})

export function formatCurrency(value: number | string | null | undefined) {
  const numericValue = Number(value ?? 0)
  return currencyFormatter.format(Number.isFinite(numericValue) ? numericValue : 0)
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return "—"
  }

  return dateFormatter.format(typeof value === "string" ? new Date(value) : value)
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) {
    return "—"
  }

  return dateTimeFormatter.format(typeof value === "string" ? new Date(value) : value)
}

export function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`
}

export function formatCount(value: number | null | undefined) {
  return new Intl.NumberFormat("en-US").format(Number(value ?? 0))
}

export function formatStatusLabel(value: string | null | undefined) {
  if (!value) {
    return "Unknown"
  }

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}
