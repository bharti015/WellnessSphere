import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AIChatInterface } from "@/components/ai-chat/chat-interface";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export default function AIChatPage() {
  const { user } = useAuth();
  const companionName = user?.aiCompanionName || "Lily";
  
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold">AI Companion</h1>
              <p className="text-muted-foreground">
                Chat with {companionName}, your personal AI companion for emotional support and guidance
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="lg:col-span-2">
                <AIChatInterface />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-secondary/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg viewBox="0 0 24 24" className="h-6 w-6 text-secondary-foreground">
                          <path 
                            fill="currentColor" 
                            d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,10.5A1.5,1.5 0 0,1 13.5,12A1.5,1.5 0 0,1 12,13.5A1.5,1.5 0 0,1 10.5,12A1.5,1.5 0 0,1 12,10.5M7.5,10.5A1.5,1.5 0 0,1 9,12A1.5,1.5 0 0,1 7.5,13.5A1.5,1.5 0 0,1 6,12A1.5,1.5 0 0,1 7.5,10.5M16.5,10.5A1.5,1.5 0 0,1 18,12A1.5,1.5 0 0,1 16.5,13.5A1.5,1.5 0 0,1 15,12A1.5,1.5 0 0,1 16.5,10.5Z" 
                          />
                        </svg>
                      </div>
                      <h3 className="font-semibold">Emotional Support</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        Share your feelings and receive empathetic responses and encouragement.
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-primary/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg viewBox="0 0 24 24" className="h-6 w-6 text-primary-foreground">
                          <path 
                            fill="currentColor" 
                            d="M4,2A2,2 0 0,0 2,4V16A2,2 0 0,0 4,18H8V21A1,1 0 0,0 9,22H9.5V22C9.75,22 10,21.9 10.2,21.71L13.9,18H20A2,2 0 0,0 22,16V4C22,2.89 21.1,2 20,2H4M4,4H20V16H13.08L10,19.08V16H4V4M12,10.08V11H12.92L17.23,6.69L16.31,5.77L12,10.08M14.07,5.69L14.99,6.61L16.31,5.29L15.39,4.37L14.07,5.69Z" 
                          />
                        </svg>
                      </div>
                      <h3 className="font-semibold">Conversation</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        Engage in meaningful discussions about your interests, concerns, or daily life.
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-accent/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg viewBox="0 0 24 24" className="h-6 w-6 text-accent-foreground">
                          <path 
                            fill="currentColor" 
                            d="M12,8L10.67,8.09C9.81,7.07 7.4,4.5 5,4.5C5,4.5 3.03,7.46 4.96,11.41C4.41,12.24 4.07,12.67 4,13.66L2.07,13.95L2.28,14.93L4.04,14.67L4.18,15.38L2.61,16.32L3.08,17.21L4.53,16.32C5.68,18.76 8.59,20 12,20C15.41,20 18.32,18.76 19.47,16.32L20.92,17.21L21.39,16.32L19.82,15.38L19.96,14.67L21.72,14.93L21.93,13.95L20,13.66C19.93,12.67 19.59,12.24 19.04,11.41C20.97,7.46 19,4.5 19,4.5C16.6,4.5 14.19,7.07 13.33,8.09L12,8M9,11A1,1 0 0,1 10,12A1,1 0 0,1 9,13A1,1 0 0,1 8,12A1,1 0 0,1 9,11M15,11A1,1 0 0,1 16,12A1,1 0 0,1 15,13A1,1 0 0,1 14,12A1,1 0 0,1 15,11M12,14L13.5,17H10.5L12,14Z" 
                          />
                        </svg>
                      </div>
                      <h3 className="font-semibold">Personalized</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        Customize your AI companion's name and personality in Settings.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}
