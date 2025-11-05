import { db } from "@/drizzle/db";
import { posts } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

// Force static rendering (Next.js 15/16)
export const dynamic = "force-static";

// Generate static params for all posts at build time
// This is the key function for SSG with dynamic routes
export async function generateStaticParams() {
  console.log(
    "SSG: generateStaticParams - Fetching all post IDs at build time"
  );

  const allPosts = await db
    .select({ id: posts.id })
    .from(posts)
    .where(eq(posts.published, 1));

  // Return array of params objects for each post
  // Next.js will pre-render a page for each ID
  return allPosts.map((post) => ({
    id: post.id,
  }));
}

// Page component - params is a Promise in Next.js 15+
export default async function SSGPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  console.log(`SSG: Rendering post ${id} (only happens at build time)`);

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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-16 px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/ssg/posts"
            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
          >
            ← Back to SSG Posts
          </Link>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
          >
            Home
          </Link>
        </div>

        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="inline-block px-3 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full font-semibold">
              SSG
            </span>
            <span className="text-sm text-green-800 dark:text-green-200">
              Generated at build time with{" "}
              <code className="text-xs bg-green-100 dark:bg-green-900/50 px-2 py-0.5 rounded">
                generateStaticParams()
              </code>
            </span>
          </div>
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
            SSG Implementation Details:
          </h3>
          <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
            <li>
              ✓ Pre-rendered at build time using{" "}
              <code>generateStaticParams()</code>
            </li>
            <li>
              ✓ All post IDs fetched during build to generate static pages
            </li>
            <li>✓ Zero database queries at runtime</li>
            <li>✓ Maximum performance - served from CDN</li>
            <li>✓ Content frozen until next build</li>
            <li>
              ✓ Uses <code>dynamic = 'force-static'</code>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
