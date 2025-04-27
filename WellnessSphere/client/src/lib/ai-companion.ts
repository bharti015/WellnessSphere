import { apiRequest } from "./queryClient";
import { InsertChatMessage, ChatMessage } from "@shared/schema";

interface MessageResponse {
  userMessage: ChatMessage;
  aiMessage: ChatMessage;
}

export async function sendMessageToCompanion(message: InsertChatMessage): Promise<MessageResponse> {
  const response = await apiRequest("POST", "/api/chat", message);
  const data = await response.json();
  return data;
}
