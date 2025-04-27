import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { GoalForm } from "@/components/goals/goal-form";
import { GoalItem } from "@/components/goals/goal-item";
import { useQuery } from "@tanstack/react-query";
import { Goal } from "@shared/schema";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Flag, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function GoalsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("progress-asc");
  const [showNewGoalDialog, setShowNewGoalDialog] = useState(false);
  
  const { data: goals = [], isLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  // Filter goals based on search query
  const filteredGoals = goals.filter(goal => 
    searchQuery.trim() === "" || 
    goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (goal.description && goal.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (goal.unit && goal.unit.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Sort goals based on selected option
  const sortedGoals = [...filteredGoals].sort((a, b) => {
    const progressA = (a.current / a.target) * 100;
    const progressB = (b.current / b.target) * 100;
    
    switch (sortOption) {
      case "progress-asc":
        return progressA - progressB;
      case "progress-desc":
        return progressB - progressA;
      case "alphabetical":
        return a.title.localeCompare(b.title);
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold">Goals</h1>
                <p className="text-muted-foreground">
                  Set, track, and achieve your personal goals
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search goals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="progress-asc">Progress (Lowest First)</SelectItem>
                    <SelectItem value="progress-desc">Progress (Highest First)</SelectItem>
                    <SelectItem value="alphabetical">Alphabetical</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
                
                <Dialog open={showNewGoalDialog} onOpenChange={setShowNewGoalDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" /> New Goal
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                      <DialogTitle>Create a New Goal</DialogTitle>
                      <DialogDescription>
                        Define what you want to achieve and track your progress.
                      </DialogDescription>
                    </DialogHeader>
                    <GoalForm onSuccess={() => setShowNewGoalDialog(false)} />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-60">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading your goals...</span>
              </div>
            ) : sortedGoals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedGoals.map((goal) => (
                  <GoalItem key={goal.id} goal={goal} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Flag className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No goals found</h3>
                  <p className="text-muted-foreground text-center mb-6">
                    {searchQuery 
                      ? "No goals match your search criteria. Try different keywords."
                      : "You haven't created any goals yet. Start by setting your first goal."
                    }
                  </p>
                  <Dialog open={showNewGoalDialog} onOpenChange={setShowNewGoalDialog}>
                    <DialogTrigger asChild>
                      <Button>Create Your First Goal</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px]">
                      <DialogHeader>
                        <DialogTitle>Create a New Goal</DialogTitle>
                        <DialogDescription>
                          Define what you want to achieve and track your progress.
                        </DialogDescription>
                      </DialogHeader>
                      <GoalForm onSuccess={() => setShowNewGoalDialog(false)} />
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}
