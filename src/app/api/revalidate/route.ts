import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// API Route for on-demand revalidation (ISR)
// This demonstrates how to manually trigger revalidation
// without waiting for the time-based revalidation period

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, secret } = body;

    // Optional: Add secret token for security
    // Uncomment and set REVALIDATE_SECRET in your .env
    // if (secret !== process.env.REVALIDATE_SECRET) {
    //   return NextResponse.json(
    //     { message: "Invalid secret token" },
    //     { status: 401 }
    //   );
    // }

    if (!path) {
      return NextResponse.json(
        { message: "Path is required" },
        { status: 400 }
      );
    }

    // Revalidate the specified path
    revalidatePath(path);

    return NextResponse.json({
      revalidated: true,
      path,
      now: Date.now(),
      message: `Successfully revalidated ${path}`,
    });
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json(
      { message: "Error revalidating", error: String(error) },
      { status: 500 }
    );
  }
}

// Example usage:
// POST /api/revalidate
// Body: { "path": "/isr/posts" }
// or
// Body: { "path": "/isr/posts/[post-id]" }
