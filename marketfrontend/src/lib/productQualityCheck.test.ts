import { describe, expect, it } from "vitest";
import { Product } from "@/types";
import { checkProductQuality } from "./productQualityCheck";

const baseProduct: Product = {
  id: "1",
  productCode: "PRD-1",
  name: "Sản phẩm kiểm thử",
  description:
    "Mô tả sản phẩm đầy đủ với thông tin chất liệu, công dụng và hướng dẫn sử dụng rõ ràng.",
  sku: "SKU-001",
  images: ["a.jpg", "b.jpg", "c.jpg"],
  category: "12",
  price: 100000,
  originalPrice: 120000,
  stock: 10,
  status: "PENDING",
  sellerId: "1",
  sellerName: "Test Shop",
  createdAt: "2026-04-26T10:00:00",
  brand: "Test Brand",
  weight: 500,
  length: 10,
  variants: [
    { id: 1, sku: "SKU-001-BLACK", variantName: "Đen", price: 100000, stockQuantity: 5 },
    { id: 2, sku: "SKU-001-WHITE", variantName: "Trắng", price: 100000, stockQuantity: 5 },
  ],
};

const codesFor = (product: Product) => checkProductQuality(product).map((issue) => issue.code);

describe("checkProductQuality", () => {
  it("returns no issues for a complete product", () => {
    expect(checkProductQuality(baseProduct)).toEqual([]);
  });

  it("detects missing images", () => {
    expect(codesFor({ ...baseProduct, images: [] })).toContain("missing_images");
  });

  it("detects few images", () => {
    expect(codesFor({ ...baseProduct, images: ["a.jpg", "b.jpg"] })).toContain("few_images");
  });

  it("detects no description", () => {
    expect(codesFor({ ...baseProduct, description: " " })).toContain("no_description");
  });

  it("detects short description", () => {
    expect(codesFor({ ...baseProduct, description: "Quá ngắn" })).toContain("short_description");
  });

  it("detects suspicious low price", () => {
    expect(codesFor({ ...baseProduct, price: 999 })).toContain("suspicious_price");
  });

  it("detects sale price above original price", () => {
    expect(codesFor({ ...baseProduct, price: 150000, originalPrice: 100000 })).toContain(
      "price_above_original",
    );
  });

  it("detects out-of-stock products", () => {
    expect(codesFor({ ...baseProduct, stock: 0 })).toContain("out_of_stock");
  });

  it("detects missing category", () => {
    expect(codesFor({ ...baseProduct, category: "0" })).toContain("no_category");
  });

  it("detects missing SKU", () => {
    expect(codesFor({ ...baseProduct, sku: "" })).toContain("no_sku");
  });

  it("detects missing brand", () => {
    expect(codesFor({ ...baseProduct, brand: "" })).toContain("no_brand");
  });

  it("detects missing dimensions", () => {
    expect(
      codesFor({
        ...baseProduct,
        weight: undefined,
        length: undefined,
        width: undefined,
        height: undefined,
      }),
    ).toContain("no_dimensions");
  });

  it("detects a single variant", () => {
    expect(codesFor({ ...baseProduct, variants: [baseProduct.variants![0]] })).toContain(
      "single_variant_only",
    );
  });

  it("sorts issues by severity", () => {
    const severities = checkProductQuality({
      ...baseProduct,
      images: [],
      brand: "",
      price: 999,
    }).map((issue) => issue.severity);

    expect(severities).toEqual(["critical", "warning", "info"]);
  });
});
