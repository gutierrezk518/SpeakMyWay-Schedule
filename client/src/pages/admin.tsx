import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAppContext } from "@/contexts/app-context";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, formatDistance, subDays, eachDayOfInterval } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { 
  ArrowUpDown, 
  Check, 
  ChevronDown, 
  CircleUser, 
  ClipboardList, 
  Download, 
  Info, 
  Lock, 
  Mail,
  MoreHorizontal,
  Search, 
  Users 
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { language } = useAppContext();
  
  // Email test state
  const [testEmail, setTestEmail] = useState('');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [selectedTab, setSelectedTab] = useState("users");
  
  // ==== Users Tab ====
  const [userDetailDialogOpen, setUserDetailDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userLoginHistoryDialogOpen, setUserLoginHistoryDialogOpen] = useState(false);
  
  // User metrics
  const usersQuery = useQuery({
    queryKey: ['/api/admin/users'],
    retry: 1,
    refetchOnWindowFocus: false
  });
  
  const userCountQuery = useQuery({
    queryKey: ['/api/admin/users/count'],
    retry: 1,
    refetchOnWindowFocus: false
  });
  
  const newUsersQuery = useQuery({
    queryKey: ['/api/admin/users/new'],
    retry: 1,
    refetchOnWindowFocus: false
  });
  
  const activeUsersQuery = useQuery({
    queryKey: ['/api/admin/users/active'],
    retry: 1,
    refetchOnWindowFocus: false
  });
  
  const mostActiveUsersQuery = useQuery({
    queryKey: ['/api/admin/users/most-active'],
    retry: 1,
    refetchOnWindowFocus: false
  });
  
  // User login history
  const userLoginHistoryQuery = useQuery({
    queryKey: ['/api/admin/users', selectedUser?.id, 'login-history'],
    enabled: !!selectedUser?.id && userLoginHistoryDialogOpen,
    retry: 1,
    refetchOnWindowFocus: false
  });
  
  // Toggle admin status
  const toggleAdminStatus = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: number, isAdmin: boolean }) => {
      const response = await apiRequest("PATCH", `/api/admin/users/${userId}/admin`, { isAdmin });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "User updated",
        description: "Admin status has been updated successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating user",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // File upload state
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<{
    categories: File | null;
    subcategories: File | null;
    corewords: File | null;
    cards: File | null;
  }>({
    categories: null,
    subcategories: null,
    corewords: null,
    cards: null
  });
  
  // ==== Categories Tab ====
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    nameEs: "",
    icon: "",
    color: "blue-500",
    type: "vocabulary", // or "schedule"
    sortOrder: 0
  });

  // ==== Subcategories Tab ====
  const [subcategoryForm, setSubcategoryForm] = useState({
    categoryId: 1,
    name: "",
    nameEs: "",
    icon: "",
    color: "",
    sortOrder: 0
  });
  
  // ==== Core Words Tab ====
  const [coreWordForm, setCoreWordForm] = useState({
    text: "",
    textEs: "",
    icon: "",
    canBePlural: false,
    color: "",
    sortOrder: 0
  });
  
  // ==== Activity Cards Tab ====
  const [cardForm, setCardForm] = useState({
    text: "",
    speechText: "", // What the TTS should say in English (e.g., "Eat Breakfast")
    textEs: "", // Spanish text
    speechTextEs: "", // What the TTS should say in Spanish
    category: "",
    subcategory: "",
    icon: "",
    bgColor: "gray-100",
    canBePlural: false,
    language: "en",
    isScheduleCard: true,
    isCommunicationCard: false
  });

  // Fetch categories
  const categoriesQuery = useQuery({
    queryKey: ['/api/categories'],
    retry: 1,
    refetchOnWindowFocus: false
  });
  
  // Fetch subcategories
  const subcategoriesQuery = useQuery({
    queryKey: ['/api/subcategories'],
    retry: 1,
    refetchOnWindowFocus: false
  });
  
  // Fetch core words
  const coreWordsQuery = useQuery({
    queryKey: ['/api/corewords'],
    retry: 1,
    refetchOnWindowFocus: false
  });
  
  // Fetch activity cards
  const cardsQuery = useQuery({
    queryKey: ['/api/cards'],
    retry: 1,
    refetchOnWindowFocus: false
  });

  // Create category mutation
  const createCategory = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", '/api/categories', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setCategoryForm({
        name: "",
        nameEs: "",
        icon: "",
        color: "blue-500",
        type: "vocabulary",
        sortOrder: 0
      });
      toast({
        title: "Category created",
        description: "The category has been created successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating category",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Create subcategory mutation
  const createSubcategory = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", '/api/subcategories', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subcategories'] });
      setSubcategoryForm({
        categoryId: 1,
        name: "",
        nameEs: "",
        icon: "",
        color: "",
        sortOrder: 0
      });
      toast({
        title: "Subcategory created",
        description: "The subcategory has been created successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating subcategory",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Create core word mutation
  const createCoreWord = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", '/api/corewords', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/corewords'] });
      setCoreWordForm({
        text: "",
        textEs: "",
        icon: "",
        canBePlural: false,
        color: "",
        sortOrder: 0
      });
      toast({
        title: "Core word created",
        description: "The core word has been created successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating core word",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Create activity card mutation
  const createCard = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", '/api/cards', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cards'] });
      setCardForm({
        text: "",
        speechText: "",
        textEs: "",
        speechTextEs: "",
        category: "",
        subcategory: "",
        icon: "",
        bgColor: "gray-100",
        canBePlural: false,
        language: "en",
        isScheduleCard: true,
        isCommunicationCard: false
      });
      toast({
        title: "Activity card created",
        description: "The activity card has been created successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating activity card",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Check email verification status
  const checkEmailVerification = useMutation({
    mutationFn: async (emails: string[]) => {
      const response = await apiRequest("POST", '/api/admin/check-email-verification', { emails });
      return await response.json();
    },
    onSuccess: (data) => {
      setVerificationStatus(data);
    },
    onError: (error: any) => {
      toast({
        title: "Error Checking Verification",
        description: error.message || "Failed to check email verification status.",
        variant: "destructive"
      });
    }
  });

  // Send test email mutation
  const sendTestEmail = useMutation({
    mutationFn: async (data: string | { recipientEmail: string, provider?: string }) => {
      const emailData = typeof data === 'string' 
        ? { recipientEmail: data } 
        : data;
      
      const response = await apiRequest("POST", '/api/admin/test-email', emailData);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Test Email Sent",
        description: data.message || "A test email has been sent successfully.",
      });
      setSendingTestEmail(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error Sending Test Email",
        description: error.message || "Failed to send test email. Please check server logs.",
        variant: "destructive"
      });
      setSendingTestEmail(false);
    }
  });
  
  // Send welcome email to user mutation
  const sendWelcomeEmail = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest("POST", `/api/admin/users/${userId}/send-welcome-email`, {});
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Welcome Email Sent",
        description: data.message || "Welcome email sent successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Sending Welcome Email",
        description: error.message || "Failed to send welcome email. Please check server logs.",
        variant: "destructive"
      });
    }
  });

  // Generate mock user signup data for the chart based on users data
  const generateUserSignupData = () => {
    if (usersQuery.isLoading || usersQuery.isError || !usersQuery.data) {
      return [];
    }
    
    // Get last 30 days date range
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);
    
    // Create an array of dates for the last 30 days
    const dateRange = eachDayOfInterval({
      start: thirtyDaysAgo,
      end: today
    });
    
    // Map each user to their signup date (only using createdAt)
    const userSignups = usersQuery.data
      .filter((user: any) => user.createdAt)
      .map((user: any) => ({
        date: new Date(user.createdAt).toISOString().split('T')[0] // Format as YYYY-MM-DD
      }));
    
    // Create a map to count signups by date
    const signupsByDate = new Map();
    
    // Initialize all dates with 0 signups
    dateRange.forEach(date => {
      const dateStr = date.toISOString().split('T')[0];
      signupsByDate.set(dateStr, 0);
    });
    
    // Count signups for each date
    userSignups.forEach((signup: { date: string }) => {
      if (signupsByDate.has(signup.date)) {
        signupsByDate.set(signup.date, signupsByDate.get(signup.date) + 1);
      }
    });
    
    // Convert to array for the chart
    const chartData = Array.from(signupsByDate, ([date, count]) => ({
      date,
      signups: count
    })).sort((a, b) => a.date.localeCompare(b.date)); // Sort by date
    
    return chartData;
  };
  
  // Generate signup data
  const userSignupData = generateUserSignupData();

  // Handle form submissions
  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCategory.mutate(categoryForm);
  };

  const handleSubcategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSubcategory.mutate(subcategoryForm);
  };

  const handleCoreWordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCoreWord.mutate(coreWordForm);
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCard.mutate(cardForm);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <p className="mb-6 text-gray-600">
        Manage categories, subcategories, core words, and activity cards for the AAC application.
      </p>
      
      <Tabs defaultValue="users" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="users" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="subcategories">Subcategories</TabsTrigger>
          <TabsTrigger value="corewords">Core Words</TabsTrigger>
          <TabsTrigger value="cards">Activity Cards</TabsTrigger>
          <TabsTrigger value="import-export">Import/Export</TabsTrigger>
          <TabsTrigger value="email-settings" className="flex items-center gap-1">
            <Mail className="h-4 w-4" />
            Email Settings
          </TabsTrigger>
        </TabsList>
        
        {/* Users Tab */}
        <TabsContent value="users">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userCountQuery.isLoading ? (
                    "Loading..."
                  ) : userCountQuery.isError ? (
                    "Error"
                  ) : (
                    userCountQuery.data?.count || 0
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Registered user accounts
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Users (30d)</CardTitle>
                <CircleUser className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {newUsersQuery.isLoading ? (
                    "Loading..."
                  ) : newUsersQuery.isError ? (
                    "Error"
                  ) : (
                    newUsersQuery.data?.count || 0
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  New accounts in the last 30 days
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users (30d)</CardTitle>
                <Check className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activeUsersQuery.isLoading ? (
                    "Loading..."
                  ) : activeUsersQuery.isError ? (
                    "Error"
                  ) : (
                    activeUsersQuery.data?.count || 0
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Users who logged in during last 30 days
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
                <Lock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {usersQuery.isLoading 
                    ? "Loading..."
                    : usersQuery.isError 
                    ? "Error" 
                    : usersQuery.data?.filter((user: any) => user.isAdmin).length || 0
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Users with administrative privileges
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
                <CardDescription>
                  Activity statistics and user engagement metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Most Active Users</h3>
                    {mostActiveUsersQuery.isLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : mostActiveUsersQuery.isError ? (
                      <div className="text-center py-4 text-destructive">
                        Error loading active users data
                      </div>
                    ) : mostActiveUsersQuery.data?.length === 0 ? (
                      <div className="text-center py-4">
                        No active user data available
                      </div>
                    ) : (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Username</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Login Count</TableHead>
                              <TableHead>Time in System</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {mostActiveUsersQuery.data?.slice(0, 5).map((item: any) => (
                              <TableRow key={item.user.id}>
                                <TableCell className="font-medium">{item.user.username}</TableCell>
                                <TableCell>{item.user.email || "-"}</TableCell>
                                <TableCell>{item.loginCount}</TableCell>
                                <TableCell>
                                  {item.user.createdAt ? 
                                    formatDistance(new Date(item.user.createdAt), new Date()) : "-"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                  
                  {/* User Signup Trend Chart */}
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-2">User Signup Trend (Last 30 Days)</h3>
                    {usersQuery.isLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : usersQuery.isError ? (
                      <div className="text-center py-4 text-destructive">
                        Error loading user data
                      </div>
                    ) : userSignupData.length === 0 ? (
                      <div className="text-center py-4">
                        No user signup data available
                      </div>
                    ) : (
                      <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={userSignupData}
                            margin={{
                              top: 5,
                              right: 20,
                              left: 5,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              tick={{ fontSize: 12 }}
                              tickFormatter={(value) => {
                                const date = new Date(value);
                                return format(date, 'MMM dd');
                              }}
                            />
                            <YAxis 
                              allowDecimals={false}
                              tick={{ fontSize: 12 }}
                            />
                            <Tooltip 
                              formatter={(value) => [`${value} signups`, 'Signups']}
                              labelFormatter={(value) => format(new Date(value), 'MMMM d, yyyy')}
                            />
                            <Line
                              type="monotone"
                              dataKey="signups"
                              stroke="#4F46E5"
                              strokeWidth={2}
                              activeDot={{ r: 7 }}
                              name="New Users"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  View and manage all registered users and their information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usersQuery.isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : usersQuery.isError ? (
                  <div className="text-center py-8 text-destructive">
                    Error loading users data
                  </div>
                ) : usersQuery.data?.length === 0 ? (
                  <div className="text-center py-8">
                    No users found in the database
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">ID</TableHead>
                          <TableHead>Username</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Last Login</TableHead>
                          <TableHead>Time in System</TableHead>
                          <TableHead className="w-[100px]">Role</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {usersQuery.data?.map((user: any) => (
                          <TableRow key={user.id}>
                            <TableCell>{user.id}</TableCell>
                            <TableCell className="font-medium">{user.username}</TableCell>
                            <TableCell>{user.email || "-"}</TableCell>
                            <TableCell>
                              {user.createdAt ? (
                                <span title={user.createdAt}>
                                  {formatDistance(new Date(user.createdAt), new Date(), { addSuffix: true })}
                                </span>
                              ) : "-"}
                            </TableCell>
                            <TableCell>
                              {user.lastLoginAt ? (
                                <span title={user.lastLoginAt}>
                                  {formatDistance(new Date(user.lastLoginAt), new Date(), { addSuffix: true })}
                                </span>
                              ) : "Never"}
                            </TableCell>
                            <TableCell>
                              {user.createdAt ? (
                                <span title={`Account created ${format(new Date(user.createdAt), 'PPpp')}`}>
                                  {formatDistance(new Date(user.createdAt), new Date())}
                                </span>
                              ) : "-"}
                            </TableCell>
                            <TableCell>
                              {user.isAdmin ? (
                                <Badge className="bg-primary">Admin</Badge>
                              ) : (
                                <Badge variant="outline">User</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setUserDetailDialogOpen(true);
                                    }}
                                  >
                                    <Info className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setUserLoginHistoryDialogOpen(true);
                                    }}
                                  >
                                    <ClipboardList className="h-4 w-4 mr-2" />
                                    Login History
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => toggleAdminStatus.mutate({ 
                                      userId: user.id, 
                                      isAdmin: !user.isAdmin 
                                    })}
                                  >
                                    <Lock className="h-4 w-4 mr-2" />
                                    {user.isAdmin ? "Remove Admin" : "Make Admin"}
                                  </DropdownMenuItem>
                                  {user.email && (
                                    <DropdownMenuItem
                                      onClick={() => {
                                        // Create function to send email manually
                                        toast({
                                          title: "Sending welcome email",
                                          description: `Sending welcome email to ${user.username} at ${user.email}`
                                        });
                                        apiRequest("POST", `/api/admin/users/${user.id}/send-welcome-email`)
                                          .then(() => {
                                            toast({
                                              title: "Email sent",
                                              description: `Welcome email sent to ${user.email}`
                                            });
                                          })
                                          .catch(err => {
                                            toast({
                                              title: "Error sending email",
                                              description: err.message || "Failed to send welcome email",
                                              variant: "destructive"
                                            });
                                          });
                                      }}
                                    >
                                      <Mail className="h-4 w-4 mr-2" />
                                      Send Welcome Email
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* User Detail Dialog */}
          <Dialog open={userDetailDialogOpen} onOpenChange={setUserDetailDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>User Details</DialogTitle>
                <DialogDescription>
                  Detailed information about the selected user account.
                </DialogDescription>
              </DialogHeader>
              {selectedUser && (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">ID</Label>
                    <div className="col-span-3">{selectedUser.id}</div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Username</Label>
                    <div className="col-span-3 font-medium">{selectedUser.username}</div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Email</Label>
                    <div className="col-span-3">{selectedUser.email || "-"}</div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Full Name</Label>
                    <div className="col-span-3">{selectedUser.name || "-"}</div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Role</Label>
                    <div className="col-span-3">
                      {selectedUser.isAdmin ? (
                        <Badge className="bg-primary">Administrator</Badge>
                      ) : (
                        <Badge variant="outline">Regular User</Badge>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Created</Label>
                    <div className="col-span-3">
                      {selectedUser.createdAt ? format(new Date(selectedUser.createdAt), 'PPpp') : '-'}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Last Login</Label>
                    <div className="col-span-3">
                      {selectedUser.lastLoginAt ? format(new Date(selectedUser.lastLoginAt), 'PPpp') : 'Never'}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Last IP</Label>
                    <div className="col-span-3">{selectedUser.lastLoginIp || '-'}</div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Time in System</Label>
                    <div className="col-span-3">
                      {selectedUser.createdAt ? formatDistance(new Date(selectedUser.createdAt), new Date()) : '-'}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Usage Analytics</Label>
                    <div className="col-span-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => setUserLoginHistoryDialogOpen(true)}
                      >
                        <ClipboardList className="h-4 w-4 mr-2" />
                        View Login History
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
          
          {/* Login History Dialog */}
          <Dialog open={userLoginHistoryDialogOpen} onOpenChange={setUserLoginHistoryDialogOpen}>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>User Login History</DialogTitle>
                <DialogDescription>
                  {selectedUser && `Login activity for ${selectedUser.username}`}
                </DialogDescription>
              </DialogHeader>
              {userLoginHistoryQuery.isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : userLoginHistoryQuery.isError ? (
                <div className="text-center py-8 text-destructive">
                  Error loading login history
                </div>
              ) : userLoginHistoryQuery.data?.length === 0 ? (
                <div className="text-center py-8">
                  No login records found for this user
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Browser</TableHead>
                        <TableHead>Device</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userLoginHistoryQuery.data?.map((login: any) => (
                        <TableRow key={login.id}>
                          <TableCell>
                            {login.createdAt ? format(new Date(login.createdAt), 'PPpp') : '-'}
                          </TableCell>
                          <TableCell>{login.ipAddress}</TableCell>
                          <TableCell>{login.browser}</TableCell>
                          <TableCell>{login.device}</TableCell>
                          <TableCell className="text-right">
                            {login.success ? (
                              <Badge className="bg-green-500">Success</Badge>
                            ) : (
                              <Badge variant="destructive">Failed</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>
      
        {/* Categories Tab */}
        <TabsContent value="categories">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Category</CardTitle>
                <CardDescription>
                  Create a new category for organizing vocabulary or schedule activities.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleCategorySubmit}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name (English)</Label>
                      <Input 
                        id="name" 
                        value={categoryForm.name} 
                        onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="nameEs">Name (Spanish)</Label>
                      <Input 
                        id="nameEs" 
                        value={categoryForm.nameEs} 
                        onChange={(e) => setCategoryForm({...categoryForm, nameEs: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="icon">Icon</Label>
                      <Input 
                        id="icon" 
                        value={categoryForm.icon} 
                        onChange={(e) => setCategoryForm({...categoryForm, icon: e.target.value})}
                        placeholder="ri-food-line (Remix Icon Name)"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <Input 
                        id="color" 
                        value={categoryForm.color} 
                        onChange={(e) => setCategoryForm({...categoryForm, color: e.target.value})}
                        placeholder="blue-500 (Tailwind Color)"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select 
                        value={categoryForm.type} 
                        onValueChange={(value) => setCategoryForm({...categoryForm, type: value})}
                      >
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Select category type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vocabulary">Vocabulary</SelectItem>
                          <SelectItem value="schedule">Schedule</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sortOrder">Sort Order</Label>
                      <Input 
                        id="sortOrder" 
                        type="number"
                        value={categoryForm.sortOrder.toString()} 
                        onChange={(e) => setCategoryForm({...categoryForm, sortOrder: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={createCategory.isPending}>
                    {createCategory.isPending ? "Creating..." : "Create Category"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Existing Categories</h2>
              {categoriesQuery.isLoading ? (
                <p>Loading categories...</p>
              ) : categoriesQuery.isError ? (
                <p className="text-red-500">Error loading categories</p>
              ) : categoriesQuery.data?.length === 0 ? (
                <p>No categories found. Add your first category!</p>
              ) : (
                <div className="space-y-4">
                  {categoriesQuery.data?.map((category: any) => (
                    <Card key={category.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <CardDescription>{category.nameEs}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p><span className="font-medium">Icon:</span> {category.icon}</p>
                        <p><span className="font-medium">Color:</span> {category.color}</p>
                        <p><span className="font-medium">Type:</span> {category.type}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* Subcategories Tab */}
        <TabsContent value="subcategories">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Subcategory</CardTitle>
                <CardDescription>
                  Create a new subcategory for a specific category.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubcategorySubmit}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="categoryId">Parent Category</Label>
                      <Select 
                        value={subcategoryForm.categoryId.toString()} 
                        onValueChange={(value) => setSubcategoryForm({...subcategoryForm, categoryId: parseInt(value)})}
                      >
                        <SelectTrigger id="categoryId">
                          <SelectValue placeholder="Select parent category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoriesQuery.data?.map((category: any) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subName">Name (English)</Label>
                      <Input 
                        id="subName" 
                        value={subcategoryForm.name} 
                        onChange={(e) => setSubcategoryForm({...subcategoryForm, name: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subNameEs">Name (Spanish)</Label>
                      <Input 
                        id="subNameEs" 
                        value={subcategoryForm.nameEs} 
                        onChange={(e) => setSubcategoryForm({...subcategoryForm, nameEs: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subIcon">Icon</Label>
                      <Input 
                        id="subIcon" 
                        value={subcategoryForm.icon} 
                        onChange={(e) => setSubcategoryForm({...subcategoryForm, icon: e.target.value})}
                        placeholder="ri-food-line (optional)"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subColor">Color</Label>
                      <Input 
                        id="subColor" 
                        value={subcategoryForm.color} 
                        onChange={(e) => setSubcategoryForm({...subcategoryForm, color: e.target.value})}
                        placeholder="blue-500 (optional)"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subSortOrder">Sort Order</Label>
                      <Input 
                        id="subSortOrder" 
                        type="number"
                        value={subcategoryForm.sortOrder.toString()} 
                        onChange={(e) => setSubcategoryForm({...subcategoryForm, sortOrder: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={createSubcategory.isPending || categoriesQuery.isLoading}>
                    {createSubcategory.isPending ? "Creating..." : "Create Subcategory"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Existing Subcategories</h2>
              {subcategoriesQuery.isLoading ? (
                <p>Loading subcategories...</p>
              ) : subcategoriesQuery.isError ? (
                <p className="text-red-500">Error loading subcategories</p>
              ) : subcategoriesQuery.data?.length === 0 ? (
                <p>No subcategories found. Add your first subcategory!</p>
              ) : (
                <div className="space-y-4">
                  {subcategoriesQuery.data?.map((subcategory: any) => {
                    const parentCategory = categoriesQuery.data?.find((c: any) => c.id === subcategory.categoryId);
                    return (
                      <Card key={subcategory.id}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{subcategory.name}</CardTitle>
                          <CardDescription>
                            {subcategory.nameEs} - Under: {parentCategory?.name || "Unknown"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {subcategory.icon && <p><span className="font-medium">Icon:</span> {subcategory.icon}</p>}
                          {subcategory.color && <p><span className="font-medium">Color:</span> {subcategory.color}</p>}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* Core Words Tab */}
        <TabsContent value="corewords">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Core Word</CardTitle>
                <CardDescription>
                  Create a new core word for the communication board.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleCoreWordSubmit}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="coreText">Text (English)</Label>
                      <Input 
                        id="coreText" 
                        value={coreWordForm.text} 
                        onChange={(e) => setCoreWordForm({...coreWordForm, text: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="coreTextEs">Text (Spanish)</Label>
                      <Input 
                        id="coreTextEs" 
                        value={coreWordForm.textEs} 
                        onChange={(e) => setCoreWordForm({...coreWordForm, textEs: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="coreIcon">Icon</Label>
                      <Input 
                        id="coreIcon" 
                        value={coreWordForm.icon} 
                        onChange={(e) => setCoreWordForm({...coreWordForm, icon: e.target.value})}
                        placeholder="ri-action-line"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="coreColor">Color</Label>
                      <Input 
                        id="coreColor" 
                        value={coreWordForm.color} 
                        onChange={(e) => setCoreWordForm({...coreWordForm, color: e.target.value})}
                        placeholder="blue-500"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="coreCanBePlural" 
                        checked={coreWordForm.canBePlural}
                        onCheckedChange={(checked) => setCoreWordForm({...coreWordForm, canBePlural: checked})}
                      />
                      <Label htmlFor="coreCanBePlural">Can be Plural</Label>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="coreSortOrder">Sort Order</Label>
                      <Input 
                        id="coreSortOrder" 
                        type="number"
                        value={coreWordForm.sortOrder.toString()} 
                        onChange={(e) => setCoreWordForm({...coreWordForm, sortOrder: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={createCoreWord.isPending}>
                    {createCoreWord.isPending ? "Creating..." : "Create Core Word"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Existing Core Words</h2>
              {coreWordsQuery.isLoading ? (
                <p>Loading core words...</p>
              ) : coreWordsQuery.isError ? (
                <p className="text-red-500">Error loading core words</p>
              ) : coreWordsQuery.data?.length === 0 ? (
                <p>No core words found. Add your first core word!</p>
              ) : (
                <div className="space-y-4">
                  {coreWordsQuery.data?.map((coreWord: any) => (
                    <Card key={coreWord.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{coreWord.text}</CardTitle>
                        <CardDescription>{coreWord.textEs}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p><span className="font-medium">Icon:</span> {coreWord.icon}</p>
                        {coreWord.color && <p><span className="font-medium">Color:</span> {coreWord.color}</p>}
                        <p><span className="font-medium">Can be Plural:</span> {coreWord.canBePlural ? "Yes" : "No"}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* Activity Cards Tab */}
        <TabsContent value="cards">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Activity Card</CardTitle>
                <CardDescription>
                  Create a new activity card for the schedule or communication board.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleCardSubmit}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardText">Text (English)</Label>
                      <Input 
                        id="cardText" 
                        value={cardForm.text} 
                        onChange={(e) => setCardForm({...cardForm, text: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cardSpeechText">
                        Speech Text (English)
                        <span className="text-xs text-gray-500 block">What should be spoken (e.g., "Eat Breakfast")</span>
                      </Label>
                      <Input 
                        id="cardSpeechText" 
                        value={cardForm.speechText} 
                        onChange={(e) => setCardForm({...cardForm, speechText: e.target.value})}
                        placeholder="Leave blank to use the card text"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cardTextEs">Text (Spanish)</Label>
                      <Input 
                        id="cardTextEs" 
                        value={cardForm.textEs} 
                        onChange={(e) => setCardForm({...cardForm, textEs: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cardSpeechTextEs">
                        Speech Text (Spanish)
                        <span className="text-xs text-gray-500 block">What should be spoken in Spanish</span>
                      </Label>
                      <Input 
                        id="cardSpeechTextEs" 
                        value={cardForm.speechTextEs} 
                        onChange={(e) => setCardForm({...cardForm, speechTextEs: e.target.value})}
                        placeholder="Leave blank to use the Spanish card text"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cardCategory">Category</Label>
                      <Select 
                        value={cardForm.category}
                        onValueChange={(value) => setCardForm({...cardForm, category: value})}
                      >
                        <SelectTrigger id="cardCategory">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoriesQuery.data?.map((category: any) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cardSubcategory">Subcategory</Label>
                      <Select 
                        value={cardForm.subcategory}
                        onValueChange={(value) => setCardForm({...cardForm, subcategory: value})}
                      >
                        <SelectTrigger id="cardSubcategory">
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          {subcategoriesQuery.data
                            ?.filter((subcategory: any) => {
                              const parentCategory = categoriesQuery.data?.find(
                                (c: any) => c.id === subcategory.categoryId
                              );
                              return parentCategory?.name === cardForm.category;
                            })
                            .map((subcategory: any) => (
                              <SelectItem key={subcategory.id} value={subcategory.name}>
                                {subcategory.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cardIcon">Icon</Label>
                      <Input 
                        id="cardIcon" 
                        value={cardForm.icon} 
                        onChange={(e) => setCardForm({...cardForm, icon: e.target.value})}
                        placeholder="ri-cup-line"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cardBgColor">Background Color</Label>
                      <Input 
                        id="cardBgColor" 
                        value={cardForm.bgColor} 
                        onChange={(e) => setCardForm({...cardForm, bgColor: e.target.value})}
                        placeholder="blue-300"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="cardCanBePlural" 
                        checked={cardForm.canBePlural}
                        onCheckedChange={(checked) => setCardForm({...cardForm, canBePlural: checked})}
                      />
                      <Label htmlFor="cardCanBePlural">Can be Plural</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="cardIsScheduleCard" 
                        checked={cardForm.isScheduleCard}
                        onCheckedChange={(checked) => setCardForm({...cardForm, isScheduleCard: checked})}
                      />
                      <Label htmlFor="cardIsScheduleCard">Use in Schedule</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="cardIsCommunicationCard" 
                        checked={cardForm.isCommunicationCard}
                        onCheckedChange={(checked) => setCardForm({...cardForm, isCommunicationCard: checked})}
                      />
                      <Label htmlFor="cardIsCommunicationCard">Use in Communication</Label>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={createCard.isPending}>
                    {createCard.isPending ? "Creating..." : "Create Activity Card"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Existing Activity Cards</h2>
              {cardsQuery.isLoading ? (
                <p>Loading activity cards...</p>
              ) : cardsQuery.isError ? (
                <p className="text-red-500">Error loading activity cards</p>
              ) : cardsQuery.data?.length === 0 ? (
                <p>No activity cards found. Add your first activity card!</p>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {cardsQuery.data?.map((card: any) => (
                    <Card key={card.id}>
                      <CardHeader className={`pb-2 bg-${card.bgColor} rounded-t-lg`}>
                        <CardTitle className="text-lg">{card.text}</CardTitle>
                        <CardDescription>{card.textEs}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <p><span className="font-medium">Speech Text:</span> {card.speechText || card.text}</p>
                        {card.speechTextEs && (
                          <p><span className="font-medium">Spanish Speech:</span> {card.speechTextEs}</p>
                        )}
                        <p><span className="font-medium">Icon:</span> {card.icon}</p>
                        <p><span className="font-medium">Category:</span> {card.category}</p>
                        <p><span className="font-medium">Subcategory:</span> {card.subcategory}</p>
                        <div className="mt-2">
                          {card.isScheduleCard && (
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">
                              Schedule
                            </span>
                          )}
                          {card.isCommunicationCard && (
                            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              Communication
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Import/Export Tab */}
        <TabsContent value="import-export">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Download CSV Templates</CardTitle>
                <CardDescription>
                  Download template CSV files to fill with your data.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Available Templates:</h3>
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      onClick={() => {
                        const categoryTemplate = 'name,nameEs,icon,color,type,sortOrder\nFood,Comida,ri-restaurant-line,green-500,vocabulary,0\nTransportation,Transporte,ri-car-line,blue-500,vocabulary,1';
                        
                        const blob = new Blob([categoryTemplate], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'categories_template.csv';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);

                        toast({
                          title: "Template Downloaded",
                          description: "Categories template has been downloaded."
                        });
                      }}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <i className="ri-file-download-line mr-2"></i>
                      Categories Template
                    </Button>

                    <Button
                      onClick={() => {
                        const subcategoryTemplate = 'categoryId,name,nameEs,icon,color,sortOrder\n1,Fruits,Frutas,ri-apple-line,red-500,0\n1,Vegetables,Verduras,ri-plant-line,green-500,1';
                        
                        const blob = new Blob([subcategoryTemplate], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'subcategories_template.csv';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);

                        toast({
                          title: "Template Downloaded",
                          description: "Subcategories template has been downloaded."
                        });
                      }}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <i className="ri-file-download-line mr-2"></i>
                      Subcategories Template
                    </Button>

                    <Button
                      onClick={() => {
                        const coreWordTemplate = 'text,textEs,icon,canBePlural,color,sortOrder\nI,Yo,ri-user-line,false,blue-500,0\nWant,Quiero,ri-hand-line,false,pink-500,1';
                        
                        const blob = new Blob([coreWordTemplate], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'corewords_template.csv';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);

                        toast({
                          title: "Template Downloaded",
                          description: "Core words template has been downloaded."
                        });
                      }}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <i className="ri-file-download-line mr-2"></i>
                      Core Words Template
                    </Button>

                    <Button
                      onClick={() => {
                        const cardsTemplate = 'text,speechText,textEs,speechTextEs,category,subcategory,icon,bgColor,canBePlural,language,isScheduleCard,isCommunicationCard\nApple,Apple,Manzana,Manzana,Food,Fruits,ri-apple-line,red-100,false,en,false,true\nBreakfast,Eat Breakfast,Desayuno,Comer Desayuno,Routine,Morning,ri-restaurant-line,orange-100,false,en,true,false';
                        
                        const blob = new Blob([cardsTemplate], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'cards_template.csv';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);

                        toast({
                          title: "Template Downloaded",
                          description: "Activity cards template has been downloaded."
                        });
                      }}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <i className="ri-file-download-line mr-2"></i>
                      Activity Cards Template
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upload CSV Files</CardTitle>
                <CardDescription>
                  Upload your filled CSV files to import the data.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoriesFile">Categories CSV File</Label>
                    <Input 
                      id="categoriesFile" 
                      type="file" 
                      accept=".csv" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFiles(prev => ({...prev, categories: file}));
                          toast({
                            title: "File Selected",
                            description: `Categories file "${file.name}" selected.`
                          });
                        }
                      }}
                    />
                    {selectedFiles.categories && (
                      <p className="text-xs text-muted-foreground">
                        Selected: {selectedFiles.categories.name}
                      </p>
                    )}
                    <Button 
                      onClick={async () => {
                        if (!selectedFiles.categories) {
                          toast({
                            title: "No File Selected",
                            description: "Please select a CSV file first.",
                            variant: "destructive",
                          });
                          return;
                        }
                        
                        const formData = new FormData();
                        formData.append("file", selectedFiles.categories);
                        
                        setUploading(true);
                        try {
                          const response = await fetch("/api/import/categories", {
                            method: "POST",
                            body: formData,
                          });
                          
                          const data = await response.json();
                          
                          if (response.ok) {
                            toast({
                              title: "Import Successful",
                              description: `Successfully imported ${data.totalImported} categories. ${data.totalErrors} failed.`,
                            });
                          } else {
                            toast({
                              title: "Import Failed",
                              description: data.message || "An error occurred during import.",
                              variant: "destructive",
                            });
                          }
                        } catch (error) {
                          toast({
                            title: "Import Failed",
                            description: "An error occurred during the upload process.",
                            variant: "destructive",
                          });
                        } finally {
                          setUploading(false);
                        }
                      }}
                      variant="outline"
                      size="sm"
                      disabled={!selectedFiles.categories || uploading}
                    >
                      {uploading ? "Uploading..." : "Upload Categories"}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subcategoriesFile">Subcategories CSV File</Label>
                    <Input 
                      id="subcategoriesFile" 
                      type="file" 
                      accept=".csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFiles(prev => ({...prev, subcategories: file}));
                          toast({
                            title: "File Selected",
                            description: `Subcategories file "${file.name}" selected.`
                          });
                        }
                      }}
                    />
                    {selectedFiles.subcategories && (
                      <p className="text-xs text-muted-foreground">
                        Selected: {selectedFiles.subcategories.name}
                      </p>
                    )}
                    <Button 
                      onClick={async () => {
                        if (!selectedFiles.subcategories) {
                          toast({
                            title: "No File Selected",
                            description: "Please select a CSV file first.",
                            variant: "destructive",
                          });
                          return;
                        }
                        
                        const formData = new FormData();
                        formData.append("file", selectedFiles.subcategories);
                        
                        setUploading(true);
                        try {
                          const response = await fetch("/api/import/subcategories", {
                            method: "POST",
                            body: formData,
                          });
                          
                          const data = await response.json();
                          
                          if (response.ok) {
                            toast({
                              title: "Import Successful",
                              description: `Successfully imported ${data.totalImported} subcategories. ${data.totalErrors} failed.`,
                            });
                          } else {
                            toast({
                              title: "Import Failed",
                              description: data.message || "An error occurred during import.",
                              variant: "destructive",
                            });
                          }
                        } catch (error) {
                          toast({
                            title: "Import Failed",
                            description: "An error occurred during the upload process.",
                            variant: "destructive",
                          });
                        } finally {
                          setUploading(false);
                        }
                      }}
                      variant="outline"
                      size="sm"
                      disabled={!selectedFiles.subcategories || uploading}
                    >
                      {uploading ? "Uploading..." : "Upload Subcategories"}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="corewordsFile">Core Words CSV File</Label>
                    <Input 
                      id="corewordsFile" 
                      type="file" 
                      accept=".csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFiles(prev => ({...prev, corewords: file}));
                          toast({
                            title: "File Selected",
                            description: `Core words file "${file.name}" selected.`
                          });
                        }
                      }}
                    />
                    {selectedFiles.corewords && (
                      <p className="text-xs text-muted-foreground">
                        Selected: {selectedFiles.corewords.name}
                      </p>
                    )}
                    <Button 
                      onClick={async () => {
                        if (!selectedFiles.corewords) {
                          toast({
                            title: "No File Selected",
                            description: "Please select a CSV file first.",
                            variant: "destructive",
                          });
                          return;
                        }
                        
                        const formData = new FormData();
                        formData.append("file", selectedFiles.corewords);
                        
                        setUploading(true);
                        try {
                          const response = await fetch("/api/import/corewords", {
                            method: "POST",
                            body: formData,
                          });
                          
                          const data = await response.json();
                          
                          if (response.ok) {
                            toast({
                              title: "Import Successful",
                              description: `Successfully imported ${data.totalImported} core words. ${data.totalErrors} failed.`,
                            });
                          } else {
                            toast({
                              title: "Import Failed",
                              description: data.message || "An error occurred during import.",
                              variant: "destructive",
                            });
                          }
                        } catch (error) {
                          toast({
                            title: "Import Failed",
                            description: "An error occurred during the upload process.",
                            variant: "destructive",
                          });
                        } finally {
                          setUploading(false);
                        }
                      }}
                      variant="outline"
                      size="sm"
                      disabled={!selectedFiles.corewords || uploading}
                    >
                      {uploading ? "Uploading..." : "Upload Core Words"}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardsFile">Activity Cards CSV File</Label>
                    <Input 
                      id="cardsFile" 
                      type="file" 
                      accept=".csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFiles(prev => ({...prev, cards: file}));
                          toast({
                            title: "File Selected",
                            description: `Activity cards file "${file.name}" selected.`
                          });
                        }
                      }}
                    />
                    {selectedFiles.cards && (
                      <p className="text-xs text-muted-foreground">
                        Selected: {selectedFiles.cards.name}
                      </p>
                    )}
                    <Button 
                      onClick={async () => {
                        if (!selectedFiles.cards) {
                          toast({
                            title: "No File Selected",
                            description: "Please select a CSV file first.",
                            variant: "destructive",
                          });
                          return;
                        }
                        
                        const formData = new FormData();
                        formData.append("file", selectedFiles.cards);
                        // If we have a userId, add it to the query
                        const userId = 1; // For testing purposes; in production, get from user context
                        
                        setUploading(true);
                        try {
                          const response = await fetch(`/api/import/cards?userId=${userId}`, {
                            method: "POST",
                            body: formData,
                          });
                          
                          const data = await response.json();
                          
                          if (response.ok) {
                            toast({
                              title: "Import Successful",
                              description: `Successfully imported ${data.totalImported} activity cards. ${data.totalErrors} failed.`,
                            });
                          } else {
                            toast({
                              title: "Import Failed",
                              description: data.message || "An error occurred during import.",
                              variant: "destructive",
                            });
                          }
                        } catch (error) {
                          toast({
                            title: "Import Failed",
                            description: "An error occurred during the upload process.",
                            variant: "destructive",
                          });
                        } finally {
                          setUploading(false);
                        }
                      }}
                      variant="outline"
                      size="sm"
                      disabled={!selectedFiles.cards || uploading}
                    >
                      {uploading ? "Uploading..." : "Upload Activity Cards"}
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => {
                    // Reset all selected files
                    setSelectedFiles({
                      categories: null,
                      subcategories: null,
                      corewords: null,
                      cards: null
                    });
                    toast({
                      title: "Selection Cleared",
                      description: "All selected files have been cleared."
                    });
                  }}
                  disabled={!Object.values(selectedFiles).some(file => file !== null)}
                >
                  <i className="ri-refresh-line mr-2"></i>
                  Clear Selected Files
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Email Settings Tab */}
        <TabsContent value="email-settings">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Email Configuration</CardTitle>
                <CardDescription>
                  Manage email settings and send test emails
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-5">
                  <Label htmlFor="test-email">Test Email Address</Label>
                  <div className="flex flex-col gap-2 mt-1.5">
                    <div className="flex gap-2">
                      <Input 
                        id="test-email" 
                        placeholder="Enter email address" 
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => {
                            if (!testEmail || !testEmail.includes('@')) {
                              toast({
                                title: "Invalid Email",
                                description: "Please enter a valid email address",
                                variant: "destructive"
                              });
                              return;
                            }
                            setSendingTestEmail(true);
                            sendTestEmail.mutate(testEmail);
                          }}
                          disabled={sendingTestEmail || !testEmail}
                        >
                          {sendingTestEmail ? 'Sending...' : 'Send Test'}
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (!testEmail || !testEmail.includes('@')) {
                            toast({
                              title: "Invalid Email",
                              description: "Please enter a valid email address",
                              variant: "destructive"
                            });
                            return;
                          }
                          setSendingTestEmail(true);
                          sendTestEmail.mutate({ recipientEmail: testEmail, provider: 'sendgrid' });
                        }}
                        disabled={sendingTestEmail || !testEmail}
                      >
                        Try with SendGrid
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        (Alternative provider, requires API key)
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Send a test email to verify your email configuration
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start space-y-2">
                <div className="p-4 border rounded-md bg-green-50 border-green-200 w-full">
                  <div className="flex items-start">
                    <Info className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-green-800">Resend Email Service Configured</h3>
                      <p className="text-xs text-green-700 mt-1">
                        Emails are now sent using Resend, a modern email delivery service that doesn't require recipient verification.
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        <span className="font-medium">Default sender:</span> <code className="bg-green-100 px-1 py-0.5 rounded">onboarding@resend.dev</code>
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        <span className="font-medium">Status:</span> <span className="text-green-600 font-medium">Active</span>
                      </p>

                      <div className="mt-2 border-t border-green-200 pt-2">
                        <p className="text-xs font-medium text-green-800">Resend Email Service Features:</p>
                        <ul className="text-xs text-green-700 list-disc pl-5 mt-1 space-y-1">
                          <li>No recipient email verification required</li>
                          <li>High deliverability rates</li>
                          <li>Email analytics and tracking</li>
                          <li>Simple API for easy integration</li>
                          <li>Support for HTML and text emails</li>
                        </ul>
                      </div>
                      
                      <div className="mt-2 border-t border-green-200 pt-2">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-xs font-medium text-green-800">Test Email</p>
                          <a 
                            href="https://resend.com/overview" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-xs flex items-center"
                          >
                            Resend Dashboard
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                        <p className="text-xs text-green-700 mb-2">
                          Send a test email to verify your email configuration is working correctly.
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              if (!testEmail || !testEmail.includes('@')) {
                                toast({
                                  title: "Invalid Email",
                                  description: "Please enter a valid email address",
                                  variant: "destructive"
                                });
                                return;
                              }
                              setSendingTestEmail(true);
                              sendTestEmail.mutate({ recipientEmail: testEmail });
                            }}
                            disabled={sendingTestEmail || !testEmail}
                            className="text-xs"
                          >
                            {sendingTestEmail ? (
                              <>
                                <div className="h-3 w-3 mr-1 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Mail className="h-3 w-3 mr-1" />
                                Send Test Email
                              </>
                            )}
                          </Button>
                          <Input 
                            placeholder="Enter test email address" 
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardFooter>
            </Card>
            
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>
                  Preview and test email templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="border rounded-md p-4">
                    <h3 className="text-lg font-medium mb-2">Welcome Email</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Sent automatically when a new user registers with an email address
                    </p>
                    
                    <div className="space-y-1 mb-4">
                      <span className="text-xs font-medium">Features:</span>
                      <ul className="text-xs space-y-1 list-disc pl-5">
                        <li>Personalized with username</li>
                        <li>Application feature highlights</li>
                        <li>Getting started links</li>
                        <li>Support contact information</li>
                        <li>Responsive design for mobile devices</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-50 border rounded-md p-4 mb-4">
                      <span className="text-xs font-medium block mb-1">Preview:</span>
                      <div className="text-xs">
                        <p><strong>Subject:</strong> Welcome to SpeakMyWay, [username]!</p>
                        <p className="mt-1"><strong>From:</strong> SpeakMyWay &lt;onboarding@resend.dev&gt;</p>
                        <p className="mt-1"><strong>To:</strong> [user's email address]</p>
                        <p className="mt-2 text-muted-foreground italic">Enhanced with HTML formatting, responsive design, and plain text fallback</p>
                      </div>
                    </div>
                    
                    {usersQuery.data && Array.isArray(usersQuery.data) && usersQuery.data.length > 0 && (
                      <div>
                        <span className="text-xs font-medium">Send test welcome email to user:</span>
                        <div className="mt-2 flex flex-col gap-4">
                          {(usersQuery.data as any[]).slice(0, 3).map((user: any) => (
                            <div key={user.id} className="flex items-center justify-between p-2 border rounded-md">
                              <div>
                                <span className="font-medium">{user.username}</span>
                                <span className="text-xs text-muted-foreground block">
                                  {user.email || 'No email address'}
                                </span>
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => sendWelcomeEmail.mutate(user.id)}
                                disabled={!user.email || sendWelcomeEmail.isPending}
                              >
                                {sendWelcomeEmail.isPending ? (
                                  <>
                                    <div className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    <Mail className="h-4 w-4 mr-1" />
                                    Send Email
                                  </>
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}