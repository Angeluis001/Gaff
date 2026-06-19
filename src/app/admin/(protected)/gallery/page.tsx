import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { AdminStatGrid } from "@/components/admin/AdminStatGrid"
import { MetricCard } from "@/components/admin/MetricCard"
import { GalleryManager } from "@/components/admin/gallery/GalleryManager"
import { getAdminGalleryItems } from "@/lib/admin/gallery"

export default async function AdminGalleryPage() {
  const items = await getAdminGalleryItems()

  const publishedCount = items.filter((item) => item.published).length
  const featuredCount = items.filter((item) => item.featured).length
  const videoCount = items.filter((item) => item.mediaType === "video").length

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Gallery"
        title="Gallery"
        description="Stage, upload, and publish GAFF photo and video proof for the public gallery experience."
      />

      <AdminStatGrid>
        <MetricCard title="Assets" value={String(items.length)} tone="info" />
        <MetricCard title="Published" value={String(publishedCount)} tone="success" />
        <MetricCard title="Featured" value={String(featuredCount)} tone="warning" />
        <MetricCard title="Videos" value={String(videoCount)} tone="neutral" />
      </AdminStatGrid>

      <GalleryManager initialItems={items} />
    </div>
  )
}
