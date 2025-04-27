import { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Settings } from "@shared/schema";

type ThemeProviderProps = {
  children: React.ReactNode;
};

type Theme = "light" | "dark" | "system";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>("light");
  const { user } = useAuth();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  // Fetch current settings
  const { data: settings } = useQuery<Settings>({
    queryKey: ["/api/settings"],
    enabled: !!user,
  });

  // Theme update mutation
  const updateThemeMutation = useMutation({
    mutationFn: async (newTheme: Theme) => {
      const res = await apiRequest("PUT", "/api/settings", { theme: newTheme });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Theme update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Set the theme based on settings
  useEffect(() => {
    if (settings?.theme) {
      setThemeState(settings.theme as Theme);
    }
  }, [settings]);

  // Update the HTML element with the theme class
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove current theme classes
    root.classList.remove("light", "dark");
    
    // Add new theme class
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (user) {
      updateThemeMutation.mutate(newTheme);
    }
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}