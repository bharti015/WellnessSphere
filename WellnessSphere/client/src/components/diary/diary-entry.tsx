import { useState } from "react";
import { DiaryEntry } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Save } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface DiaryEntryProps {
  entry: DiaryEntry;
}

export function DiaryEntryCard({ entry }: DiaryEntryProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEntry, setEditedEntry] = useState({
    title: entry.title || "",
    content: entry.content,
    mood: entry.mood || "",
  });
  const { toast } = useToast();

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<DiaryEntry>) => {
      const res = await apiRequest("PUT", `/api/diary/${entry.id}`, updates);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/diary"] });
      setIsEditing(false);
      toast({
        title: "Entry updated",
        description: "Your diary entry has been updated successfully.",
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
      await apiRequest("DELETE", `/api/diary/${entry.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/diary"] });
      toast({
        title: "Entry deleted",
        description: "Your diary entry has been deleted.",
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

  const handleUpdate = () => {
    updateMutation.mutate(editedEntry);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const getMoodEmoji = (mood: string) => {
    const moods: Record<string, string> = {
      happy: "😊",
      neutral: "😐",
      sad: "😔",
      angry: "😤",
      excited: "😃",
      tired: "😴",
      anxious: "😰",
    };
    return moods[mood.toLowerCase()] || "🙂";
  };

  return (
    <Card className="card-hover">
      {isEditing ? (
        <CardContent className="p-6">
          <Input 
            className="mb-3"
            placeholder="Entry title"
            value={editedEntry.title}
            onChange={(e) => setEditedEntry({ ...editedEntry, title: e.target.value })}
          />
          <Textarea 
            className="min-h-[200px] mb-3"
            placeholder="Write your thoughts here..."
            value={editedEntry.content}
            onChange={(e) => setEditedEntry({ ...editedEntry, content: e.target.value })}
          />
          <Input 
            className="mb-3"
            placeholder="How are you feeling? (e.g., happy, sad, anxious)"
            value={editedEntry.mood}
            onChange={(e) => setEditedEntry({ ...editedEntry, mood: e.target.value })}
          />
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate} 
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <span className="flex items-center">
                  <span className="mr-2">Saving</span>
                  <span className="animate-spin">...</span>
                </span>
              ) : (
                <span className="flex items-center">
                  <Save size={16} className="mr-2" />
                  Save
                </span>
              )}
            </Button>
          </div>
        </CardContent>
      ) : (
        <>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-xl font-bold">
                {entry.title || "Untitled Entry"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {entry.createdAt ? format(new Date(entry.createdAt), "MMMM d, yyyy • h:mm a") : ""}
              </p>
            </div>
            {entry.mood && (
              <Badge variant="outline" className="text-base px-2 py-1">
                {getMoodEmoji(entry.mood)} {entry.mood}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="pt-2">
            <p className="whitespace-pre-wrap">{entry.content}</p>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit size={16} className="mr-2" />
              Edit
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive">
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your diary entry.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
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
