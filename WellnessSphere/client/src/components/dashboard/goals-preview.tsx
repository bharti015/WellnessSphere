import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Goal } from "@shared/schema";
import { Plus } from "lucide-react";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export function GoalsPreview() {
  const [, setLocation] = useLocation();
  
  const { data: goals = [], isLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  // Sort goals by progress percentage (lowest to highest)
  const sortedGoals = [...goals].sort((a, b) => {
    const progressA = (a.current / a.target) * 100;
    const progressB = (b.current / b.target) * 100;
    return progressA - progressB;
  });

  // Only show at most 3 goals in the preview
  const previewGoals = sortedGoals.slice(0, 3);

  // Get progress color based on progress percentage
  const getProgressColor = (index: number) => {
    const colors = ["bg-primary", "bg-secondary-dark", "bg-accent-dark"];
    return colors[index % colors.length];
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold">Goals Progress</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-primary"
          onClick={() => setLocation("/goals")}
        >
          View All
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </div>
        ) : previewGoals.length > 0 ? (
          <div className="space-y-4">
            {previewGoals.map((goal, index) => {
              const progressPercent = Math.round((goal.current / goal.target) * 100);
              
              return (
                <div key={goal.id} className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{goal.title}</span>
                    <span className="text-xs text-primary-foreground">
                      {goal.current}/{goal.target} {goal.unit}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getProgressColor(index)} rounded-full goal-progress`} 
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-2">No goals set yet!</p>
          </div>
        )}
        
        <Button 
          variant="outline" 
          className="w-full mt-4 border-dashed border-primary-light rounded-xl text-primary-foreground hover:bg-primary/10 transition duration-300"
          onClick={() => setLocation("/goals")}
        >
          <Plus className="mr-2 h-4 w-4" /> Add New Goal
        </Button>
      </CardContent>
    </Card>
  );
}
