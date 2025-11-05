import { db } from "@/drizzle/db";
import { posts } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

// Revalidate every 60 seconds (ISR)
export const revalidate = 60;

// Generate static params for all posts at build time
// With ISR, these pages will be regenerated in the background
export async function generateStaticParams() {
  console.log(
    "ISR: generateStaticParams - Fetching all post IDs at build time"
  );

  const allPosts = await db
    .select({ id: posts.id })
    .from(posts)
    .where(eq(posts.published, 1));

  // Return array of params objects for each post
  // Next.js will pre-render these at build time
  // Then revalidate them every 60 seconds
  return allPosts.map((post) => ({
    id: post.id,
  }));
}

// Page component - params is a Promise in Next.js 15+
export default async function ISRPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  console.log(
    `ISR: Rendering post ${id} (happens at build time and every 60s)`
  );

  // Fetch the specific post
  const [post] = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      createdAt: posts.createdAt,
      userId: posts.userId,
    })
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);

  if (!post) {
    notFound();
  }

  // Add timestamp to show when page was generated
  const generatedAt = new Date().toISOString();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-16 px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/isr/posts"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
          >
            ← Back to ISR Posts
          </Link>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
          >
            Home
          </Link>
        </div>

        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full font-semibold">
              ISR
            </span>
            <span className="text-sm text-blue-800 dark:text-blue-200">
              Revalidates every 60 seconds with{" "}
              <code className="text-xs bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded">
                revalidate = 60
              </code>
            </span>
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Page generated at: {generatedAt}
          </p>
        </div>

        <article className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 p-8">
          <h1 className="text-4xl font-bold text-black dark:text-zinc-50 mb-4">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400 mb-8 pb-6 border-b border-zinc-200 dark:border-zinc-800">
            <span>Post ID: {post.id}</span>
            <span>•</span>
            <span>
              Created: {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="prose prose-zinc dark:prose-invert max-w-none">
            <p className="text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>
        </article>

        <div className="mt-6 p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-black dark:text-zinc-50 mb-2">
            ISR Implementation Details:
          </h3>
          <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
            <li>
              ✓ Pre-rendered at build time using{" "}
              <code>generateStaticParams()</code>
            </li>
            <li>✓ Revalidates every 60 seconds in the background</li>
            <li>
              ✓ Stale content served while regenerating (stale-while-revalidate)
            </li>
            <li>✓ Fresh content after revalidation completes</li>
            <li>✓ Best of both: static performance + fresh content</li>
            <li>
              ✓ Uses <code>export const revalidate = 60</code>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
