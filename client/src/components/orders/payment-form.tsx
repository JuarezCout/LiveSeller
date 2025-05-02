import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface PaymentFormProps {
  orderId: number;
  clientId: number;
  onPaymentComplete?: () => void;
}

export function PaymentForm({ orderId, clientId, onPaymentComplete }: PaymentFormProps) {
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const { toast } = useToast();
  
  const confirmPaymentMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      
      // Convert dataURL to Blob
      if (proofUrl && proofUrl.startsWith('data:')) {
        const res = await fetch(proofUrl);
        const blob = await res.blob();
        formData.append('proof', blob, 'payment-proof.jpg');
      } else if (proofUrl) {
        // If it's already a file path, we need to download and re-upload
        const res = await fetch(proofUrl);
        const blob = await res.blob();
        formData.append('proof', blob, 'payment-proof.jpg');
      } else {
        throw new Error("No payment proof uploaded");
      }
      
      const response = await fetch(`/api/clients/${clientId}/orders/${orderId}/payment`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to confirm payment");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment confirmed",
        description: "Your payment has been confirmed.",
      });
      if (onPaymentComplete) {
        onPaymentComplete();
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to confirm payment",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleUploadSuccess = (url: string) => {
    setProofUrl(url);
  };
  
  const handleConfirmPayment = () => {
    if (!proofUrl) {
      toast({
        title: "No payment proof",
        description: "Please upload your payment proof.",
        variant: "destructive",
      });
      return;
    }
    
    confirmPaymentMutation.mutate();
  };
  
  return (
    <div className="rounded-md bg-gray-50 p-4">
      <div className="mb-4">
        <p className="mb-1 text-sm font-medium text-gray-700">Bank Transfer</p>
        <p className="text-sm text-gray-500">Account: 1234-5678-9012-3456</p>
        <p className="text-sm text-gray-500">Name: LiveSell Shop</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="paymentProof" className="block text-sm font-medium text-gray-700">
            Upload Payment Proof
          </label>
          <FileUpload
            endpoint="/api/products/upload" // Reuse the same endpoint as it saves to the uploads folder
            onUploadSuccess={handleUploadSuccess}
            value={proofUrl}
            className="mt-1"
          />
        </div>
        
        {confirmPaymentMutation.isError && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {confirmPaymentMutation.error.message}
            </AlertDescription>
          </Alert>
        )}
        
        <Button
          onClick={handleConfirmPayment}
          disabled={confirmPaymentMutation.isPending || !proofUrl}
          className="w-full"
        >
          {confirmPaymentMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Confirming Payment...
            </>
          ) : (
            "Confirm Payment"
          )}
        </Button>
      </div>
    </div>
  );
}

export default PaymentForm;
