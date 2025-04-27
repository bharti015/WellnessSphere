import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Todo } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Edit, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface TodoItemProps {
  todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(todo.content);
  const { toast } = useToast();

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<Todo>) => {
      const res = await apiRequest("PUT", `/api/todos/${todo.id}`, updates);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      if (isEditing) {
        setIsEditing(false);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/todos/${todo.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      toast({
        title: "Task deleted",
        description: "Your task has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleComplete = () => {
    updateMutation.mutate({ completed: !todo.completed });
  };

  const saveEdit = () => {
    if (editedTask.trim()) {
      updateMutation.mutate({ content: editedTask });
    } else {
      toast({
        title: "Cannot save empty task",
        description: "Please enter a task description.",
        variant: "destructive",
      });
    }
  };

  const getBadgeVariant = (category: string | null) => {
    if (!category) return "outline";
    
    const categories: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "self-care": "default",
      "health": "secondary",
      "family": "destructive",
      "work": "outline",
    };
    
    return categories[category.toLowerCase()] || "outline";
  };

  return (
    <div className={`flex items-center p-3 border rounded-xl transition-all duration-300 ${
      todo.completed ? "border-muted bg-muted/30" : "border-border hover:border-primary/60"
    }`}>
      <Checkbox
        checked={todo.completed}
        onCheckedChange={toggleComplete}
        className="mr-3"
        disabled={updateMutation.isPending}
      />
      
      {isEditing ? (
        <Input
          value={editedTask}
          onChange={(e) => setEditedTask(e.target.value)}
          className="flex-grow mr-2"
          autoFocus
        />
      ) : (
        <span 
          className={`flex-grow mr-2 ${
            todo.completed ? "line-through text-muted-foreground" : ""
          }`}
        >
          {todo.content}
          {todo.dueDate && (
            <span className="block text-xs text-muted-foreground">
              Due: {format(new Date(todo.dueDate), "MMM d, yyyy")}
            </span>
          )}
        </span>
      )}
      
      {todo.category && !isEditing && (
        <Badge 
          variant={getBadgeVariant(todo.category)} 
          className="mr-2 whitespace-nowrap"
        >
          {todo.category}
        </Badge>
      )}
      
      {isEditing ? (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={saveEdit}
          disabled={updateMutation.isPending}
        >
          <Save size={16} />
        </Button>
      ) : (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsEditing(true)}
        >
          <Edit size={16} />
        </Button>
      )}
      
      <Button 
        variant="ghost" 
        size="sm"
        className="text-destructive"
        onClick={() => deleteMutation.mutate()}
        disabled={deleteMutation.isPending}
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
}
