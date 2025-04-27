import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
  BookText,
  CheckSquare,
  Flag,
  MessagesSquare,
  SmilePlus,
  Settings,
  LayoutDashboard,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active: boolean;
}

function SidebarItem({ icon, label, href, active }: SidebarItemProps) {
  return (
    <Link href={href}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2 px-4 py-2 mb-1 rounded-xl font-medium",
          active ? "bg-primary/20 text-primary-foreground" : "hover:bg-primary/10"
        )}
      >
        {icon}
        <span>{label}</span>
      </Button>
    </Link>
  );
}

export function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const sidebarItems = [
    { 
      icon: <LayoutDashboard size={20} />, 
      label: "Dashboard", 
      href: "/" 
    },
    { 
      icon: <BookText size={20} />, 
      label: "Diary", 
      href: "/diary" 
    },
    { 
      icon: <CheckSquare size={20} />, 
      label: "To-Do List", 
      href: "/todos" 
    },
    { 
      icon: <Flag size={20} />, 
      label: "Goals", 
      href: "/goals" 
    },
    { 
      icon: <MessagesSquare size={20} />, 
      label: `AI Chat`, 
      href: "/ai-chat" 
    },
    { 
      icon: <SmilePlus size={20} />, 
      label: "Mood Tracker", 
      href: "/mood" 
    },
  ];

  return (
    <div className="w-64 border-r border-border h-screen flex flex-col bg-background">
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-bold text-primary-foreground flex items-center">
          My Well-Being
          <span className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full ml-2">
            Beta
          </span>
        </h1>
      </div>
      
      <ScrollArea className="flex-grow px-3 py-4">
        <div className="space-y-1">
          {sidebarItems.map((item) => (
            <SidebarItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={location === item.href}
            />
          ))}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t border-border mt-auto">
        <Link href="/settings">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2 px-4 py-2 mb-2 rounded-xl font-medium",
              location === "/settings" ? "bg-primary/20 text-primary-foreground" : "hover:bg-primary/10"
            )}
          >
            <Settings size={20} />
            <span>Settings</span>
          </Button>
        </Link>
        
        <Button
          variant="outline"
          className="w-full justify-start gap-2 px-4 py-2 rounded-xl font-medium"
          onClick={handleLogout}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
}
