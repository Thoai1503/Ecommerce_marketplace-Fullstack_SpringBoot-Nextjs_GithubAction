"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ImagePlus, Package, Save } from "lucide-react";
import {
  SellerProduct,
  SellerProductPayload,
} from "@/service/sellerProducts";

interface ProductFormState {
  name: string;
  description: string;
  categoryId: string;
  price: string;
  originalPrice: string;
  stock: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  imagesText: string;
}

interface ProductFormProps {
  title: string;
  submitLabel: string;
  draftKey: string;
  initialProduct?: SellerProduct;
  isSubmitting?: boolean;
  onSubmit: (payload: SellerProductPayload) => Promise<void>;
}

const emptyForm: ProductFormState = {
  name: "",
  description: "",
  categoryId: "",
  price: "",
  originalPrice: "",
  stock: "0",
  weight: "",
  length: "",
  width: "",
  height: "",
  imagesText: "",
};

const productToForm = (product: SellerProduct): ProductFormState => ({
  name: product.name ?? "",
  description: product.description ?? "",
  categoryId: product.categoryId ?? "",
  price: String(product.price ?? ""),
  originalPrice: String(product.originalPrice ?? product.price ?? ""),
  stock: String(product.stock ?? 0),
  weight: product.weight == null ? "" : String(product.weight),
  length: product.length == null ? "" : String(product.length),
  width: product.width == null ? "" : String(product.width),
  height: product.height == null ? "" : String(product.height),
  imagesText: product.images?.join("\n") ?? "",
});

const numberOrNull = (value: string) => {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const imageUrls = (value: string) =>
  value
    .split(/\r?\n/)
    .map((url) => url.trim())
    .filter(Boolean);

export default function ProductForm({
  title,
  submitLabel,
  draftKey,
  initialProduct,
  isSubmitting,
  onSubmit,
}: ProductFormProps) {
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (initialProduct) {
      setForm(productToForm(initialProduct));
      setReady(true);
      return;
    }

    try {
      const saved = window.localStorage.getItem(draftKey);
      setForm(saved ? { ...emptyForm, ...JSON.parse(saved) } : emptyForm);
    } catch {
      setForm(emptyForm);
    } finally {
      setReady(true);
    }
  }, [draftKey, initialProduct]);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(draftKey, JSON.stringify(form));
  }, [draftKey, form, ready]);

  const images = useMemo(() => imageUrls(form.imagesText), [form.imagesText]);

  const setField = (name: keyof ProductFormState, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const validate = () => {
    const next: Record<string, string> = {};
    const price = numberOrNull(form.price);
    const originalPrice = numberOrNull(form.originalPrice);
    const stock = numberOrNull(form.stock);

    if (form.name.trim().length < 3 || form.name.trim().length > 100) {
      next.name = "Ten san pham phai tu 3 den 100 ky tu";
    }
    if (!Number(form.categoryId)) {
      next.categoryId = "Danh muc la bat buoc";
    }
    if (price == null || price < 1000) {
      next.price = "Gia ban phai >= 1000";
    }
    if (originalPrice == null || originalPrice < 1000) {
      next.originalPrice = "Gia goc phai >= 1000";
    }
    if (price != null && originalPrice != null && originalPrice < price) {
      next.originalPrice = "Gia goc phai >= gia ban";
    }
    if (stock == null || stock < 0) {
      next.stock = "Ton kho phai >= 0";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    const payload: SellerProductPayload = {
      name: form.name.trim(),
      description: form.description.trim(),
      categoryId: Number(form.categoryId),
      price: Number(form.price),
      originalPrice: Number(form.originalPrice),
      stock: Number(form.stock),
      weight: numberOrNull(form.weight),
      length: numberOrNull(form.length),
      width: numberOrNull(form.width),
      height: numberOrNull(form.height),
      images,
    };

    await onSubmit(payload);
    window.localStorage.removeItem(draftKey);
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex align-items-center justify-content-between gap-3 mb-4">
        <div>
          <Link href="/seller/products" className="btn btn-link px-0 text-decoration-none">
            <ArrowLeft size={16} className="me-1" />
            Quay lai danh sach
          </Link>
          <h1 className="h3 fw-bold mb-1">{title}</h1>
          <p className="text-muted mb-0">
            Seller tao hoac sua product, trang thai se cho admin duyet.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="row g-4">
        <div className="col-12 col-xl-8">
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body p-4">
              <div className="mb-3">
                <label className="form-label fw-semibold">Ten san pham</label>
                <input
                  className={`form-control ${errors.name ? "is-invalid" : ""}`}
                  value={form.name}
                  maxLength={100}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="Nhap ten san pham"
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Mo ta</label>
                <textarea
                  className="form-control"
                  rows={6}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="Mo ta chi tiet san pham"
                />
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Danh muc ID</label>
                  <input
                    className={`form-control ${errors.categoryId ? "is-invalid" : ""}`}
                    value={form.categoryId}
                    inputMode="numeric"
                    onChange={(e) => setField("categoryId", e.target.value)}
                    placeholder="Vi du: 1"
                  />
                  {errors.categoryId && <div className="invalid-feedback">{errors.categoryId}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Ton kho</label>
                  <input
                    className={`form-control ${errors.stock ? "is-invalid" : ""}`}
                    type="number"
                    min={0}
                    value={form.stock}
                    onChange={(e) => setField("stock", e.target.value)}
                  />
                  {errors.stock && <div className="invalid-feedback">{errors.stock}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Gia ban</label>
                  <input
                    className={`form-control ${errors.price ? "is-invalid" : ""}`}
                    type="number"
                    min={1000}
                    value={form.price}
                    onChange={(e) => setField("price", e.target.value)}
                  />
                  {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Gia goc</label>
                  <input
                    className={`form-control ${errors.originalPrice ? "is-invalid" : ""}`}
                    type="number"
                    min={1000}
                    value={form.originalPrice}
                    onChange={(e) => setField("originalPrice", e.target.value)}
                  />
                  {errors.originalPrice && <div className="invalid-feedback">{errors.originalPrice}</div>}
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-3 mt-4">
            <div className="card-body p-4">
              <h2 className="h6 fw-bold mb-3">Logistics</h2>
              <div className="row g-3">
                {(["weight", "length", "width", "height"] as const).map((field) => (
                  <div className="col-6 col-md-3" key={field}>
                    <label className="form-label text-capitalize">{field}</label>
                    <input
                      className="form-control"
                      type="number"
                      min={0}
                      step="0.01"
                      value={form[field]}
                      onChange={(e) => setField(field, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body p-4">
              <h2 className="h6 fw-bold d-flex align-items-center gap-2">
                <ImagePlus size={18} />
                Anh san pham
              </h2>
              <p className="small text-muted">Nhap moi URL tren mot dong. Thu tu dong se duoc luu lam thu tu anh.</p>
              <textarea
                className="form-control"
                rows={8}
                value={form.imagesText}
                onChange={(e) => setField("imagesText", e.target.value)}
                placeholder="https://..."
              />

              <div className="row g-2 mt-3">
                {images.length === 0 ? (
                  <div className="col-12">
                    <div className="border rounded-3 bg-light d-flex align-items-center justify-content-center py-5 text-muted">
                      <Package size={24} className="me-2" />
                      Chua co anh
                    </div>
                  </div>
                ) : (
                  images.slice(0, 6).map((url) => (
                    <div className="col-4" key={url}>
                      <div className="ratio ratio-1x1 rounded-3 overflow-hidden bg-light border">
                        <img src={url} alt="" className="object-fit-cover w-100 h-100" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-3 mt-4">
            <div className="card-body p-4">
              <div className="alert alert-info small mb-3">
                Seller khong duoc chon trang thai. Server luon tao product moi o PENDING.
              </div>
              <button className="btn btn-danger w-100 fw-semibold" disabled={isSubmitting}>
                <Save size={16} className="me-2" />
                {isSubmitting ? "Dang luu..." : submitLabel}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
