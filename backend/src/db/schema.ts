import { integer, text, sqliteTable } from "drizzle-orm/sqlite-core";
import { status } from "elysia";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
});

export const products = sqliteTable("products", {
  shopId: integer("shop_id").primaryKey(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  link: text("link").notNull(),
  categories: text("categories"), // Store as JSON string
  downloadable: integer("downloadable").default(0),
});

// Helper functions for JSON approach
function categoriesToJson(
  categories: Array<{ id: number; name: string; slug: string }>,
): string {
  return JSON.stringify(categories);
}

function categoriesFromJson(
  jsonString: string | null,
): Array<{ id: number; name: string; slug: string }> {
  return jsonString ? JSON.parse(jsonString) : [];
}

export const agentSessions = sqliteTable("agent_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt: integer("created_at").notNull(),
  status: text("status", ["active", "inactive"]).notNull(),
  toolCallCount: integer("tool_call_count").default(0),
  toolsUsed: integer("tools_used").default(0),
  toolCallsSuccessful: integer("tool_calls_successful").default(0),
  toolCallsFailed: integer("tool_calls_failed").default(0),
  totalTokenInput: integer("total_token_input").default(0),
  totalTokensOutput: integer("total_tokens_output").default(0),
  averageResponseTime: integer("average_response_time").default(0),
  //if user provided personal information
  userProvidedInfo: text("user_provided_info").default(""),
  //if conversation required escalated handling
  humanEscalated: integer("human_escalated").default(0),
  //if user booked a calendar event
  calendarBooking: integer("calendar_booking").default(0),
  userSatisfactionRating: integer("user_satisfaction").default(0),
  userFeedback: text("user_feedback").default(""),
  transcript: text("transcript").default(""),
});
