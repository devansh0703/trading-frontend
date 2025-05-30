import { pgTable, text, serial, integer, boolean, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const trendlines = pgTable("trendlines", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  startTimestamp: integer("start_timestamp").notNull(),
  startPrice: real("start_price").notNull(),
  endTimestamp: integer("end_timestamp").notNull(),
  endPrice: real("end_price").notNull(),
  color: text("color").default("#2962FF"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTrendlineSchema = createInsertSchema(trendlines).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTrendline = z.infer<typeof insertTrendlineSchema>;
export type Trendline = typeof trendlines.$inferSelect;

// Chart data types
export interface OHLCData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TrendlinePoint {
  timestamp: number;
  price: number;
  x: number;
  y: number;
}

export interface TrendlineData {
  id: string;
  start: TrendlinePoint;
  end: TrendlinePoint;
  color: string;
  series?: any; // Lightweight Charts series reference
}
