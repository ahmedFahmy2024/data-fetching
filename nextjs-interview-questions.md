# Next.js 16 Interview Questions - Comprehensive Guide

> Based on official Next.js v16.0.3 documentation via Context7 MCP
> Last Updated: December 2025

## Table of Contents

1. [App Router & Routing](#app-router--routing)
2. [Server & Client Components](#server--client-components)
3. [Data Fetching](#data-fetching)
4. [Caching & Revalidation](#caching--revalidation)
5. [SSR, SSG, ISR & PPR](#ssr-ssg-isr--ppr)
6. [Server Actions](#server-actions)
7. [API Routes & Route Handlers](#api-routes--route-handlers)
8. [Image Optimization](#image-optimization)
9. [SEO & Metadata](#seo--metadata)
10. [Error Handling](#error-handling)
11. [Middleware & Proxy](#middleware--proxy)
12. [Advanced Topics](#advanced-topics)

---

## App Router & Routing

### Q1: What is the App Router in Next.js 16 and how does it differ from the Pages Router?

**Answer:**
The App Router is the modern routing system in Next.js 13+ that uses a file-system based approach with special files:

- `page.tsx/jsx` - Defines route UI
- `layout.tsx/jsx` - Wraps pages with shared UI
- `loading.tsx/jsx` - Loading states
- `error.tsx/jsx` - Error boundaries

Key differences from Pages Router:

- Server Components by default
- Nested layouts support
- Streaming and Suspense built-in
- Colocated data fetching
- Better performance with React Server Components

```typescript
// app/page.tsx - Root page
export default function Page() {
  return <h1>Hello, Next.js!</h1>;
}

// app/layout.tsx - Root layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### Q2: How do dynamic routes work in the App Router?

**Answer:**
Dynamic routes use square brackets `[param]` in folder names:

```typescript
// app/blog/[slug]/page.tsx
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <h1>Post: {slug}</h1>;
}
```

**Catch-all routes** use `[...slug]`:

```typescript
// app/shop/[...slug]/page.tsx - Matches /shop/a, /shop/a/b, etc.
```

**Optional catch-all** use `[[...slug]]`:

```typescript
// app/docs/[[...slug]]/page.tsx - Matches /docs, /docs/a, /docs/a/b
```

### Q3: What is `generateStaticParams` and when should you use it?

**Answer:**
`generateStaticParams` is used to statically generate routes at build time for dynamic segments. It replaces `getStaticPaths` from Pages Router.

```typescript
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await fetch("https://api.example.com/posts").then((res) =>
    res.json()
  );

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Render post
}
```

**Key features:**

- Runs at build time
- Can return empty array for ISR
- Use `dynamicParams = false` to return 404 for ungenerated paths
- Child segments receive parent params

### Q4: How do you handle multiple dynamic segments?

**Answer:**
Child `generateStaticParams` receives parent params:

```typescript
// app/products/[category]/[product]/page.tsx

// Parent: app/products/[category]/layout.tsx
export async function generateStaticParams() {
  return [{ category: "electronics" }, { category: "clothing" }];
}

// Child: app/products/[category]/[product]/page.tsx
export async function generateStaticParams({
  params: { category },
}: {
  params: { category: string };
}) {
  const products = await fetch(
    `https://api.example.com/products?category=${category}`
  ).then((res) => res.json());

  return products.map((product) => ({
    product: product.id,
  }));
}
```

Generates: `/products/electronics/laptop`, `/products/clothing/shirt`, etc.

---

## Server & Client Components

### Q5: What are Server Components and what are their benefits?

**Answer:**
Server Components are React components that render on the server. They are the default in Next.js App Router.

**Benefits:**

- Direct database/API access without exposing credentials
- Reduced JavaScript bundle size
- Better SEO with server-rendered HTML
- Automatic code splitting
- Can use async/await directly

```typescript
// Server Component (default)
export default async function Page() {
  const data = await fetch("https://api.example.com/data");
  const posts = await data.json();

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

**Limitations:**

- Cannot use hooks (useState, useEffect, etc.)
- Cannot use browser APIs
- Cannot use event handlers

### Q6: How do you create a Client Component and when should you use it?

**Answer:**
Add `'use client'` directive at the top of the file:

```typescript
"use client";

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}
```

**Use Client Components when you need:**

- React hooks (useState, useEffect, useContext)
- Browser APIs (window, localStorage)
- Event handlers (onClick, onChange)
- Third-party libraries that use browser APIs

**Best Practice:** Keep Client Components small and nested within Server Components to minimize JavaScript bundle.

### Q7: How do you pass data from Server Components to Client Components?

**Answer:**
Pass serializable data as props:

```typescript
// Server Component
import LikeButton from "./like-button";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);

  return (
    <div>
      <h1>{post.title}</h1>
      <LikeButton likes={post.likes} />
    </div>
  );
}
```

```typescript
// Client Component - like-button.tsx
"use client";

export default function LikeButton({ likes }: { likes: number }) {
  const [count, setCount] = useState(likes);

  return <button onClick={() => setCount(count + 1)}>Likes: {count}</button>;
}
```

**Important:** Only serializable data (JSON-compatible) can be passed as props.

### Q8: Can you nest Server Components inside Client Components?

**Answer:**
Yes, but you must pass them as children or props (composition pattern):

```typescript
// Client Component - modal.tsx
"use client";

export default function Modal({ children }: { children: React.ReactNode }) {
  return <div className="modal">{children}</div>;
}
```

```typescript
// Server Component - page.tsx
import Modal from "./modal";
import Cart from "./cart"; // Server Component

export default function Page() {
  return (
    <Modal>
      <Cart /> {/* Server Component as child */}
    </Modal>
  );
}
```

**Why this works:** The Server Component is rendered on the server before being passed to the Client Component.

---

## Data Fetching

### Q9: What are the different ways to fetch data in Next.js 16?

**Answer:**

**1. Server Components (Recommended):**

```typescript
export default async function Page() {
  const data = await fetch("https://api.example.com/data");
  const posts = await data.json();
  return <div>{/* render */}</div>;
}
```

**2. Client Components with SWR:**

```typescript
"use client";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function Page() {
  const { data, error, isLoading } = useSWR(
    "https://api.example.com/data",
    fetcher
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error</div>;
  return <div>{/* render */}</div>;
}
```

**3. Route Handlers (API Routes):**

```typescript
// app/api/data/route.ts
export async function GET() {
  const data = await fetchData();
  return Response.json(data);
}
```

### Q10: How do you implement parallel data fetching?

**Answer:**
Initiate requests before awaiting them with `Promise.all()`:

```typescript
export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  // Initiate both requests in parallel
  const artistData = getArtist(username);
  const albumsData = getAlbums(username);

  // Wait for both to complete
  const [artist, albums] = await Promise.all([artistData, albumsData]);

  return (
    <>
      <h1>{artist.name}</h1>
      <Albums list={albums} />
    </>
  );
}
```

**Benefits:**

- Reduces total loading time
- Requests start immediately when functions are called
- Better performance than sequential fetching

### Q11: How do you handle sequential data fetching with dependencies?

**Answer:**
Use Suspense boundaries to prevent blocking:

```typescript
import { Suspense } from "react";

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const artist = await getArtist(username);

  return (
    <>
      <h1>{artist.name}</h1>
      <Suspense fallback={<div>Loading playlists...</div>}>
        <Playlists artistID={artist.id} />
      </Suspense>
    </>
  );
}

async function Playlists({ artistID }: { artistID: string }) {
  const playlists = await getArtistPlaylists(artistID);

  return (
    <ul>
      {playlists.map((playlist) => (
        <li key={playlist.id}>{playlist.name}</li>
      ))}
    </ul>
  );
}
```

**Benefits:**

- Shows partial content immediately
- Dependent data loads without blocking parent
- Better user experience with progressive rendering

---

## Caching & Revalidation

### Q12: What is the `'use cache'` directive in Next.js 16?

**Answer:**
`'use cache'` is a new directive in Next.js 16 for caching component output, function results, or entire routes.

**Component-level caching:**

```typescript
export async function Bookings({ type = "haircut" }) {
  "use cache";

  const data = await fetch(`/api/bookings?type=${type}`);
  return <div>{/* render */}</div>;
}
```

**Function-level caching:**

```typescript
export async function getData() {
  "use cache";

  const data = await fetch("/api/data");
  return data;
}
```

**Route-level caching:**

```typescript
"use cache";

export default async function Page() {
  return <div>Cached page</div>;
}
```

**Key features:**

- Replaces experimental PPR in Next.js 15
- Works with `cacheLife()` and `cacheTag()` for fine-grained control
- Enables partial pre-rendering

### Q13: What are the different cache revalidation strategies?

**Answer:**

**1. Time-based revalidation:**

```typescript
// Revalidate every 60 seconds
export const revalidate = 60;

export default async function Page() {
  const data = await fetch("https://api.example.com/data");
  return <div>{/* render */}</div>;
}
```

**2. On-demand with `revalidateTag`:**

```typescript
// Tagging data
const data = await fetch("https://api.example.com/posts", {
  next: { tags: ["posts"] },
});

// Revalidating in Server Action
("use server");
import { revalidateTag } from "next/cache";

export async function createPost() {
  // Create post...
  revalidateTag("posts", "max"); // Recommended: stale-while-revalidate
}
```

**3. On-demand with `revalidatePath`:**

```typescript
"use server";
import { revalidatePath } from "next/cache";

export async function updateUser() {
  // Update user...
  revalidatePath("/profile");
}
```

**4. Immediate expiration with `updateTag`:**

```typescript
"use server";
import { updateTag } from "next/cache";

export async function createPost() {
  // Create post...
  updateTag("posts"); // Immediate cache expiration
}
```

### Q14: What are the different caching layers in Next.js?

**Answer:**

| Cache Layer             | Purpose                         | Location | Duration                       |
| ----------------------- | ------------------------------- | -------- | ------------------------------ |
| **Request Memoization** | Dedupe same requests in render  | Server   | Per-request lifecycle          |
| **Data Cache**          | Store fetch results             | Server   | Persistent (until revalidated) |
| **Full Route Cache**    | Pre-rendered HTML & RSC payload | Server   | Persistent (until revalidated) |
| **Router Cache**        | RSC payload in browser          | Client   | User session or time-based     |

**How APIs affect caching:**

| API                   | Router Cache | Full Route Cache | Data Cache       | React Cache      |
| --------------------- | ------------ | ---------------- | ---------------- | ---------------- |
| `<Link prefetch>`     | Cache        | -                | -                | -                |
| `fetch`               | -            | -                | Cache            | Cache (GET/HEAD) |
| `fetch options.cache` | -            | -                | Cache or Opt out | -                |
| `revalidateTag`       | Revalidate   | Revalidate       | Revalidate       | -                |
| `revalidatePath`      | Revalidate   | Revalidate       | Revalidate       | -                |
| `cookies`             | Revalidate   | Opt out          | -                | -                |
| `headers`             | -            | Opt out          | -                | -                |

### Q15: How do you configure cache behavior with fetch?

**Answer:**

**Force cache (default):**

```typescript
const data = await fetch("https://api.example.com/data", {
  cache: "force-cache", // Static, cached indefinitely
});
```

**No cache (dynamic):**

```typescript
const data = await fetch("https://api.example.com/data", {
  cache: "no-store", // Fetch on every request
});
```

**Time-based revalidation:**

```typescript
const data = await fetch("https://api.example.com/data", {
  next: { revalidate: 3600 }, // Revalidate every hour
});
```

**Tag-based revalidation:**

```typescript
const data = await fetch("https://api.example.com/data", {
  next: { tags: ["posts"] },
});
```

### Q16: What is `cacheLife` and how do you use it?

**Answer:**
`cacheLife` defines cache duration profiles for cached functions:

```typescript
import { cacheLife } from "next/cache";

export async function getSettings() {
  "use cache";
  cacheLife("max"); // Settings rarely change

  return await fetchSettings();
}

export async function getRealtimeStats() {
  "use cache";
  cacheLife("seconds"); // Stats update constantly

  return await fetchStats();
}
```

**Built-in profiles:**

- `'seconds'` - Very short cache
- `'minutes'` - Short cache
- `'hours'` - Medium cache
- `'days'` - Long cache
- `'weeks'` - Very long cache
- `'max'` - Maximum cache duration

**Custom profile:**

```typescript
cacheLife({ expire: 60, stale: 30 });
```

---

## SSR, SSG, ISR & PPR

### Q17: What is Server-Side Rendering (SSR) in Next.js 16?

**Answer:**
SSR renders pages on the server for each request. In App Router, use `cache: 'no-store'`:

```typescript
export default async function Page() {
  // Fetch fresh data on every request
  const data = await fetch("https://api.example.com/data", {
    cache: "no-store",
  });
  const posts = await data.json();

  return <div>{/* render */}</div>;
}
```

**When to use SSR:**

- Personalized content
- Real-time data
- User-specific information
- Authentication-dependent pages

**Migration from Pages Router:**

```typescript
// Old: pages/index.js
export async function getServerSideProps() {
  const data = await fetch("...");
  return { props: { data } };
}

// New: app/page.tsx
export default async function Page() {
  const data = await fetch("...", { cache: "no-store" });
  return <div>{/* render */}</div>;
}
```

### Q18: What is Static Site Generation (SSG) and how do you implement it?

**Answer:**
SSG pre-renders pages at build time. In App Router, use default fetch behavior or `force-cache`:

```typescript
export default async function Page() {
  // Cached by default (force-cache)
  const data = await fetch("https://api.example.com/data");
  const posts = await data.json();

  return <div>{/* render */}</div>;
}
```

**With dynamic routes:**

```typescript
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await fetch("https://api.example.com/posts").then((res) =>
    res.json()
  );

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await fetch(`https://api.example.com/posts/${slug}`).then(
    (res) => res.json()
  );

  return <article>{post.content}</article>;
}
```

**When to use SSG:**

- Marketing pages
- Blog posts
- Documentation
- E-commerce product pages
- Any content that doesn't change frequently

### Q19: What is Incremental Static Regeneration (ISR)?

**Answer:**
ISR allows you to update static pages after build without rebuilding the entire site.

**App Router implementation:**

```typescript
// Revalidate every 60 seconds
export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await fetch("https://api.example.com/posts").then((res) =>
    res.json()
  );

  return posts.map((post) => ({
    id: String(post.id),
  }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await fetch(`https://api.example.com/posts/${id}`).then((res) =>
    res.json()
  );

  return <article>{post.content}</article>;
}
```

**Pages Router implementation:**

```typescript
export async function getStaticProps({ params }) {
  const post = await fetch(`https://api.example.com/posts/${params.id}`).then(
    (res) => res.json()
  );

  return {
    props: { post },
    revalidate: 60, // Revalidate every 60 seconds
  };
}

export async function getStaticPaths() {
  const posts = await fetch("https://api.example.com/posts").then((res) =>
    res.json()
  );

  return {
    paths: posts.map((post) => ({ params: { id: post.id } })),
    fallback: "blocking", // Generate new pages on-demand
  };
}
```

**ISR behavior:**

- First request after revalidate time: serves stale content, regenerates in background
- Subsequent requests: serve fresh content
- New pages can be generated on-demand with `fallback: 'blocking'`

### Q20: What is Partial Prerendering (PPR) and how does it work in Next.js 16?

**Answer:**
PPR combines static and dynamic rendering in a single route. In Next.js 16, enable it with `cacheComponents`:

```javascript
// next.config.js
module.exports = {
  cacheComponents: true,
};
```

**Implementation with Suspense:**

```typescript
import { Suspense } from "react";

export default function Page() {
  return (
    <>
      {/* Static shell - pre-rendered */}
      <header>
        <h1>My Store</h1>
      </header>

      {/* Dynamic content - streamed */}
      <Suspense fallback={<ProductsSkeleton />}>
        <DynamicProducts />
      </Suspense>

      {/* Static footer - pre-rendered */}
      <footer>© 2025</footer>
    </>
  );
}

async function DynamicProducts() {
  const products = await fetch("https://api.example.com/products", {
    cache: "no-store",
  }).then((res) => res.json());

  return <div>{/* render products */}</div>;
}
```

**How PPR works:**

1. Static parts are pre-rendered at build time
2. Dynamic parts (inside Suspense) are streamed at request time
3. User sees static shell immediately
4. Dynamic content loads progressively

**Benefits:**

- Fast initial page load (static shell)
- Fresh dynamic data
- Better Core Web Vitals
- Improved user experience

---

## Server Actions

### Q21: What are Server Actions and how do you create them?

**Answer:**
Server Actions are asynchronous functions that run on the server, allowing you to mutate data without creating API routes.

**Inline Server Action:**

```typescript
export default function Page() {
  async function createInvoice(formData: FormData) {
    "use server";

    const rawFormData = {
      customerId: formData.get("customerId"),
      amount: formData.get("amount"),
      status: formData.get("status"),
    };

    // Mutate data
    await db.invoices.create(rawFormData);

    // Revalidate cache
    revalidatePath("/invoices");
  }

  return <form action={createInvoice}>...</form>;
}
```

**Separate file (recommended):**

```typescript
// app/actions.ts
"use server";

export async function createPost(formData: FormData) {
  const title = formData.get("title");
  const content = formData.get("content");

  await db.posts.create({ title, content });
  revalidatePath("/posts");
}
```

```typescript
// app/page.tsx
import { createPost } from "./actions";

export default function Page() {
  return <form action={createPost}>...</form>;
}
```

### Q22: How do you pass additional arguments to Server Actions?

**Answer:**
Use `.bind()` to pass extra arguments:

```typescript
// app/actions.ts
"use server";

export async function updateUser(userId: string, formData: FormData) {
  const name = formData.get("name");
  await db.users.update(userId, { name });
}
```

```typescript
// app/user-profile.tsx
"use client";

import { updateUser } from "./actions";

export function UserProfile({ userId }: { userId: string }) {
  const updateUserWithId = updateUser.bind(null, userId);

  return (
    <form action={updateUserWithId}>
      <input type="text" name="name" />
      <button type="submit">Update User Name</button>
    </form>
  );
}
```

### Q23: How do you handle validation and errors in Server Actions?

**Answer:**
Use `useActionState` hook for form state management:

```typescript
// app/actions.ts
"use server";

import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function createUser(prevState: any, formData: FormData) {
  const validatedFields = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid fields",
    };
  }

  // Create user...
  return { message: "User created successfully" };
}
```

```typescript
// app/form.tsx
"use client";

import { useActionState } from "react";
import { createUser } from "./actions";

export function Form() {
  const [state, formAction, pending] = useActionState(createUser, {
    message: "",
  });

  return (
    <form action={formAction}>
      <input type="email" name="email" required />
      <input type="password" name="password" required />

      {state?.message && <p aria-live="polite">{state.message}</p>}

      <button disabled={pending}>
        {pending ? "Creating..." : "Create User"}
      </button>
    </form>
  );
}
```

### Q24: How do you redirect after a Server Action?

**Answer:**
Use `redirect()` from `next/navigation`:

```typescript
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createPost(formData: FormData) {
  const title = formData.get("title");
  const content = formData.get("content");

  const post = await db.posts.create({ title, content });

  revalidatePath("/posts");
  redirect(`/post/${post.id}`);
}
```

**Note:** `redirect()` returns a 303 (See Other) status code for Server Actions.

### Q25: What are the security considerations for Server Actions?

**Answer:**

**1. Allowed Origins:**

```javascript
// next.config.js
module.exports = {
  experimental: {
    serverActions: {
      allowedOrigins: ["my-proxy.com", "*.my-proxy.com"],
    },
  },
};
```

**2. Body Size Limit:**

```javascript
// next.config.js
module.exports = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb", // Default: 1mb
    },
  },
};
```

**3. Automatic Security:**

- Next.js generates secure, non-deterministic IDs for Server Actions
- Unused actions are removed during build
- CSRF protection with origin checking
- Only same-origin requests allowed by default

---

## API Routes & Route Handlers

### Q26: How do you create API routes in the App Router?

**Answer:**
Create a `route.ts/js` file in the `app` directory:

```typescript
// app/api/hello/route.ts
export async function GET(request: Request) {
  return Response.json({ message: "Hello from Next.js!" });
}

export async function POST(request: Request) {
  const body = await request.json();
  // Process data
  return Response.json({ success: true });
}
```

**Supported HTTP methods:**

- GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS

### Q27: How do you handle dynamic API routes?

**Answer:**
Use dynamic segments in folder names:

```typescript
// app/api/posts/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const post = await db.posts.findById(id);

  return Response.json(post);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.posts.delete(id);

  return new Response(null, { status: 204 });
}
```

**Catch-all routes:**

```typescript
// app/api/posts/[...slug]/route.ts
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  // slug is an array: ['a', 'b', 'c']
  return Response.json({ slug });
}
```

### Q28: How do you handle errors in Route Handlers?

**Answer:**
Use try-catch blocks:

```typescript
// app/api/posts/route.ts
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const post = await db.posts.create(body);

    return Response.json(post, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";

    return Response.json({ error: message }, { status: 500 });
  }
}
```

### Q29: How do you configure Route Handler behavior?

**Answer:**

**Dynamic rendering:**

```typescript
export const dynamic = "force-dynamic"; // Always dynamic
export const dynamic = "force-static"; // Always static
```

**Revalidation:**

```typescript
export const revalidate = 60; // Revalidate every 60 seconds
```

**Runtime:**

```typescript
export const runtime = "edge"; // Edge runtime
export const runtime = "nodejs"; // Node.js runtime (default)
```

**Example:**

```typescript
// app/api/data/route.ts
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const data = await fetchFreshData();
  return Response.json(data);
}
```

### Q30: What's the difference between Pages Router API routes and App Router Route Handlers?

**Answer:**

| Feature          | Pages Router                           | App Router                               |
| ---------------- | -------------------------------------- | ---------------------------------------- |
| File location    | `pages/api/`                           | `app/api/`                               |
| File name        | `[name].ts`                            | `route.ts`                               |
| Request/Response | `NextApiRequest/NextApiResponse`       | Web `Request/Response`                   |
| Methods          | Single handler with `req.method` check | Separate named exports (GET, POST, etc.) |
| Middleware       | Custom middleware                      | Native Web APIs                          |
| Body parsing     | Automatic                              | Manual with `request.json()`             |

**Pages Router (old):**

```typescript
// pages/api/hello.ts
export default function handler(req, res) {
  if (req.method === "POST") {
    res.status(200).json({ message: "POST" });
  } else {
    res.status(200).json({ message: "GET" });
  }
}
```

**App Router (new):**

```typescript
// app/api/hello/route.ts
export async function GET() {
  return Response.json({ message: "GET" });
}

export async function POST() {
  return Response.json({ message: "POST" });
}
```

---

## Image Optimization

### Q31: How do you use the Next.js Image component?

**Answer:**
Import and use the `Image` component from `next/image`:

```typescript
import Image from "next/image";

export default function Page() {
  return (
    <div>
      {/* Local image */}
      <Image
        src="/profile.jpg"
        alt="Profile picture"
        width={500}
        height={500}
      />

      {/* Remote image */}
      <Image
        src="https://example.com/image.jpg"
        alt="Remote image"
        width={800}
        height={600}
      />
    </div>
  );
}
```

**Required props:**

- `src` - Image path or URL
- `alt` - Alternative text for accessibility
- `width` and `height` - Dimensions (or `fill` for responsive)

### Q32: How do you configure remote image domains?

**Answer:**
Use `remotePatterns` in `next.config.js`:

```javascript
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.vercel.com",
        port: "",
        pathname: "/image/upload/**",
      },
      {
        protocol: "https",
        hostname: "*.example.com", // Wildcard subdomain
      },
    ],
  },
};
```

**Security:** Only whitelisted domains can be optimized to prevent abuse.

### Q33: What are the different image optimization options?

**Answer:**

**1. Priority loading:**

```typescript
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority // Load immediately, no lazy loading
/>
```

**2. Quality:**

```typescript
<Image
  src="/photo.jpg"
  alt="Photo"
  width={800}
  height={600}
  quality={90} // Default: 75, range: 1-100
/>
```

**3. Placeholder:**

```typescript
<Image
  src="/photo.jpg"
  alt="Photo"
  width={800}
  height={600}
  placeholder="blur"
  blurDataURL="data:image/..." // Base64 encoded blur
/>
```

**4. Responsive images:**

```typescript
<Image
  src="/photo.jpg"
  alt="Photo"
  fill // Fill parent container
  style={{ objectFit: "cover" }}
/>
```

**5. Disable optimization:**

```typescript
<Image
  src="/logo.svg"
  alt="Logo"
  width={100}
  height={100}
  unoptimized // Skip optimization for SVG/small images
/>
```

### Q34: How do you create a custom image loader?

**Answer:**
Define a loader function for external image optimization services:

```typescript
// imageLoader.ts
"use client";

export default function myImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  return `https://example.com/${src}?w=${width}&q=${quality || 75}`;
}
```

```typescript
// page.tsx
import Image from "next/image";
import myImageLoader from "./imageLoader";

export default function Page() {
  return (
    <Image
      loader={myImageLoader}
      src="photo.jpg"
      alt="Photo"
      width={800}
      height={600}
    />
  );
}
```

**Global loader configuration:**

```javascript
// next.config.js
module.exports = {
  images: {
    loader: "custom",
    loaderFile: "./imageLoader.ts",
  },
};
```

---

## SEO & Metadata

### Q35: How do you configure page metadata in Next.js 16?

**Answer:**

**Static metadata:**

```typescript
// app/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Blog",
  description: "A blog about web development",
  keywords: ["Next.js", "React", "TypeScript"],
};

export default function Page() {
  return <div>Content</div>;
}
```

**Dynamic metadata:**

```typescript
// app/blog/[slug]/page.tsx
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetch(`https://api.example.com/posts/${slug}`).then(
    (res) => res.json()
  );

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Render page
}
```

### Q36: How do you configure Open Graph and Twitter metadata?

**Answer:**

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Article",
  description: "An interesting article",

  // Open Graph
  openGraph: {
    title: "My Article",
    description: "An interesting article",
    type: "article",
    publishedTime: "2025-01-01T00:00:00.000Z",
    authors: ["John Doe"],
    images: [
      {
        url: "https://example.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Article cover",
      },
    ],
  },

  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "My Article",
    description: "An interesting article",
    images: ["https://example.com/twitter-image.jpg"],
    creator: "@johndoe",
  },
};
```

### Q37: How do you configure robots.txt and sitemap?

**Answer:**

**Robots metadata:**

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};
```

**Static robots.txt:**

```txt
// public/robots.txt
User-agent: *
Allow: /
Disallow: /admin/

Sitemap: https://example.com/sitemap.xml
```

**Dynamic robots.txt:**

```typescript
// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin/",
    },
    sitemap: "https://example.com/sitemap.xml",
  };
}
```

**Dynamic sitemap:**

```typescript
// app/sitemap.ts
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await fetch("https://api.example.com/posts").then((res) =>
    res.json()
  );

  const postUrls = posts.map((post) => ({
    url: `https://example.com/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: "https://example.com",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: "https://example.com/about",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...postUrls,
  ];
}
```

### Q38: How do you configure canonical URLs and alternate languages?

**Answer:**

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://example.com/blog/post",
    languages: {
      "en-US": "https://example.com/en-US/blog/post",
      "de-DE": "https://example.com/de-DE/blog/post",
      "fr-FR": "https://example.com/fr-FR/blog/post",
    },
    media: {
      "only screen and (max-width: 600px)":
        "https://example.com/mobile/blog/post",
    },
    types: {
      "application/rss+xml": "https://example.com/rss",
    },
  },
};
```

**Generated HTML:**

```html
<link rel="canonical" href="https://example.com/blog/post" />
<link
  rel="alternate"
  hreflang="en-US"
  href="https://example.com/en-US/blog/post"
/>
<link
  rel="alternate"
  hreflang="de-DE"
  href="https://example.com/de-DE/blog/post"
/>
<link
  rel="alternate"
  media="only screen and (max-width: 600px)"
  href="https://example.com/mobile/blog/post"
/>
<link
  rel="alternate"
  type="application/rss+xml"
  href="https://example.com/rss"
/>
```

---

## Error Handling

### Q39: How do you handle errors in Server Components?

**Answer:**

**Expected errors (validation, not found):**

```typescript
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await fetch(`https://api.example.com/posts/${id}`);
  const post = await res.json();

  if (!res.ok) {
    return <div>Post not found</div>;
  }

  return <article>{post.content}</article>;
}
```

**With redirect:**

```typescript
import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await fetch(`https://api.example.com/posts/${id}`);

  if (!res.ok) {
    redirect("/404");
  }

  const post = await res.json();
  return <article>{post.content}</article>;
}
```

### Q40: How do you create custom error boundaries?

**Answer:**
Create an `error.tsx` file in any route segment:

```typescript
// app/blog/error.tsx
"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error(error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

**Error boundary hierarchy:**

- `app/error.tsx` - Catches errors in all routes
- `app/blog/error.tsx` - Catches errors in `/blog/*`
- `app/blog/[slug]/error.tsx` - Catches errors in `/blog/[slug]`

**Note:** Error boundaries must be Client Components (`'use client'`).

### Q41: How do you create a global not-found page?

**Answer:**

```typescript
// app/not-found.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not Found",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <a href="/">Go back home</a>
    </div>
  );
}
```

**Trigger not-found programmatically:**

```typescript
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound(); // Renders not-found.tsx
  }

  return <article>{post.content}</article>;
}
```

### Q42: How do you handle errors in Server Actions?

**Answer:**
Model errors as return values instead of throwing:

```typescript
// app/actions.ts
"use server";

export async function createPost(prevState: any, formData: FormData) {
  const title = formData.get("title");
  const content = formData.get("content");

  // Validation
  if (!title || title.length < 3) {
    return {
      error: "Title must be at least 3 characters",
      field: "title",
    };
  }

  try {
    const res = await fetch("https://api.example.com/posts", {
      method: "POST",
      body: JSON.stringify({ title, content }),
    });

    if (!res.ok) {
      return { error: "Failed to create post" };
    }

    return { success: true };
  } catch (error) {
    return { error: "Network error occurred" };
  }
}
```

```typescript
// app/form.tsx
"use client";

import { useActionState } from "react";
import { createPost } from "./actions";

export function Form() {
  const [state, formAction, pending] = useActionState(createPost, {
    error: null,
  });

  return (
    <form action={formAction}>
      <input type="text" name="title" />
      {state?.field === "title" && <p className="error">{state.error}</p>}

      <textarea name="content" />

      {state?.error && !state?.field && <p className="error">{state.error}</p>}

      <button disabled={pending}>
        {pending ? "Creating..." : "Create Post"}
      </button>
    </form>
  );
}
```

### Q43: How do you handle errors in event handlers?

**Answer:**
Use try-catch with state management:

```typescript
"use client";

import { useState } from "react";

export function Button() {
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    try {
      setError(null);
      const response = await fetch("/api/data");

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();
      // Process data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  return (
    <div>
      <button onClick={handleClick}>Fetch Data</button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

**Note:** Error boundaries don't catch errors in event handlers - you must handle them manually.

---

## Middleware & Proxy

### Q44: What is Middleware in Next.js and how has it changed in v16?

**Answer:**
In Next.js 16, the `middleware` export has been renamed to `proxy`:

**Before (Next.js 15):**

```typescript
// middleware.ts
export function middleware(request: Request) {
  // Handle request
}
```

**After (Next.js 16):**

```typescript
// proxy.ts
export function proxy(request: Request) {
  // Handle request
}
```

**Migration:** Run the codemod:

```bash
npx @next/codemod@canary middleware-to-proxy .
```

### Q45: How do you implement authentication with proxy?

**Answer:**

```typescript
// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token");

  // Protect routes
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

### Q46: How do you implement rewrites and redirects with proxy?

**Answer:**

**Rewrites (internal, URL stays same):**

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Rewrite /about to /about-2
  if (request.nextUrl.pathname === "/about") {
    return NextResponse.rewrite(new URL("/about-2", request.url));
  }

  // Proxy to external service
  if (request.nextUrl.pathname.startsWith("/api/external")) {
    return NextResponse.rewrite(
      new URL(request.nextUrl.pathname, "https://external-api.com")
    );
  }

  return NextResponse.next();
}
```

**Redirects (external, URL changes):**

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Redirect old URLs
  if (request.nextUrl.pathname === "/old-blog") {
    return NextResponse.redirect(new URL("/blog", request.url));
  }

  // Redirect based on locale
  const locale = request.cookies.get("locale")?.value || "en";
  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  return NextResponse.next();
}
```

### Q47: How do you configure proxy matcher?

**Answer:**

```typescript
// proxy.ts
export function proxy(request: NextRequest) {
  // Proxy logic
}

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    "/((?!api|_next/static|_next/image|favicon.ico).*)",

    // Or specific paths
    "/dashboard/:path*",
    "/admin/:path*",

    // Multiple matchers
    ["/about", "/contact", "/blog/:path*"],
  ],
};
```

**Matcher options:**

- `*` - Match any characters
- `:path` - Named parameter
- `:path*` - Catch-all
- Negative lookahead: `(?!pattern)` - Exclude patterns

### Q48: How do you implement rate limiting with proxy?

**Answer:**

```typescript
// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory rate limiter (use Redis in production)
const rateLimit = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = 10; // requests
const WINDOW = 60 * 1000; // 1 minute

export function proxy(request: NextRequest) {
  const ip = request.ip || "unknown";
  const now = Date.now();

  const userLimit = rateLimit.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimit.set(ip, {
      count: 1,
      resetTime: now + WINDOW,
    });
    return NextResponse.next();
  }

  if (userLimit.count >= RATE_LIMIT) {
    return new NextResponse("Too Many Requests", { status: 429 });
  }

  userLimit.count++;
  return NextResponse.next();
}
```

---

## Advanced Topics

### Q49: How do you implement internationalization (i18n)?

**Answer:**

**Route structure:**

```
app/
  [lang]/
    page.tsx
    layout.tsx
    blog/
      [slug]/
        page.tsx
```

**Root layout with language:**

```typescript
// app/[lang]/layout.tsx
export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "de" }, { lang: "fr" }];
}

export default function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  return children;
}
```

**Dictionary pattern:**

```typescript
// app/[lang]/page.tsx
const dictionaries = {
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  de: () => import("./dictionaries/de.json").then((m) => m.default),
};

export default async function Page({
  params,
}: {
  params: Promise<{ lang: "en" | "de" }>;
}) {
  const { lang } = await params;
  const dict = await dictionaries[lang]();

  return (
    <div>
      <h1>{dict.welcome}</h1>
      <p>{dict.description}</p>
    </div>
  );
}
```

### Q50: How do you implement streaming with Suspense?

**Answer:**

```typescript
import { Suspense } from "react";

export default function Page() {
  return (
    <div>
      {/* Immediately rendered */}
      <h1>My Dashboard</h1>

      {/* Streamed when ready */}
      <Suspense fallback={<UserSkeleton />}>
        <UserProfile />
      </Suspense>

      {/* Streamed independently */}
      <Suspense fallback={<PostsSkeleton />}>
        <RecentPosts />
      </Suspense>
    </div>
  );
}

async function UserProfile() {
  const user = await fetchUser(); // Slow query
  return <div>{user.name}</div>;
}

async function RecentPosts() {
  const posts = await fetchPosts(); // Another slow query
  return (
    <ul>
      {posts.map((p) => (
        <li key={p.id}>{p.title}</li>
      ))}
    </ul>
  );
}
```

**Benefits:**

- Faster Time to First Byte (TTFB)
- Progressive rendering
- Better perceived performance
- Independent loading states

### Q51: How do you implement optimistic updates?

**Answer:**

```typescript
"use client";

import { useOptimistic } from "react";
import { addTodo } from "./actions";

export function TodoList({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo: Todo) => [...state, newTodo]
  );

  async function handleSubmit(formData: FormData) {
    const title = formData.get("title") as string;

    // Optimistically add todo
    addOptimisticTodo({
      id: Date.now(),
      title,
      completed: false,
    });

    // Actually add todo
    await addTodo(formData);
  }

  return (
    <div>
      <form action={handleSubmit}>
        <input type="text" name="title" />
        <button type="submit">Add</button>
      </form>

      <ul>
        {optimisticTodos.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Q52: How do you implement draft mode for CMS preview?

**Answer:**

**Enable draft mode:**

```typescript
// app/api/draft/route.ts
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug");

  // Verify secret
  if (secret !== process.env.DRAFT_SECRET) {
    return new Response("Invalid token", { status: 401 });
  }

  // Enable draft mode
  const draft = await draftMode();
  draft.enable();

  // Redirect to preview page
  redirect(`/blog/${slug}`);
}
```

**Check draft mode in page:**

```typescript
// app/blog/[slug]/page.tsx
import { draftMode } from "next/headers";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const draft = await draftMode();

  // Fetch draft or published content
  const post = await getPost(slug, draft.isEnabled);

  return (
    <article>
      {draft.isEnabled && (
        <div className="draft-banner">Draft Mode Enabled</div>
      )}
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </article>
  );
}
```

**Disable draft mode:**

```typescript
// app/api/disable-draft/route.ts
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

export async function GET() {
  const draft = await draftMode();
  draft.disable();
  redirect("/");
}
```

### Q53: How do you implement parallel routes and intercepting routes?

**Answer:**

**Parallel Routes** - Render multiple pages in the same layout:

```
app/
  @analytics/
    page.tsx
  @team/
    page.tsx
  layout.tsx
  page.tsx
```

```typescript
// app/layout.tsx
export default function Layout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  team: React.ReactNode;
}) {
  return (
    <div>
      <div>{children}</div>
      <div className="sidebar">
        {analytics}
        {team}
      </div>
    </div>
  );
}
```

**Intercepting Routes** - Intercept navigation to show modal:

```
app/
  photos/
    [id]/
      page.tsx
  @modal/
    (.)photos/
      [id]/
        page.tsx
  layout.tsx
```

```typescript
// app/layout.tsx
export default function Layout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
```

```typescript
// app/@modal/(.)photos/[id]/page.tsx
import Modal from "@/components/modal";

export default async function PhotoModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const photo = await getPhoto(id);

  return (
    <Modal>
      <img src={photo.url} alt={photo.title} />
    </Modal>
  );
}
```

**Intercepting patterns:**

- `(.)` - Same level
- `(..)` - One level up
- `(..)(..)` - Two levels up
- `(...)` - From root

### Q54: How do you implement route groups?

**Answer:**
Route groups organize routes without affecting URL structure using `(folder)`:

```
app/
  (marketing)/
    about/
      page.tsx
    contact/
      page.tsx
    layout.tsx
  (shop)/
    products/
      page.tsx
    cart/
      page.tsx
    layout.tsx
  layout.tsx
```

**URLs:**

- `/about` (not `/marketing/about`)
- `/products` (not `/shop/products`)

**Use cases:**

- Organize routes by section
- Apply different layouts to route groups
- Create multiple root layouts

```typescript
// app/(marketing)/layout.tsx
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <nav>{/* Marketing nav */}</nav>
      {children}
    </div>
  );
}
```

```typescript
// app/(shop)/layout.tsx
export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <nav>{/* Shop nav */}</nav>
      {children}
    </div>
  );
}
```

### Q55: How do you implement custom 404 and 500 pages?

**Answer:**

**Custom 404:**

```typescript
// app/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <p>Could not find the requested resource</p>
      <a href="/">Return Home</a>
    </div>
  );
}
```

**Custom 500 (global error):**

```typescript
// app/global-error.tsx
"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h1>500 - Something went wrong!</h1>
        <p>{error.message}</p>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
```

**Note:** `global-error.tsx` must include `<html>` and `<body>` tags.

### Q56: How do you implement loading states?

**Answer:**

**Route-level loading:**

```typescript
// app/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="loading">
      <div className="spinner" />
      <p>Loading dashboard...</p>
    </div>
  );
}
```

**Component-level with Suspense:**

```typescript
// app/dashboard/page.tsx
import { Suspense } from "react";

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>

      <Suspense fallback={<StatsSkeleton />}>
        <Stats />
      </Suspense>

      <Suspense fallback={<ChartSkeleton />}>
        <Chart />
      </Suspense>
    </div>
  );
}
```

**Instant loading with useTransition:**

```typescript
"use client";

import { useTransition } from "react";
import { updateUser } from "./actions";

export function Form() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await updateUser(formData);
    });
  };

  return (
    <form action={handleSubmit}>
      <input type="text" name="name" />
      <button disabled={isPending}>{isPending ? "Saving..." : "Save"}</button>
    </form>
  );
}
```

### Q57: What are the key differences between Next.js 15 and 16?

**Answer:**

| Feature              | Next.js 15          | Next.js 16                |
| -------------------- | ------------------- | ------------------------- |
| **Middleware**       | `middleware` export | `proxy` export (renamed)  |
| **PPR**              | `experimental.ppr`  | `cacheComponents`         |
| **Async params**     | Synchronous         | Asynchronous (must await) |
| **Cache Components** | Experimental        | Stable with `'use cache'` |
| **React**            | React 18            | React 19                  |
| **Turbopack**        | Beta                | Stable                    |

**Breaking changes:**

1. Rename `middleware` to `proxy`
2. Await `params` and `searchParams`
3. Update `experimental.ppr` to `cacheComponents`

**Migration:**

```bash
# Run codemods
npx @next/codemod@canary upgrade latest
npx @next/codemod@canary middleware-to-proxy .
```

### Q58: How do you optimize performance in Next.js 16?

**Answer:**

**1. Use Server Components by default:**

```typescript
// Automatically server-rendered, no JS sent to client
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```

**2. Implement code splitting with dynamic imports:**

```typescript
import dynamic from "next/dynamic";

const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => <p>Loading...</p>,
  ssr: false, // Disable SSR for client-only components
});

export default function Page() {
  return <HeavyComponent />;
}
```

**3. Use Suspense for streaming:**

```typescript
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<Skeleton />}>
      <SlowComponent />
    </Suspense>
  );
}
```

**4. Optimize images:**

```typescript
import Image from "next/image";

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority // Load immediately for LCP
  placeholder="blur"
/>;
```

**5. Implement caching strategies:**

```typescript
// Static with revalidation
export const revalidate = 3600;

// Or per-fetch
const data = await fetch("...", {
  next: { revalidate: 3600 },
});
```

**6. Use `'use cache'` for expensive operations:**

```typescript
export async function getExpensiveData() {
  "use cache";
  cacheLife("hours");

  return await expensiveOperation();
}
```

**7. Prefetch links:**

```typescript
import Link from "next/link";

<Link href="/dashboard" prefetch={true}>
  Dashboard
</Link>;
```

**8. Bundle analysis:**

```bash
npm run build -- --profile
```

### Q59: How do you implement authentication patterns?

**Answer:**

**Session-based with cookies:**

```typescript
// app/actions.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  const user = await verifyCredentials(email, password);

  if (!user) {
    return { error: "Invalid credentials" };
  }

  const session = await createSession(user.id);
  const cookieStore = await cookies();

  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  redirect("/dashboard");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/login");
}
```

**Protected routes with proxy:**

```typescript
// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const session = request.cookies.get("session");

  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Verify session
    const isValid = await verifySession(session.value);
    if (!isValid) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}
```

**Get current user in Server Component:**

```typescript
import { cookies } from "next/headers";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  if (!session) return null;

  return await getUserFromSession(session.value);
}

export default async function Dashboard() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <div>Welcome, {user.name}</div>;
}
```

### Q60: How do you implement testing in Next.js?

**Answer:**

**Unit testing with Jest:**

```typescript
// __tests__/page.test.tsx
import { render, screen } from "@testing-library/react";
import Page from "@/app/page";

describe("Page", () => {
  it("renders heading", () => {
    render(<Page />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
  });
});
```

**Testing Server Actions:**

```typescript
// __tests__/actions.test.ts
import { createPost } from "@/app/actions";

describe("createPost", () => {
  it("creates a post", async () => {
    const formData = new FormData();
    formData.append("title", "Test Post");
    formData.append("content", "Test content");

    const result = await createPost(null, formData);

    expect(result.success).toBe(true);
  });
});
```

**E2E testing with Playwright:**

```typescript
// e2e/home.spec.ts
import { test, expect } from "@playwright/test";

test("homepage loads", async ({ page }) => {
  await page.goto("http://localhost:3000");

  await expect(page.locator("h1")).toContainText("Welcome");
});

test("navigation works", async ({ page }) => {
  await page.goto("http://localhost:3000");

  await page.click("text=About");
  await expect(page).toHaveURL("http://localhost:3000/about");
});
```

**Jest configuration:**

```javascript
// jest.config.js
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

module.exports = createJestConfig(customJestConfig);
```

---

## Bonus Questions

### Q61: What is the difference between `revalidateTag` and `updateTag`?

**Answer:**

| Feature      | revalidateTag                         | updateTag            |
| ------------ | ------------------------------------- | -------------------- |
| **Context**  | Server Actions, Route Handlers        | Server Actions only  |
| **Behavior** | Stale-while-revalidate (with `'max'`) | Immediate expiration |
| **Use case** | Background revalidation               | Read-your-own-writes |
| **Syntax**   | `revalidateTag('posts', 'max')`       | `updateTag('posts')` |

```typescript
// revalidateTag - Recommended for most cases
'use server'
import { revalidateTag } from 'next/cache'

export async function createPost() {
  await db.posts.create(...)
  revalidateTag('posts', 'max') // Stale-while-revalidate
}

// updateTag - For immediate visibility
'use server'
import { updateTag } from 'next/cache'

export async function createPost() {
  await db.posts.create(...)
  updateTag('posts') // Immediate expiration
}
```

### Q62: How do you implement A/B testing?

**Answer:**

```typescript
// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Get or set variant cookie
  let variant = request.cookies.get("ab-test-variant")?.value;

  if (!variant) {
    // Randomly assign variant
    variant = Math.random() < 0.5 ? "A" : "B";
  }

  const response = NextResponse.next();

  // Set variant cookie
  response.cookies.set("ab-test-variant", variant, {
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  // Add variant to headers for use in components
  response.headers.set("x-ab-test-variant", variant);

  return response;
}
```

```typescript
// app/page.tsx
import { headers } from "next/headers";

export default async function Page() {
  const headersList = await headers();
  const variant = headersList.get("x-ab-test-variant");

  return (
    <div>
      {variant === "A" ? (
        <h1>Welcome to Version A</h1>
      ) : (
        <h1>Welcome to Version B</h1>
      )}
    </div>
  );
}
```

### Q63: How do you implement feature flags?

**Answer:**

```typescript
// lib/features.ts
export const features = {
  newDashboard: process.env.FEATURE_NEW_DASHBOARD === "true",
  betaFeatures: process.env.FEATURE_BETA === "true",
};

// Or from database/API
export async function getFeatureFlags(userId?: string) {
  const flags = await db.featureFlags.findMany({
    where: userId ? { userId } : { global: true },
  });

  return flags.reduce(
    (acc, flag) => ({
      ...acc,
      [flag.name]: flag.enabled,
    }),
    {}
  );
}
```

```typescript
// app/dashboard/page.tsx
import { features } from "@/lib/features";
import NewDashboard from "./new-dashboard";
import OldDashboard from "./old-dashboard";

export default function Dashboard() {
  return features.newDashboard ? <NewDashboard /> : <OldDashboard />;
}
```

**With user-specific flags:**

```typescript
export default async function Dashboard() {
  const user = await getCurrentUser();
  const flags = await getFeatureFlags(user.id);

  return (
    <div>
      {flags.newDashboard && <NewFeature />}
      {flags.betaFeatures && <BetaSection />}
    </div>
  );
}
```

### Q64: How do you implement webhooks?

**Answer:**

```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from "next/headers";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return new Response(
      `Webhook Error: ${err instanceof Error ? err.message : "Unknown"}`,
      { status: 400 }
    );
  }

  // Handle event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      await handlePaymentSuccess(paymentIntent);
      break;

    case "customer.subscription.updated":
      const subscription = event.data.object;
      await handleSubscriptionUpdate(subscription);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
  });
}

// Disable body parsing for webhooks
export const config = {
  api: {
    bodyParser: false,
  },
};
```

### Q65: How do you implement background jobs?

**Answer:**

**Using Route Handlers with cron:**

```typescript
// app/api/cron/cleanup/route.ts
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Perform cleanup
  await db.sessions.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  return Response.json({ success: true });
}
```

**Vercel Cron configuration:**

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 0 * * *"
    }
  ]
}
```

**Using Server Actions with queues:**

```typescript
// app/actions.ts
"use server";

import { Queue } from "bullmq";

const emailQueue = new Queue("emails", {
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT!),
  },
});

export async function sendWelcomeEmail(userId: string) {
  await emailQueue.add("welcome", {
    userId,
    timestamp: Date.now(),
  });

  return { success: true };
}
```

### Q66: How do you implement real-time features?

**Answer:**

**Using Server-Sent Events (SSE):**

```typescript
// app/api/events/route.ts
export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial data
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`)
      );

      // Send updates every 5 seconds
      const interval = setInterval(() => {
        const data = { type: "update", timestamp: Date.now() };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }, 5000);

      // Cleanup on close
      return () => clearInterval(interval);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

```typescript
// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [updates, setUpdates] = useState<any[]>([]);

  useEffect(() => {
    const eventSource = new EventSource("/api/events");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setUpdates((prev) => [...prev, data]);
    };

    return () => eventSource.close();
  }, []);

  return (
    <div>
      <h1>Real-time Updates</h1>
      <ul>
        {updates.map((update, i) => (
          <li key={i}>{JSON.stringify(update)}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Q67: How do you implement file uploads?

**Answer:**

```typescript
// app/api/upload/route.ts
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return Response.json({ error: "Invalid file type" }, { status: 400 });
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    return Response.json({ error: "File too large" }, { status: 400 });
  }

  // Save file
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filename = `${Date.now()}-${file.name}`;
  const path = join(process.cwd(), "public/uploads", filename);

  await writeFile(path, buffer);

  return Response.json({
    success: true,
    url: `/uploads/${filename}`,
  });
}
```

```typescript
// app/upload/page.tsx
"use client";

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      setUrl(data.url);
    }

    setUploading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        accept="image/*"
      />
      <button type="submit" disabled={!file || uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {url && <img src={url} alt="Uploaded" />}
    </form>
  );
}
```

---

## Summary

This comprehensive guide covers all major topics in Next.js 16:

✅ **App Router & Routing** - File-based routing, dynamic routes, generateStaticParams
✅ **Server & Client Components** - Component types, data passing, composition patterns
✅ **Data Fetching** - Parallel/sequential fetching, SWR, Route Handlers
✅ **Caching & Revalidation** - Cache layers, revalidation strategies, 'use cache' directive
✅ **SSR, SSG, ISR & PPR** - Rendering strategies, cacheComponents, Suspense
✅ **Server Actions** - Form handling, validation, security
✅ **API Routes** - Route Handlers, dynamic routes, error handling
✅ **Image Optimization** - Image component, remote patterns, custom loaders
✅ **SEO & Metadata** - Static/dynamic metadata, Open Graph, sitemaps
✅ **Error Handling** - Error boundaries, not-found pages, Server Action errors
✅ **Middleware & Proxy** - Authentication, rewrites, redirects, rate limiting
✅ **Advanced Topics** - i18n, streaming, optimistic updates, draft mode, testing

**Key Changes in Next.js 16:**

- `middleware` → `proxy` (renamed)
- `experimental.ppr` → `cacheComponents`
- Async `params` and `searchParams`
- Stable `'use cache'` directive
- React 19 support
- Stable Turbopack

**Best Practices:**

1. Use Server Components by default
2. Keep Client Components small and nested
3. Implement proper caching strategies
4. Use Suspense for streaming
5. Optimize images with next/image
6. Configure proper metadata for SEO
7. Handle errors gracefully
8. Test thoroughly

---

**Resources:**

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js GitHub](https://github.com/vercel/next.js)
- [Next.js Examples](https://github.com/vercel/next.js/tree/canary/examples)
