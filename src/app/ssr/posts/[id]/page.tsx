import { db } from "@/drizzle/db";
import { posts } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

// Force dynamic rendering (SSR) - Next.js 15/16
export const dynamic = "force-dynamic";

// Note: No generateStaticParams for SSR
// Pages are rendered on-demand for each request

// Page component - params is a Promise in Next.js 15+
export default async function SSRPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  console.log(`SSR: Rendering post ${id} (happens on EVERY request)`);

  // Fetch the specific post
  // This query runs on EVERY request
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

  // Add timestamp to show when page was rendered
  const renderedAt = new Date().toISOString();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-16 px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/ssr/posts"
            className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200"
          >
            ← Back to SSR Posts
          </Link>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
          >
            Home
          </Link>
        </div>

        <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block px-3 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full font-semibold">
              SSR
            </span>
            <span className="text-sm text-purple-800 dark:text-purple-200">
              Rendered on every request with{" "}
              <code className="text-xs bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 rounded">
                dynamic = 'force-dynamic'
              </code>
            </span>
          </div>
          <p className="text-xs text-purple-700 dark:text-purple-300">
            Page rendered at: {renderedAt}
          </p>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
            💡 Refresh to see a new timestamp
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
            SSR Implementation Details:
          </h3>
          <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
            <li>✓ Rendered on the server for every request</li>
            <li>✓ Database query runs on every page load</li>
            <li>✓ Always shows the latest data (real-time)</li>
            <li>✓ No caching - fresh data every time</li>
            <li>✓ No generateStaticParams needed</li>
            <li>
              ✓ Uses <code>dynamic = 'force-dynamic'</code>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
