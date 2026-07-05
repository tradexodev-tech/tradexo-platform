"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PRODUCT_COUNTRIES } from "@/lib/catalog";

export type ContactSupplierFormData = {
  buyer_name: string;
  buyer_company: string;
  buyer_email: string;
  buyer_country: string;
  buyer_phone: string;
  message: string;
};

type ContactSupplierModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: ContactSupplierFormData) => void;
  submitting?: boolean;
  productName?: string;
  supplierUserId?: string;
  productId?: string;
  triggerRef?: React.RefObject<HTMLElement | null>;
};

const emptyForm = (): ContactSupplierFormData => ({
  buyer_name: "",
  buyer_company: "",
  buyer_email: "",
  buyer_country: "",
  buyer_phone: "",
  message: "",
});

const inputClass =
  "w-full rounded-lg border bg-background p-3 text-sm text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
const labelClass = "mb-2 block text-sm font-medium text-foreground";
const errorClass = "mt-1 text-xs text-destructive";

function isValidEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value.trim());
}

function validateForm(form: ContactSupplierFormData) {
  const errors: Partial<Record<keyof ContactSupplierFormData, string>> = {};

  if (!form.buyer_name.trim()) {
    errors.buyer_name = "Buyer name is required.";
  }

  if (!form.buyer_email.trim()) {
    errors.buyer_email = "Email is required.";
  } else if (!isValidEmail(form.buyer_email)) {
    errors.buyer_email = "Enter a valid email address.";
  }

  if (!form.message.trim()) {
    errors.message = "Message is required.";
  }

  return errors;
}

export default function ContactSupplierModal({
  open,
  onClose,
  onSubmit,
  submitting = false,
  productName,
  supplierUserId,
  productId,
  triggerRef,
}: ContactSupplierModalProps) {
  void supplierUserId;
  void productId;

  const [form, setForm] = useState<ContactSupplierFormData>(emptyForm);
  const [touched, setTouched] = useState<
    Partial<Record<keyof ContactSupplierFormData, boolean>>
  >({});

  const firstInputRef = useRef<HTMLInputElement>(null);
  const prevOpenRef = useRef(false);

  const fieldErrors = useMemo(() => validateForm(form), [form]);
  const isValid = Object.keys(fieldErrors).length === 0;

  useEffect(() => {
    if (open) {
      setForm(emptyForm());
      setTouched({});
      requestAnimationFrame(() => {
        firstInputRef.current?.focus();
      });
    } else if (prevOpenRef.current) {
      triggerRef?.current?.focus();
    }

    prevOpenRef.current = open;
  }, [open, triggerRef]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !submitting) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose, submitting]);

  function updateField<K extends keyof ContactSupplierFormData>(
    key: K,
    value: ContactSupplierFormData[K]
  ) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  function markTouched(key: keyof ContactSupplierFormData) {
    setTouched((previous) => ({ ...previous, [key]: true }));
  }

  function showError(key: keyof ContactSupplierFormData) {
    return touched[key] ? fieldErrors[key] : undefined;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setTouched({
      buyer_name: true,
      buyer_email: true,
      message: true,
    });

    if (!isValid || submitting) return;

    onSubmit?.(form);
  }

  function handleClose() {
    if (submitting) return;
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={handleClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-supplier-title"
        className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border bg-card shadow-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b px-6 py-5">
          <div>
            <h2
              id="contact-supplier-title"
              className="text-lg font-semibold text-foreground"
            >
              Contact Supplier
            </h2>
            {productName ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Interested in:{" "}
                <span className="font-medium text-foreground">{productName}</span>
              </p>
            ) : null}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClose}
            disabled={submitting}
            aria-label="Close"
          >
            <X className="size-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <div>
              <label htmlFor="contact-buyer-name" className={labelClass}>
                Buyer Name <span className="text-destructive">*</span>
              </label>
              <input
                ref={firstInputRef}
                id="contact-buyer-name"
                type="text"
                className={inputClass}
                placeholder="Your full name"
                value={form.buyer_name}
                onChange={(event) => updateField("buyer_name", event.target.value)}
                onBlur={() => markTouched("buyer_name")}
                disabled={submitting}
                aria-invalid={Boolean(showError("buyer_name"))}
                aria-describedby={
                  showError("buyer_name") ? "contact-buyer-name-error" : undefined
                }
              />
              {showError("buyer_name") ? (
                <p id="contact-buyer-name-error" className={errorClass}>
                  {showError("buyer_name")}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="contact-company-name" className={labelClass}>
                Company Name
              </label>
              <input
                id="contact-company-name"
                type="text"
                className={inputClass}
                placeholder="Your company"
                value={form.buyer_company}
                onChange={(event) =>
                  updateField("buyer_company", event.target.value)
                }
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="contact-email" className={labelClass}>
                Email <span className="text-destructive">*</span>
              </label>
              <input
                id="contact-email"
                type="email"
                className={inputClass}
                placeholder="you@company.com"
                value={form.buyer_email}
                onChange={(event) => updateField("buyer_email", event.target.value)}
                onBlur={() => markTouched("buyer_email")}
                disabled={submitting}
                aria-invalid={Boolean(showError("buyer_email"))}
                aria-describedby={
                  showError("buyer_email") ? "contact-email-error" : undefined
                }
              />
              {showError("buyer_email") ? (
                <p id="contact-email-error" className={errorClass}>
                  {showError("buyer_email")}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="contact-country" className={labelClass}>
                Country
              </label>
              <select
                id="contact-country"
                className={inputClass}
                value={form.buyer_country}
                onChange={(event) =>
                  updateField("buyer_country", event.target.value)
                }
                disabled={submitting}
              >
                <option value="">Select country</option>
                {PRODUCT_COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="contact-phone" className={labelClass}>
                Phone
              </label>
              <input
                id="contact-phone"
                type="tel"
                className={inputClass}
                placeholder="+1 555 000 0000"
                value={form.buyer_phone}
                onChange={(event) => updateField("buyer_phone", event.target.value)}
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="contact-message" className={labelClass}>
                Message <span className="text-destructive">*</span>
              </label>
              <textarea
                id="contact-message"
                className={`${inputClass} min-h-28 resize-y`}
                placeholder="Tell the supplier about your requirements..."
                value={form.message}
                onChange={(event) => updateField("message", event.target.value)}
                onBlur={() => markTouched("message")}
                disabled={submitting}
                aria-invalid={Boolean(showError("message"))}
                aria-describedby={
                  showError("message") ? "contact-message-error" : undefined
                }
              />
              {showError("message") ? (
                <p id="contact-message-error" className={errorClass}>
                  {showError("message")}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t bg-muted/20 px-6 py-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || submitting}>
              {submitting ? "Sending..." : "Send Inquiry"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
