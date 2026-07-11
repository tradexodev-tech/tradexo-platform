"use client";

import { useEffect, useState } from "react";
import { Paperclip, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Quotation } from "@/types/quotation";
import type { RFQ } from "@/types/rfq";
import {
  DEFAULT_QUOTATION_CURRENCY,
  type SubmitQuotationInput,
  type UpdateQuotationInput,
} from "@/types/quotation";

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "CNY", "AED", "JPY"];

const inputClass =
  "w-full rounded-lg border bg-background p-3 text-sm text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
const labelClass = "mb-2 block text-sm font-medium text-foreground";
const selectClass =
  "w-full rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
const textareaClass = inputClass;

type QuotationFormValues = {
  price: string;
  currency: string;
  lead_time: string;
  message: string;
};

type QuotationFormProps = {
  open: boolean;
  rfq: RFQ;
  quotation?: Quotation | null;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (input: SubmitQuotationInput) => Promise<void>;
  onUpdate?: (id: string, input: UpdateQuotationInput) => Promise<void>;
};

function emptyValues(rfq: RFQ): QuotationFormValues {
  return {
    price: "",
    currency: rfq.currency || DEFAULT_QUOTATION_CURRENCY,
    lead_time: "",
    message: "",
  };
}

function quotationToValues(quotation: Quotation): QuotationFormValues {
  return {
    price: String(quotation.price),
    currency: quotation.currency,
    lead_time: quotation.lead_time,
    message: quotation.message,
  };
}

export default function QuotationForm({
  open,
  rfq,
  quotation,
  saving = false,
  onClose,
  onSubmit,
  onUpdate,
}: QuotationFormProps) {
  const [form, setForm] = useState<QuotationFormValues>(() =>
    quotation ? quotationToValues(quotation) : emptyValues(rfq)
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, saving]);

  if (!open) {
    return null;
  }

    async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const price = Number(form.price);

    if (quotation && onUpdate) {
      await onUpdate(quotation.id, {
        price,
        currency: form.currency,
        lead_time: form.lead_time,
        message: form.message,
      });
      return;
    }

    await onSubmit({
      rfq_id: rfq.id,
      price,
      currency: form.currency,
      lead_time: form.lead_time,
      message: form.message,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={saving ? undefined : onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quotation-form-title"
        className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 id="quotation-form-title" className="text-lg font-semibold text-foreground">
              {quotation ? "Update Quotation" : "Submit Quotation"}
            </h2>
            <p className="text-sm text-muted-foreground">{rfq.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Close quotation form"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="quotation-price" className={labelClass}>
                  Price
                </label>
                <input
                  id="quotation-price"
                  type="number"
                  min="0.01"
                  step="any"
                  value={form.price}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      price: event.target.value,
                    }))
                  }
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label htmlFor="quotation-currency" className={labelClass}>
                  Currency
                </label>
                <select
                  id="quotation-currency"
                  value={form.currency}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      currency: event.target.value,
                    }))
                  }
                  className={selectClass}
                >
                  {CURRENCIES.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="quotation-lead-time" className={labelClass}>
                Lead Time
              </label>
              <input
                id="quotation-lead-time"
                value={form.lead_time}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    lead_time: event.target.value,
                  }))
                }
                className={inputClass}
                placeholder="e.g. 4-6 weeks"
                required
              />
            </div>

            <div>
              <label htmlFor="quotation-message" className={labelClass}>
                Message
              </label>
              <textarea
                id="quotation-message"
                value={form.message}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    message: event.target.value,
                  }))
                }
                className={`${textareaClass} min-h-28`}
                placeholder="Describe your offer, terms, and capabilities."
                required
              />
            </div>

            <div className="rounded-lg border border-dashed bg-muted/20 p-4">
              <div className="flex items-start gap-3">
                <Paperclip className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Attachments</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    File upload will be available in a future release.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t px-5 py-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" disabled={saving} onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving
                ? quotation
                  ? "Updating..."
                  : "Submitting..."
                : quotation
                  ? "Update Quotation"
                  : "Submit Quotation"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
