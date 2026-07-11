"use client";

import { useEffect, useState } from "react";
import { Paperclip, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { COMPANY_INDUSTRIES, PRODUCT_COUNTRIES } from "@/lib/catalog";
import { fetchRecentlyViewedProducts } from "@/lib/recently-viewed";
import type { CreateRFQInput, RFQ, RFQBudgetType, RFQVisibility } from "@/types/rfq";
import {
  DEFAULT_RFQ_BUDGET_TYPE,
  DEFAULT_RFQ_CURRENCY,
  RFQ_BUDGET_TYPE_OPTIONS,
  RFQ_VISIBILITY_OPTIONS,
} from "@/types/rfq";

const UNITS = [
  "Pieces",
  "Kilograms",
  "Metric Tons",
  "Cartons",
  "Pallets",
  "Containers",
  "Sets",
  "Meters",
  "Liters",
];

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "CNY", "AED", "JPY"];

const inputClass =
  "w-full rounded-lg border bg-background p-3 text-sm text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
const labelClass = "mb-2 block text-sm font-medium text-foreground";
const selectClass =
  "w-full rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

type ProductOption = {
  id: string;
  label: string;
};

type RFQFormProps = {
  rfq?: RFQ | null;
  saving?: boolean;
  onClose: () => void;
  onSaveDraft: (input: CreateRFQInput) => Promise<void>;
  onPublish: (input: CreateRFQInput) => Promise<void>;
};

function emptyFormValues(): CreateRFQInput {
  return {
    title: "",
    description: "",
    product_id: null,
    quantity: 1,
    unit: "Pieces",
    target_price: null,
    currency: DEFAULT_RFQ_CURRENCY,
    budget_type: DEFAULT_RFQ_BUDGET_TYPE,
    delivery_country: "",
    delivery_city: "",
    industry: "",
    industry_category: "",
    required_before: null,
    visibility: "private",
    attachment_urls: [],
  };
}

function rfqToFormValues(rfq: RFQ): CreateRFQInput {
  return {
    title: rfq.title,
    description: rfq.description,
    product_id: rfq.product_id,
    quantity: rfq.quantity,
    unit: rfq.unit,
    target_price: rfq.target_price,
    currency: rfq.currency,
    budget_type: rfq.budget_type,
    delivery_country: rfq.delivery_country,
    delivery_city: rfq.delivery_city ?? "",
    industry: rfq.industry ?? "",
    industry_category: rfq.industry_category ?? "",
    required_before: rfq.required_before,
    visibility: rfq.visibility,
    attachment_urls: rfq.attachment_urls,
  };
}

export default function RFQForm({
  rfq,
  saving = false,
  onClose,
  onSaveDraft,
  onPublish,
}: RFQFormProps) {
  const [form, setForm] = useState<CreateRFQInput>(() =>
    rfq ? rfqToFormValues(rfq) : emptyFormValues()
  );
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);

  useEffect(() => {
    void fetchRecentlyViewedProducts({ limit: 20 }).then(({ data }) => {
      setProductOptions(
        (data ?? []).map((product) => ({
          id: product.id,
          label: product.product_name,
        }))
      );
    });
  }, []);

  useEffect(() => {
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
  }, [onClose, saving]);

  function updateField<K extends keyof CreateRFQInput>(
    key: K,
    value: CreateRFQInput[K]
  ) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  function buildPayload(): CreateRFQInput {
    return {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      unit: form.unit.trim(),
      delivery_country: form.delivery_country.trim(),
      delivery_city: form.delivery_city?.trim() || undefined,
      industry: form.industry?.trim() || undefined,
      industry_category: form.industry_category?.trim() || undefined,
      product_id: form.product_id || null,
      target_price:
        form.target_price != null && form.target_price !== ("" as unknown as number)
          ? Number(form.target_price)
          : null,
      required_before: form.required_before || null,
    };
  }

  return (
    <div className="fixed inset-y-0 right-0 left-0 z-40 md:left-64">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={saving ? undefined : onClose}
        aria-hidden="true"
      />

      <aside
        className="absolute inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l bg-white shadow-2xl"
        aria-label={rfq ? "Edit RFQ" : "Create RFQ"}
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {rfq ? "Edit RFQ" : "Create RFQ"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Save as draft or publish when ready.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Close RFQ form"
          >
            <X className="size-5" />
          </button>
        </div>

        <form
          className="flex flex-1 flex-col overflow-hidden"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
            <div>
              <label htmlFor="rfq-title" className={labelClass}>
                Title
              </label>
              <input
                id="rfq-title"
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label htmlFor="rfq-description" className={labelClass}>
                Description
              </label>
              <textarea
                id="rfq-description"
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                className={`${inputClass} min-h-28`}
                required
              />
            </div>

            <div>
              <label htmlFor="rfq-product" className={labelClass}>
                Product (optional)
              </label>
              <select
                id="rfq-product"
                value={form.product_id ?? ""}
                onChange={(event) =>
                  updateField("product_id", event.target.value || null)
                }
                className={selectClass}
              >
                <option value="">No linked product</option>
                {productOptions.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-muted-foreground">
                Recently viewed marketplace products appear here.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="rfq-quantity" className={labelClass}>
                  Quantity
                </label>
                <input
                  id="rfq-quantity"
                  type="number"
                  min="0.01"
                  step="any"
                  value={form.quantity}
                  onChange={(event) =>
                    updateField("quantity", Number(event.target.value))
                  }
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label htmlFor="rfq-unit" className={labelClass}>
                  Unit
                </label>
                <select
                  id="rfq-unit"
                  value={form.unit}
                  onChange={(event) => updateField("unit", event.target.value)}
                  className={selectClass}
                  required
                >
                  {UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="rfq-target-price" className={labelClass}>
                  Target Price
                </label>
                <input
                  id="rfq-target-price"
                  type="number"
                  min="0"
                  step="any"
                  value={form.target_price ?? ""}
                  onChange={(event) =>
                    updateField(
                      "target_price",
                      event.target.value ? Number(event.target.value) : null
                    )
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="rfq-currency" className={labelClass}>
                  Currency
                </label>
                <select
                  id="rfq-currency"
                  value={form.currency}
                  onChange={(event) => updateField("currency", event.target.value)}
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
              <label htmlFor="rfq-budget-type" className={labelClass}>
                Budget Type
              </label>
              <select
                id="rfq-budget-type"
                value={form.budget_type}
                onChange={(event) =>
                  updateField("budget_type", event.target.value as RFQBudgetType)
                }
                className={selectClass}
              >
                {RFQ_BUDGET_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="rfq-delivery-country" className={labelClass}>
                  Delivery Country
                </label>
                <select
                  id="rfq-delivery-country"
                  value={form.delivery_country}
                  onChange={(event) =>
                    updateField("delivery_country", event.target.value)
                  }
                  className={selectClass}
                  required
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
                <label htmlFor="rfq-delivery-city" className={labelClass}>
                  Delivery City
                </label>
                <input
                  id="rfq-delivery-city"
                  value={form.delivery_city ?? ""}
                  onChange={(event) =>
                    updateField("delivery_city", event.target.value)
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="rfq-industry" className={labelClass}>
                  Industry
                </label>
                <select
                  id="rfq-industry"
                  value={form.industry ?? ""}
                  onChange={(event) => updateField("industry", event.target.value)}
                  className={selectClass}
                >
                  <option value="">Select industry</option>
                  {COMPANY_INDUSTRIES.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="rfq-industry-category" className={labelClass}>
                  Industry Category
                </label>
                <input
                  id="rfq-industry-category"
                  value={form.industry_category ?? ""}
                  onChange={(event) =>
                    updateField("industry_category", event.target.value)
                  }
                  className={inputClass}
                  placeholder="e.g. CNC Machines"
                />
              </div>
            </div>

            <div>
              <label htmlFor="rfq-required-before" className={labelClass}>
                Required Before
              </label>
              <input
                id="rfq-required-before"
                type="date"
                value={form.required_before ?? ""}
                onChange={(event) =>
                  updateField("required_before", event.target.value || null)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="rfq-visibility" className={labelClass}>
                Visibility
              </label>
              <select
                id="rfq-visibility"
                value={form.visibility}
                onChange={(event) =>
                  updateField("visibility", event.target.value as RFQVisibility)
                }
                className={selectClass}
              >
                {RFQ_VISIBILITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-lg border border-dashed bg-muted/20 p-4">
              <div className="flex items-start gap-3">
                <Paperclip className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Attachments
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    File upload will be available in a future release. UI
                    placeholder only.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t px-5 py-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={saving}
              onClick={() => void onSaveDraft(buildPayload())}
            >
              {saving ? "Saving..." : "Save Draft"}
            </Button>
            <Button
              type="button"
              disabled={saving}
              onClick={() => void onPublish(buildPayload())}
            >
              {saving ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </form>
      </aside>
    </div>
  );
}
