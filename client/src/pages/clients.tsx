import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Mail, Phone, Package, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

// Client form schema
const clientFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Clients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Create client form
  const form = useForm<z.infer<typeof clientFormSchema>>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
    },
  });
  
  // Fetch clients
  const { data: clients, isLoading } = useQuery({
    queryKey: ['/api/clients'],
  });
  
  // Fetch client orders when a client is selected
  const { data: clientOrders, isLoading: isLoadingClientOrders } = useQuery({
    queryKey: [`/api/clients/${selectedClient?.id}/orders`],
    enabled: !!selectedClient,
  });
  
  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: (data: z.infer<typeof clientFormSchema>) => {
      return apiRequest("POST", "/api/clients", data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: "Client created",
        description: "The client has been created successfully.",
      });
      form.reset();
      setIsClientFormOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to create client",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: z.infer<typeof clientFormSchema>) => {
    createClientMutation.mutate(data);
  };
  
  // Filter clients
  const filteredClients = clients
    ? clients.filter((client) => {
        // Search filter
        const matchesSearch =
          searchQuery === "" ||
          client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (client.phone && client.phone.includes(searchQuery));
        
        return matchesSearch;
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500">Manage your customers and their orders</p>
        </div>
        <div>
          <Button onClick={() => setIsClientFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </div>
      </div>
      
      {/* Search */}
      <div className="relative w-full md:max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search clients..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Clients Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="mt-1 h-4 w-24" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Skeleton className="mr-2 h-4 w-4" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <div className="flex items-center text-sm">
                    <Skeleton className="mr-2 h-4 w-4" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <Card key={client.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{client.name}</CardTitle>
                      <CardDescription>Client #{client.id}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <Mail className="mr-2 h-4 w-4" />
                    <span>{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Phone className="mr-2 h-4 w-4" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setSelectedClient(client)}
                    >
                      <Package className="mr-2 h-4 w-4" />
                      View Orders
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>{client.name}'s Orders</DialogTitle>
                      <DialogDescription>
                        All orders placed by this client
                      </DialogDescription>
                    </DialogHeader>
                    
                    {isLoadingClientOrders ? (
                      <div className="space-y-2 py-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    ) : clientOrders && clientOrders.length > 0 ? (
                      <div className="max-h-[60vh] overflow-y-auto py-4">
                        <div className="divide-y divide-gray-200 rounded-md border">
                          {clientOrders.map((order: any) => (
                            <div key={order.id} className="p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">Order #{order.id}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex flex-col items-end">
                                  <p className="font-medium">${order.totalAmount.toFixed(2)}</p>
                                  <div className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                                    {order.status}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="py-4 text-center text-gray-500">
                        This client has no orders.
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <Mail className="mb-4 h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">No clients found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery
              ? "No clients match your search."
              : "Add your first client to get started."}
          </p>
          {searchQuery ? (
            <Button
              variant="outline"
              onClick={() => setSearchQuery("")}
              className="mt-4"
            >
              Clear Search
            </Button>
          ) : (
            <Button onClick={() => setIsClientFormOpen(true)} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          )}
        </div>
      )}
      
      {/* Add Client Dialog */}
      <Dialog open={isClientFormOpen} onOpenChange={setIsClientFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Create a new client who can access their orders
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Maria Alvarez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="maria@example.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="+1 (555) 123-4567" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsClientFormOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createClientMutation.isPending}
                >
                  {createClientMutation.isPending ? "Creating..." : "Create Client"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
