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
import { apiRequest } from "@/lib/queryClient";
import { useAppContext } from "@/contexts/app-context";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, formatDistance } from "date-fns";
import { 
  ArrowUpDown, 
  Check, 
  ChevronDown, 
  CircleUser, 
  ClipboardList, 
  Download, 
  Info, 
  Lock, 
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
    mutationFn: ({ userId, isAdmin }: { userId: number, isAdmin: boolean }) => 
      apiRequest(`/api/admin/users/${userId}/admin`, {
        method: 'PATCH',
        body: JSON.stringify({ isAdmin })
      }),
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
    mutationFn: (data: any) => apiRequest('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
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
    mutationFn: (data: any) => apiRequest('/api/subcategories', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
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
    mutationFn: (data: any) => apiRequest('/api/corewords', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
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
    mutationFn: (data: any) => apiRequest('/api/cards', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
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
        </TabsList>
        
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
      </Tabs>
    </div>
  );
}