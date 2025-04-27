import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DailyQuote } from "@/components/dashboard/daily-quote";
import { QuickCheckIn } from "@/components/dashboard/quick-check-in";
import { TasksPreview } from "@/components/dashboard/tasks-preview";
import { GoalsPreview } from "@/components/dashboard/goals-preview";
import { MoodInsights } from "@/components/dashboard/mood-insights";
import { AIChatInterface } from "@/components/ai-chat/chat-interface";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const { user } = useAuth();
  const companionName = user?.aiCompanionName || "Lily";
  
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Greeting and Daily Quote */}
            <DailyQuote />
            
            {/* Dashboard Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Quick Check-in */}
              <div className="lg:col-span-2">
                <QuickCheckIn />
              </div>
              
              {/* AI Companion */}
              <div className="lg:row-span-2">
                <AIChatInterface />
              </div>
              
              {/* Tasks Preview */}
              <div>
                <TasksPreview />
              </div>
              
              {/* Goals Preview */}
              <div>
                <GoalsPreview />
              </div>
              
              {/* Mood Insights */}
              <div className="lg:col-span-2">
                <MoodInsights />
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}
