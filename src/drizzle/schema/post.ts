import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { users } from "./user";

export const posts = pgTable("posts", {
  id,
  createdAt,
  updatedAt,
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  published: integer("published").default(0).notNull(), // 0 = false, 1 = true
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
