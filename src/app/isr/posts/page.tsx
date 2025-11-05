import { db } from "@/drizzle/db";
import { posts } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

// This page uses Incremental Static Regeneration (ISR)
// The page will be statically generated and revalidated every 60 seconds
export const revalidate = 60;

export default async function ISRPostsPage() {
  console.log(
    "ISR: Fetching posts from database (this will only show in server logs on revalidation)"
  );

  // Fetch all published posts from database
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

  // This fetch happens at build time and then every 60 seconds
  // On-demand updates are also possible with revalidatePath()

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-16 px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-black dark:text-zinc-50 mb-2">
              Incremental Static Regeneration (ISR)
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Page revalidates every 60 seconds
            </p>
          </div>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">
            How ISR Works:
          </h2>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
            <li>Page is statically generated and cached</li>
            <li>After 60 seconds, next request triggers regeneration</li>
            <li>
              Old cache served until new generation completes
              (stale-while-revalidate)
            </li>
            <li>Perfect for content that updates occasionally</li>
            <li>Fast initial load + automatic updates</li>
            <li>Uses `revalidate = 60` for time-based ISR</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-6">
            Posts (ISR) - {postList.length} total
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
                  href={`/isr/posts/${post.id}`}
                  className="block p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:shadow-md transition-shadow hover:border-blue-500 dark:hover:border-blue-500"
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
            <code>export const revalidate = 60</code> to enable ISR
          </p>
          <p>
            <strong>Revision:</strong> Check server logs - this page regenerates
            every 60 seconds or when revalidatePath() is called
          </p>
        </div>
      </div>
    </div>
  );
}
