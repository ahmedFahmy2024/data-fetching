import { db } from "@/drizzle/db";
import { posts } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

// This page uses Server-Side Rendering (SSR)
// The page is rendered on every request with fresh data
// Force dynamic rendering (Next.js 15/16)
export const dynamic = "force-dynamic";

export default async function SSRPostsPage() {
  console.log(
    "SSR: Fetching posts from database (this happens on EVERY request)"
  );

  // Fetch all published posts from database
  // This query runs on EVERY request - always fresh data
  const postList = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      createdAt: posts.createdAt,
      userId: posts.userId,
    })
    .from(posts)
    .where(eq(posts.published, 1))
    .orderBy(posts.createdAt);

  // Generate timestamp to show when page was rendered
  const renderedAt = new Date().toISOString();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-16 px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-black dark:text-zinc-50 mb-2">
              Server-Side Rendering (SSR)
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Page rendered on every request
            </p>
          </div>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="mb-8 p-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
          <h2 className="text-xl font-semibold text-purple-900 dark:text-purple-100 mb-2">
            How SSR Works:
          </h2>
          <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1 list-disc list-inside">
            <li>Page is rendered on the server for every request</li>
            <li>Database query runs on every page load</li>
            <li>Always shows the latest data (real-time)</li>
            <li>No caching - fresh data every time</li>
            <li>Perfect for dynamic, user-specific content</li>
            <li>Uses `dynamic = 'force-dynamic'`</li>
          </ul>
          <p className="text-xs text-purple-700 dark:text-purple-300 mt-3">
            Page rendered at: {renderedAt}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-6">
            Posts (SSR) - {postList.length} total
          </h2>

          {postList.length === 0 ? (
            <p className="text-zinc-600 dark:text-zinc-400">
              No published posts found. Add some posts to the database to see
              them here.
            </p>
          ) : (
            <div className="space-y-4">
              {postList.map((post) => (
                <Link
                  key={post.id}
                  href={`/ssr/posts/${post.id}`}
                  className="block p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:shadow-md transition-shadow hover:border-purple-500 dark:hover:border-purple-500"
                >
                  <h3 className="text-xl font-semibold text-black dark:text-zinc-50 mb-2">
                    {post.title}
                  </h3>
                  <p className="text-zinc-700 dark:text-zinc-300 mb-2 line-clamp-3">
                    {post.content}
                  </p>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 flex justify-between">
                    <span>ID: {post.id}</span>
                    <span>
                      Created: {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 text-xs text-zinc-500 dark:text-zinc-400">
          <p>
            <strong>Implementation:</strong> Uses{" "}
            <code>dynamic = 'force-dynamic'</code> for SSR
          </p>
          <p>
            <strong>Behavior:</strong> Database query on every request - always
            fresh, never cached
          </p>
          <p className="mt-2 text-purple-600 dark:text-purple-400">
            💡 Refresh this page to see a new render timestamp
          </p>
        </div>
      </div>
    </div>
  );
}
