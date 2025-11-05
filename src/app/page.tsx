import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-16 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-black dark:text-zinc-50 mb-4">
            Next.js 16.0.1 Rendering Comparison
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            Comparing <strong>SSG</strong>, <strong>ISR</strong>, and{" "}
            <strong>SSR</strong> with Database Data
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* SSG Card */}
          <Link
            href="/ssg/posts"
            className="block bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <div className="mb-3">
              <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                Static Site Generation
              </h2>
              <span className="inline-block px-3 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full">
                SSG
              </span>
            </div>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-4">
              Build-time generation with no revalidation
            </p>

            <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Generated at build time</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Maximum performance</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Requires rebuild to update</span>
              </li>
            </ul>

            <div className="mt-4 text-sm text-green-600 dark:text-green-400 font-medium">
              View SSG Demo →
            </div>
          </Link>

          {/* ISR Card */}
          <Link
            href="/isr/posts"
            className="block bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <div className="mb-3">
              <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                Incremental Static Regeneration
              </h2>
              <span className="inline-block px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full">
                ISR
              </span>
            </div>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-4">
              Static generation with automatic revalidation
            </p>

            <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Revalidates every 60 seconds</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Served from CDN cache</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Fresh within revalidation window</span>
              </li>
            </ul>

            <div className="mt-4 text-sm text-blue-600 dark:text-blue-400 font-medium">
              View ISR Demo →
            </div>
          </Link>

          {/* SSR Card */}
          <Link
            href="/ssr/posts"
            className="block bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <div className="mb-3">
              <h2 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                Server-Side Rendering
              </h2>
              <span className="inline-block px-3 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full">
                SSR
              </span>
            </div>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-4">
              Rendered on every request with fresh data
            </p>

            <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Rendered on every request</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Always shows latest data</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>No caching - real-time</span>
              </li>
            </ul>

            <div className="mt-4 text-sm text-purple-600 dark:text-purple-400 font-medium">
              View SSR Demo →
            </div>
          </Link>
        </div>

        {/* Comparison Table */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-2xl font-bold text-black dark:text-zinc-50">
              SSG vs ISR vs SSR Comparison
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Feature
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">
                    SSG
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    ISR
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                    SSR
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-black dark:text-zinc-50">
                    Rendering
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-700 dark:text-zinc-300">
                    Build time only
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-700 dark:text-zinc-300">
                    Build + revalidation
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-700 dark:text-zinc-300">
                    Every request
                  </td>
                </tr>
                <tr className="bg-zinc-50/50 dark:bg-zinc-800/50">
                  <td className="px-4 py-3 text-sm font-medium text-black dark:text-zinc-50">
                    Updates
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-700 dark:text-zinc-300">
                    Rebuild required
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-700 dark:text-zinc-300">
                    Every 60s
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-700 dark:text-zinc-300">
                    Real-time
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-black dark:text-zinc-50">
                    Performance
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-700 dark:text-zinc-300">
                    Maximum
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-700 dark:text-zinc-300">
                    Excellent
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-700 dark:text-zinc-300">
                    Good
                  </td>
                </tr>
                <tr className="bg-zinc-50/50 dark:bg-zinc-800/50">
                  <td className="px-4 py-3 text-sm font-medium text-black dark:text-zinc-50">
                    Best For
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-700 dark:text-zinc-300">
                    Static content
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-700 dark:text-zinc-300">
                    Periodic updates
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-700 dark:text-zinc-300">
                    Dynamic content
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-black dark:text-zinc-50">
                    Config
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-700 dark:text-zinc-300">
                    <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">
                      force-static
                    </code>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-700 dark:text-zinc-300">
                    <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">
                      revalidate=60
                    </code>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-700 dark:text-zinc-300">
                    <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">
                      force-dynamic
                    </code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/comparison"
            className="inline-block mb-6 px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded-lg font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            View Detailed Comparison →
          </Link>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Built with Next.js 16.0.1 App Router + Drizzle ORM + PostgreSQL
          </p>
        </div>
      </div>
    </div>
  );
}
