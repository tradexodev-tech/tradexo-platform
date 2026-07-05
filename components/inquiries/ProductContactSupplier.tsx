"use client";

import { useEffect, useRef, useState } from "react";

import ContactSupplierModal, {
  type ContactSupplierFormData,
} from "@/components/inquiries/ContactSupplierModal";
import { buttonVariants } from "@/components/ui/button";
import { createInquiry } from "@/lib/inquiries";
import { cn } from "@/lib/utils";

type ProductContactSupplierProps = {
  productName: string;
  productId: string;
  supplierUserId: string;
};

type ToastState = {
  type: "success" | "error";
  message: string;
};

export default function ProductContactSupplier({
  productName,
  productId,
  supplierUserId,
}: ProductContactSupplierProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const contactButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!toast) return;

    const timeout = window.setTimeout(() => {
      setToast(null);
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [toast]);

  async function handleSubmit(formData: ContactSupplierFormData) {
  
    setSubmitting(true);
  
  
    const result = await createInquiry({
      ...formData,
      supplier_user_id: supplierUserId,
      product_id: productId,
      product_name: productName,
    });
  
    
  
    
  
    setSubmitting(false);
  
    if (result.error) {
      
  
      setToast({
        type: "error",
        message: result.error.message || JSON.stringify(result.error),
      });
  
      return;
    }
  
    
  
    setModalOpen(false);
  
    setToast({
      type: "success",
      message: "Your inquiry has been sent successfully.",
    });
  }

  return (
    <>
      <button
        ref={contactButtonRef}
        type="button"
        className={cn(buttonVariants({ size: "lg" }), "mt-6 w-full sm:w-auto")}
        onClick={() => setModalOpen(true)}
      >
        Contact Supplier
      </button>

      <ContactSupplierModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        productName={productName}
        productId={productId}
        supplierUserId={supplierUserId}
        triggerRef={contactButtonRef}
        submitting={submitting}
        onSubmit={handleSubmit}
      />

      {toast ? (
        <div
          role={toast.type === "error" ? "alert" : "status"}
          aria-live={toast.type === "error" ? "assertive" : "polite"}
          className={cn(
            "fixed right-4 bottom-4 z-[60] max-w-sm rounded-lg border px-4 py-3 text-sm shadow-lg",
            toast.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-destructive/30 bg-destructive/5 text-destructive"
          )}
        >
          {toast.message}
        </div>
      ) : null}
    </>
  );
}
