import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoodEntry } from "@shared/schema";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { format, subDays, parseISO, startOfWeek, endOfWeek } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export function MoodInsights() {
  const [, setLocation] = useLocation();
  
  const { data: moodEntries = [], isLoading } = useQuery<MoodEntry[]>({
    queryKey: ["/api/mood"],
  });

  // Current display mode - default to week
  const displayMode = "week";

  // Get entries for the selected period
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  
  const filteredEntries = moodEntries.filter(entry => {
    const entryDate = parseISO(entry.createdAt as unknown as string);
    return entryDate >= weekStart && entryDate <= weekEnd;
  });

  // Calculate average mood score
  const averageScore = filteredEntries.length > 0
    ? Math.round(filteredEntries.reduce((sum, entry) => sum + entry.score, 0) / filteredEntries.length * 10) / 10
    : 0;

  // Get mood name from score
  const getMoodName = (score: number) => {
    const moods = ["Upset", "Sad", "Neutral", "Good", "Happy"];
    return moods[Math.min(Math.max(0, score - 1), 4)];
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold">Mood Insights</CardTitle>
        <div className="flex space-x-2">
          <Button 
            variant={displayMode === "week" ? "default" : "ghost"} 
            size="sm" 
            className="text-xs rounded-full px-3 py-1"
          >
            Week
          </Button>
          <Button 
            variant={displayMode === "month" ? "default" : "ghost"} 
            size="sm" 
            className="text-xs rounded-full px-3 py-1"
            onClick={() => setLocation("/mood")}
          >
            Month
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-48 flex items-center justify-center">
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <div>
            <div className="h-48 flex items-end justify-between pt-4 pb-2 px-2">
              {[...Array(7)].map((_, index) => {
                const date = subDays(now, 6 - index);
                const dayEntry = filteredEntries.find(entry => {
                  const entryDate = parseISO(entry.createdAt as unknown as string);
                  return format(entryDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
                });
                
                const height = dayEntry ? (dayEntry.score / 5) * 100 : 0;
                const dayName = format(date, 'EEE');
                
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div className="h-16 w-8 bg-primary/20 rounded-full relative overflow-hidden">
                      {dayEntry && (
                        <div 
                          className="absolute bottom-0 w-full bg-primary rounded-full transition-all duration-1000"
                          style={{ height: `${height}%` }}
                        />
                      )}
                    </div>
                    <span className="text-xs mt-2 text-muted-foreground">{dayName}</span>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-primary"></span>
                <span className="text-xs ml-1 text-muted-foreground">Mood Score</span>
              </div>
              {filteredEntries.length > 0 ? (
                <span className="text-xs text-muted-foreground">
                  Average: {getMoodName(Math.round(averageScore))} ({averageScore}/5)
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  No mood data for this week
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
