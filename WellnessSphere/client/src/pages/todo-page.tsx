import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { TodoForm } from "@/components/todos/todo-form";
import { TodoItem } from "@/components/todos/todo-item";
import { useQuery } from "@tanstack/react-query";
import { Todo } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, CheckCircle2 } from "lucide-react";

export default function TodoPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  const { data: todos = [], isLoading } = useQuery<Todo[]>({
    queryKey: ["/api/todos"],
  });

  // Filter todos based on search query and active tab
  const filteredTodos = todos.filter(todo => {
    const matchesSearch = searchQuery.trim() === "" || 
      todo.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (todo.category && todo.category.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "completed") return todo.completed && matchesSearch;
    if (activeTab === "active") return !todo.completed && matchesSearch;
    
    // Filter by category
    if (activeTab === "self-care") return todo.category?.toLowerCase() === "self-care" && matchesSearch;
    if (activeTab === "health") return todo.category?.toLowerCase() === "health" && matchesSearch;
    if (activeTab === "work") return todo.category?.toLowerCase() === "work" && matchesSearch;
    
    return false;
  });

  // Sort todos with non-completed first, then by creation date
  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold">To-Do List</h1>
                <p className="text-muted-foreground">
                  Organize tasks and track your progress
                </p>
              </div>
              
              <div className="w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full md:w-64"
                  />
                </div>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Add a New Task</CardTitle>
                <CardDescription>
                  What do you need to accomplish today?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TodoForm />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <Tabs 
                  defaultValue="all" 
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <div className="flex justify-between items-center">
                    <CardTitle>Your Tasks</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {!isLoading && <span>{todos.filter(t => !t.completed).length} remaining</span>}
                    </div>
                  </div>
                  
                  <TabsList className="mt-4 grid grid-cols-3 md:grid-cols-7">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="self-care" className="hidden md:inline-flex">Self-care</TabsTrigger>
                    <TabsTrigger value="health" className="hidden md:inline-flex">Health</TabsTrigger>
                    <TabsTrigger value="work" className="hidden md:inline-flex">Work</TabsTrigger>
                    <TabsTrigger value="more" className="md:hidden">More</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all">
                    {renderTodoList(sortedTodos, isLoading)}
                  </TabsContent>
                  
                  <TabsContent value="active">
                    {renderTodoList(sortedTodos, isLoading)}
                  </TabsContent>
                  
                  <TabsContent value="completed">
                    {renderTodoList(sortedTodos, isLoading)}
                  </TabsContent>
                  
                  <TabsContent value="self-care">
                    {renderTodoList(sortedTodos, isLoading)}
                  </TabsContent>
                  
                  <TabsContent value="health">
                    {renderTodoList(sortedTodos, isLoading)}
                  </TabsContent>
                  
                  <TabsContent value="work">
                    {renderTodoList(sortedTodos, isLoading)}
                  </TabsContent>
                  
                  <TabsContent value="more">
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <Button variant="outline" onClick={() => setActiveTab("self-care")}>Self-care</Button>
                      <Button variant="outline" onClick={() => setActiveTab("health")}>Health</Button>
                      <Button variant="outline" onClick={() => setActiveTab("work")}>Work</Button>
                      <Button variant="outline" onClick={() => setActiveTab("all")}>Back to All</Button>
                    </div>
                    {renderTodoList(sortedTodos, isLoading)}
                  </TabsContent>
                </Tabs>
              </CardHeader>
            </Card>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}

function renderTodoList(todos: Todo[], isLoading: boolean) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40 my-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading your tasks...</span>
      </div>
    );
  }
  
  if (todos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 my-4">
        <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
        <p className="text-muted-foreground text-center">
          You don't have any tasks that match your current filter.
        </p>
      </div>
    );
  }
  
  return (
    <CardContent className="space-y-3 pt-4">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </CardContent>
  );
}
