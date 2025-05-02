import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { 
  CreditCard, 
  Truck, 
  Bell, 
  Lock, 
  Settings as SettingsIcon,
  Save,
  LogOut
} from "lucide-react";

// Password change form schema
const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function Settings() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("account");
  
  // Password change form
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  const onPasswordSubmit = (data: z.infer<typeof passwordFormSchema>) => {
    // This would be a real API call in a production app
    console.log("Password change data:", data);
    
    // Show success message
    toast({
      title: "Password updated",
      description: "Your password has been updated successfully.",
    });
    
    // Reset form
    passwordForm.reset();
  };
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Manage your account settings and preferences</p>
      </div>
      
      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start border-b bg-transparent p-0">
          <TabsTrigger
            value="account"
            className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary-600 data-[state=active]:bg-transparent"
          >
            Account
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary-600 data-[state=active]:bg-transparent"
          >
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="payment"
            className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary-600 data-[state=active]:bg-transparent"
          >
            Payment
          </TabsTrigger>
          <TabsTrigger
            value="shipping"
            className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary-600 data-[state=active]:bg-transparent"
          >
            Shipping
          </TabsTrigger>
        </TabsList>
        
        {/* Account Settings */}
        <TabsContent value="account" className="space-y-6 pt-4">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <FormLabel>Username</FormLabel>
                  <Input value={user?.username || ""} readOnly />
                </div>
                
                <div className="space-y-2">
                  <FormLabel>Email</FormLabel>
                  <Input type="email" value="admin@livesell.com" readOnly />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Password Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="mr-2 h-5 w-5" />
                Password
              </CardTitle>
              <CardDescription>
                Change your password
              </CardDescription>
            </CardHeader>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    Update Password
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
          
          {/* Logout */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Logging out will end your current session.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="destructive" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Manage your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New Orders</p>
                    <p className="text-sm text-gray-500">
                      Get notified when a new order is placed
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Payment Confirmations</p>
                    <p className="text-sm text-gray-500">
                      Get notified when a payment is confirmed
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Low Stock Alerts</p>
                    <p className="text-sm text-gray-500">
                      Get notified when products are running low on stock
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Notification Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Payment Settings */}
        <TabsContent value="payment" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Payment Methods
              </CardTitle>
              <CardDescription>
                Manage your payment methods and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="font-medium">Bank Account</p>
                <div className="rounded-md border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-medium">LiveSell Shop</p>
                    <div className="text-sm text-gray-500">Primary</div>
                  </div>
                  <p className="text-sm text-gray-500">Account: 1234-5678-9012-3456</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline">
                <CreditCard className="mr-2 h-4 w-4" />
                Add Payment Method
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Shipping Settings */}
        <TabsContent value="shipping" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="mr-2 h-5 w-5" />
                Shipping Settings
              </CardTitle>
              <CardDescription>
                Manage your shipping options and defaults
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <FormLabel>Default Shipping Fee</FormLabel>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <Input
                    type="number"
                    className="pl-7"
                    defaultValue="8.50"
                    step="0.01"
                    min="0"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  This fee will be applied to all new orders by default
                </p>
              </div>
              
              <div className="space-y-2">
                <FormLabel>Shipping Provider</FormLabel>
                <Input defaultValue="USPS" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Shipping Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
