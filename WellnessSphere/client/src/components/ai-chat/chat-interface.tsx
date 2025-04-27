import { useRef, useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ChatMessage, InsertChatMessage } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, Send, User, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

export function AIChatInterface() {
  const [message, setMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const companionName = user?.aiCompanionName || "Lily";

  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (newMessage: InsertChatMessage) => {
      const res = await apiRequest("POST", "/api/chat", newMessage);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat"] });
      setMessage("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    sendMessageMutation.mutate({ content: message });
  };

  // Auto-scroll to the latest message
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Format the timestamp
  const formatMessageTime = (timestamp: Date | string) => {
    if (typeof timestamp === "string") {
      timestamp = new Date(timestamp);
    }
    return format(timestamp, "h:mm a");
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-xl flex items-center">
          <span>{companionName}, Your AI Friend</span>
        </CardTitle>
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => window.location.href = "/settings"}>
          <Settings size={18} />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-[500px] p-4" ref={scrollAreaRef}>
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">Loading conversation...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center">
              <Bot size={48} className="text-primary mb-4" />
              <h3 className="text-lg font-medium mb-2">Welcome to your AI friend!</h3>
              <p className="text-center text-muted-foreground max-w-md">
                I'm here to listen, chat, and support you. Feel free to share your thoughts, ask for advice, or just have a casual conversation.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isAi ? "" : "justify-end"}`}>
                  {msg.isAi ? (
                    <div className="flex max-w-[80%]">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Bot size={16} />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="bg-background border rounded-2xl rounded-tl-none px-4 py-2">
                          <p>{msg.content}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 ml-1">
                          {formatMessageTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex max-w-[80%]">
                      <div>
                        <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-none px-4 py-2">
                          <p>{msg.content}</p>
                        </div>
                        <p className="text-xs text-right text-muted-foreground mt-1 mr-1">
                          {formatMessageTime(msg.createdAt)}
                        </p>
                      </div>
                      <Avatar className="h-8 w-8 ml-2">
                        <AvatarFallback className="bg-secondary text-secondary-foreground">
                          <User size={16} />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                </div>
              ))}
              {sendMessageMutation.isPending && (
                <div className="flex">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot size={16} />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="bg-background border rounded-2xl rounded-tl-none px-4 py-2">
                      <div className="flex space-x-2">
                        <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
          <Input
            placeholder={`Message ${companionName}...`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-grow"
            disabled={sendMessageMutation.isPending}
          />
          <Button 
            type="submit" 
            className="rounded-full w-10 h-10 p-0 flex-shrink-0"
            disabled={!message.trim() || sendMessageMutation.isPending}
          >
            <Send size={18} />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
