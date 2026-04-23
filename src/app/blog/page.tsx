import Link from "next/link"
import { eq } from "drizzle-orm"
import type { Metadata } from "next"

import { db } from "@/lib/db"
import { seoPosts } from "@/lib/db/schema"
import { SITE_NAME, SITE_URL } from "@/lib/constants"

export const metadata: Metadata = {
  title: `Fishing Blog & Reports | ${SITE_NAME}`,
  description: "Cabo San Lucas fishing reports, tips, and weekly updates from GAFF All Fishing. Expert sport fishing insights for your Los Cabos trip.",
  alternates: { canonical: `${SITE_URL}/blog` },
}

const KIND_LABEL: Record<string, string> = {
  blog_post: "Blog",
  fishing_report: "Trip Report",
}

export default async function BlogPage() {
  const posts = await db
    .select({
      id: seoPosts.id,
      slug: seoPosts.slug,
      kind: seoPosts.kind,
      title: seoPosts.title,
      excerpt: seoPosts.excerpt,
      keywordFocus: seoPosts.keywordFocus,
      publishedAt: seoPosts.publishedAt,
    })
    .from(seoPosts)
    .where(eq(seoPosts.status, "published"))
    .orderBy(seoPosts.publishedAt)

  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <Link href="/" className="text-sm text-white/40 hover:text-white/70 transition-colors">
        ← Back to GAFF All Fishing
      </Link>
      <header className="mb-12 mt-8">
        <p className="text-sm uppercase tracking-widest text-amber-500">GAFF All Fishing Los Cabos</p>
        <h1 className="mt-2 text-4xl font-bold text-white">Fishing Blog & Reports</h1>
        <p className="mt-3 text-white/60">
          Weekly fishing conditions, trip reports, and sport fishing tips for Cabo San Lucas.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-white/40">No posts published yet — check back soon.</p>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group block rounded-2xl border border-white/10 bg-white/5 px-6 py-5 transition hover:border-white/20 hover:bg-white/10"
            >
              <div className="flex items-center gap-2 text-xs text-white/40 mb-2">
                <span className="rounded-full border border-white/10 px-2 py-0.5">
                  {KIND_LABEL[post.kind] ?? post.kind}
                </span>
                {post.publishedAt && (
                  <span>
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      month: "long", day: "numeric", year: "numeric",
                    })}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-semibold text-white group-hover:text-amber-300 transition-colors">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="mt-1 text-sm text-white/55 line-clamp-2">{post.excerpt}</p>
              )}
              {post.keywordFocus && (
                <p className="mt-2 text-xs text-emerald-400/60">{post.keywordFocus}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
