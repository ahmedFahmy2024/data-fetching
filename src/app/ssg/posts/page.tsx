import { db } from "@/drizzle/db";
import { posts } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

// This page uses Static Site Generation (SSG)
// The page is generated at build time and never revalidated
// It's completely static unless you rebuild the application

// Force static rendering (Next.js 15/16)
export const dynamic = "force-static";

export default async function SSGPostsPage() {
  console.log(
    "SSG: Fetching posts from database (this only happens at build time)"
  );

  // Fetch all published posts from database
  // This query runs during `npm run build` and the data is baked into the HTML
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

  // This data is static and won't change until the site is rebuilt
  // Perfect for content that rarely changes

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-16 px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-black dark:text-zinc-50 mb-2">
              Static Site Generation (SSG)
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Page generated at build time (no revalidation)
            </p>
          </div>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="mb-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <h2 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-2">
            How SSG Works:
          </h2>
          <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 list-disc list-inside">
            <li>Page is generated once during `npm run build`</li>
            <li>Content is baked into static HTML files</li>
            <li>Served extremely fast (CDN-ready)</li>
            <li>No database queries on each request</li>
            <li>Perfect for content that never/rarely changes</li>
            <li>Uses `dynamic = 'force-static'` to ensure static rendering</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-6">
            Posts (SSG) - {postList.length} total
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
                  href={`/ssg/posts/${post.id}`}
                  className="block p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:shadow-md transition-shadow hover:border-green-500 dark:hover:border-green-500"
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
            <code>dynamic = 'force-static'</code> for pure SSG
          </p>
          <p>
            <strong>Revision:</strong> Content is static - must rebuild with{" "}
            <code>npm run build</code> to update
          </p>
        </div>
      </div>
    </div>
  );
}
