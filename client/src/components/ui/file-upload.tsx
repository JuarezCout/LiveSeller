import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, X } from "lucide-react";

interface FileUploadProps {
  endpoint: string;
  onUploadSuccess: (url: string) => void;
  value?: string | null;
  className?: string;
}

export function FileUpload({
  endpoint,
  onUploadSuccess,
  value,
  className,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const { toast } = useToast();
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }
    
    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Upload file
    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append("image", file);
      
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload file");
      }
      
      const data = await response.json();
      
      onUploadSuccess(data.imageUrl);
      
      toast({
        title: "Upload successful",
        description: "Your file has been uploaded",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleRemove = () => {
    setPreview(null);
    onUploadSuccess("");
  };
  
  return (
    <div className={cn("flex flex-col items-center", className)}>
      {preview ? (
        <div className="relative mb-4 flex h-40 w-full items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-4">
          <img
            src={preview}
            alt="Preview"
            className="max-h-full max-w-full object-contain"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -right-2 -top-2 rounded-full bg-gray-800 p-1 text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="mb-4 flex w-full items-center justify-center rounded-md border-2 border-dashed border-gray-300 px-6 py-10">
          <div className="space-y-1 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Upload className="h-6 w-6 text-gray-400" />
            </div>
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md bg-white font-medium text-primary-600 focus-within:outline-none hover:text-primary-700"
              >
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  onChange={handleFileChange}
                  accept="image/*"
                  disabled={isUploading}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
      )}
      
      {isUploading && (
        <div className="flex items-center justify-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span className="text-sm">Uploading...</span>
        </div>
      )}
    </div>
  );
}

export default FileUpload;
