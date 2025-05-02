import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProductCard from "@/components/products/product-card";
import ProductForm from "@/components/products/product-form";
import { Product } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  
  // Fetch products
  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/products'],
  });
  
  // Handle opening edit modal
  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setIsProductFormOpen(true);
  };
  
  // Handle opening create modal
  const handleAddProduct = () => {
    setProductToEdit(null);
    setIsProductFormOpen(true);
  };
  
  // Filter products
  const filteredProducts = products
    ? products.filter((product) => {
        // Search filter
        const matchesSearch =
          searchQuery === "" ||
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.reference.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Category filter
        const matchesCategory =
          categoryFilter === "all" || product.category === categoryFilter;
        
        // Status filter
        let matchesStatus = true;
        if (statusFilter === "inStock") {
          matchesStatus = product.inStock === true;
        } else if (statusFilter === "lowStock") {
          matchesStatus = product.inStock === true && product.stockQuantity <= 5 && product.stockQuantity > 0;
        } else if (statusFilter === "outOfStock") {
          matchesStatus = product.inStock === false || product.stockQuantity === 0;
        }
        
        return matchesSearch && matchesCategory && matchesStatus;
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Product Inventory</h1>
          <p className="text-sm text-gray-500">Manage your product catalog</p>
        </div>
        <div>
          <Button onClick={handleAddProduct}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search products"
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-4">
          <Select
            value={categoryFilter}
            onValueChange={setCategoryFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Dresses">Dresses</SelectItem>
              <SelectItem value="Blouses">Blouses</SelectItem>
              <SelectItem value="Accessories">Accessories</SelectItem>
              <SelectItem value="Shoes">Shoes</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="inStock">In Stock</SelectItem>
              <SelectItem value="lowStock">Low Stock</SelectItem>
              <SelectItem value="outOfStock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Product Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <Skeleton className="aspect-square w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex items-center justify-between pt-2">
                  <Skeleton className="h-6 w-16" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEditProduct}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <p className="text-center text-gray-500">
            {searchQuery || categoryFilter !== "all" || statusFilter !== "all"
              ? "No products match your filters"
              : "No products found. Add a product to get started."}
          </p>
          {searchQuery || categoryFilter !== "all" || statusFilter !== "all" ? (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("all");
                setStatusFilter("all");
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          ) : (
            <Button onClick={handleAddProduct} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          )}
        </div>
      )}
      
      {/* Product Form Modal */}
      <ProductForm
        open={isProductFormOpen}
        onOpenChange={setIsProductFormOpen}
        product={productToEdit}
      />
    </div>
  );
}
