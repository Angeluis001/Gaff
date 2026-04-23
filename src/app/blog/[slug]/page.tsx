import { notFound } from "next/navigation"
import Link from "next/link"
import { eq } from "drizzle-orm"
import type { Metadata } from "next"

import { db } from "@/lib/db"
import { seoPosts } from "@/lib/db/schema"
import { SITE_NAME, SITE_URL } from "@/lib/constants"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const [post] = await db
    .select({ title: seoPosts.title, excerpt: seoPosts.excerpt })
    .from(seoPosts)
    .where(eq(seoPosts.slug, slug))
    .limit(1)

  if (!post) return {}

  return {
    title: `${post.title} | ${SITE_NAME}`,
    description: post.excerpt ?? undefined,
    alternates: { canonical: `${SITE_URL}/blog/${slug}` },
  }
}

const KIND_LABEL: Record<string, string> = {
  blog_post: "Blog",
  fishing_report: "Trip Report",
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params

  const [post] = await db
    .select()
    .from(seoPosts)
    .where(eq(seoPosts.slug, slug))
    .limit(1)

  if (!post || post.status !== "published") notFound()

  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      {/* Back */}
      <Link href="/blog" className="text-sm text-white/40 hover:text-white/70 transition-colors">
        ← All posts
      </Link>

      {/* Meta */}
      <div className="mt-6 flex items-center gap-3 text-xs text-white/40">
        <span className="rounded-full border border-white/10 px-2 py-0.5">
          {KIND_LABEL[post.kind] ?? post.kind}
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

      {/* Title */}
      <h1 className="mt-4 text-3xl font-bold leading-tight text-white">{post.title}</h1>

      {/* Excerpt */}
      {post.excerpt && (
        <p className="mt-3 text-lg text-white/60 leading-relaxed">{post.excerpt}</p>
      )}

      {/* Divider */}
      <hr className="my-8 border-white/10" />

      {/* Content */}
      <article className="prose prose-invert prose-sm max-w-none text-white/80 leading-relaxed whitespace-pre-wrap">
        {post.content}
      </article>

      {/* Footer CTA */}
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
  )
}
