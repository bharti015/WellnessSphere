import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/theme-provider";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Settings, InsertSettings } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

// Define form schema
const settingsFormSchema = z.object({
  theme: z.string(),
  notificationsEnabled: z.boolean(),
  aiSettings: z.object({
    name: z.string().min(1, "Companion name is required"),
    avatar: z.string(),
  }),
});

const profileFormSchema = z.object({
  firstName: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  confirmPassword: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;
type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function SettingsPage() {
  const { user, loginMutation } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  
  // Fetch current settings
  const { data: settings, isLoading: isLoadingSettings } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  // Form for settings
  const settingsForm = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      theme: "light",
      notificationsEnabled: true,
      aiSettings: {
        name: "Lily",
        avatar: "robot",
      },
    },
  });

  // Form for profile settings
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      password: "",
      confirmPassword: "",
    },
  });

  // Update forms when data is loaded
  useEffect(() => {
    if (settings) {
      settingsForm.reset({
        theme: settings.theme,
        notificationsEnabled: settings.notificationsEnabled,
        aiSettings: settings.aiSettings || {
          name: "Lily",
          avatar: "robot",
        },
      });
    }
  }, [settings, settingsForm]);

  useEffect(() => {
    if (user) {
      profileForm.reset({
        firstName: user.firstName || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [user, profileForm]);

  // Settings update mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<InsertSettings>) => {
      const res = await apiRequest("PUT", "/api/settings", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Settings updated",
        description: "Your settings have been saved successfully.",
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

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await apiRequest("PUT", "/api/user", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      
      // Clear password fields
      profileForm.setValue("password", "");
      profileForm.setValue("confirmPassword", "");
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get theme from theme provider
  const { theme, setTheme } = useTheme();

  // Override the normal form submission for theme to use our theme provider directly
  const onSubmitSettings = (data: SettingsFormValues) => {
    // If theme changed, update it via the theme provider
    if (data.theme !== theme) {
      setTheme(data.theme as "light" | "dark" | "system");
    }
    
    // Submit all settings to the API
    updateSettingsMutation.mutate(data);
  };

  const onSubmitProfile = (data: ProfileFormValues) => {
    // Only submit fields that have values
    const updateData: ProfileFormValues = {};
    
    if (data.firstName) {
      updateData.firstName = data.firstName;
    }
    
    if (data.password) {
      updateData.password = data.password;
    }
    
    updateProfileMutation.mutate(updateData);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">
                Customize your experience and manage your account
              </p>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="ai">AI Companion</TabsTrigger>
                <TabsTrigger value="account">Account</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>
                      Manage your app preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingSettings ? (
                      <div className="flex justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      <Form {...settingsForm}>
                        <form onSubmit={settingsForm.handleSubmit(onSubmitSettings)} className="space-y-6">
                          <FormField
                            control={settingsForm.control}
                            name="theme"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between">
                                <div className="space-y-0.5">
                                  <FormLabel>Theme</FormLabel>
                                  <FormDescription>
                                    Choose your preferred theme
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <select
                                    className="w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    {...field}
                                  >
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                    <option value="system">System</option>
                                  </select>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={settingsForm.control}
                            name="notificationsEnabled"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between">
                                <div className="space-y-0.5">
                                  <FormLabel>Notifications</FormLabel>
                                  <FormDescription>
                                    Receive reminders and updates
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className="w-full"
                            disabled={updateSettingsMutation.isPending}
                          >
                            {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
                          </Button>
                        </form>
                      </Form>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="ai" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Companion Settings</CardTitle>
                    <CardDescription>
                      Customize your AI companion's personality
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingSettings ? (
                      <div className="flex justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      <Form {...settingsForm}>
                        <form onSubmit={settingsForm.handleSubmit(onSubmitSettings)} className="space-y-6">
                          <FormField
                            control={settingsForm.control}
                            name="aiSettings.name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Companion Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormDescription>
                                  Personalize your AI companion with a name
                                </FormDescription>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={settingsForm.control}
                            name="aiSettings.avatar"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Avatar Style</FormLabel>
                                <FormControl>
                                  <select
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    {...field}
                                  >
                                    <option value="robot">Robot</option>
                                    <option value="animal">Animal</option>
                                    <option value="human">Human</option>
                                  </select>
                                </FormControl>
                                <FormDescription>
                                  Choose what your AI companion looks like
                                </FormDescription>
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className="w-full"
                            disabled={updateSettingsMutation.isPending}
                          >
                            {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
                          </Button>
                        </form>
                      </Form>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="account" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                      Update your personal information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-6">
                        <FormField
                          control={profileForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <div className="pt-4 border-t">
                          <h3 className="font-medium mb-4">Change Password</h3>
                          
                          <FormField
                            control={profileForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem className="mb-4">
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirm New Password</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}
