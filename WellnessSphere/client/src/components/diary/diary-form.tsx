import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { InsertDiaryEntry } from "@shared/schema";
import { Smile, Image, PenLine, SendHorizonal } from "lucide-react";
import { Label } from "@/components/ui/label";

export function DiaryForm() {
  const [entry, setEntry] = useState<InsertDiaryEntry>({
    content: "",
    title: "",
    mood: "",
  });

  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async (newEntry: InsertDiaryEntry) => {
      const res = await apiRequest("POST", "/api/diary", newEntry);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/diary"] });
      setEntry({ content: "", title: "", mood: "" });
      toast({
        title: "Entry created",
        description: "Your diary entry has been saved successfully.",
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
    if (!entry.content.trim()) {
      toast({
        title: "Cannot save empty entry",
        description: "Please write something in your diary entry.",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(entry);
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <PenLine className="mr-2" size={20} />
          New Diary Entry
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              placeholder="Give your entry a title"
              value={entry.title}
              onChange={(e) => setEntry({ ...entry, title: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">What's on your mind today?</Label>
            <Textarea
              id="content"
              placeholder="Write your thoughts, reflections, or experiences here..."
              rows={8}
              value={entry.content}
              onChange={(e) => setEntry({ ...entry, content: e.target.value })}
              className="resize-none"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mood">How are you feeling?</Label>
            <Input
              id="mood"
              placeholder="e.g., happy, reflective, anxious, peaceful"
              value={entry.mood}
              onChange={(e) => setEntry({ ...entry, mood: e.target.value })}
            />
          </div>
          
          <div className="flex justify-between items-center pt-2">
            <div className="flex space-x-2">
              <Button type="button" variant="ghost" size="icon" className="rounded-full">
                <Smile size={20} />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="rounded-full">
                <Image size={20} />
              </Button>
            </div>
            
            <Button 
              type="submit" 
              className="px-4"
              disabled={createMutation.isPending || !entry.content.trim()}
            >
              {createMutation.isPending ? (
                "Saving..."
              ) : (
                <>
                  <SendHorizonal className="mr-2" size={16} />
                  Save Entry
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
