import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/drizzle/schema";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Get DATABASE_URL from environment or construct it
const DATABASE_URL =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

// Create a connection pool
const pool = new Pool({
  connectionString: DATABASE_URL,
});

// Create drizzle instance
const db = drizzle(pool, { schema });

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log("Clearing existing posts...");
  await db.delete(schema.posts);
  console.log("Clearing existing users...");
  await db.delete(schema.users);

  // Insert sample users
  console.log("\n📝 Inserting users...");
  const userData = [
    {
      name: "John Doe",
      email: "john@example.com",
      passwordHash: "hashed_password_123",
    },
    {
      name: "Jane Smith",
      email: "jane@example.com",
      passwordHash: "hashed_password_456",
    },
    {
      name: "Bob Johnson",
      email: "bob@example.com",
      passwordHash: "hashed_password_789",
    },
    {
      name: "Alice Williams",
      email: "alice@example.com",
      passwordHash: "hashed_password_abc",
    },
    {
      name: "Charlie Brown",
      email: "charlie@example.com",
      passwordHash: "hashed_password_def",
    },
  ];

  const insertedUsers = await db
    .insert(schema.users)
    .values(userData)
    .returning();

  console.log(`✅ Inserted ${insertedUsers.length} users`);

  // Insert sample posts
  console.log("\n📄 Inserting posts...");
  const postData = [
    {
      userId: insertedUsers[0].id,
      title: "Getting Started with Next.js",
      content:
        "Next.js is a powerful React framework that makes it easy to build server-side rendered applications. In this post, we'll explore the basics of Next.js and how to get started with your first project.",
      published: 1,
    },
    {
      userId: insertedUsers[0].id,
      title: "Understanding Drizzle ORM",
      content:
        "Drizzle ORM is a lightweight, TypeScript-first ORM that provides a great developer experience. Let's dive into its features and see how it compares to other ORMs.",
      published: 1,
    },
    {
      userId: insertedUsers[1].id,
      title: "Building RESTful APIs with TypeScript",
      content:
        "TypeScript has become the go-to choice for building robust APIs. This guide covers best practices for designing and implementing RESTful APIs using TypeScript.",
      published: 1,
    },
    {
      userId: insertedUsers[1].id,
      title: "Database Design Patterns",
      content:
        "Good database design is crucial for application performance and scalability. Here are some common patterns and anti-patterns to avoid.",
      published: 0,
    },
    {
      userId: insertedUsers[2].id,
      title: "Frontend Performance Optimization",
      content:
        "Learn how to optimize your frontend applications for better performance. We'll cover lazy loading, code splitting, and other optimization techniques.",
      published: 1,
    },
    {
      userId: insertedUsers[2].id,
      title: "State Management in React",
      content:
        "Managing state effectively is key to building scalable React applications. Explore different state management solutions and when to use each.",
      published: 0,
    },
    {
      userId: insertedUsers[3].id,
      title: "Authentication Best Practices",
      content:
        "Security should always be a top priority. This post covers authentication best practices including password hashing, JWT tokens, and session management.",
      published: 1,
    },
    {
      userId: insertedUsers[3].id,
      title: "Testing Strategies for Modern Web Apps",
      content:
        "A comprehensive guide to testing modern web applications. We'll discuss unit tests, integration tests, and end-to-end testing strategies.",
      published: 0,
    },
    {
      userId: insertedUsers[4].id,
      title: "Deploying to Production",
      content:
        "Preparing your application for production deployment involves many considerations. Learn about environment configuration, CI/CD pipelines, and monitoring.",
      published: 1,
    },
    {
      userId: insertedUsers[4].id,
      title: "The Future of Web Development",
      content:
        "Web development continues to evolve rapidly. Explore emerging trends and technologies that are shaping the future of web development.",
      published: 0,
    },
  ];

  const insertedPosts = await db
    .insert(schema.posts)
    .values(postData)
    .returning();

  console.log(`✅ Inserted ${insertedPosts.length} posts`);

  // Display summary
  console.log("\n📊 Seeding Summary:");
  console.log(`   Users: ${insertedUsers.length}`);
  console.log(`   Posts: ${insertedPosts.length}`);

  // Show published vs unpublished posts
  const publishedCount = insertedPosts.filter((p) => p.published === 1).length;
  const unpublishedCount = insertedPosts.filter((p) => p.published === 0).length;
  console.log(`   Published: ${publishedCount}`);
  console.log(`   Unpublished: ${unpublishedCount}`);

  console.log("\n✨ Seeding completed successfully!");

  // Close connection
  await pool.end();
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  });
