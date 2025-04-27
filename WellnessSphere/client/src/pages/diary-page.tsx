import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DiaryForm } from "@/components/diary/diary-form";
import { DiaryEntryCard } from "@/components/diary/diary-entry";
import { useQuery } from "@tanstack/react-query";
import { DiaryEntry } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, BookPlus, Calendar } from "lucide-react";

export default function DiaryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  const { data: entries = [], isLoading } = useQuery<DiaryEntry[]>({
    queryKey: ["/api/diary"],
  });

  // Filter entries based on search query and tab
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = searchQuery.trim() === "" || 
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.title && entry.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (entry.mood && entry.mood.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeTab === "all") return matchesSearch;
    
    // Filter by mood categories in other tabs
    if (activeTab === "happy" && entry.mood && ["happy", "excited", "good", "great"].includes(entry.mood.toLowerCase())) {
      return matchesSearch;
    }
    if (activeTab === "neutral" && entry.mood && ["neutral", "okay", "fine"].includes(entry.mood.toLowerCase())) {
      return matchesSearch;
    }
    if (activeTab === "sad" && entry.mood && ["sad", "upset", "anxious", "stressed"].includes(entry.mood.toLowerCase())) {
      return matchesSearch;
    }
    
    return false;
  });

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold">My Diary</h1>
                <p className="text-muted-foreground">
                  Your personal journal for thoughts, reflections, and daily experiences
                </p>
              </div>
              
              <div className="w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search entries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full md:w-64"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Diary Form */}
              <div className="md:col-span-3">
                <DiaryForm />
              </div>
              
              {/* Entries Section */}
              <div className="md:col-span-3">
                <Tabs 
                  defaultValue="all" 
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <div className="flex justify-between items-center mb-4">
                    <TabsList>
                      <TabsTrigger value="all">All Entries</TabsTrigger>
                      <TabsTrigger value="happy">Happy</TabsTrigger>
                      <TabsTrigger value="neutral">Neutral</TabsTrigger>
                      <TabsTrigger value="sad">Sad</TabsTrigger>
                    </TabsList>
                    
                    <Button variant="outline" className="gap-2">
                      <Calendar size={16} />
                      <span className="hidden md:inline">Calendar View</span>
                    </Button>
                  </div>
                  
                  {isLoading ? (
                    <div className="flex justify-center items-center h-60">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-2">Loading your diary entries...</span>
                    </div>
                  ) : filteredEntries.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                      {filteredEntries.map((entry) => (
                        <DiaryEntryCard key={entry.id} entry={entry} />
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-8">
                        <BookPlus className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No entries found</h3>
                        <p className="text-muted-foreground text-center mb-4">
                          {searchQuery 
                            ? "No entries match your search criteria. Try different keywords."
                            : "You haven't created any entries yet. Start writing your thoughts above."
                          }
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </Tabs>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}
