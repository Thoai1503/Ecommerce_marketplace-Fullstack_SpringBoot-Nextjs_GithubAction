import { Product } from "@/types";

export type QualityIssueSeverity = "critical" | "warning" | "info";

export type QualityIssue = {
  code: string;
  field: string;
  severity: QualityIssueSeverity;
  message: string;
  suggestion: string;
};

const severityRank: Record<QualityIssueSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

const isBlank = (value?: string | null) => !value || value.trim() === "";

const hasCategory = (product: Product) =>
  !isBlank(product.category) && product.category !== "0";

const hasDimensions = (product: Product) =>
  Boolean(product.weight || product.length || product.width || product.height);

export function checkProductQuality(product: Product): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const imageCount = product.images?.length ?? 0;
  const description = product.description?.trim() ?? "";

  if (imageCount === 0) {
    issues.push({
      code: "missing_images",
      field: "images",
      severity: "critical",
      message: "Không có hình ảnh sản phẩm",
      suggestion: "Thêm ít nhất 1 hình ảnh sản phẩm",
    });
  } else if (imageCount < 3) {
    issues.push({
      code: "few_images",
      field: "images",
      severity: "warning",
      message: "Hình ảnh sản phẩm còn ít",
      suggestion: "Nên có ít nhất 3 hình từ nhiều góc độ",
    });
  }

  if (description.length === 0) {
    issues.push({
      code: "no_description",
      field: "description",
      severity: "critical",
      message: "Chưa có mô tả sản phẩm",
      suggestion: "Bắt buộc có mô tả sản phẩm",
    });
  } else if (description.length < 50) {
    issues.push({
      code: "short_description",
      field: "description",
      severity: "warning",
      message: "Mô tả sản phẩm quá ngắn",
      suggestion: "Mô tả nên có ít nhất 50 ký tự",
    });
  }

  if (product.price < 1000) {
    issues.push({
      code: "suspicious_price",
      field: "price",
      severity: "warning",
      message: "Giá bán thấp bất thường",
      suggestion: "Giá quá thấp, nên kiểm tra lại",
    });
  }

  if (product.originalPrice && product.price > product.originalPrice) {
    issues.push({
      code: "price_above_original",
      field: "price",
      severity: "critical",
      message: "Giá bán cao hơn giá gốc",
      suggestion: "Giá bán cao hơn giá gốc, không hợp lệ",
    });
  }

  if (product.stock === 0) {
    issues.push({
      code: "out_of_stock",
      field: "stock",
      severity: "warning",
      message: "Sản phẩm đang hết hàng",
      suggestion: "Cập nhật tồn kho trước khi mở bán",
    });
  }

  if (!hasCategory(product)) {
    issues.push({
      code: "no_category",
      field: "category",
      severity: "critical",
      message: "Chưa chọn danh mục",
      suggestion: "Phải chọn danh mục",
    });
  }

  if (isBlank(product.sku)) {
    issues.push({
      code: "no_sku",
      field: "sku",
      severity: "warning",
      message: "Chưa có SKU",
      suggestion: "Nên có SKU để quản lý",
    });
  }

  if (isBlank(product.brand)) {
    issues.push({
      code: "no_brand",
      field: "brand",
      severity: "info",
      message: "Chưa có thương hiệu",
      suggestion: "Có thương hiệu sẽ tăng độ tin cậy",
    });
  }

  if (!hasDimensions(product)) {
    issues.push({
      code: "no_dimensions",
      field: "dimensions",
      severity: "info",
      message: "Chưa có kích thước hoặc cân nặng",
      suggestion: "Thêm kích thước/cân nặng để tính phí ship",
    });
  }

  if (product.variants?.length === 1) {
    issues.push({
      code: "single_variant_only",
      field: "variants",
      severity: "info",
      message: "Sản phẩm chỉ có một biến thể",
      suggestion: "Có thể thêm nhiều biến thể như size hoặc màu",
    });
  }

  return issues.sort((a, b) => {
    const severityDiff = severityRank[a.severity] - severityRank[b.severity];
    return severityDiff !== 0 ? severityDiff : a.code.localeCompare(b.code);
  });
}
