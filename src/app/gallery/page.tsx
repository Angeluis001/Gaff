import type { Metadata } from "next"

import { Footer } from "@/components/landing/Footer"
import { Navbar } from "@/components/landing/Navbar"
import { GalleryExperience } from "@/components/gallery/GalleryExperience"
import { GalleryHero } from "@/components/gallery/GalleryHero"
import { getPublishedGalleryItems } from "@/lib/gallery"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata: Metadata = {
  title: "Gallery | GAFF All Fishing Los Cabos",
  description:
    "Explore GAFF's curated photo and video gallery featuring boats, catches, crew moments, and the offshore experience in Cabo San Lucas.",
}

export default async function GalleryPage() {
  const items = await getPublishedGalleryItems()

  return (
    <>
      <Navbar />
      <main className="landing-shell pb-16">
        <GalleryHero />
        <GalleryExperience items={items} />
        <Footer />
      </main>
    </>
  )
}
