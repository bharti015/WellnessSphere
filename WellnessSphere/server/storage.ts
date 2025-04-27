import { 
  users, type User, type InsertUser,
  diaryEntries, type DiaryEntry, type InsertDiaryEntry,
  todos, type Todo, type InsertTodo,
  goals, type Goal, type InsertGoal,
  chatMessages, type ChatMessage, type InsertChatMessage,
  moodEntries, type MoodEntry, type InsertMoodEntry,
  settings, type Settings, type InsertSettings
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db, pool } from './db';
import { eq } from 'drizzle-orm';

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;

  // Diary methods
  getDiaryEntries(userId: number): Promise<DiaryEntry[]>;
  getDiaryEntry(id: number): Promise<DiaryEntry | undefined>;
  createDiaryEntry(userId: number, entry: InsertDiaryEntry): Promise<DiaryEntry>;
  updateDiaryEntry(id: number, updates: Partial<DiaryEntry>): Promise<DiaryEntry>;
  deleteDiaryEntry(id: number): Promise<void>;

  // Todo methods
  getTodos(userId: number): Promise<Todo[]>;
  getTodo(id: number): Promise<Todo | undefined>;
  createTodo(userId: number, todo: InsertTodo): Promise<Todo>;
  updateTodo(id: number, updates: Partial<Todo>): Promise<Todo>;
  deleteTodo(id: number): Promise<void>;

  // Goal methods
  getGoals(userId: number): Promise<Goal[]>;
  getGoal(id: number): Promise<Goal | undefined>;
  createGoal(userId: number, goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, updates: Partial<Goal>): Promise<Goal>;
  deleteGoal(id: number): Promise<void>;

  // Chat methods
  getChatMessages(userId: number): Promise<ChatMessage[]>;
  createChatMessage(userId: number, message: InsertChatMessage, isAi: boolean): Promise<ChatMessage>;

  // Mood methods
  getMoodEntries(userId: number): Promise<MoodEntry[]>;
  getMoodEntry(id: number): Promise<MoodEntry | undefined>;
  createMoodEntry(userId: number, entry: InsertMoodEntry): Promise<MoodEntry>;

  // Settings methods
  getSettings(userId: number): Promise<Settings | undefined>;
  updateSettings(userId: number, updates: Partial<InsertSettings>): Promise<Settings>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const timestamp = new Date();
    const [user] = await db
      .insert(users)
      .values({ 
        ...insertUser, 
        aiCompanionName: "Lily", 
        createdAt: timestamp 
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    
    if (!updatedUser) throw new Error(`User with id ${id} not found`);
    return updatedUser;
  }

  async getDiaryEntries(userId: number): Promise<DiaryEntry[]> {
    return await db
      .select()
      .from(diaryEntries)
      .where(eq(diaryEntries.userId, userId))
      .orderBy(diaryEntries.createdAt);
  }

  async getDiaryEntry(id: number): Promise<DiaryEntry | undefined> {
    const [entry] = await db
      .select()
      .from(diaryEntries)
      .where(eq(diaryEntries.id, id));
    return entry || undefined;
  }

  async createDiaryEntry(userId: number, entry: InsertDiaryEntry): Promise<DiaryEntry> {
    const timestamp = new Date();
    const [diaryEntry] = await db
      .insert(diaryEntries)
      .values({ ...entry, userId, createdAt: timestamp })
      .returning();
    return diaryEntry;
  }

  async updateDiaryEntry(id: number, updates: Partial<DiaryEntry>): Promise<DiaryEntry> {
    const [updatedEntry] = await db
      .update(diaryEntries)
      .set(updates)
      .where(eq(diaryEntries.id, id))
      .returning();
    
    if (!updatedEntry) throw new Error(`Diary entry with id ${id} not found`);
    return updatedEntry;
  }

  async deleteDiaryEntry(id: number): Promise<void> {
    await db
      .delete(diaryEntries)
      .where(eq(diaryEntries.id, id));
  }

  async getTodos(userId: number): Promise<Todo[]> {
    return await db
      .select()
      .from(todos)
      .where(eq(todos.userId, userId))
      .orderBy(todos.createdAt);
  }

  async getTodo(id: number): Promise<Todo | undefined> {
    const [todo] = await db
      .select()
      .from(todos)
      .where(eq(todos.id, id));
    return todo || undefined;
  }

  async createTodo(userId: number, todo: InsertTodo): Promise<Todo> {
    const timestamp = new Date();
    const [newTodo] = await db
      .insert(todos)
      .values({ 
        ...todo, 
        userId, 
        completed: false, 
        createdAt: timestamp 
      })
      .returning();
    return newTodo;
  }

  async updateTodo(id: number, updates: Partial<Todo>): Promise<Todo> {
    const [updatedTodo] = await db
      .update(todos)
      .set(updates)
      .where(eq(todos.id, id))
      .returning();
    
    if (!updatedTodo) throw new Error(`Todo with id ${id} not found`);
    return updatedTodo;
  }

  async deleteTodo(id: number): Promise<void> {
    await db
      .delete(todos)
      .where(eq(todos.id, id));
  }

  async getGoals(userId: number): Promise<Goal[]> {
    return await db
      .select()
      .from(goals)
      .where(eq(goals.userId, userId))
      .orderBy(goals.createdAt);
  }

  async getGoal(id: number): Promise<Goal | undefined> {
    const [goal] = await db
      .select()
      .from(goals)
      .where(eq(goals.id, id));
    return goal || undefined;
  }

  async createGoal(userId: number, goal: InsertGoal): Promise<Goal> {
    const timestamp = new Date();
    const [newGoal] = await db
      .insert(goals)
      .values({ 
        ...goal, 
        userId, 
        current: 0, 
        createdAt: timestamp 
      })
      .returning();
    return newGoal;
  }

  async updateGoal(id: number, updates: Partial<Goal>): Promise<Goal> {
    const [updatedGoal] = await db
      .update(goals)
      .set(updates)
      .where(eq(goals.id, id))
      .returning();
    
    if (!updatedGoal) throw new Error(`Goal with id ${id} not found`);
    return updatedGoal;
  }

  async deleteGoal(id: number): Promise<void> {
    await db
      .delete(goals)
      .where(eq(goals.id, id));
  }

  async getChatMessages(userId: number): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(chatMessages.createdAt);
  }

  async createChatMessage(userId: number, message: InsertChatMessage, isAi: boolean): Promise<ChatMessage> {
    const timestamp = new Date();
    const [chatMessage] = await db
      .insert(chatMessages)
      .values({ 
        ...message, 
        userId, 
        isAi, 
        createdAt: timestamp 
      })
      .returning();
    return chatMessage;
  }

  async getMoodEntries(userId: number): Promise<MoodEntry[]> {
    return await db
      .select()
      .from(moodEntries)
      .where(eq(moodEntries.userId, userId))
      .orderBy(moodEntries.createdAt);
  }

  async getMoodEntry(id: number): Promise<MoodEntry | undefined> {
    const [entry] = await db
      .select()
      .from(moodEntries)
      .where(eq(moodEntries.id, id));
    return entry || undefined;
  }

  async createMoodEntry(userId: number, entry: InsertMoodEntry): Promise<MoodEntry> {
    const timestamp = new Date();
    const [moodEntry] = await db
      .insert(moodEntries)
      .values({ ...entry, userId, createdAt: timestamp })
      .returning();
    return moodEntry;
  }

  async getSettings(userId: number): Promise<Settings | undefined> {
    const [setting] = await db
      .select()
      .from(settings)
      .where(eq(settings.userId, userId));
    return setting || undefined;
  }

  async updateSettings(userId: number, updates: Partial<InsertSettings>): Promise<Settings> {
    let setting = await this.getSettings(userId);
    
    if (!setting) {
      // Create default settings if they don't exist
      const [newSetting] = await db
        .insert(settings)
        .values({
          userId,
          theme: "light",
          notificationsEnabled: true,
          aiSettings: {
            name: "Lily",
            avatar: "robot"
          }
        })
        .returning();
      return newSetting;
    }
    
    const [updatedSettings] = await db
      .update(settings)
      .set(updates)
      .where(eq(settings.id, setting.id))
      .returning();
    
    return updatedSettings;
  }
}

export const storage = new DatabaseStorage();