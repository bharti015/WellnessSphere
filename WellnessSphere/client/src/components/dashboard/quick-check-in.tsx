import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InsertDiaryEntry } from "@shared/schema";
import { SmilePlus, Image, Palette } from "lucide-react";

export function QuickCheckIn() {
  const [text, setText] = useState("");
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async (entry: InsertDiaryEntry) => {
      const res = await apiRequest("POST", "/api/diary", entry);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/diary"] });
      setText("");
      toast({
        title: "Entry saved",
        description: "Your check-in has been saved successfully.",
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

  const handleSave = () => {
    if (!text.trim()) {
      toast({
        title: "Empty entry",
        description: "Please write something before saving.",
        variant: "destructive",
      });
      return;
    }
    
    createMutation.mutate({
      content: text,
      title: "Quick Check-In",
      mood: "",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold">Quick Check-In</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          className="w-full p-4 h-32 rounded-xl border border-input focus:border-primary focus:ring focus:ring-primary/50 transition duration-300 resize-none"
          placeholder="How are you feeling today? What's on your mind?"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex justify-between items-center mt-4">
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <SmilePlus className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Image className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Palette className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={createMutation.isPending || !text.trim()}
            className="px-4 rounded-full"
          >
            {createMutation.isPending ? "Saving..." : "Save Entry"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
