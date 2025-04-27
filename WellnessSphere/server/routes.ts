import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertDiaryEntrySchema, 
  insertTodoSchema, 
  insertGoalSchema, 
  insertChatMessageSchema, 
  insertMoodEntrySchema,
  insertSettingsSchema
} from "@shared/schema";

// Helper function to ensure user is authenticated
function ensureAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Diary routes
  app.get("/api/diary", ensureAuthenticated, async (req, res) => {
    try {
      const entries = await storage.getDiaryEntries(req.user!.id);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: `Error fetching diary entries: ${error.message}` });
    }
  });

  app.get("/api/diary/:id", ensureAuthenticated, async (req, res) => {
    try {
      const entry = await storage.getDiaryEntry(Number(req.params.id));
      if (!entry) {
        return res.status(404).json({ message: "Diary entry not found" });
      }
      
      if (entry.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: `Error fetching diary entry: ${error.message}` });
    }
  });

  app.post("/api/diary", ensureAuthenticated, async (req, res) => {
    try {
      const validatedData = insertDiaryEntrySchema.parse(req.body);
      const entry = await storage.createDiaryEntry(req.user!.id, validatedData);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: `Error creating diary entry: ${error.message}` });
    }
  });

  app.put("/api/diary/:id", ensureAuthenticated, async (req, res) => {
    try {
      const entry = await storage.getDiaryEntry(Number(req.params.id));
      if (!entry) {
        return res.status(404).json({ message: "Diary entry not found" });
      }
      
      if (entry.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const validatedData = insertDiaryEntrySchema.partial().parse(req.body);
      const updatedEntry = await storage.updateDiaryEntry(Number(req.params.id), validatedData);
      res.json(updatedEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: `Error updating diary entry: ${error.message}` });
    }
  });

  app.delete("/api/diary/:id", ensureAuthenticated, async (req, res) => {
    try {
      const entry = await storage.getDiaryEntry(Number(req.params.id));
      if (!entry) {
        return res.status(404).json({ message: "Diary entry not found" });
      }
      
      if (entry.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteDiaryEntry(Number(req.params.id));
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: `Error deleting diary entry: ${error.message}` });
    }
  });

  // Todo routes
  app.get("/api/todos", ensureAuthenticated, async (req, res) => {
    try {
      const todos = await storage.getTodos(req.user!.id);
      res.json(todos);
    } catch (error) {
      res.status(500).json({ message: `Error fetching todos: ${error.message}` });
    }
  });

  app.post("/api/todos", ensureAuthenticated, async (req, res) => {
    try {
      const validatedData = insertTodoSchema.parse(req.body);
      const todo = await storage.createTodo(req.user!.id, validatedData);
      res.status(201).json(todo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: `Error creating todo: ${error.message}` });
    }
  });

  app.put("/api/todos/:id", ensureAuthenticated, async (req, res) => {
    try {
      const todo = await storage.getTodo(Number(req.params.id));
      if (!todo) {
        return res.status(404).json({ message: "Todo not found" });
      }
      
      if (todo.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const validatedData = insertTodoSchema.partial().parse(req.body);
      const updatedTodo = await storage.updateTodo(Number(req.params.id), {
        ...validatedData,
        completed: req.body.completed !== undefined ? req.body.completed : todo.completed
      });
      res.json(updatedTodo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: `Error updating todo: ${error.message}` });
    }
  });

  app.delete("/api/todos/:id", ensureAuthenticated, async (req, res) => {
    try {
      const todo = await storage.getTodo(Number(req.params.id));
      if (!todo) {
        return res.status(404).json({ message: "Todo not found" });
      }
      
      if (todo.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteTodo(Number(req.params.id));
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: `Error deleting todo: ${error.message}` });
    }
  });

  // Goal routes
  app.get("/api/goals", ensureAuthenticated, async (req, res) => {
    try {
      const goals = await storage.getGoals(req.user!.id);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: `Error fetching goals: ${error.message}` });
    }
  });

  app.post("/api/goals", ensureAuthenticated, async (req, res) => {
    try {
      const validatedData = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal(req.user!.id, validatedData);
      res.status(201).json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: `Error creating goal: ${error.message}` });
    }
  });

  app.put("/api/goals/:id", ensureAuthenticated, async (req, res) => {
    try {
      const goal = await storage.getGoal(Number(req.params.id));
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      if (goal.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const validatedData = insertGoalSchema.partial().parse(req.body);
      const updatedGoal = await storage.updateGoal(Number(req.params.id), {
        ...validatedData,
        current: req.body.current !== undefined ? req.body.current : goal.current
      });
      res.json(updatedGoal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: `Error updating goal: ${error.message}` });
    }
  });

  app.delete("/api/goals/:id", ensureAuthenticated, async (req, res) => {
    try {
      const goal = await storage.getGoal(Number(req.params.id));
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      if (goal.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteGoal(Number(req.params.id));
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: `Error deleting goal: ${error.message}` });
    }
  });

  // Chat routes
  app.get("/api/chat", ensureAuthenticated, async (req, res) => {
    try {
      const messages = await storage.getChatMessages(req.user!.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: `Error fetching chat messages: ${error.message}` });
    }
  });

  app.post("/api/chat", ensureAuthenticated, async (req, res) => {
    try {
      const validatedData = insertChatMessageSchema.parse(req.body);
      
      // Save the user message
      const userMessage = await storage.createChatMessage(
        req.user!.id, 
        validatedData, 
        false // not AI
      );
      
      // Generate a simple AI response
      const aiResponse = {
        content: generateSimpleAIResponse(validatedData.content)
      };
      
      // Save the AI response
      const aiMessage = await storage.createChatMessage(
        req.user!.id, 
        aiResponse, 
        true // is AI
      );
      
      res.status(201).json({
        userMessage,
        aiMessage
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: `Error creating chat message: ${error.message}` });
    }
  });

  // Mood routes
  app.get("/api/mood", ensureAuthenticated, async (req, res) => {
    try {
      const entries = await storage.getMoodEntries(req.user!.id);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: `Error fetching mood entries: ${error.message}` });
    }
  });

  app.post("/api/mood", ensureAuthenticated, async (req, res) => {
    try {
      const validatedData = insertMoodEntrySchema.parse(req.body);
      const entry = await storage.createMoodEntry(req.user!.id, validatedData);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: `Error creating mood entry: ${error.message}` });
    }
  });

  // Settings routes
  app.get("/api/settings", ensureAuthenticated, async (req, res) => {
    try {
      let settings = await storage.getSettings(req.user!.id);
      
      if (!settings) {
        settings = await storage.updateSettings(req.user!.id, {
          theme: "light",
          notificationsEnabled: true,
          aiSettings: { name: "Lily", avatar: "robot" }
        });
      }
      
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: `Error fetching settings: ${error.message}` });
    }
  });

  app.put("/api/settings", ensureAuthenticated, async (req, res) => {
    try {
      const validatedData = insertSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateSettings(req.user!.id, validatedData);
      
      // If AI companion name is updated, also update it in the user's profile
      if (validatedData.aiSettings?.name) {
        await storage.updateUser(req.user!.id, {
          aiCompanionName: validatedData.aiSettings.name
        });
      }
      
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: `Error updating settings: ${error.message}` });
    }
  });

  // Quote of the day
  app.get("/api/quote", ensureAuthenticated, (req, res) => {
    const quotes = [
      { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
      { quote: "Take a deep breath. You are exactly where you need to be.", author: "Unknown" },
      { quote: "Be the change you wish to see in the world.", author: "Mahatma Gandhi" },
      { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
      { quote: "The purpose of our lives is to be happy.", author: "Dalai Lama" },
      { quote: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
      { quote: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
      { quote: "It always seems impossible until it's done.", author: "Nelson Mandela" },
      { quote: "Your mental health is a priority. Your happiness is essential.", author: "Unknown" },
      { quote: "You are enough just as you are.", author: "Meghan Markle" }
    ];
    
    // Get a random quote
    const randomIndex = Math.floor(Math.random() * quotes.length);
    res.json(quotes[randomIndex]);
  });

  // Create the HTTP server
  const httpServer = createServer(app);
  return httpServer;
}

// Simple AI response generator
function generateSimpleAIResponse(message: string): string {
  const responses = [
    "I understand how you're feeling. Would you like to talk more about that?",
    "Thank you for sharing that with me. How does that make you feel?",
    "I'm here to listen. Is there anything specific that's bothering you?",
    "That's interesting. Tell me more about why you feel that way.",
    "I appreciate you opening up to me. What do you think would help in this situation?",
    "It sounds like you're going through a lot. Remember to take care of yourself.",
    "Have you tried taking some deep breaths when you feel this way?",
    "Sometimes writing down our thoughts can help us process them better.",
    "It's important to acknowledge your feelings. You're doing great by expressing them.",
    "Remember that it's okay to have bad days. Tomorrow is a new opportunity."
  ];
  
  // Get a random response
  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
}
