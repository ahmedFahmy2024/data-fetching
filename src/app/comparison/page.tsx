import Link from "next/link";

export default function ComparisonPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-16 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <Link
            href="/"
            className="inline-block mb-6 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
          >
            ← Back to Home
          </Link>
          <h1 className="text-5xl font-bold text-black dark:text-zinc-50 mb-4">
            SSG vs ISR vs SSR: Complete Comparison
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            Understanding the differences with Next.js 15/16
          </p>
        </div>

        {/* Side-by-side code comparison */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* SSG Code */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full font-semibold">
                SSG
              </span>
              <h2 className="text-2xl font-bold text-black dark:text-zinc-50 mt-2">
                Static Site Generation
              </h2>
            </div>
            <pre className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg overflow-x-auto text-xs">
              <code>{`// Force static rendering
export const dynamic = 'force-static';

// Generate all paths at build time
export async function generateStaticParams() {
  const posts = await db
    .select({ id: posts.id })
    .from(posts);
  
  return posts.map((post) => ({
    id: post.id,
  }));
}

// Page component (params is Promise)
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await fetchPost(id);
  
  return <div>{post.title}</div>;
}`}</code>
            </pre>
          </div>

          {/* ISR Code */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full font-semibold">
                ISR
              </span>
              <h2 className="text-2xl font-bold text-black dark:text-zinc-50 mt-2">
                Incremental Static Regeneration
              </h2>
            </div>
            <pre className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg overflow-x-auto text-xs">
              <code>{`// Revalidate every 60 seconds
export const revalidate = 60;

// Generate all paths at build time
export async function generateStaticParams() {
  const posts = await db
    .select({ id: posts.id })
    .from(posts);
  
  return posts.map((post) => ({
    id: post.id,
  }));
}

// Page component (params is Promise)
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await fetchPost(id);
  
  return <div>{post.title}</div>;
}`}</code>
            </pre>
          </div>

          {/* SSR Code */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full font-semibold">
                SSR
              </span>
              <h2 className="text-2xl font-bold text-black dark:text-zinc-50 mt-2">
                Server-Side Rendering
              </h2>
            </div>
            <pre className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg overflow-x-auto text-xs">
              <code>{`// Force dynamic rendering
export const dynamic = 'force-dynamic';

// No generateStaticParams needed
// Pages rendered on every request

// Page component (params is Promise)
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await fetchPost(id);
  
  return <div>{post.title}</div>;
}`}</code>
            </pre>
          </div>
        </div>

        {/* Detailed comparison table */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden mb-12">
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-2xl font-bold text-black dark:text-zinc-50">
              Feature Comparison
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Feature
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">
                    SSG
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    ISR
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                    SSR
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-black dark:text-zinc-50">
                    Configuration
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                    <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                      dynamic = 'force-static'
                    </code>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                    <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                      revalidate = 60
                    </code>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                    <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                      dynamic = 'force-dynamic'
                    </code>
                  </td>
                </tr>
                <tr className="bg-zinc-50/50 dark:bg-zinc-800/50">
                  <td className="px-6 py-4 text-sm font-medium text-black dark:text-zinc-50">
                    Rendering Time
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                    Build time only
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                    Build time + revalidation
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                    Every request
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-black dark:text-zinc-50">
                    Content Updates
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                    Requires full rebuild
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                    After revalidate period
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                    Real-time (always fresh)
                  </td>
                </tr>
                <tr className="bg-zinc-50/50 dark:bg-zinc-800/50">
                  <td className="px-6 py-4 text-sm font-medium text-black dark:text-zinc-50">
                    Database Queries
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                    Only at build time
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                    Build time + revalidation
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                    Every request
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-black dark:text-zinc-50">
                    Performance
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                    Maximum (always cached)
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                    Excellent (cached + fresh)
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                    Good (no caching)
                  </td>
                </tr>
                <tr className="bg-zinc-50/50 dark:bg-zinc-800/50">
                  <td className="px-6 py-4 text-sm font-medium text-black dark:text-zinc-50">
                    Caching
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                    Permanent (until rebuild)
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                    Time-based (60s)
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                    None
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-black dark:text-zinc-50">
                    generateStaticParams
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                    Required for dynamic routes
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                    Required for dynamic routes
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                    Not needed
                  </td>
                </tr>
                <tr className="bg-zinc-50/50 dark:bg-zinc-800/50">
                  <td className="px-6 py-4 text-sm font-medium text-black dark:text-zinc-50">
                    Best For
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                    Static content, docs, marketing
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                    E-commerce, blogs, news
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                    User dashboards, real-time data
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Key differences */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-4">
              When to Use SSG
            </h3>
            <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Content rarely or never changes</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Maximum performance is critical</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Documentation sites</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Marketing pages</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Blog posts (if rarely updated)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>You control deployment schedule</span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-4">
              When to Use ISR
            </h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span>Content updates periodically</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span>Need fresh content without rebuilds</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span>E-commerce product pages</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span>News and blog sites</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span>Large sites (thousands of pages)</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span>Balance between static and dynamic</span>
              </li>
            </ul>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-4">
              When to Use SSR
            </h3>
            <ul className="space-y-2 text-sm text-purple-800 dark:text-purple-200">
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">✓</span>
                <span>Content changes frequently</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">✓</span>
                <span>Need real-time data</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">✓</span>
                <span>User-specific content</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">✓</span>
                <span>Personalized dashboards</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">✓</span>
                <span>Authentication-dependent pages</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">✓</span>
                <span>Dynamic, always-fresh data required</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Next.js 15/16 specific features */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 p-6 mb-12">
          <h2 className="text-2xl font-bold text-black dark:text-zinc-50 mb-4">
            Next.js 15/16 Specific Features
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-black dark:text-zinc-50 mb-2">
                1. Params as Promise
              </h3>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-2">
                In Next.js 15+, the{" "}
                <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                  params
                </code>{" "}
                prop is now a Promise and must be awaited:
              </p>
              <pre className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded text-xs overflow-x-auto">
                <code>{`// Next.js 15/16
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // Must await
  // ...
}`}</code>
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-black dark:text-zinc-50 mb-2">
                2. generateStaticParams
              </h3>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-2">
                Used for both SSG and ISR to pre-render dynamic routes:
              </p>
              <pre className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded text-xs overflow-x-auto">
                <code>{`export async function generateStaticParams() {
  const posts = await fetchPosts();
  return posts.map((post) => ({ id: post.id }));
}`}</code>
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-black dark:text-zinc-50 mb-2">
                3. On-Demand Revalidation
              </h3>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-2">
                Trigger ISR revalidation manually:
              </p>
              <pre className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded text-xs overflow-x-auto">
                <code>{`import { revalidatePath } from 'next/cache';

// In API route or Server Action
revalidatePath('/isr/posts');`}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Try it yourself */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-zinc-200 dark:border-zinc-800 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-black dark:text-zinc-50 mb-4">
            Try It Yourself
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300 mb-6">
            Compare the implementations side-by-side
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/ssg/posts"
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
            >
              View SSG Demo
            </Link>
            <Link
              href="/isr/posts"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              View ISR Demo
            </Link>
            <Link
              href="/ssr/posts"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
            >
              View SSR Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
