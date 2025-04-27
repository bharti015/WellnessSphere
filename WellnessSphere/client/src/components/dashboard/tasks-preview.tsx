import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Todo } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus } from "lucide-react";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function TasksPreview() {
  const [, setLocation] = useLocation();
  
  const { data: todos = [], isLoading } = useQuery<Todo[]>({
    queryKey: ["/api/todos"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number, completed: boolean }) => {
      const res = await apiRequest("PUT", `/api/todos/${id}`, { completed });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
    },
  });

  const toggleComplete = (todo: Todo) => {
    updateMutation.mutate({
      id: todo.id,
      completed: !todo.completed
    });
  };

  // Sort todos with incomplete first, then by creation date
  const sortedTodos = [...todos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Only show at most 3 tasks in the preview
  const previewTodos = sortedTodos.slice(0, 3);

  const getBadgeVariant = (category: string | null) => {
    if (!category) return "outline";
    
    const categories: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "self-care": "default",
      "health": "secondary",
      "family": "destructive",
      "work": "outline",
      "personal": "default",
      "home": "secondary"
    };
    
    return categories[category.toLowerCase()] || "outline";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold">Today's Tasks</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-primary"
          onClick={() => setLocation("/todos")}
        >
          View All
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        ) : previewTodos.length > 0 ? (
          <div className="space-y-3">
            {previewTodos.map((todo) => (
              <div 
                key={todo.id}
                className={cn(
                  "flex items-center p-3 border rounded-xl transition-all duration-300",
                  todo.completed 
                    ? "border-muted bg-muted/20" 
                    : "border-input hover:border-primary/60"
                )}
              >
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={() => toggleComplete(todo)}
                  className="mr-3"
                />
                <span 
                  className={`flex-grow ${
                    todo.completed ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {todo.content}
                </span>
                {todo.category && (
                  <Badge variant={getBadgeVariant(todo.category)} className="ml-2">
                    {todo.category}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-2">No tasks yet!</p>
          </div>
        )}
        
        <Button 
          variant="outline" 
          className="w-full mt-4 border-dashed border-primary-light rounded-xl text-primary-foreground hover:bg-primary/10 transition duration-300"
          onClick={() => setLocation("/todos")}
        >
          <Plus className="mr-2 h-4 w-4" /> Add New Task
        </Button>
      </CardContent>
    </Card>
  );
}
