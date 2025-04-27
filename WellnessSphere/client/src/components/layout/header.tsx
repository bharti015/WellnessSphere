import { useAuth } from "@/hooks/use-auth";
import { Bell, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLocation } from "wouter";

export function Header() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const getInitials = () => {
    if (user?.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    }
    return user?.username.charAt(0).toUpperCase() || "U";
  };

  return (
    <header className="bg-background border-b border-border py-3 px-6 sticky top-0 z-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {user?.firstName ? `Hi, ${user.firstName}!` : "Welcome!"}
          </h2>
          <p className="text-muted-foreground">How are you feeling today?</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell size={20} className="text-muted-foreground" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full flex items-center space-x-2 px-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{user?.firstName || user?.username}</span>
                <ChevronDown size={16} className="text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setLocation("/settings")}>
                Profile & Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
