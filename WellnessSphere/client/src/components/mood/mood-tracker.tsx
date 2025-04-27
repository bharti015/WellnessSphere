import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MoodEntry, InsertMoodEntry } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format, subDays, isToday, parseISO, startOfWeek, endOfWeek } from "date-fns";

type MoodOption = {
  emoji: string;
  name: string;
  score: number;
};

const moodOptions: MoodOption[] = [
  { emoji: "😀", name: "Happy", score: 5 },
  { emoji: "😊", name: "Good", score: 4 },
  { emoji: "😐", name: "Neutral", score: 3 },
  { emoji: "😔", name: "Sad", score: 2 },
  { emoji: "😢", name: "Upset", score: 1 },
];

export function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [note, setNote] = useState("");
  const { toast } = useToast();

  const { data: moodEntries = [], isLoading } = useQuery<MoodEntry[]>({
    queryKey: ["/api/mood"],
  });

  const createMutation = useMutation({
    mutationFn: async (newEntry: InsertMoodEntry) => {
      const res = await apiRequest("POST", "/api/mood", newEntry);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mood"] });
      setSelectedMood(null);
      setNote("");
      toast({
        title: "Mood recorded",
        description: "Your mood has been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood) {
      toast({
        title: "No mood selected",
        description: "Please select a mood before saving.",
        variant: "destructive",
      });
      return;
    }

    const moodEntry: InsertMoodEntry = {
      mood: selectedMood.name,
      score: selectedMood.score,
      note: note || undefined,
    };
    
    createMutation.mutate(moodEntry);
  };

  // Check if user already logged mood today
  const todayEntry = moodEntries.find(entry => {
    const entryDate = new Date(entry.createdAt);
    return isToday(entryDate);
  });

  // Get entries for this week
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  
  const weekEntries = moodEntries
    .filter(entry => {
      const entryDate = parseISO(entry.createdAt as unknown as string);
      return entryDate >= weekStart && entryDate <= weekEnd;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateA.getTime() - dateB.getTime();
    });

  // Calculate average mood for this week
  const averageMood = weekEntries.length > 0
    ? Math.round(weekEntries.reduce((sum, entry) => sum + entry.score, 0) / weekEntries.length * 10) / 10
    : null;

  const getMoodName = (score: number) => {
    const mood = moodOptions.find(m => m.score === score);
    return mood ? mood.name : "Unknown";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">How are you feeling today?</CardTitle>
        </CardHeader>
        <CardContent>
          {todayEntry ? (
            <div className="text-center py-4">
              <p className="text-2xl mb-2">{moodOptions.find(m => m.name === todayEntry.mood)?.emoji || "🙂"}</p>
              <p className="font-medium">You've already logged your mood today as <span className="text-primary-foreground font-bold">{todayEntry.mood}</span>.</p>
              {todayEntry.note && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="italic text-muted-foreground">{todayEntry.note}</p>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex justify-center space-x-4">
                {moodOptions.map((mood) => (
                  <Button
                    key={mood.name}
                    type="button"
                    variant={selectedMood?.name === mood.name ? "default" : "outline"}
                    className="mood-emoji h-16 w-16 rounded-full text-2xl"
                    onClick={() => setSelectedMood(mood)}
                  >
                    {mood.emoji}
                  </Button>
                ))}
              </div>
              
              {selectedMood && (
                <div className="text-center animate-fadeIn">
                  <p className="font-medium mb-4">You're feeling <span className="text-primary-foreground font-bold">{selectedMood.name}</span> today.</p>
                  <Textarea
                    placeholder="Add a note about why you feel this way... (optional)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                  <Button 
                    type="submit" 
                    className="mt-4 px-8"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? "Saving..." : "Save Mood"}
                  </Button>
                </div>
              )}
            </form>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Your Weekly Mood</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-48 flex items-center justify-center">
              <p>Loading mood data...</p>
            </div>
          ) : weekEntries.length > 0 ? (
            <>
              <div className="h-48 flex items-end justify-between pt-4 pb-2 px-2">
                {[...Array(7)].map((_, index) => {
                  const date = subDays(now, 6 - index);
                  const dayEntry = weekEntries.find(entry => {
                    const entryDate = parseISO(entry.createdAt as unknown as string);
                    return format(entryDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
                  });
                  
                  const height = dayEntry ? (dayEntry.score / 5) * 100 : 0;
                  const dayName = format(date, 'EEE');
                  
                  return (
                    <div key={index} className="flex flex-col items-center">
                      <div className="h-24 w-8 bg-primary/20 rounded-full relative overflow-hidden">
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
              
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-primary mr-1"></span>
                  <span className="text-xs text-muted-foreground">Mood Score</span>
                </div>
                {averageMood !== null && (
                  <span className="text-xs text-muted-foreground">
                    Average: {getMoodName(Math.round(averageMood))} ({averageMood}/5)
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No mood data for this week yet.</p>
              <p className="text-sm">Start tracking your mood to see patterns here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
