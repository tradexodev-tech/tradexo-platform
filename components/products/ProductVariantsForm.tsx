"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createEmptyVariant } from "@/lib/product-utils";
import type { ProductVariant } from "@/types/product";

const STOCK_STATUSES = [
  { value: "", label: "Select status" },
  { value: "in_stock", label: "In Stock" },
  { value: "out_of_stock", label: "Out of Stock" },
  { value: "made_to_order", label: "Made to Order" },
];

const UNITS = [
  "Pieces",
  "Kilograms",
  "Metric Tons",
  "Cartons",
  "Pallets",
  "Containers",
  "Sets",
];

type ProductVariantsFormProps = {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
  inputClass: string;
  labelClass: string;
};

export default function ProductVariantsForm({
  variants,
  onChange,
  inputClass,
  labelClass,
}: ProductVariantsFormProps) {
  function updateVariant(index: number, field: keyof ProductVariant, value: string | number | null) {
    onChange(
      variants.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      )
    );
  }

  function addVariant() {
    onChange([...variants, createEmptyVariant()]);
  }

  function removeVariant(index: number) {
    onChange(variants.filter((_, i) => i !== index));
  }

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground">Product Variants</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Add multiple SKUs with different pricing and availability.
      </p>

      <div className="mt-4 space-y-4">
        {variants.length === 0 && (
          <p className="text-sm text-muted-foreground">No variants added yet.</p>
        )}

        {variants.map((variant, index) => (
          <div
            key={variant.id}
            className="rounded-lg border bg-muted/20 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">
                Variant {index + 1}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => removeVariant(index)}
                aria-label="Remove variant"
              >
                <Trash2 className="size-3.5 text-muted-foreground" />
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Variant Name</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. Large / Blue"
                  value={variant.variant_name}
                  onChange={(e) =>
                    updateVariant(index, "variant_name", e.target.value)
                  }
                />
              </div>
              <div>
                <label className={labelClass}>SKU</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="SKU-001"
                  value={variant.sku}
                  onChange={(e) => updateVariant(index, "sku", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Price</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className={inputClass}
                  placeholder="0.00"
                  value={variant.price ?? ""}
                  onChange={(e) =>
                    updateVariant(
                      index,
                      "price",
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                />
              </div>
              <div>
                <label className={labelClass}>MOQ</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. 500"
                  value={variant.moq}
                  onChange={(e) => updateVariant(index, "moq", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Unit</label>
                <select
                  className={inputClass}
                  value={variant.unit}
                  onChange={(e) => updateVariant(index, "unit", e.target.value)}
                >
                  <option value="">Select unit</option>
                  {UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Stock Status</label>
                <select
                  className={inputClass}
                  value={variant.stock_status}
                  onChange={(e) =>
                    updateVariant(index, "stock_status", e.target.value)
                  }
                >
                  {STOCK_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-4"
        onClick={addVariant}
      >
        <Plus className="size-4" />
        Add Variant
      </Button>
    </div>
  );
}
