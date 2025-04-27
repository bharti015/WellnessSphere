import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { InsertTodo } from "@shared/schema";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function TodoForm() {
  const [todo, setTodo] = useState<InsertTodo>({
    content: "",
    category: "",
    dueDate: undefined
  });
  const [date, setDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async (newTodo: InsertTodo) => {
      const res = await apiRequest("POST", "/api/todos", newTodo);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      setTodo({ content: "", category: "", dueDate: undefined });
      setDate(undefined);
      toast({
        title: "Task created",
        description: "Your new task has been added.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!todo.content.trim()) {
      toast({
        title: "Cannot add empty task",
        description: "Please enter a task description.",
        variant: "destructive",
      });
      return;
    }

    const todoToSubmit = {
      ...todo,
      dueDate: date ? date.toISOString() : undefined
    };
    
    createMutation.mutate(todoToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="task">Add a new task</Label>
        <div className="flex items-center space-x-2">
          <Input
            id="task"
            placeholder="What do you need to do?"
            value={todo.content}
            onChange={(e) => setTodo({ ...todo, content: e.target.value })}
            className="flex-grow"
          />

          <Select
            value={todo.category || ""}
            onValueChange={(value) => setTodo({ ...todo, category: value })}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Self-care">Self-care</SelectItem>
              <SelectItem value="Health">Health</SelectItem>
              <SelectItem value="Family">Family</SelectItem>
              <SelectItem value="Work">Work</SelectItem>
              <SelectItem value="Home">Home</SelectItem>
              <SelectItem value="Personal">Personal</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[140px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Due date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button type="submit" disabled={createMutation.isPending || !todo.content.trim()}>
            <Plus size={16} className="mr-2" />
            Add
          </Button>
        </div>
      </div>
    </form>
  );
}
