"use client"

import Image from "next/image"
import { Check, Users } from "lucide-react"
import { CldImage } from "next-cloudinary"

import {
  extractCloudinaryPublicId,
  isAbsoluteUrl,
  normalizeCloudinaryImageValue,
} from "@/lib/cloudinary"
import { calculateDepositAmount, getBoatPrice } from "@/lib/booking/pricing"
import { cn } from "@/lib/utils"
import type { TripType } from "@/types/boat"
import type { BookingBoatOption } from "@/types/booking"

type BoatSelectorProps = {
  boats: BookingBoatOption[]
  selectedBoatId: string
  tripType: TripType
  onSelect: (boatId: string) => void
  capacityLabel: (count: number) => string
  emptyMessage: string
  depositLabel?: string
}

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

function BoatImage({ boat }: { boat: BookingBoatOption }) {
  const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const resolvedImage = boat.image
    ? normalizeCloudinaryImageValue(boat.image, cloudinaryCloudName)
    : null
  const normalizedImage = resolvedImage ? extractCloudinaryPublicId(resolvedImage) : null
  const shouldUseCloudinary =
    Boolean(cloudinaryCloudName) && Boolean(normalizedImage) && !isAbsoluteUrl(resolvedImage ?? "")

  if (!resolvedImage) {
    return (
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(98,182,203,0.26),transparent_35%),linear-gradient(180deg,#163753_0%,#07111e_100%)]" />
    )
  }

  if (shouldUseCloudinary) {
    return (
      <CldImage
        alt={`${boat.name} fishing charter`}
        src={normalizedImage!}
        fill
        className="object-cover"
        sizes="(min-width: 768px) 50vw, 100vw"
        crop="fill"
        gravity="auto"
      />
    )
  }

  return (
    <Image
      alt={`${boat.name} fishing charter`}
      src={resolvedImage}
      fill
      className="object-cover"
      sizes="(min-width: 768px) 50vw, 100vw"
    />
  )
}

export function BoatSelector({
  boats,
  selectedBoatId,
  tripType,
  onSelect,
  capacityLabel,
  emptyMessage,
  depositLabel,
}: BoatSelectorProps) {
  if (boats.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-gold/12 bg-white/3 px-5 py-8 text-center text-sm leading-7 text-sand/68">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {boats.map((boat) => {
        const selected = boat.id === selectedBoatId
        let total = 0
        try {
          total = getBoatPrice(boat, tripType)
        } catch {
          total = 0
        }
        const deposit = total > 0 ? calculateDepositAmount(total) : 0

        return (
          <button
            key={boat.id}
            type="button"
            onClick={() => onSelect(boat.id)}
            className={cn(
              "overflow-hidden rounded-[1.5rem] border text-left transition",
              selected
                ? "border-gold bg-gold/12 shadow-[0_16px_40px_rgba(212,168,67,0.18)]"
                : "border-gold/14 bg-white/3 hover:border-gold/30 hover:bg-white/6"
            )}
          >
            <div className="relative h-36 overflow-hidden">
              <BoatImage boat={boat} />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/20 to-transparent" />
              {selected ? (
                <span className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-full bg-gold text-navy">
                  <Check className="size-4" strokeWidth={2.5} />
                </span>
              ) : null}
              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                <div>
                  <p className="font-heading text-2xl text-white">{boat.name}</p>
                  <p className="text-xs uppercase tracking-[0.22em] text-sand/70">
                    {boat.category}
                    {boat.length ? ` · ${boat.length}` : ""}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-4">
              <div className="flex items-center gap-2 text-sm text-sand/72">
                <Users className="size-4 text-teal" />
                <span>{capacityLabel(boat.capacity)}</span>
              </div>

              {total > 0 ? (
                <div className="rounded-[1rem] border border-gold/10 bg-navy/40 px-3 py-2.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs uppercase tracking-[0.18em] text-sand/54">Total</span>
                    <span className="text-lg font-semibold text-white">{formatUsd(total)}</span>
                  </div>
                  {depositLabel ? (
                    <p className="mt-1 text-xs text-sand/60">
                      {depositLabel}: {formatUsd(deposit)}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-sand/60">50% deposit: {formatUsd(deposit)}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-sand/60">Price on request</p>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
