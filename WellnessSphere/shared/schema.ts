import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  aiCompanionName: text("ai_companion_name").default("Lily"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Diary entries table
export const diaryEntries = pgTable("diary_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  title: text("title"),
  createdAt: timestamp("created_at").defaultNow(),
  mood: text("mood"),
});

// Todo items table
export const todos = pgTable("todos", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  completed: boolean("completed").default(false),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow(),
  dueDate: timestamp("due_date"),
});

// Goals table
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  target: integer("target").notNull(),
  current: integer("current").default(0),
  unit: text("unit"),
  createdAt: timestamp("created_at").defaultNow(),
  deadline: timestamp("deadline"),
});

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isAi: boolean("is_ai").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Mood entries table
export const moodEntries = pgTable("mood_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  mood: text("mood").notNull(),
  score: integer("score").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Settings table
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  theme: text("theme").default("light"),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  aiSettings: json("ai_settings").$type<{
    name: string;
    avatar: string;
  }>(),
});

// Schemas for form validation and insertion
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
});

export const insertDiaryEntrySchema = createInsertSchema(diaryEntries).pick({
  content: true,
  title: true,
  mood: true,
});

export const insertTodoSchema = createInsertSchema(todos).pick({
  content: true,
  category: true,
  dueDate: true,
});

export const insertGoalSchema = createInsertSchema(goals).pick({
  title: true,
  description: true,
  target: true,
  unit: true,
  deadline: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  content: true,
});

export const insertMoodEntrySchema = createInsertSchema(moodEntries).pick({
  mood: true,
  score: true,
  note: true,
});

export const insertSettingsSchema = createInsertSchema(settings).pick({
  theme: true,
  notificationsEnabled: true,
  aiSettings: true,
});

// Types for use in the application
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDiaryEntry = z.infer<typeof insertDiaryEntrySchema>;
export type DiaryEntry = typeof diaryEntries.$inferSelect;

export type InsertTodo = z.infer<typeof insertTodoSchema>;
export type Todo = typeof todos.$inferSelect;

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type InsertMoodEntry = z.infer<typeof insertMoodEntrySchema>;
export type MoodEntry = typeof moodEntries.$inferSelect;

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;
