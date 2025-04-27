import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Goal } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, Save, Plus, Minus } from "lucide-react";
import { format } from "date-fns";

interface GoalItemProps {
  goal: Goal;
}

export function GoalItem({ goal }: GoalItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedGoal, setEditedGoal] = useState({
    title: goal.title,
    description: goal.description || "",
    target: goal.target,
    current: goal.current,
    unit: goal.unit || "",
  });
  const { toast } = useToast();

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<Goal>) => {
      const res = await apiRequest("PUT", `/api/goals/${goal.id}`, updates);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      if (isEditing) {
        setIsEditing(false);
      }
      toast({
        title: "Goal updated",
        description: "Your goal has been updated successfully.",
      });
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
      await apiRequest("DELETE", `/api/goals/${goal.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Goal deleted",
        description: "Your goal has been removed.",
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

  const incrementProgress = () => {
    if (goal.current < goal.target) {
      updateMutation.mutate({ current: goal.current + 1 });
    }
  };

  const decrementProgress = () => {
    if (goal.current > 0) {
      updateMutation.mutate({ current: goal.current - 1 });
    }
  };

  const saveEdit = () => {
    if (editedGoal.title.trim() && editedGoal.target > 0) {
      updateMutation.mutate({
        title: editedGoal.title,
        description: editedGoal.description,
        target: editedGoal.target,
        current: editedGoal.current,
        unit: editedGoal.unit
      });
    } else {
      toast({
        title: "Invalid goal",
        description: "Title is required and target must be greater than 0.",
        variant: "destructive",
      });
    }
  };

  const calculateProgress = () => {
    return Math.round((goal.current / goal.target) * 100);
  };

  return (
    <Card className="card-hover">
      {isEditing ? (
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={editedGoal.title}
              onChange={(e) => setEditedGoal({ ...editedGoal, title: e.target.value })}
              placeholder="Goal title"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Description (optional)</label>
            <Input
              value={editedGoal.description}
              onChange={(e) => setEditedGoal({ ...editedGoal, description: e.target.value })}
              placeholder="Describe your goal"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Target</label>
              <Input
                type="number"
                min="1"
                value={editedGoal.target}
                onChange={(e) => setEditedGoal({ ...editedGoal, target: parseInt(e.target.value) || 1 })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Current</label>
              <Input
                type="number"
                min="0"
                value={editedGoal.current}
                onChange={(e) => setEditedGoal({ ...editedGoal, current: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Unit (optional)</label>
            <Input
              value={editedGoal.unit}
              onChange={(e) => setEditedGoal({ ...editedGoal, unit: e.target.value })}
              placeholder="e.g., books, miles, hours"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={saveEdit} disabled={updateMutation.isPending}>
              <Save size={16} className="mr-2" />
              Save
            </Button>
          </div>
        </CardContent>
      ) : (
        <>
          <CardHeader>
            <CardTitle className="text-xl">{goal.title}</CardTitle>
            {goal.description && (
              <p className="text-muted-foreground">{goal.description}</p>
            )}
            {goal.deadline && (
              <p className="text-sm text-muted-foreground mt-1">
                Deadline: {format(new Date(goal.deadline), "MMMM d, yyyy")}
              </p>
            )}
          </CardHeader>
          
          <CardContent className="pb-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">
                Progress: {goal.current}/{goal.target} {goal.unit}
              </span>
              <span className="text-sm font-medium">{calculateProgress()}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-2 goal-progress" />
            
            <div className="flex items-center justify-center mt-4 space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={decrementProgress}
                disabled={goal.current <= 0 || updateMutation.isPending}
              >
                <Minus size={16} />
              </Button>
              <span className="text-xl font-bold min-w-[40px] text-center">{goal.current}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={incrementProgress}
                disabled={goal.current >= goal.target || updateMutation.isPending}
              >
                <Plus size={16} />
              </Button>
            </div>
          </CardContent>
          
          <CardFooter className="pt-2 flex justify-end space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit size={16} className="mr-1" />
              Edit
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive">
                  <Trash2 size={16} className="mr-1" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your goal.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => deleteMutation.mutate()}
                    className="bg-destructive text-destructive-foreground"
                  >
                    {deleteMutation.isPending ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
