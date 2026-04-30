import { notFound } from "next/navigation"
import Link from "next/link"
import { eq, and } from "drizzle-orm"
import type { Metadata } from "next"

import { db } from "@/lib/db"
import { seoPosts } from "@/lib/db/schema"
import { SITE_NAME, SITE_URL } from "@/lib/constants"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const [post] = await db
    .select({ title: seoPosts.title, excerpt: seoPosts.excerpt, publishedAt: seoPosts.publishedAt })
    .from(seoPosts)
    .where(and(eq(seoPosts.slug, slug), eq(seoPosts.kind, "fishing_report")))
    .limit(1)

  if (!post) return {}

  return {
    title: `${post.title} | ${SITE_NAME}`,
    description: post.excerpt ?? "Cabo San Lucas fishing report from GAFF All Fishing.",
    alternates: { canonical: `${SITE_URL}/fishing-reports/${slug}` },
    openGraph: {
      title: `${post.title} | ${SITE_NAME}`,
      description: post.excerpt ?? "Cabo San Lucas fishing report from GAFF All Fishing.",
      url: `${SITE_URL}/fishing-reports/${slug}`,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
    },
  }
}

export default async function FishingReportPage({ params }: Props) {
  const { slug } = await params

  const [post] = await db
    .select()
    .from(seoPosts)
    .where(and(eq(seoPosts.slug, slug), eq(seoPosts.kind, "fishing_report")))
    .limit(1)

  if (!post || post.status !== "published") notFound()

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt ?? "",
    "datePublished": post.publishedAt?.toISOString() ?? post.createdAt?.toISOString(),
    "dateModified": post.updatedAt?.toISOString() ?? post.createdAt?.toISOString(),
    "author": {
      "@type": "Organization",
      "name": SITE_NAME,
      "url": SITE_URL,
    },
    "publisher": {
      "@type": "Organization",
      "name": SITE_NAME,
      "url": SITE_URL,
    },
    "about": {
      "@type": "TouristAttraction",
      "name": "Sport Fishing in Cabo San Lucas",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Cabo San Lucas",
        "addressRegion": "Baja California Sur",
        "addressCountry": "MX",
      },
    },
    "url": `${SITE_URL}/fishing-reports/${slug}`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <Link href="/fishing-reports" className="text-sm text-white/40 hover:text-white/70 transition-colors">
          ← All fishing reports
        </Link>

        <div className="mt-6 flex items-center gap-3 text-xs text-white/40">
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-emerald-400">
            Trip Report
          </span>
          {post.publishedAt && (
            <span>
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                weekday: "long", month: "long", day: "numeric", year: "numeric",
              })}
            </span>
          )}
          {post.keywordFocus && (
            <span className="text-emerald-400/60">{post.keywordFocus}</span>
          )}
        </div>

        <h1 className="mt-4 text-3xl font-bold leading-tight text-white">{post.title}</h1>

        {post.excerpt && (
          <p className="mt-3 text-lg text-white/60 leading-relaxed">{post.excerpt}</p>
        )}

        <hr className="my-8 border-white/10" />

        <article className="prose prose-invert prose-sm max-w-none text-white/80 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </article>

        <div className="mt-16 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-6 py-6 text-center">
          <p className="text-white/70 text-sm mb-3">
            Ready to experience Cabo San Lucas fishing for yourself?
          </p>
          <Link
            href="/booking"
            className="inline-block rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-semibold text-black hover:bg-amber-400 transition-colors"
          >
            Book your charter
          </Link>
        </div>
      </main>
    </>
  )
}
