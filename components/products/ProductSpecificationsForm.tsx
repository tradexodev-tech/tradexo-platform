"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ProductSpecification } from "@/types/product";

type ProductSpecificationsFormProps = {
  specifications: ProductSpecification;
  onChange: (specifications: ProductSpecification) => void;
  inputClass: string;
  labelClass: string;
};

export default function ProductSpecificationsForm({
  specifications,
  onChange,
  inputClass,
  labelClass,
}: ProductSpecificationsFormProps) {
  function updateField<K extends keyof Omit<ProductSpecification, "custom">>(
    key: K,
    value: ProductSpecification[K]
  ) {
    onChange({ ...specifications, [key]: value });
  }

  function addCustomSpec() {
    onChange({
      ...specifications,
      custom: [...specifications.custom, { label: "", value: "" }],
    });
  }

  function updateCustomSpec(
    index: number,
    field: "label" | "value",
    value: string
  ) {
    const custom = specifications.custom.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange({ ...specifications, custom });
  }

  function removeCustomSpec(index: number) {
    onChange({
      ...specifications,
      custom: specifications.custom.filter((_, i) => i !== index),
    });
  }

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground">Specifications</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Technical details buyers use to evaluate your product.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Material</label>
          <input
            type="text"
            className={inputClass}
            placeholder="e.g. Stainless Steel 304"
            value={specifications.material}
            onChange={(e) => updateField("material", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Size / Dimensions</label>
          <input
            type="text"
            className={inputClass}
            placeholder="e.g. 100 x 50 x 25 mm"
            value={specifications.size_dimensions}
            onChange={(e) => updateField("size_dimensions", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Weight</label>
          <input
            type="text"
            className={inputClass}
            placeholder="e.g. 2.5 kg"
            value={specifications.weight}
            onChange={(e) => updateField("weight", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Color</label>
          <input
            type="text"
            className={inputClass}
            placeholder="e.g. Silver"
            value={specifications.color}
            onChange={(e) => updateField("color", e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Packaging</label>
          <input
            type="text"
            className={inputClass}
            placeholder="e.g. Export carton, 50 units per box"
            value={specifications.packaging}
            onChange={(e) => updateField("packaging", e.target.value)}
          />
        </div>

        {specifications.custom.map((item, index) => (
          <div key={index} className="flex gap-2 sm:col-span-2">
            <input
              type="text"
              className={inputClass}
              placeholder="Label"
              value={item.label}
              onChange={(e) => updateCustomSpec(index, "label", e.target.value)}
            />
            <input
              type="text"
              className={inputClass}
              placeholder="Value"
              value={item.value}
              onChange={(e) => updateCustomSpec(index, "value", e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeCustomSpec(index)}
              aria-label="Remove specification"
            >
              <Trash2 className="size-4 text-muted-foreground" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-4"
        onClick={addCustomSpec}
      >
        <Plus className="size-4" />
        Add More
      </Button>
    </div>
  );
}
