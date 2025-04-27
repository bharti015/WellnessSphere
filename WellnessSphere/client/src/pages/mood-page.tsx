import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MoodTracker } from "@/components/mood/mood-tracker";
import { useQuery } from "@tanstack/react-query";
import { MoodEntry } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  parseISO, 
  subMonths 
} from "date-fns";

export default function MoodPage() {
  const { data: moodEntries = [] } = useQuery<MoodEntry[]>({
    queryKey: ["/api/mood"],
  });

  // Get entries for the last 3 months
  const today = new Date();
  const threeMonthsAgo = subMonths(today, 3);
  
  const filteredEntries = moodEntries.filter(entry => {
    const entryDate = parseISO(entry.createdAt as unknown as string);
    return entryDate >= threeMonthsAgo;
  });

  // Get mood colors
  const getMoodColor = (score: number) => {
    const colors = [
      "bg-red-300", // 1 - Upset
      "bg-orange-300", // 2 - Sad
      "bg-yellow-300", // 3 - Neutral
      "bg-green-300", // 4 - Good
      "bg-primary", // 5 - Happy
    ];
    return colors[Math.min(Math.max(0, score - 1), 4)];
  };

  // Get mood name from score
  const getMoodName = (score: number) => {
    const moods = ["Upset", "Sad", "Neutral", "Good", "Happy"];
    return moods[Math.min(Math.max(0, score - 1), 4)];
  };

  // Calculate mood distribution
  const moodDistribution = [0, 0, 0, 0, 0]; // For scores 1-5
  filteredEntries.forEach(entry => {
    const scoreIndex = Math.min(Math.max(0, entry.score - 1), 4);
    moodDistribution[scoreIndex]++;
  });
  
  const totalEntries = filteredEntries.length;
  const moodPercentages = moodDistribution.map(count => 
    totalEntries > 0 ? Math.round((count / totalEntries) * 100) : 0
  );

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Mood Tracker</h1>
              <p className="text-muted-foreground">
                Monitor your emotional well-being and discover patterns in your moods
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <MoodTracker />
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Mood Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {totalEntries > 0 ? (
                      <div className="space-y-4">
                        {["Happy", "Good", "Neutral", "Sad", "Upset"].map((mood, index) => {
                          const scoreIndex = 4 - index; // Reverse index (Happy=5, Upset=1)
                          const percentage = moodPercentages[scoreIndex];
                          
                          return (
                            <div key={mood} className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">{mood}</span>
                                <span className="text-sm text-muted-foreground">{percentage}%</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${getMoodColor(scoreIndex + 1)} rounded-full transition-all duration-1000`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-muted-foreground">
                        <p>No mood data recorded yet.</p>
                        <p className="text-sm mt-1">Track your mood to see distribution.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Monthly Calendar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <h3 className="font-medium">{format(today, 'MMMM yyyy')}</h3>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-xs text-muted-foreground">
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1">
                      {generateCalendarDays(today, filteredEntries).map((day, i) => (
                        <div 
                          key={i} 
                          className={`aspect-square rounded-full flex items-center justify-center text-xs relative ${
                            day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground opacity-30'
                          } ${day.isToday ? 'ring-2 ring-primary' : ''}`}
                        >
                          {day.moodEntry ? (
                            <div 
                              className={`absolute inset-1 rounded-full ${getMoodColor(day.moodEntry.score)}`}
                              title={`${getMoodName(day.moodEntry.score)} - ${day.moodEntry.note || 'No note'}`}
                            >
                              <span className="absolute inset-0 flex items-center justify-center font-medium text-foreground">
                                {day.date.getDate()}
                              </span>
                            </div>
                          ) : (
                            day.date.getDate()
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Mood Entries</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredEntries.length > 0 ? (
                  <div className="space-y-4">
                    {filteredEntries.slice(0, 5).map(entry => (
                      <div key={entry.id} className="flex items-start border-b pb-4">
                        <div className={`w-10 h-10 rounded-full ${getMoodColor(entry.score)} flex items-center justify-center mr-4`}>
                          <span className="text-lg">{moodToEmoji(entry.score)}</span>
                        </div>
                        <div>
                          <div className="flex items-center mb-1">
                            <h4 className="font-medium mr-2">{entry.mood}</h4>
                            <span className="text-xs text-muted-foreground">
                              {format(parseISO(entry.createdAt as unknown as string), 'PPP p')}
                            </span>
                          </div>
                          {entry.note && <p className="text-muted-foreground">{entry.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-muted-foreground">
                    <p>No mood entries recorded yet.</p>
                    <p className="text-sm mt-1">Start tracking your mood to see your history here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}

// Helper function to generate calendar days
function generateCalendarDays(currentDate: Date, moodEntries: MoodEntry[]) {
  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  
  // Get all days in month
  const daysInMonth = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth
  });
  
  // Calculate days to show before first day to fill first row
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const previousDays = [];
  for (let i = startingDayOfWeek; i > 0; i--) {
    const date = new Date(firstDayOfMonth);
    date.setDate(date.getDate() - i);
    previousDays.push(date);
  }
  
  // Calculate days to show after last day to fill last row
  const endingDayOfWeek = lastDayOfMonth.getDay();
  const nextDays = [];
  for (let i = 1; i < 7 - endingDayOfWeek; i++) {
    const date = new Date(lastDayOfMonth);
    date.setDate(date.getDate() + i);
    nextDays.push(date);
  }
  
  const allDays = [...previousDays, ...daysInMonth, ...nextDays];
  
  return allDays.map(date => {
    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
    const isToday = isSameDay(date, new Date());
    
    // Find mood entry for this date
    const moodEntry = moodEntries.find(entry => {
      const entryDate = parseISO(entry.createdAt as unknown as string);
      return isSameDay(date, entryDate);
    });
    
    return {
      date,
      isCurrentMonth,
      isToday,
      moodEntry
    };
  });
}

// Helper function to convert mood score to emoji
function moodToEmoji(score: number): string {
  const emojis = ["😢", "😔", "😐", "😊", "😃"];
  return emojis[Math.min(Math.max(0, score - 1), 4)];
}
