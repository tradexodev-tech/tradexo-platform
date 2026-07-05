import type {
  ProductSpecification,
  ProductStatus,
  ProductVariant,
} from "@/types/product";

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseSpecifications(value: unknown): ProductSpecification {
  if (!value || typeof value !== "object") {
    return emptySpecifications();
  }
  const spec = value as Record<string, unknown>;
  const custom = Array.isArray(spec.custom)
    ? spec.custom.filter(
        (item): item is { label: string; value: string } =>
          typeof item === "object" &&
          item !== null &&
          "label" in item &&
          "value" in item
      )
    : [];

  return {
    material: (spec.material as string) ?? "",
    size_dimensions: (spec.size_dimensions as string) ?? "",
    weight: (spec.weight as string) ?? "",
    color: (spec.color as string) ?? "",
    packaging: (spec.packaging as string) ?? "",
    custom,
  };
}

export function parseVariants(value: unknown): ProductVariant[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is ProductVariant =>
        typeof item === "object" &&
        item !== null &&
        "variant_name" in item &&
        "id" in item
    )
    .map((item) => ({
      id: item.id,
      variant_name: item.variant_name ?? "",
      sku: item.sku ?? "",
      price: item.price != null ? Number(item.price) : null,
      moq: item.moq ?? "",
      unit: item.unit ?? "",
      stock_status: item.stock_status ?? "",
    }));
}

export function emptySpecifications(): ProductSpecification {
  return {
    material: "",
    size_dimensions: "",
    weight: "",
    color: "",
    packaging: "",
    custom: [],
  };
}

export function createEmptyVariant(): ProductVariant {
  return {
    id: crypto.randomUUID(),
    variant_name: "",
    sku: "",
    price: null,
    moq: "",
    unit: "",
    stock_status: "",
  };
}

export function normalizeProductStatus(status: unknown): ProductStatus {
  if (
    status === "draft" ||
    status === "published" ||
    status === "archived" ||
    status === "pending_approval"
  ) {
    return status;
  }
  return "draft";
}
