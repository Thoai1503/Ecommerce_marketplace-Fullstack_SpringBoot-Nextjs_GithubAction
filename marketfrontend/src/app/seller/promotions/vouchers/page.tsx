"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { vouchersQuery } from "@/query/vouchers";
import { useSellerAuth } from "@/context/SellerAuthContext";
import { createVoucher, saveVoucherRules, updateVoucher } from "@/service/vouchers";
import { getProductByShopId } from "@/feature/admin/service";
import { API_URL } from "@/helper/api";
import {
  AdminVoucher,
  VoucherCampaign,
  VoucherStatus as ApiVoucherStatus,
  VoucherScopeRule,
  VoucherRulesPayload,
} from "@/types";
import { IProduct } from "@/validators/product";

type VoucherStatus = "all" | "running" | "upcoming" | "ended";
type VoucherType = "shop" | "product" | "category" | "private" | "live" | "video";
type DiscountKind = "FIXED" | "PERCENT" | "FREE_SHIPPING" | "GIFT_ITEM";

type ShopCategoryOption = {
  id: number;
  label: string;
  productCount: number;
  sampleProducts: string[];
};

type CategoryOption = {
  id: number;
  category_name?: string;
  name?: string;
};

type VoucherItem = {
  id: string;
  name: string;
  code: string;
  status: VoucherStatus;
  isProductSpecific: boolean;
  isCategorySpecific: boolean;
  productIds: number[];
  categoryIds: number[];
  typeLabel: string;
  applyScope: string;
  audience: string;
  discount: string;
  maxUses: number;
  used: number;
  timeRange: string;
  origin: string[];
  iconText: string;
  iconBg: string;
};

const statusFromApiToUi = (
  status?: ApiVoucherStatus,
  validFrom?: string,
  validTo?: string,
): VoucherStatus => {
  const now = Date.now();
  const start = validFrom ? new Date(validFrom).getTime() : null;
  const end = validTo ? new Date(validTo).getTime() : null;

  if (status === "EXPIRED" || (end && end < now)) return "ended";
  if (status === "ACTIVE") {
    if (start && start > now) return "upcoming";
    return "running";
  }
  if (status === "DRAFT" || status === "PAUSED") return "upcoming";
  return "ended";
};

const formatVoucherDiscount = (voucher: AdminVoucher): string => {
  if (voucher.discountType === "PERCENT") {
    return `${Number(voucher.discountPercent || 0)}%`;
  }
  if (voucher.discountType === "FIXED") {
    return `₫${Number(voucher.discountAmount || 0).toLocaleString()}`;
  }
  if (voucher.discountType === "FREE_SHIPPING") {
    return "Free shipping";
  }
  return "Gift item";
};

const formatDateTimeRange = (from?: string, to?: string): string => {
  if (!from || !to) return "N/A";
  const format = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };
  return `${format(from)} - ${format(to)}`;
};

const mapVoucherToItem = (
  voucher: AdminVoucher,
  scopeRules: VoucherScopeRule[],
  products: Partial<IProduct>[],
  categories: ShopCategoryOption[],
): VoucherItem => {
  const includedProductRules = scopeRules.filter(
    (rule) => rule.scopeType === "PRODUCT" && rule.includeExclude === "INCLUDE",
  );
  const includedCategoryRules = scopeRules.filter(
    (rule) => rule.scopeType === "CATEGORY" && rule.includeExclude === "INCLUDE",
  );
  const matchedProducts = includedProductRules
    .map((rule) =>
      products.find((product) => Number(product.id) === Number(rule.scopeId)),
    )
    .filter(Boolean);
  const matchedCategories = includedCategoryRules
    .map((rule) =>
      categories.find((category) => Number(category.id) === Number(rule.scopeId)),
    )
    .filter(Boolean);
  const isProductSpecific = includedProductRules.length > 0;
  const isCategorySpecific = includedCategoryRules.length > 0;
  const applyScope = isProductSpecific
    ? matchedProducts.length > 0
      ? matchedProducts.length === 1
        ? matchedProducts[0]?.product_name || `Product #${includedProductRules[0]?.scopeId}`
        : `${matchedProducts.length} selected products`
      : `${includedProductRules.length} selected products`
    : isCategorySpecific
      ? matchedCategories.length > 0
        ? matchedCategories.length === 1
          ? matchedCategories[0]?.label || `Category #${includedCategoryRules[0]?.scopeId}`
          : `${matchedCategories.length} selected categories`
        : `${includedCategoryRules.length} selected categories`
      : "All products";

  return {
    id: voucher.id,
    name: voucher.title,
    code: voucher.code,
    status: statusFromApiToUi(voucher.status, voucher.validFrom, voucher.validTo),
    isProductSpecific,
    isCategorySpecific,
    productIds: includedProductRules.map((rule) => Number(rule.scopeId)),
    categoryIds: includedCategoryRules.map((rule) => Number(rule.scopeId)),
    typeLabel: isProductSpecific
      ? "Product-specific voucher"
      : isCategorySpecific
        ? "Category-specific voucher"
      : voucher.discountType === "FREE_SHIPPING"
        ? "Shipping voucher"
        : voucher.discountType === "GIFT_ITEM"
          ? "Gift voucher"
          : "Shop-wide voucher",
    applyScope,
    audience: "All buyers",
    discount: formatVoucherDiscount(voucher),
    maxUses: voucher.totalQuota,
    used: voucher.claimedCount,
    timeRange: formatDateTimeRange(voucher.validFrom, voucher.validTo),
    origin: ["Shop issued", voucher.status],
    iconText: isProductSpecific ? "P" : isCategorySpecific ? "C" : "S",
    iconBg: isProductSpecific
      ? "linear-gradient(135deg, #fb923c 0%, #f97316 100%)"
      : isCategorySpecific
        ? "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)"
      : "linear-gradient(135deg, #ee4d2d 0%, #ff8a00 100%)",
  };
};

const formatUiStatusLabel = (status: VoucherStatus) => {
  switch (status) {
    case "running":
      return "Running";
    case "upcoming":
      return "Upcoming";
    case "ended":
      return "Ended";
    default:
      return "All";
  }
};

type ShopVoucherFormState = {
  campaignId: string | null;
  title: string;
  description: string;
  codePrefix: string;
  codeSuffix: string;
  claimStartDate: string;
  claimStartTime: string;
  claimEndDate: string;
  claimEndTime: string;
  validFromDate: string;
  validFromTime: string;
  validToDate: string;
  validToTime: string;
  discountKind: DiscountKind;
  discountValue: string;
  maxDiscountAmount: string;
  minOrderValue: string;
  maxOrderValue: string;
  maxUses: string;
  perUserLimit: string;
  stackable: boolean;
  status: ApiVoucherStatus;
  priority: string;
};

type ProductVoucherFormState = ShopVoucherFormState & {
  selectedProductIds: number[];
};

type CategoryVoucherFormState = ShopVoucherFormState & {
  selectedCategoryIds: number[];
};

const creatorCards: {
  key: VoucherType;
  title: string;
  description: string;
  icon: string;
  accent: string;
}[] = [
  {
    key: "shop",
    title: "Shop-wide voucher",
    description:
      "Apply this to all products in the shop to increase conversions.",
    icon: "S",
    accent: "#ee4d2d",
  },
  {
    key: "product",
    title: "Product-specific voucher",
    description: "Apply this to specific products to boost their sales.",
    icon: "P",
    accent: "#ff8a00",
  },
  {
    key: "category",
    title: "Category-specific voucher",
    description: "Apply this voucher to categories that already exist in your shop.",
    icon: "C",
    accent: "#2563eb",
  },
  {
    key: "private",
    title: "Private voucher",
    description:
      "Distribute to a specific group of customers using a unique voucher code.",
    icon: "R",
    accent: "#1d4ed8",
  },
  {
    key: "live",
    title: "Voucher Nexamart Live",
    description:
      "Exclusive offers for livestreamers to boost sales during live sessions.",
    icon: "L",
    accent: "#ef4444",
  },
  {
    key: "video",
    title: "Voucher Nexamart Video",
    description: "Exclusive vouchers for products featured in Nexamart videos.",
    icon: "V",
    accent: "#f97316",
  },
];

const statusTabs: { key: VoucherStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "running", label: "Running" },
  { key: "upcoming", label: "Upcoming" },
  { key: "ended", label: "Ended" },
];

const metricCards = [
  { label: "Sales", value: "₫0", subtext: "compared to last 7 days 0.00%" },
  { label: "Orders", value: "0", subtext: "compared to last 7 days 0.00%" },
  {
    label: "Redemption rate",
    value: "0.00%",
    subtext: "compared to last 7 days 0.00%",
  },
  { label: "Buyers", value: "0", subtext: "compared to last 7 days 0.00%" },
];

const toDateTimeFields = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  const iso = local.toISOString();
  return { date: iso.slice(0, 10), time: iso.slice(11, 16) };
};

const createInitialShopVoucherForm = (): ShopVoucherFormState => {
  const now = new Date();
  now.setSeconds(0, 0);

  const claimStart = toDateTimeFields(now);
  const claimEnd = toDateTimeFields(new Date(now.getTime() + 60 * 60 * 1000));
  const validToDate = new Date(now);
  validToDate.setDate(validToDate.getDate() + 3);
  validToDate.setHours(23, 59, 0, 0);
  const validTo = toDateTimeFields(validToDate);

  return {
    campaignId: null,
    title: "",
    description: "",
    codePrefix: "S",
    codeSuffix: "",
    claimStartDate: claimStart.date,
    claimStartTime: claimStart.time,
    claimEndDate: claimEnd.date,
    claimEndTime: claimEnd.time,
    validFromDate: claimStart.date,
    validFromTime: claimStart.time,
    validToDate: validTo.date,
    validToTime: validTo.time,
    discountKind: "FIXED",
    discountValue: "",
    maxDiscountAmount: "",
    minOrderValue: "",
    maxOrderValue: "",
    maxUses: "",
    perUserLimit: "1",
    stackable: false,
    status: "DRAFT",
    priority: "100",
  };
};

const createInitialProductVoucherForm = (): ProductVoucherFormState => ({
  ...createInitialShopVoucherForm(),
  selectedProductIds: [],
});

const createInitialCategoryVoucherForm = (): CategoryVoucherFormState => ({
  ...createInitialShopVoucherForm(),
  selectedCategoryIds: [],
});

const buildDateTimeString = (date: string, time: string) =>
  date && time ? `${date}T${time}:00` : "";

const parseDateTimeToFields = (value?: string) => {
  if (!value) return { date: "", time: "" };
  const normalized = String(value).replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    const [datePart = "", timePart = ""] = normalized.split("T");
    return { date: datePart, time: timePart.slice(0, 5) };
  }
  return toDateTimeFields(date);
};

const parseVoucherCode = (code: string) => {
  const [prefix, ...rest] = String(code || "").split("-");
  return {
    codePrefix: prefix || "S",
    codeSuffix: rest.join("-"),
  };
};

const buildShopVoucherFormFromVoucher = (
  voucher: AdminVoucher,
): ShopVoucherFormState => {
  const claimStart = parseDateTimeToFields(voucher.claimStartAt);
  const claimEnd = parseDateTimeToFields(voucher.claimEndAt);
  const validFrom = parseDateTimeToFields(voucher.validFrom);
  const validTo = parseDateTimeToFields(voucher.validTo);
  const { codePrefix, codeSuffix } = parseVoucherCode(voucher.code);

  return {
    campaignId: voucher.campaignId ? String(voucher.campaignId) : null,
    title: voucher.title || "",
    description: voucher.description || "",
    codePrefix,
    codeSuffix,
    claimStartDate: claimStart.date,
    claimStartTime: claimStart.time,
    claimEndDate: claimEnd.date,
    claimEndTime: claimEnd.time,
    validFromDate: validFrom.date,
    validFromTime: validFrom.time,
    validToDate: validTo.date,
    validToTime: validTo.time,
    discountKind: voucher.discountType,
    discountValue:
      voucher.discountType === "PERCENT"
        ? String(voucher.discountPercent || "")
        : voucher.discountType === "FIXED"
          ? String(voucher.discountAmount || "")
          : "",
    maxDiscountAmount:
      voucher.discountType === "PERCENT"
        ? String(voucher.maxDiscountAmount || "")
        : "",
    minOrderValue: String(voucher.minOrderValue ?? ""),
    maxOrderValue:
      voucher.maxOrderValue === null || voucher.maxOrderValue === undefined
        ? ""
        : String(voucher.maxOrderValue),
    maxUses: String(voucher.totalQuota || ""),
    perUserLimit: String(voucher.perUserQuota || 1),
    stackable: Boolean(voucher.stackable),
    status: voucher.status,
    priority: String(voucher.priority || 100),
  };
};

const buildShopVoucherPayload = (
  form: ShopVoucherFormState,
  shopId?: number | null,
): Partial<AdminVoucher> => {
  const resolvedCodePrefix = shopId ? `S${shopId}` : form.codePrefix;
  const code = `${resolvedCodePrefix}${form.codeSuffix ? `-${form.codeSuffix.toUpperCase()}` : ""}`;

  return {
    campaignId: form.campaignId,
    code,
    title: form.title.trim(),
    description: form.description.trim() || "",
    issuerType: "SHOP",
    issuerId: shopId ?? null,
    discountType: form.discountKind,
    discountPercent:
      form.discountKind === "PERCENT" && form.discountValue !== ""
        ? Number(form.discountValue)
        : null,
    discountAmount:
      form.discountKind === "FIXED" && form.discountValue !== ""
        ? Number(form.discountValue)
        : null,
    maxDiscountAmount:
      form.discountKind === "PERCENT" && form.maxDiscountAmount !== ""
        ? Number(form.maxDiscountAmount)
        : null,
    minOrderValue: form.minOrderValue === "" ? 0 : Number(form.minOrderValue),
    maxOrderValue:
      form.maxOrderValue === "" ? null : Number(form.maxOrderValue),
    totalQuota: Number(form.maxUses || 0),
    claimedCount: 0,
    redeemedCount: 0,
    perUserQuota: Number(form.perUserLimit || 1),
    stackable: form.stackable,
    claimStartAt: buildDateTimeString(form.claimStartDate, form.claimStartTime),
    claimEndAt: buildDateTimeString(form.claimEndDate, form.claimEndTime),
    validFrom: buildDateTimeString(form.validFromDate, form.validFromTime),
    validTo: buildDateTimeString(form.validToDate, form.validToTime),
    status: form.status,
    priority: Number(form.priority || 100),
  };
};

const getSaveErrorMessage = (error: any, fallback: string) => {
  const responseData = error?.response?.data;
  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  return responseData?.message || error?.message || fallback;
};

function AlertBanner({
  variant,
  message,
  className = "",
  onClose,
}: {
  variant: "success" | "danger";
  message: string;
  className?: string;
  onClose?: () => void;
}) {
  const tone =
    variant === "success"
      ? {
          icon: "✓",
          title: "Success",
          bg: "#ecfdf3",
          border: "#a7f3d0",
          text: "#065f46",
        }
      : {
          icon: "!",
          title: "Error",
          bg: "#fef2f2",
          border: "#fecaca",
          text: "#991b1b",
        };

  return (
    <div
      className={`d-flex align-items-start gap-3 rounded-4 px-3 py-3 ${className}`}
      role="alert"
      style={{
        background: tone.bg,
        border: `1px solid ${tone.border}`,
        color: tone.text,
      }}
    >
      <div
        className="d-inline-flex align-items-center justify-content-center rounded-circle fw-bold flex-shrink-0"
        style={{
          width: 28,
          height: 28,
          background: "#fff",
          border: `1px solid ${tone.border}`,
        }}
      >
        {tone.icon}
      </div>
      <div className="flex-grow-1">
        <div className="fw-semibold mb-1">{tone.title}</div>
        <div className="small">{message}</div>
      </div>
      {onClose && (
        <button
          type="button"
          className="btn btn-sm p-0 border-0 bg-transparent lh-1"
          aria-label="Close alert"
          onClick={onClose}
          style={{ color: tone.text }}
        >
          ×
        </button>
      )}
    </div>
  );
}

function ShopVoucherCreateModal({
  form,
  shopId,
  campaigns,
  isCampaignsLoading,
  isSaving,
  isEditing,
  saveError,
  onClearError,
  onClose,
  onConfirm,
  onChange,
}: {
  form: ShopVoucherFormState;
  shopId?: number | null;
  campaigns: VoucherCampaign[];
  isCampaignsLoading: boolean;
  isSaving: boolean;
  isEditing?: boolean;
  saveError: string | null;
  onClearError: () => void;
  onClose: () => void;
  onConfirm: () => void;
  onChange: <K extends keyof ShopVoucherFormState>(
    key: K,
    value: ShopVoucherFormState[K],
  ) => void;
}) {
  const selectedCampaign =
    campaigns.find(
      (campaign) => String(campaign.id) === String(form.campaignId),
    ) ?? null;
  const resolvedCodePrefix = shopId ? `S${shopId}` : form.codePrefix;
  const generatedCode = `${resolvedCodePrefix}${form.codeSuffix ? `-${form.codeSuffix.toUpperCase()}` : ""}`;
  const isFixedDiscount = form.discountKind === "FIXED";
  const isPercentDiscount = form.discountKind === "PERCENT";
  const isFreeShipping = form.discountKind === "FREE_SHIPPING";
  const isGiftItem = form.discountKind === "GIFT_ITEM";
  const previewDiscount =
    isFixedDiscount
      ? form.discountValue
        ? `₫${form.discountValue}`
        : "₫..."
      : isPercentDiscount
        ? `${form.discountValue}%`
        : isFreeShipping
          ? "Free ship"
          : isGiftItem
            ? "Gift item"
            : "N/A";
  const voucherPayload = buildShopVoucherPayload(form, shopId);

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100"
      style={{ background: "rgba(15, 23, 42, 0.42)", zIndex: 1050 }}
      onClick={onClose}
    >
      <div
        className="h-100 overflow-auto p-3 p-lg-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="bg-light rounded-4 shadow-lg mx-auto"
          style={{ maxWidth: 1180 }}
        >
          <div className="d-flex justify-content-between align-items-center px-4 px-lg-5 py-4 border-bottom bg-white rounded-top-4">
            <div>
              <h4 className="mb-1">
                {isEditing ? "Edit Shop-wide Voucher" : "Create Shop-wide Voucher"}
              </h4>
              <div className="text-muted small">
                Configure a public voucher for all products in your shop.
              </div>
            </div>
            <button className="btn btn-outline-secondary" onClick={onClose}>
              Close
            </button>
          </div>

          <div className="p-3 p-lg-4">
            {saveError && (
              <AlertBanner
                variant="danger"
                message={saveError}
                className="mb-4"
                onClose={onClearError}
              />
            )}
            <div className="row g-4 align-items-start">
              <div className="col-xl-9">
                <div className="bg-white border rounded-4 p-4 mb-4">
                  <h5 className="mb-4">Basic information</h5>

                  <div className="row g-3 align-items-start mb-3">
                    <label className="col-lg-3 col-form-label">
                      Voucher type
                    </label>
                    <div className="col-lg-9">
                      <div className="border rounded-3 px-3 py-2 d-inline-flex align-items-center gap-2 bg-white">
                        <span
                          className="rounded-2 d-inline-flex align-items-center justify-content-center text-white fw-bold"
                          style={{
                            width: 28,
                            height: 28,
                            background: "#ee4d2d",
                          }}
                        >
                          S
                        </span>
                        <span>Shop-wide voucher</span>
                      </div>
                    </div>
                  </div>

                  <div className="row g-3 align-items-start mb-3">
                    <label className="col-lg-3 col-form-label">Campaign</label>
                    <div className="col-lg-9">
                      <select
                        className="form-select"
                        value={form.campaignId ?? ""}
                        onChange={(e) =>
                          onChange("campaignId", e.target.value || null)
                        }
                        disabled={isCampaignsLoading}
                      >
                        <option value="">
                          {isCampaignsLoading
                            ? "Loading campaigns..."
                            : "Select campaign from voucher_campaign"}
                        </option>
                        {campaigns.map((campaign) => (
                          <option key={campaign.id} value={String(campaign.id)}>
                            {campaign.code} - {campaign.name}
                          </option>
                        ))}
                      </select>
                      <div className="d-flex justify-content-between small text-muted mt-1">
                        <span>
                          {selectedCampaign
                            ? `Selected: ${selectedCampaign.name} (${selectedCampaign.status})`
                            : "Campaigns are loaded from voucher_campaign"}
                        </span>
                        <span>{campaigns.length} campaign(s)</span>
                      </div>
                    </div>
                  </div>

                  <div className="row g-3 align-items-start mb-3">
                    <label className="col-lg-3 col-form-label">
                      Voucher title
                    </label>
                    <div className="col-lg-9">
                      <input
                        className="form-control"
                        maxLength={255}
                        value={form.title}
                        onChange={(e) => onChange("title", e.target.value)}
                        placeholder="Enter voucher title"
                      />
                    </div>
                  </div>

                  <div className="row g-3 align-items-start mb-3">
                    <label className="col-lg-3 col-form-label">
                      Description
                    </label>
                    <div className="col-lg-9">
                      <textarea
                        className="form-control"
                        rows={3}
                        value={form.description}
                        onChange={(e) =>
                          onChange("description", e.target.value)
                        }
                        placeholder="Internal or public voucher description"
                      />
                    </div>
                  </div>

                  <div className="row g-3 align-items-start mb-3">
                    <label className="col-lg-3 col-form-label">
                      Voucher code
                    </label>
                    <div className="col-lg-9">
                      <div className="input-group">
                        {resolvedCodePrefix && (
                          <span className="input-group-text bg-light">
                            {resolvedCodePrefix}
                          </span>
                        )}
                        <input
                          className="form-control"
                          maxLength={20}
                          value={form.codeSuffix}
                          onChange={(e) =>
                            onChange("codeSuffix", e.target.value)
                          }
                          placeholder="Enter voucher code"
                        />
                      </div>
                      <div className="d-flex justify-content-between small text-muted mt-1">
                        <span>
                          Use uppercase letters or numbers only. Current code:{" "}
                          <strong>{generatedCode || "N/A"}</strong>
                        </span>
                        <span>{form.codeSuffix.length}/20</span>
                      </div>
                    </div>
                  </div>

                  <div className="row g-3 align-items-start">
                    <label className="col-lg-3 col-form-label">
                      Claim period
                    </label>
                    <div className="col-lg-9">
                      <div className="row g-2">
                        <div className="col-sm-6">
                          <div className="input-group">
                            <input
                              type="time"
                              className="form-control"
                              value={form.claimStartTime}
                              onChange={(e) =>
                                onChange("claimStartTime", e.target.value)
                              }
                            />
                            <input
                              type="date"
                              className="form-control"
                              value={form.claimStartDate}
                              onChange={(e) =>
                                onChange("claimStartDate", e.target.value)
                              }
                            />
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="input-group">
                            <input
                              type="time"
                              className="form-control"
                              value={form.claimEndTime}
                              onChange={(e) =>
                                onChange("claimEndTime", e.target.value)
                              }
                            />
                            <input
                              type="date"
                              className="form-control"
                              value={form.claimEndDate}
                              onChange={(e) =>
                                onChange("claimEndDate", e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row g-3 align-items-start">
                    <label className="col-lg-3 col-form-label">
                      Valid period
                    </label>
                    <div className="col-lg-9">
                      <div className="row g-2">
                        <div className="col-sm-6">
                          <div className="input-group">
                            <input
                              type="time"
                              className="form-control"
                              value={form.validFromTime}
                              onChange={(e) =>
                                onChange("validFromTime", e.target.value)
                              }
                            />
                            <input
                              type="date"
                              className="form-control"
                              value={form.validFromDate}
                              onChange={(e) =>
                                onChange("validFromDate", e.target.value)
                              }
                            />
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="input-group">
                            <input
                              type="time"
                              className="form-control"
                              value={form.validToTime}
                              onChange={(e) =>
                                onChange("validToTime", e.target.value)
                              }
                            />
                            <input
                              type="date"
                              className="form-control"
                              value={form.validToDate}
                              onChange={(e) =>
                                onChange("validToDate", e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-4 p-4 mb-4">
                  <h5 className="mb-4">Voucher setup</h5>
                  <div className="row g-3 align-items-center mb-3">
                    <label className="col-lg-3 col-form-label">
                      Discount type
                    </label>
                    <div className="col-lg-9">
                      <div className="row g-2">
                        <div className="col-md-4">
                          <select
                            className="form-select"
                            value={form.discountKind}
                            onChange={(e) =>
                              onChange(
                                "discountKind",
                                e.target.value as DiscountKind,
                              )
                            }
                          >
                            <option value="FIXED">Fixed amount</option>
                            <option value="PERCENT">Percentage</option>
                            <option value="FREE_SHIPPING">Free shipping</option>
                            <option value="GIFT_ITEM">Gift item</option>
                          </select>
                        </div>
                        <div className="col-md-8">
                          <div className="input-group">
                            <span className="input-group-text">
                              {isFixedDiscount
                                ? "₫"
                                : isPercentDiscount
                                  ? "%"
                                  : "•"}
                            </span>
                            <input
                              className="form-control"
                              value={form.discountValue}
                              onChange={(e) =>
                                onChange("discountValue", e.target.value)
                              }
                              disabled={isFreeShipping || isGiftItem}
                              placeholder={
                                isFixedDiscount
                                  ? "Enter amount"
                                  : isPercentDiscount
                                    ? "Enter percentage"
                                    : isFreeShipping
                                      ? "Not required for free shipping"
                                      : "Not required for gift item"
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row g-3 align-items-center mb-3">
                    <label className="col-lg-3 col-form-label">
                      Minimum order value
                    </label>
                    <div className="col-lg-9">
                      <div className="input-group">
                        <span className="input-group-text">₫</span>
                        <input
                          className="form-control"
                          value={form.minOrderValue}
                          onChange={(e) =>
                            onChange("minOrderValue", e.target.value)
                          }
                          placeholder="Enter minimum spend"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row g-3 align-items-center mb-3">
                    <label className="col-lg-3 col-form-label">
                      Max discount amount
                    </label>
                    <div className="col-lg-9">
                      <div className="input-group">
                        <span className="input-group-text">₫</span>
                        <input
                          className="form-control"
                          value={form.maxDiscountAmount}
                          onChange={(e) =>
                            onChange("maxDiscountAmount", e.target.value)
                          }
                          disabled={!isPercentDiscount}
                          placeholder={
                            isPercentDiscount
                              ? "Cap for percentage discount"
                              : isFixedDiscount
                                ? "Not required for fixed amount"
                                : isFreeShipping
                                  ? "Not required for free shipping"
                                  : "Not required for gift item"
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row g-3 align-items-center mb-3">
                    <label className="col-lg-3 col-form-label">
                      Max order value
                    </label>
                    <div className="col-lg-9">
                      <div className="input-group">
                        <span className="input-group-text">₫</span>
                        <input
                          className="form-control"
                          value={form.maxOrderValue}
                          onChange={(e) =>
                            onChange("maxOrderValue", e.target.value)
                          }
                          placeholder="Optional ceiling for eligible orders"
                        />
                      </div>
                    </div>
                  </div>

                  {(isFreeShipping || isGiftItem) && (
                    <div className="row g-3 align-items-start mb-3">
                      <label className="col-lg-3 col-form-label">Type note</label>
                      <div className="col-lg-9">
                        <div className="alert alert-info mb-0 py-2">
                          {isFreeShipping
                            ? "Free shipping vouchers do not require discount amount fields. Buyers will receive shipping support based on the voucher rules."
                            : "Gift item vouchers do not require amount fields. Use the title/description to describe the gift until gift-item detail fields are modeled separately."}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="row g-3 align-items-center mb-3">
                    <label className="col-lg-3 col-form-label">
                      Total max uses
                    </label>
                    <div className="col-lg-9">
                      <input
                        className="form-control"
                        value={form.maxUses}
                        onChange={(e) => onChange("maxUses", e.target.value)}
                        placeholder="Total number of claims available"
                      />
                    </div>
                  </div>

                  <div className="row g-3 align-items-center">
                    <label className="col-lg-3 col-form-label">
                      Max uses per buyer
                    </label>
                    <div className="col-lg-9">
                      <input
                        className="form-control"
                        value={form.perUserLimit}
                        onChange={(e) =>
                          onChange("perUserLimit", e.target.value)
                        }
                        placeholder="1"
                      />
                    </div>
                  </div>

                  <div className="row g-3 align-items-center mt-1">
                    <label className="col-lg-3 col-form-label">Stackable</label>
                    <div className="col-lg-9">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="stackable"
                          checked={form.stackable}
                          onChange={(e) =>
                            onChange("stackable", e.target.checked)
                          }
                        />
                        <label className="form-check-label" htmlFor="stackable">
                          Allow combining with other vouchers
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-4 p-4">
                  <h5 className="mb-4">Voucher display and applied products</h5>

                  <div className="row g-3 align-items-start">
                    <label className="col-lg-3 col-form-label">Status</label>
                    <div className="col-lg-4">
                      <select
                        className="form-select"
                        value={form.status}
                        onChange={(e) =>
                          onChange("status", e.target.value as ApiVoucherStatus)
                        }
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="ACTIVE">Active</option>
                        <option value="PAUSED">Paused</option>
                      </select>
                    </div>
                    <label className="col-lg-2 col-form-label">Priority</label>
                    <div className="col-lg-3">
                      <input
                        className="form-control"
                        value={form.priority}
                        onChange={(e) => onChange("priority", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="row g-3 align-items-start mt-1">
                    <label className="col-lg-3 col-form-label">
                      Applied products
                    </label>
                    <div className="col-lg-9">
                      <div className="fw-semibold">All products</div>
                      <p className="text-muted small mb-0">
                        This voucher will be visible on all product cards and
                        shop pages unless a stronger campaign is currently
                        taking precedence.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-xl-3">
                <div className="position-sticky" style={{ top: 16 }}>
                  <div className="text-muted small mb-2">Preview</div>
                  <div className="bg-white border rounded-4 shadow-sm p-3">
                    <div
                      className="mx-auto rounded-4 overflow-hidden border"
                      style={{ width: 220, background: "#fff" }}
                    >
                      <div
                        className="text-white p-3"
                        style={{
                          background:
                            "linear-gradient(180deg, #4b2e2a 0%, #8e4b3b 45%, #f5f5f5 45%)",
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <div className="fw-semibold"> Shop</div>
                            <div className="small opacity-75">
                              4.9 • 3.1k followers
                            </div>
                          </div>
                          <button className="btn btn-sm btn-light py-0 px-2">
                            Follow
                          </button>
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="d-flex gap-2 mb-3 small">
                          <span className="text-danger fw-semibold border-bottom border-2 border-danger">
                            Shop
                          </span>
                          <span className="text-muted">Products</span>
                          <span className="text-muted">Reviews</span>
                        </div>
                        <div className="row g-2 mb-3">
                          <div className="col-6">
                            <div className="border rounded-3 p-2 text-center">
                              <div className="small text-muted">Save up to</div>
                              <div className="text-danger fw-bold">
                                {previewDiscount}
                              </div>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="border rounded-3 p-2 text-center">
                              <div className="small text-muted">Voucher code</div>
                              <div className="text-danger fw-bold small text-truncate">
                                {generatedCode || "N/A"}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="small fw-semibold mb-1 text-truncate">
                          {form.title ||
                            selectedCampaign?.name ||
                            "No campaign selected"}
                        </div>
                        <div className="small text-muted">
                          Buyers will be able to save this voucher and use it on
                          eligible products in your shop.
                        </div>
                        <div className="small text-muted mt-2">
                          Status: <strong>{form.status}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-light border rounded-3 p-3 mt-3">
                    <div className="small text-muted mb-2">Payload preview</div>
                    <pre
                      className="mb-0 small"
                      style={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {JSON.stringify(voucherPayload, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border-top px-4 px-lg-5 py-3 d-flex justify-content-end gap-2 rounded-bottom-4">
            <button
              className="btn btn-outline-secondary"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button className="btn btn-danger" onClick={onConfirm} disabled={isSaving}>
              {isSaving ? "Saving..." : isEditing ? "Update voucher" : "Create voucher"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductVoucherCreateModal({
  form,
  shopId,
  campaigns,
  products,
  isCampaignsLoading,
  isProductsLoading,
  isSaving,
  isEditing,
  saveError,
  onClearError,
  onClose,
  onConfirm,
  onChange,
  onToggleProduct,
}: {
  form: ProductVoucherFormState;
  shopId?: number | null;
  campaigns: VoucherCampaign[];
  products: Partial<IProduct>[];
  isCampaignsLoading: boolean;
  isProductsLoading: boolean;
  isSaving: boolean;
  isEditing?: boolean;
  saveError: string | null;
  onClearError: () => void;
  onClose: () => void;
  onConfirm: () => void;
  onChange: <K extends keyof ProductVoucherFormState>(
    key: K,
    value: ProductVoucherFormState[K],
  ) => void;
  onToggleProduct: (productId: number) => void;
}) {
  const selectedCampaign =
    campaigns.find(
      (campaign) => String(campaign.id) === String(form.campaignId),
    ) ?? null;
  const resolvedCodePrefix = shopId ? `S${shopId}` : form.codePrefix;
  const generatedCode = `${resolvedCodePrefix}${form.codeSuffix ? `-${form.codeSuffix.toUpperCase()}` : ""}`;
  const isFixedDiscount = form.discountKind === "FIXED";
  const isPercentDiscount = form.discountKind === "PERCENT";
  const isFreeShipping = form.discountKind === "FREE_SHIPPING";
  const isGiftItem = form.discountKind === "GIFT_ITEM";
  const selectedProducts = products.filter((product) =>
    form.selectedProductIds.includes(Number(product.id)),
  );
  const previewDiscount =
    isFixedDiscount
      ? form.discountValue
        ? `₫${form.discountValue}`
        : "₫..."
      : isPercentDiscount
        ? `${form.discountValue}%`
        : isFreeShipping
          ? "Free ship"
          : isGiftItem
            ? "Gift item"
            : "N/A";
  const voucherPayload = buildShopVoucherPayload(form, shopId);

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100"
      style={{ background: "rgba(15, 23, 42, 0.42)", zIndex: 1050 }}
      onClick={onClose}
    >
      <div
        className="h-100 overflow-auto p-3 p-lg-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="bg-light rounded-4 shadow-lg mx-auto"
          style={{ maxWidth: 1240 }}
        >
          <div className="d-flex justify-content-between align-items-center px-4 px-lg-5 py-4 border-bottom bg-white rounded-top-4">
            <div>
              <h4 className="mb-1">
                {isEditing
                  ? "Edit Product-specific Voucher"
                  : "Create Product-specific Voucher"}
              </h4>
              <div className="text-muted small">
                Apply this voucher to selected products only.
              </div>
            </div>
            <button className="btn btn-outline-secondary" onClick={onClose}>
              Close
            </button>
          </div>

          <div className="p-3 p-lg-4">
            {saveError && (
              <AlertBanner
                variant="danger"
                message={saveError}
                className="mb-4"
                onClose={onClearError}
              />
            )}

            <div className="row g-4 align-items-start">
              <div className="col-xl-8">
                <div className="bg-white border rounded-4 p-4 mb-4">
                  <h5 className="mb-4">Basic information</h5>

                  <div className="row g-3 align-items-start mb-3">
                    <label className="col-lg-3 col-form-label">Voucher type</label>
                    <div className="col-lg-9">
                      <div className="border rounded-3 px-3 py-2 d-inline-flex align-items-center gap-2 bg-white">
                        <span
                          className="rounded-2 d-inline-flex align-items-center justify-content-center text-white fw-bold"
                          style={{
                            width: 28,
                            height: 28,
                            background: "#ff8a00",
                          }}
                        >
                          P
                        </span>
                        <span>Product-specific voucher</span>
                      </div>
                    </div>
                  </div>

                  <div className="row g-3 align-items-start mb-3">
                    <label className="col-lg-3 col-form-label">Campaign</label>
                    <div className="col-lg-9">
                      <select
                        className="form-select"
                        value={form.campaignId ?? ""}
                        onChange={(e) =>
                          onChange("campaignId", e.target.value || null)
                        }
                        disabled={isCampaignsLoading}
                      >
                        <option value="">
                          {isCampaignsLoading
                            ? "Loading campaigns..."
                            : "Select campaign from voucher_campaign"}
                        </option>
                        {campaigns.map((campaign) => (
                          <option key={campaign.id} value={String(campaign.id)}>
                            {campaign.code} - {campaign.name}
                          </option>
                        ))}
                      </select>
                      <div className="d-flex justify-content-between small text-muted mt-1">
                        <span>
                          {selectedCampaign
                            ? `Selected: ${selectedCampaign.name} (${selectedCampaign.status})`
                            : "Campaigns are loaded from voucher_campaign"}
                        </span>
                        <span>{campaigns.length} campaign(s)</span>
                      </div>
                    </div>
                  </div>

                  <div className="row g-3 align-items-start mb-3">
                    <label className="col-lg-3 col-form-label">Voucher title</label>
                    <div className="col-lg-9">
                      <input
                        className="form-control"
                        maxLength={255}
                        value={form.title}
                        onChange={(e) => onChange("title", e.target.value)}
                        placeholder="Enter voucher title"
                      />
                    </div>
                  </div>

                  <div className="row g-3 align-items-start mb-3">
                    <label className="col-lg-3 col-form-label">Description</label>
                    <div className="col-lg-9">
                      <textarea
                        className="form-control"
                        rows={3}
                        value={form.description}
                        onChange={(e) => onChange("description", e.target.value)}
                        placeholder="Describe the product-focused promotion"
                      />
                    </div>
                  </div>

                  <div className="row g-3 align-items-start mb-3">
                    <label className="col-lg-3 col-form-label">Voucher code</label>
                    <div className="col-lg-9">
                      <div className="input-group">
                        {resolvedCodePrefix && (
                          <span className="input-group-text bg-light">
                            {resolvedCodePrefix}
                          </span>
                        )}
                        <input
                          className="form-control"
                          maxLength={20}
                          value={form.codeSuffix}
                          onChange={(e) => onChange("codeSuffix", e.target.value)}
                          placeholder="Enter voucher code"
                        />
                      </div>
                      <div className="small text-muted mt-1">
                        <span>
                          Use uppercase letters or numbers only. Current code:{" "}
                          <strong>{generatedCode || "N/A"}</strong>
                        </span>
                        <span className="float-end">{form.codeSuffix.length}/20</span>
                      </div>
                    </div>
                  </div>

                  <div className="row g-3 align-items-start mb-3">
                    <label className="col-lg-3 col-form-label">Claim period</label>
                    <div className="col-lg-9">
                      <div className="row g-2">
                        <div className="col-sm-6">
                          <div className="input-group">
                            <input
                              type="time"
                              className="form-control"
                              value={form.claimStartTime}
                              onChange={(e) =>
                                onChange("claimStartTime", e.target.value)
                              }
                            />
                            <input
                              type="date"
                              className="form-control"
                              value={form.claimStartDate}
                              onChange={(e) =>
                                onChange("claimStartDate", e.target.value)
                              }
                            />
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="input-group">
                            <input
                              type="time"
                              className="form-control"
                              value={form.claimEndTime}
                              onChange={(e) =>
                                onChange("claimEndTime", e.target.value)
                              }
                            />
                            <input
                              type="date"
                              className="form-control"
                              value={form.claimEndDate}
                              onChange={(e) =>
                                onChange("claimEndDate", e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row g-3 align-items-start">
                    <label className="col-lg-3 col-form-label">Valid period</label>
                    <div className="col-lg-9">
                      <div className="row g-2">
                        <div className="col-sm-6">
                          <div className="input-group">
                            <input
                              type="time"
                              className="form-control"
                              value={form.validFromTime}
                              onChange={(e) =>
                                onChange("validFromTime", e.target.value)
                              }
                            />
                            <input
                              type="date"
                              className="form-control"
                              value={form.validFromDate}
                              onChange={(e) =>
                                onChange("validFromDate", e.target.value)
                              }
                            />
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="input-group">
                            <input
                              type="time"
                              className="form-control"
                              value={form.validToTime}
                              onChange={(e) =>
                                onChange("validToTime", e.target.value)
                              }
                            />
                            <input
                              type="date"
                              className="form-control"
                              value={form.validToDate}
                              onChange={(e) =>
                                onChange("validToDate", e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-4 p-4 mb-4">
                  <h5 className="mb-4">Voucher setup</h5>

                  <div className="row g-3 align-items-center mb-3">
                    <label className="col-lg-3 col-form-label">Discount type</label>
                    <div className="col-lg-9">
                      <div className="row g-2">
                        <div className="col-md-4">
                          <select
                            className="form-select"
                            value={form.discountKind}
                            onChange={(e) =>
                              onChange(
                                "discountKind",
                                e.target.value as DiscountKind,
                              )
                            }
                          >
                            <option value="FIXED">Fixed amount</option>
                            <option value="PERCENT">Percentage</option>
                            <option value="FREE_SHIPPING">Free shipping</option>
                            <option value="GIFT_ITEM">Gift item</option>
                          </select>
                        </div>
                        <div className="col-md-8">
                          <div className="input-group">
                            <span className="input-group-text">
                              {isFixedDiscount ? "₫" : isPercentDiscount ? "%" : "•"}
                            </span>
                            <input
                              className="form-control"
                              value={form.discountValue}
                              onChange={(e) =>
                                onChange("discountValue", e.target.value)
                              }
                              disabled={isFreeShipping || isGiftItem}
                              placeholder={
                                isFixedDiscount
                                  ? "Enter amount"
                                  : isPercentDiscount
                                    ? "Enter percentage"
                                    : isFreeShipping
                                      ? "Not required for free shipping"
                                      : "Not required for gift item"
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row g-3 align-items-center mb-3">
                    <label className="col-lg-3 col-form-label">Minimum order value</label>
                    <div className="col-lg-9">
                      <div className="input-group">
                        <span className="input-group-text">₫</span>
                        <input
                          className="form-control"
                          value={form.minOrderValue}
                          onChange={(e) => onChange("minOrderValue", e.target.value)}
                          placeholder="Enter minimum spend"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row g-3 align-items-center mb-3">
                    <label className="col-lg-3 col-form-label">Max discount amount</label>
                    <div className="col-lg-9">
                      <div className="input-group">
                        <span className="input-group-text">₫</span>
                        <input
                          className="form-control"
                          value={form.maxDiscountAmount}
                          onChange={(e) =>
                            onChange("maxDiscountAmount", e.target.value)
                          }
                          disabled={!isPercentDiscount}
                          placeholder={
                            isPercentDiscount
                              ? "Cap for percentage discount"
                              : "Not required for this discount type"
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {(isFreeShipping || isGiftItem) && (
                    <div className="row g-3 align-items-start mb-3">
                      <label className="col-lg-3 col-form-label">Type note</label>
                      <div className="col-lg-9">
                        <div className="alert alert-info mb-0 py-2">
                          {isFreeShipping
                            ? "Free shipping vouchers do not require discount amount fields. Buyers will receive shipping support based on the voucher rules."
                            : "Gift item vouchers do not require amount fields. Use the title and description to explain the gift until gift-item detail fields are modeled separately."}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="row g-3 align-items-center mb-3">
                    <label className="col-lg-3 col-form-label">Max order value</label>
                    <div className="col-lg-9">
                      <div className="input-group">
                        <span className="input-group-text">₫</span>
                        <input
                          className="form-control"
                          value={form.maxOrderValue}
                          onChange={(e) =>
                            onChange("maxOrderValue", e.target.value)
                          }
                          placeholder="Optional ceiling for eligible orders"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row g-3 align-items-center mb-3">
                    <label className="col-lg-3 col-form-label">Total max uses</label>
                    <div className="col-lg-9">
                      <input
                        className="form-control"
                        value={form.maxUses}
                        onChange={(e) => onChange("maxUses", e.target.value)}
                        placeholder="Total number of claims available"
                      />
                    </div>
                  </div>

                  <div className="row g-3 align-items-center">
                    <label className="col-lg-3 col-form-label">
                      Max uses per buyer
                    </label>
                    <div className="col-lg-9">
                      <input
                        className="form-control"
                        value={form.perUserLimit}
                        onChange={(e) =>
                          onChange("perUserLimit", e.target.value)
                        }
                        placeholder="1"
                      />
                    </div>
                  </div>

                  <div className="row g-3 align-items-center mt-1">
                    <label className="col-lg-3 col-form-label">Stackable</label>
                    <div className="col-lg-9">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="productStackable"
                          checked={form.stackable}
                          onChange={(e) =>
                            onChange("stackable", e.target.checked)
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor="productStackable"
                        >
                          Allow combining with other vouchers
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-4 p-4 mb-4">
                  <h5 className="mb-4">Voucher targeting</h5>

                  <div className="row g-3 align-items-start">
                    <label className="col-lg-3 col-form-label">Status</label>
                    <div className="col-lg-4">
                      <select
                        className="form-select"
                        value={form.status}
                        onChange={(e) =>
                          onChange("status", e.target.value as ApiVoucherStatus)
                        }
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="ACTIVE">Active</option>
                        <option value="PAUSED">Paused</option>
                      </select>
                    </div>
                    <label className="col-lg-2 col-form-label">Priority</label>
                    <div className="col-lg-3">
                      <input
                        className="form-control"
                        value={form.priority}
                        onChange={(e) => onChange("priority", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-4 p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Choose products</h5>
                    <span className="small text-muted">
                      {form.selectedProductIds.length} selected
                    </span>
                  </div>

                  {isProductsLoading ? (
                    <div className="text-muted small">Loading products...</div>
                  ) : products.length === 0 ? (
                    <div className="text-muted small">
                      No products available for this shop.
                    </div>
                  ) : (
                    <div className="row g-3">
                      {products.map((product) => {
                        const productId = Number(product.id);
                        const selected = form.selectedProductIds.includes(productId);
                        return (
                          <div className="col-md-6" key={productId}>
                            <button
                              type="button"
                              className={`w-100 text-start border rounded-4 p-3 bg-white product-select-card ${
                                selected ? "border-danger shadow-sm" : ""
                              }`}
                              onClick={() => onToggleProduct(productId)}
                            >
                              <div className="d-flex gap-3">
                                <img
                                  src={
                                    product.image_url ||
                                    "https://via.placeholder.com/72x72?text=Item"
                                  }
                                  alt={product.product_name || "Product"}
                                  width="72"
                                  height="72"
                                  className="rounded-3 border flex-shrink-0"
                                  style={{ objectFit: "cover" }}
                                />
                                <div className="flex-grow-1">
                                  <div className="fw-semibold mb-1">
                                    {product.product_name || `Product #${productId}`}
                                  </div>
                                  <div className="small text-muted mb-2">
                                    SKU #{productId}
                                  </div>
                                  <div className="d-flex justify-content-between small">
                                    <span>₫{Number(product.price || 0).toLocaleString()}</span>
                                    <span className="text-muted">
                                      Stock {Number(product.stock_quantity || 0)}
                                    </span>
                                  </div>
                                </div>
                                <input
                                  type="checkbox"
                                  className="form-check-input mt-1"
                                  checked={selected}
                                  readOnly
                                />
                              </div>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-xl-4">
                <div className="position-sticky" style={{ top: 16 }}>
                  <div className="bg-white border rounded-4 shadow-sm p-4 mb-3">
                    <div className="small text-muted mb-2">Preview</div>
                    <h5 className="mb-1">{form.title || "Product voucher preview"}</h5>
                    <div className="text-muted small mb-3">
                      {selectedCampaign?.name || "No campaign selected"}
                    </div>
                    <div className="d-flex gap-2 flex-wrap mb-3">
                      <span className="badge text-bg-light border text-secondary">
                        {previewDiscount}
                      </span>
                      <span className="badge text-bg-light border text-secondary">
                        {generatedCode || "N/A"}
                      </span>
                      <span className="badge text-bg-light border text-secondary">
                        {form.selectedProductIds.length} products
                      </span>
                    </div>
                    <div className="small text-muted">
                      This voucher will only be redeemable on the products selected
                      below.
                    </div>
                    <div className="small text-muted mt-2">
                      Status: <strong>{form.status}</strong>
                    </div>
                  </div>

                  <div className="bg-white border rounded-4 shadow-sm p-4">
                    <div className="small text-muted mb-2">Selected products</div>
                    {selectedProducts.length === 0 ? (
                      <div className="small text-muted">No products selected yet.</div>
                    ) : (
                      <div className="d-flex flex-column gap-2">
                        {selectedProducts.slice(0, 6).map((product) => (
                          <div
                            key={product.id}
                            className="border rounded-3 px-3 py-2 small d-flex justify-content-between align-items-center"
                          >
                            <span className="text-truncate pe-2">
                              {product.product_name}
                            </span>
                            <span className="text-muted">#{product.id}</span>
                          </div>
                        ))}
                        {selectedProducts.length > 6 && (
                          <div className="small text-muted">
                            +{selectedProducts.length - 6} more products
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="bg-light border rounded-3 p-3 mt-3">
                    <div className="small text-muted mb-2">Payload preview</div>
                    <pre
                      className="mb-0 small"
                      style={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {JSON.stringify(voucherPayload, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border-top px-4 px-lg-5 py-3 d-flex justify-content-end gap-2 rounded-bottom-4">
            <button
              className="btn btn-outline-secondary"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button className="btn btn-danger" onClick={onConfirm} disabled={isSaving}>
              {isSaving ? "Saving..." : isEditing ? "Update voucher" : "Create voucher"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryVoucherCreateModal({
  form,
  shopId,
  campaigns,
  categories,
  isCampaignsLoading,
  isSaving,
  isEditing,
  saveError,
  onClearError,
  onClose,
  onConfirm,
  onChange,
  onToggleCategory,
}: {
  form: CategoryVoucherFormState;
  shopId?: number | null;
  campaigns: VoucherCampaign[];
  categories: ShopCategoryOption[];
  isCampaignsLoading: boolean;
  isSaving: boolean;
  isEditing?: boolean;
  saveError: string | null;
  onClearError: () => void;
  onClose: () => void;
  onConfirm: () => void;
  onChange: <K extends keyof CategoryVoucherFormState>(
    key: K,
    value: CategoryVoucherFormState[K],
  ) => void;
  onToggleCategory: (categoryId: number) => void;
}) {
  const selectedCampaign =
    campaigns.find(
      (campaign) => String(campaign.id) === String(form.campaignId),
    ) ?? null;
  const resolvedCodePrefix = shopId ? `S${shopId}` : form.codePrefix;
  const generatedCode = `${resolvedCodePrefix}${form.codeSuffix ? `-${form.codeSuffix.toUpperCase()}` : ""}`;
  const isFixedDiscount = form.discountKind === "FIXED";
  const isPercentDiscount = form.discountKind === "PERCENT";
  const isFreeShipping = form.discountKind === "FREE_SHIPPING";
  const isGiftItem = form.discountKind === "GIFT_ITEM";
  const selectedCategories = categories.filter((category) =>
    form.selectedCategoryIds.includes(Number(category.id)),
  );
  const previewDiscount =
    isFixedDiscount
      ? form.discountValue
        ? `₫${form.discountValue}`
        : "₫..."
      : isPercentDiscount
        ? `${form.discountValue}%`
        : isFreeShipping
          ? "Free ship"
          : isGiftItem
            ? "Gift item"
            : "N/A";
  const voucherPayload = buildShopVoucherPayload(form, shopId);

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100"
      style={{ background: "rgba(15, 23, 42, 0.42)", zIndex: 1050 }}
      onClick={onClose}
    >
      <div
        className="h-100 overflow-auto p-3 p-lg-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="bg-light rounded-4 shadow-lg mx-auto"
          style={{ maxWidth: 1240 }}
        >
          <div className="d-flex justify-content-between align-items-center px-4 px-lg-5 py-4 border-bottom bg-white rounded-top-4">
            <div>
              <h4 className="mb-1">
                {isEditing
                  ? "Edit Category-specific Voucher"
                  : "Create Category-specific Voucher"}
              </h4>
              <div className="text-muted small">
                Apply this voucher to categories that already have products in your shop.
              </div>
            </div>
            <button className="btn btn-outline-secondary" onClick={onClose}>
              Close
            </button>
          </div>

          <div className="p-3 p-lg-4">
            {saveError && (
              <AlertBanner
                variant="danger"
                message={saveError}
                className="mb-4"
                onClose={onClearError}
              />
            )}

            <div className="row g-4 align-items-start">
              <div className="col-xl-8">
                <div className="bg-white border rounded-4 p-4 mb-4">
                  <h5 className="mb-4">Basic information</h5>

                  <div className="row g-3 align-items-start mb-3">
                    <label className="col-lg-3 col-form-label">Voucher type</label>
                    <div className="col-lg-9">
                      <div className="border rounded-3 px-3 py-2 d-inline-flex align-items-center gap-2 bg-white">
                        <span
                          className="rounded-2 d-inline-flex align-items-center justify-content-center text-white fw-bold"
                          style={{ width: 28, height: 28, background: "#2563eb" }}
                        >
                          C
                        </span>
                        <span>Category-specific voucher</span>
                      </div>
                    </div>
                  </div>

                  <div className="row g-3 align-items-start mb-3">
                    <label className="col-lg-3 col-form-label">Campaign</label>
                    <div className="col-lg-9">
                      <select
                        className="form-select"
                        value={form.campaignId ?? ""}
                        onChange={(e) => onChange("campaignId", e.target.value || null)}
                        disabled={isCampaignsLoading}
                      >
                        <option value="">
                          {isCampaignsLoading
                            ? "Loading campaigns..."
                            : "Select campaign from voucher_campaign"}
                        </option>
                        {campaigns.map((campaign) => (
                          <option key={campaign.id} value={String(campaign.id)}>
                            {campaign.code} - {campaign.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row g-3 align-items-start mb-3">
                    <label className="col-lg-3 col-form-label">Voucher title</label>
                    <div className="col-lg-9">
                      <input
                        className="form-control"
                        maxLength={255}
                        value={form.title}
                        onChange={(e) => onChange("title", e.target.value)}
                        placeholder="Enter voucher title"
                      />
                    </div>
                  </div>

                  <div className="row g-3 align-items-start mb-3">
                    <label className="col-lg-3 col-form-label">Description</label>
                    <div className="col-lg-9">
                      <textarea
                        className="form-control"
                        rows={3}
                        value={form.description}
                        onChange={(e) => onChange("description", e.target.value)}
                        placeholder="Describe the category-focused promotion"
                      />
                    </div>
                  </div>

                  <div className="row g-3 align-items-start mb-3">
                    <label className="col-lg-3 col-form-label">Voucher code</label>
                    <div className="col-lg-9">
                      <div className="input-group">
                        {resolvedCodePrefix && (
                          <span className="input-group-text bg-light">{resolvedCodePrefix}</span>
                        )}
                        <input
                          className="form-control"
                          maxLength={20}
                          value={form.codeSuffix}
                          onChange={(e) => onChange("codeSuffix", e.target.value)}
                          placeholder="Enter voucher code"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row g-3 align-items-start mb-3">
                    <label className="col-lg-3 col-form-label">Claim period</label>
                    <div className="col-lg-9">
                      <div className="row g-2">
                        <div className="col-sm-6">
                          <div className="input-group">
                            <input type="time" className="form-control" value={form.claimStartTime} onChange={(e) => onChange("claimStartTime", e.target.value)} />
                            <input type="date" className="form-control" value={form.claimStartDate} onChange={(e) => onChange("claimStartDate", e.target.value)} />
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="input-group">
                            <input type="time" className="form-control" value={form.claimEndTime} onChange={(e) => onChange("claimEndTime", e.target.value)} />
                            <input type="date" className="form-control" value={form.claimEndDate} onChange={(e) => onChange("claimEndDate", e.target.value)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row g-3 align-items-start">
                    <label className="col-lg-3 col-form-label">Valid period</label>
                    <div className="col-lg-9">
                      <div className="row g-2">
                        <div className="col-sm-6">
                          <div className="input-group">
                            <input type="time" className="form-control" value={form.validFromTime} onChange={(e) => onChange("validFromTime", e.target.value)} />
                            <input type="date" className="form-control" value={form.validFromDate} onChange={(e) => onChange("validFromDate", e.target.value)} />
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="input-group">
                            <input type="time" className="form-control" value={form.validToTime} onChange={(e) => onChange("validToTime", e.target.value)} />
                            <input type="date" className="form-control" value={form.validToDate} onChange={(e) => onChange("validToDate", e.target.value)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-4 p-4 mb-4">
                  <h5 className="mb-4">Voucher setup</h5>
                  <div className="row g-3 align-items-center mb-3">
                    <label className="col-lg-3 col-form-label">Discount type</label>
                    <div className="col-lg-9">
                      <div className="row g-2">
                        <div className="col-md-4">
                          <select
                            className="form-select"
                            value={form.discountKind}
                            onChange={(e) => onChange("discountKind", e.target.value as DiscountKind)}
                          >
                            <option value="FIXED">Fixed amount</option>
                            <option value="PERCENT">Percentage</option>
                            <option value="FREE_SHIPPING">Free shipping</option>
                            <option value="GIFT_ITEM">Gift item</option>
                          </select>
                        </div>
                        <div className="col-md-8">
                          <div className="input-group">
                            <span className="input-group-text">
                              {isFixedDiscount ? "₫" : isPercentDiscount ? "%" : "•"}
                            </span>
                            <input
                              className="form-control"
                              value={form.discountValue}
                              onChange={(e) => onChange("discountValue", e.target.value)}
                              disabled={isFreeShipping || isGiftItem}
                              placeholder={
                                isFixedDiscount
                                  ? "Enter amount"
                                  : isPercentDiscount
                                    ? "Enter percentage"
                                    : "Not required for this discount type"
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row g-3 align-items-center mb-3">
                    <label className="col-lg-3 col-form-label">Minimum order value</label>
                    <div className="col-lg-9">
                      <div className="input-group">
                        <span className="input-group-text">₫</span>
                        <input className="form-control" value={form.minOrderValue} onChange={(e) => onChange("minOrderValue", e.target.value)} placeholder="Enter minimum spend" />
                      </div>
                    </div>
                  </div>

                  <div className="row g-3 align-items-center mb-3">
                    <label className="col-lg-3 col-form-label">Max discount amount</label>
                    <div className="col-lg-9">
                      <div className="input-group">
                        <span className="input-group-text">₫</span>
                        <input className="form-control" value={form.maxDiscountAmount} onChange={(e) => onChange("maxDiscountAmount", e.target.value)} disabled={!isPercentDiscount} placeholder={isPercentDiscount ? "Cap for percentage discount" : "Not required for this discount type"} />
                      </div>
                    </div>
                  </div>

                  <div className="row g-3 align-items-center mb-3">
                    <label className="col-lg-3 col-form-label">Max order value</label>
                    <div className="col-lg-9">
                      <div className="input-group">
                        <span className="input-group-text">₫</span>
                        <input className="form-control" value={form.maxOrderValue} onChange={(e) => onChange("maxOrderValue", e.target.value)} placeholder="Optional ceiling for eligible orders" />
                      </div>
                    </div>
                  </div>

                  <div className="row g-3 align-items-center mb-3">
                    <label className="col-lg-3 col-form-label">Total max uses</label>
                    <div className="col-lg-9">
                      <input className="form-control" value={form.maxUses} onChange={(e) => onChange("maxUses", e.target.value)} placeholder="Total number of claims available" />
                    </div>
                  </div>

                  <div className="row g-3 align-items-center">
                    <label className="col-lg-3 col-form-label">Max uses per buyer</label>
                    <div className="col-lg-9">
                      <input className="form-control" value={form.perUserLimit} onChange={(e) => onChange("perUserLimit", e.target.value)} placeholder="1" />
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-4 p-4 mb-4">
                  <h5 className="mb-4">Voucher targeting</h5>
                  <div className="row g-3 align-items-start">
                    <label className="col-lg-3 col-form-label">Status</label>
                    <div className="col-lg-4">
                      <select className="form-select" value={form.status} onChange={(e) => onChange("status", e.target.value as ApiVoucherStatus)}>
                        <option value="DRAFT">Draft</option>
                        <option value="ACTIVE">Active</option>
                        <option value="PAUSED">Paused</option>
                      </select>
                    </div>
                    <label className="col-lg-2 col-form-label">Priority</label>
                    <div className="col-lg-3">
                      <input className="form-control" value={form.priority} onChange={(e) => onChange("priority", e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-4 p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Choose categories</h5>
                    <span className="small text-muted">{form.selectedCategoryIds.length} selected</span>
                  </div>
                  {categories.length === 0 ? (
                    <div className="text-muted small">No categories available from this shop's products.</div>
                  ) : (
                    <div className="row g-3">
                      {categories.map((category) => {
                        const selected = form.selectedCategoryIds.includes(Number(category.id));
                        return (
                          <div className="col-md-6" key={category.id}>
                            <button
                              type="button"
                              className={`w-100 text-start border rounded-4 p-3 bg-white product-select-card ${
                                selected ? "border-primary shadow-sm" : ""
                              }`}
                              onClick={() => onToggleCategory(category.id)}
                            >
                              <div className="d-flex justify-content-between gap-3">
                                <div className="flex-grow-1">
                                  <div className="fw-semibold mb-1">{category.label}</div>
                                  <div className="small text-muted">
                                    {category.productCount} product(s) in this category
                                  </div>
                                </div>
                                <input type="checkbox" className="form-check-input mt-1" checked={selected} readOnly />
                              </div>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-xl-4">
                <div className="position-sticky" style={{ top: 16 }}>
                  <div className="bg-white border rounded-4 shadow-sm p-4 mb-3">
                    <div className="small text-muted mb-2">Preview</div>
                    <h5 className="mb-1">{form.title || "Category voucher preview"}</h5>
                    <div className="text-muted small mb-3">
                      {selectedCampaign?.name || "No campaign selected"}
                    </div>
                    <div className="d-flex gap-2 flex-wrap mb-3">
                      <span className="badge text-bg-light border text-secondary">{previewDiscount}</span>
                      <span className="badge text-bg-light border text-secondary">{generatedCode || "N/A"}</span>
                      <span className="badge text-bg-light border text-secondary">{form.selectedCategoryIds.length} categories</span>
                    </div>
                    <div className="small text-muted">
                      This voucher will only be redeemable for products in the categories selected below.
                    </div>
                    <div className="small text-muted mt-2">
                      Status: <strong>{form.status}</strong>
                    </div>
                  </div>

                  <div className="bg-white border rounded-4 shadow-sm p-4">
                    <div className="small text-muted mb-2">Selected categories</div>
                    {selectedCategories.length === 0 ? (
                      <div className="small text-muted">No categories selected yet.</div>
                    ) : (
                      <div className="d-flex flex-column gap-2">
                        {selectedCategories.slice(0, 6).map((category) => (
                          <div key={category.id} className="border rounded-3 px-3 py-2 small d-flex justify-content-between align-items-center">
                            <span className="text-truncate pe-2">{category.label}</span>
                            <span className="text-muted">#{category.id}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-light border rounded-3 p-3 mt-3">
                    <div className="small text-muted mb-2">Payload preview</div>
                    <pre className="mb-0 small" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      {JSON.stringify(voucherPayload, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border-top px-4 px-lg-5 py-3 d-flex justify-content-end gap-2 rounded-bottom-4">
            <button className="btn btn-outline-secondary" onClick={onClose} disabled={isSaving}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={onConfirm} disabled={isSaving}>
              {isSaving ? "Saving..." : isEditing ? "Update voucher" : "Create voucher"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function VoucherActionModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100"
      style={{ background: "rgba(15, 23, 42, 0.42)", zIndex: 1050 }}
      onClick={onClose}
    >
      <div
        className="h-100 overflow-auto p-3 p-lg-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="bg-white rounded-4 shadow-lg mx-auto"
          style={{ maxWidth: 980 }}
        >
          <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
            <h5 className="mb-0">{title}</h5>
            <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>
              Close
            </button>
          </div>
          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

const Page = () => {
  const queryClient = useQueryClient();
  const { shop, userId } = useSellerAuth();
  const [activeTab, setActiveTab] = useState<VoucherStatus>("all");
  const [searchField, setSearchField] = useState("Campaign name");
  const [searchTerm, setSearchTerm] = useState("");
  const [isShopVoucherModalOpen, setIsShopVoucherModalOpen] = useState(false);
  const [isProductVoucherModalOpen, setIsProductVoucherModalOpen] =
    useState(false);
  const [isCategoryVoucherModalOpen, setIsCategoryVoucherModalOpen] =
    useState(false);
  const [editingVoucherId, setEditingVoucherId] = useState<string | null>(null);
  const [editingVoucherType, setEditingVoucherType] = useState<
    "shop" | "product" | "category" | null
  >(null);
  const [detailsVoucherId, setDetailsVoucherId] = useState<string | null>(null);
  const [ordersVoucherId, setOrdersVoucherId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [shopVoucherForm, setShopVoucherForm] = useState<ShopVoucherFormState>(
    () => createInitialShopVoucherForm(),
  );
  const [productVoucherForm, setProductVoucherForm] =
    useState<ProductVoucherFormState>(() => createInitialProductVoucherForm());
  const [categoryVoucherForm, setCategoryVoucherForm] =
    useState<CategoryVoucherFormState>(() => createInitialCategoryVoucherForm());
  const campaignsQuery = useQuery(vouchersQuery.campaigns());
  const vouchersQueryResult = useQuery(vouchersQuery.all());
  const productsQuery = useQuery({
    queryKey: ["seller", "products", shop?.id],
    queryFn: () => getProductByShopId(Number(shop?.id)),
    enabled: Boolean(shop?.id),
  });
  const categoriesQuery = useQuery({
    queryKey: ["seller", "categories", "all"],
    queryFn: async (): Promise<CategoryOption[]> => {
      const res = await fetch(`${API_URL}/api/categories`);
      if (!res.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        return data as CategoryOption[];
      }
      if (Array.isArray(data?.data)) {
        return data.data as CategoryOption[];
      }
      return [];
    },
  });
  const campaigns = campaignsQuery.data || [];
  const products = productsQuery.data || [];
  const categoryNameMap = useMemo(
    () =>
      (categoriesQuery.data || []).reduce<Record<number, string>>(
        (acc, category: any) => {
          const id = Number(category?.id || 0);
          if (!id) return acc;
          acc[id] =
            category?.category_name ||
            category?.name ||
            `Category #${id}`;
          return acc;
        },
        {},
      ),
    [categoriesQuery.data],
  );
  const shopCategories = useMemo<ShopCategoryOption[]>(
    () =>
      Object.values(
        products.reduce<Record<number, ShopCategoryOption>>((acc, product) => {
          const categoryId = Number(product.category_id || 0);
          if (!categoryId) return acc;
          const existing = acc[categoryId];
          if (existing) {
            existing.productCount += 1;
            if (
              product.product_name &&
              existing.sampleProducts.length < 3 &&
              !existing.sampleProducts.includes(product.product_name)
            ) {
              existing.sampleProducts.push(product.product_name);
            }
            return acc;
          }

          acc[categoryId] = {
            id: categoryId,
            label: categoryNameMap[categoryId] || `Category #${categoryId}`,
            productCount: 1,
            sampleProducts: product.product_name ? [product.product_name] : [],
          };
          return acc;
        }, {}),
      ).sort((a, b) => a.id - b.id),
    [categoryNameMap, products],
  );
  const rawSellerVouchers = useMemo(
    () =>
      (vouchersQueryResult.data || []).filter(
        (voucher) =>
          voucher.issuerType === "SHOP" &&
          Number(voucher.issuerId) === Number(shop?.id),
      ),
    [shop?.id, vouchersQueryResult.data],
  );
  const voucherRulesQueries = useQueries({
    queries: rawSellerVouchers.map((voucher) => ({
      ...vouchersQuery.rules(String(voucher.id)),
      queryKey: ["seller", "voucher-rules", String(voucher.id)],
      enabled: Boolean(voucher.id),
    })),
  });
  const voucherRulesByVoucherId = useMemo(
    () =>
      rawSellerVouchers.reduce<Record<string, VoucherRulesPayload>>(
        (acc, voucher, index) => {
          acc[String(voucher.id)] = voucherRulesQueries[index]?.data || {
            scopeRules: [],
            segmentRules: [],
          };
          return acc;
        },
        {},
      ),
    [rawSellerVouchers, voucherRulesQueries],
  );
  const sellerVouchers = useMemo(
    () =>
      rawSellerVouchers.map((voucher) =>
        mapVoucherToItem(
          voucher,
          voucherRulesByVoucherId[String(voucher.id)]?.scopeRules || [],
          products,
          shopCategories,
        ),
      ),
    [products, rawSellerVouchers, shopCategories, voucherRulesByVoucherId],
  );
  const sellerVoucherMap = useMemo(
    () =>
      rawSellerVouchers.reduce<Record<string, AdminVoucher>>((acc, voucher) => {
        acc[String(voucher.id)] = voucher;
        return acc;
      }, {}),
    [rawSellerVouchers],
  );
  const selectedDetailsVoucher =
    detailsVoucherId !== null ? sellerVoucherMap[detailsVoucherId] : null;
  const selectedOrdersVoucher =
    ordersVoucherId !== null ? sellerVoucherMap[ordersVoucherId] : null;
  const selectedDetailsRules =
    detailsVoucherId !== null
      ? voucherRulesByVoucherId[detailsVoucherId] || {
          scopeRules: [],
          segmentRules: [],
        }
      : null;
  const selectedDetailsRulesDisplay = useMemo(() => {
    if (!selectedDetailsRules) return null;

    return {
      ...selectedDetailsRules,
      scopeRules: selectedDetailsRules.scopeRules.map((rule) => {
        const matchedProduct = products.find(
          (product) => Number(product.id) === Number(rule.scopeId),
        );

        return {
          ...rule,
          scopeLabel:
            rule.scopeType === "PRODUCT"
              ? matchedProduct?.product_name || `Product #${rule.scopeId}`
              : rule.scopeType === "CATEGORY"
                ? shopCategories.find(
                    (category) => Number(category.id) === Number(rule.scopeId),
                  )?.label || `Category #${rule.scopeId}`
              : String(rule.scopeId),
        };
      }),
    };
  }, [products, selectedDetailsRules, shopCategories]);
  const selectedOrdersRules =
    ordersVoucherId !== null
      ? voucherRulesByVoucherId[ordersVoucherId] || {
          scopeRules: [],
          segmentRules: [],
        }
      : null;
  const voucherOrdersQuery = useQuery({
    ...vouchersQuery.redemptions(ordersVoucherId ?? ""),
    queryKey: ["seller", "voucher-redemptions", ordersVoucherId ?? ""],
    enabled: Boolean(ordersVoucherId),
  });
  const voucherOrderRows = useMemo(
    () =>
      (voucherOrdersQuery.data || []).map((item) => ({
        id: item.orderCode || item.id,
        buyer: item.userName,
        orderValue: Number(item.finalOrderAmount || 0),
        discountAmount: Number(item.discountAmountApplied || 0),
        redeemedAt: formatDateTimeRange(item.redeemedAt, item.redeemedAt).split(" - ")[0],
        status: item.status,
      })),
    [voucherOrdersQuery.data],
  );
  const createVoucherMutation = useMutation({
    mutationFn: (payload: Partial<AdminVoucher> & { createdBy?: number | null }) =>
      createVoucher(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "vouchers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "voucher-stats"] });
    },
  });

  useEffect(() => {
    if (!saveSuccess && !saveError) return;

    const timeout = window.setTimeout(() => {
      setSaveSuccess(null);
      setSaveError(null);
    }, 4000);

    return () => window.clearTimeout(timeout);
  }, [saveError, saveSuccess]);
  const updateVoucherMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<AdminVoucher>;
    }) => updateVoucher(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "vouchers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "voucher-stats"] });
    },
  });

  const filteredVouchers = useMemo(
    () =>
      sellerVouchers.filter((voucher) => {
        const matchesStatus =
          activeTab === "all" ? true : voucher.status === activeTab;
        const normalizedTerm = searchTerm.trim().toLowerCase();
        const haystack =
          searchField === "Voucher code"
            ? voucher.code.toLowerCase()
            : `${voucher.name} ${voucher.code}`.toLowerCase();
        const matchesSearch = normalizedTerm
          ? haystack.includes(normalizedTerm)
          : true;

        return matchesStatus && matchesSearch;
      }),
    [activeTab, searchField, searchTerm, sellerVouchers],
  );

  const updateShopVoucherForm = <K extends keyof ShopVoucherFormState>(
    key: K,
    value: ShopVoucherFormState[K],
  ) => {
    setShopVoucherForm((prev) => ({ ...prev, [key]: value }));
  };

  const openShopVoucherModal = () => {
    setShopVoucherForm(createInitialShopVoucherForm());
    setEditingVoucherId(null);
    setEditingVoucherType(null);
    setSaveError(null);
    setIsShopVoucherModalOpen(true);
  };

  const openProductVoucherModal = () => {
    setProductVoucherForm(createInitialProductVoucherForm());
    setEditingVoucherId(null);
    setEditingVoucherType(null);
    setSaveError(null);
    setIsProductVoucherModalOpen(true);
  };

  const openCategoryVoucherModal = () => {
    setCategoryVoucherForm(createInitialCategoryVoucherForm());
    setEditingVoucherId(null);
    setEditingVoucherType(null);
    setSaveError(null);
    setIsCategoryVoucherModalOpen(true);
  };

  const updateProductVoucherForm = <K extends keyof ProductVoucherFormState>(
    key: K,
    value: ProductVoucherFormState[K],
  ) => {
    setProductVoucherForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateCategoryVoucherForm = <K extends keyof CategoryVoucherFormState>(
    key: K,
    value: CategoryVoucherFormState[K],
  ) => {
    setCategoryVoucherForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSelectedProduct = (productId: number) => {
    setProductVoucherForm((prev) => ({
      ...prev,
      selectedProductIds: prev.selectedProductIds.includes(productId)
        ? prev.selectedProductIds.filter((id) => id !== productId)
        : [...prev.selectedProductIds, productId],
    }));
  };

  const toggleSelectedCategory = (categoryId: number) => {
    setCategoryVoucherForm((prev) => ({
      ...prev,
      selectedCategoryIds: prev.selectedCategoryIds.includes(categoryId)
        ? prev.selectedCategoryIds.filter((id) => id !== categoryId)
        : [...prev.selectedCategoryIds, categoryId],
    }));
  };

  const openVoucherDetails = (voucherId: string) => {
    setDetailsVoucherId(voucherId);
  };

  const openVoucherOrders = (voucherId: string) => {
    setOrdersVoucherId(voucherId);
  };

  const openEditVoucher = (voucher: VoucherItem) => {
    const sourceVoucher = sellerVoucherMap[voucher.id];
    const sourceRules = voucherRulesByVoucherId[voucher.id] || {
      scopeRules: [],
      segmentRules: [],
    };
    if (!sourceVoucher) return;

    setSaveError(null);
    setSaveSuccess(null);
    setEditingVoucherId(voucher.id);

    if (voucher.isProductSpecific) {
      setEditingVoucherType("product");
      setProductVoucherForm({
        ...buildShopVoucherFormFromVoucher(sourceVoucher),
        selectedProductIds: sourceRules.scopeRules
          .filter(
            (rule) =>
              rule.scopeType === "PRODUCT" && rule.includeExclude === "INCLUDE",
          )
          .map((rule) => Number(rule.scopeId)),
      });
      setIsProductVoucherModalOpen(true);
      return;
    }

    if (voucher.isCategorySpecific) {
      setEditingVoucherType("category");
      setCategoryVoucherForm({
        ...buildShopVoucherFormFromVoucher(sourceVoucher),
        selectedCategoryIds: sourceRules.scopeRules
          .filter(
            (rule) =>
              rule.scopeType === "CATEGORY" && rule.includeExclude === "INCLUDE",
          )
          .map((rule) => Number(rule.scopeId)),
      });
      setIsCategoryVoucherModalOpen(true);
      return;
    }

    setEditingVoucherType("shop");
    setShopVoucherForm(buildShopVoucherFormFromVoucher(sourceVoucher));
    setIsShopVoucherModalOpen(true);
  };


  const handleCreateShopVoucher = async () => {
    const shopId = Number(shop?.id || 0);
    if (!shopId) {
      const message = "Shop information is not ready yet. Please wait a moment and try again.";
      setSaveError(message);
      window.alert(message);
      return;
    }

    try {
      setSaveError(null);
      const payload = {
        ...buildShopVoucherPayload(shopVoucherForm, shopId),
        createdBy: userId ?? null,
      };

      if (editingVoucherId && editingVoucherType === "shop") {
        await updateVoucherMutation.mutateAsync({
          id: editingVoucherId,
          payload,
        });
        setSaveSuccess("Voucher was updated successfully.");
        window.alert("Voucher was updated successfully.");
      } else {
        await createVoucherMutation.mutateAsync(payload);
        setSaveSuccess("Voucher was saved successfully.");
        window.alert("Voucher was saved successfully.");
      }
      setIsShopVoucherModalOpen(false);
      setShopVoucherForm(createInitialShopVoucherForm());
      setEditingVoucherId(null);
      setEditingVoucherType(null);
    } catch (error: any) {
      const message = getSaveErrorMessage(
        error,
        "Unable to save voucher to the database.",
      );
      setSaveError(message);
      window.alert(message);
    }
  };

  const handleCreateProductVoucher = async () => {
    const shopId = Number(shop?.id || 0);
    if (!shopId) {
      const message = "Shop information is not ready yet. Please wait a moment and try again.";
      setSaveError(message);
      window.alert(message);
      return;
    }

    if (productVoucherForm.selectedProductIds.length === 0) {
      const message = "Please select at least one product.";
      setSaveError(message);
      window.alert(message);
      return;
    }

    try {
      setSaveError(null);
      const payload = {
        ...buildShopVoucherPayload(productVoucherForm, shopId),
        createdBy: userId ?? null,
      };

      const targetVoucherId =
        editingVoucherId && editingVoucherType === "product"
          ? editingVoucherId
          : null;
      const voucherId = targetVoucherId
        ? (
            await updateVoucherMutation.mutateAsync({
              id: targetVoucherId,
              payload,
            })
          ).id
        : (await createVoucherMutation.mutateAsync(payload)).id;

      const rulesPayload: VoucherRulesPayload = {
        scopeRules: productVoucherForm.selectedProductIds.map((productId) => ({
          id: "",
          voucherId: String(voucherId),
          scopeType: "PRODUCT",
          scopeId: productId,
          includeExclude: "INCLUDE",
          createdAt: new Date().toISOString(),
        })),
        segmentRules: [],
      };

      await saveVoucherRules(String(voucherId), rulesPayload);
      const successMessage = targetVoucherId
        ? "Product-specific voucher was updated successfully."
        : "Product-specific voucher was saved successfully.";
      setSaveSuccess(successMessage);
      window.alert(successMessage);
      setIsProductVoucherModalOpen(false);
      setProductVoucherForm(createInitialProductVoucherForm());
      setEditingVoucherId(null);
      setEditingVoucherType(null);
    } catch (error: any) {
      const message = getSaveErrorMessage(
        error,
        "Unable to save product-specific voucher.",
      );
      setSaveError(message);
      window.alert(message);
    }
  };

  const handleCreateCategoryVoucher = async () => {
    const shopId = Number(shop?.id || 0);
    if (!shopId) {
      const message = "Shop information is not ready yet. Please wait a moment and try again.";
      setSaveError(message);
      window.alert(message);
      return;
    }

    if (categoryVoucherForm.selectedCategoryIds.length === 0) {
      const message = "Please select at least one category.";
      setSaveError(message);
      window.alert(message);
      return;
    }

    try {
      setSaveError(null);
      const payload = {
        ...buildShopVoucherPayload(categoryVoucherForm, shopId),
        createdBy: userId ?? null,
      };

      const targetVoucherId =
        editingVoucherId && editingVoucherType === "category"
          ? editingVoucherId
          : null;
      const voucherId = targetVoucherId
        ? (
            await updateVoucherMutation.mutateAsync({
              id: targetVoucherId,
              payload,
            })
          ).id
        : (await createVoucherMutation.mutateAsync(payload)).id;

      const rulesPayload: VoucherRulesPayload = {
        scopeRules: categoryVoucherForm.selectedCategoryIds.map((categoryId) => ({
          id: "",
          voucherId: String(voucherId),
          scopeType: "CATEGORY",
          scopeId: categoryId,
          includeExclude: "INCLUDE",
          createdAt: new Date().toISOString(),
        })),
        segmentRules: [],
      };

      await saveVoucherRules(String(voucherId), rulesPayload);
      const successMessage = targetVoucherId
        ? "Category-specific voucher was updated successfully."
        : "Category-specific voucher was saved successfully.";
      setSaveSuccess(successMessage);
      window.alert(successMessage);
      setIsCategoryVoucherModalOpen(false);
      setCategoryVoucherForm(createInitialCategoryVoucherForm());
      setEditingVoucherId(null);
      setEditingVoucherType(null);
    } catch (error: any) {
      const message = getSaveErrorMessage(
        error,
        "Unable to save category-specific voucher.",
      );
      setSaveError(message);
      window.alert(message);
    }
  };

  return (
    <div className="flex-grow-1 overflow-auto bg-light min-vh-100">
      <div className="voucher-hero border-bottom p-3 p-lg-4 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <div>
            <h4 className="mb-1 fw-bold">Shop Voucher Center</h4>
            <div className="text-muted small">
              Launch, track, and manage public offers for your storefront.
            </div>
          </div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0 ms-4">
              <li className="breadcrumb-item">
                <Link href="/seller" className="text-decoration-none">
                  Seller home
                </Link>
              </li>
              <li className="breadcrumb-item">Promotions</li>
              <li className="breadcrumb-item active">Shop Discount Codes</li>
            </ol>
          </nav>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-sm btn-outline-secondary">Docs</button>
          <button
            className="btn btn-sm btn-danger"
            onClick={openShopVoucherModal}
          >
            + Create vouchers
          </button>
        </div>
      </div>

      <div className="p-3 p-lg-4">
        {saveSuccess && (
          <AlertBanner
            variant="success"
            message={saveSuccess}
            className="mb-3 shadow-sm voucher-page-alert"
            onClose={() => setSaveSuccess(null)}
          />
        )}
        {saveError &&
          !isShopVoucherModalOpen &&
          !isProductVoucherModalOpen &&
          !isCategoryVoucherModalOpen && (
            <AlertBanner
              variant="danger"
              message={saveError}
              className="mb-3 shadow-sm voucher-page-alert"
              onClose={() => setSaveError(null)}
            />
          )}
        <div className="bg-white border rounded-4 shadow-sm p-4 mb-4 voucher-surface">
          <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-4">
            <div>
              <h3 className="mb-1 fw-bold">Create Voucher</h3>
              <p className="text-muted mb-0">
                Pick a voucher format that matches your promotion strategy.
              </p>
            </div>
            <div className="d-flex gap-3 flex-wrap">
              <div className="mini-stat">
                <span className="mini-stat__label">Live vouchers</span>
                <strong>
                  {sellerVouchers.filter((item) => item.status === "running").length}
                </strong>
              </div>
              <div className="mini-stat">
                <span className="mini-stat__label">Total vouchers</span>
                <strong>{sellerVouchers.length}</strong>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h5 className="mb-3">Conversion boosters</h5>
            <div className="row g-3">
              {creatorCards.slice(0, 3).map((card) => (
                <div className="col-lg-4" key={card.key}>
                  <div className="border rounded-3 h-100 p-4 d-flex flex-column justify-content-between voucher-create-card">
                    <div className="d-flex align-items-start gap-3">
                      <div
                        className="text-white rounded-3 d-flex align-items-center justify-content-center fw-bold"
                        style={{
                          width: 42,
                          height: 42,
                          background: card.accent,
                          flexShrink: 0,
                        }}
                      >
                        {card.icon}
                      </div>
                      <div>
                        <h6 className="mb-2 fs-5">{card.title}</h6>
                        <p className="mb-0 text-muted">{card.description}</p>
                      </div>
                    </div>
                    <div className="text-end mt-4">
                      <button
                        className="btn btn-outline-danger px-4"
                        onClick={() => {
                          if (card.key === "shop") {
                            openShopVoucherModal();
                          } else if (card.key === "product") {
                            openProductVoucherModal();
                          } else if (card.key === "category") {
                            openCategoryVoucherModal();
                          }
                        }}
                      >
                        Create
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-4 shadow-sm p-4 mb-4 voucher-surface">
          <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
            <div>
              <h4 className="mb-1">
                Performance{" "}
                <span className="text-muted fs-6 fw-normal">
                  (From 20-04-2026 to 27-04-2026 GMT+7)
                </span>
              </h4>
            </div>
            <button className="btn btn-link text-decoration-none px-0">
              Add ›
            </button>
          </div>

          <div className="row g-0 border rounded overflow-hidden">
            {metricCards.map((metric, index) => (
              <div className="col-md-3" key={metric.label}>
                <div
                  className={`p-3 h-100 ${
                    index < metricCards.length - 1 ? "border-end" : ""
                  }`}
                >
                  <div className="small text-muted mb-2">{metric.label}</div>
                  <div className="fs-3 mb-1">{metric.value}</div>
                  <div className="small text-muted">{metric.subtext}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border rounded-4 shadow-sm overflow-hidden voucher-surface">
          <div className="p-4 pb-0">
            <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4">
              <div>
                <h4 className="mb-1 fw-bold">Voucher Library</h4>
                <div className="text-muted small">
                  All vouchers currently issued by this shop.
                </div>
              </div>
            </div>

            <ul className="nav border-bottom mb-3">
              {statusTabs.map((tab) => (
                <li className="nav-item" key={tab.key}>
                  <button
                    className={`nav-link border-0 rounded-0 px-3 ${
                      activeTab === tab.key
                        ? "text-danger border-bottom border-2 border-danger fw-semibold"
                        : "text-secondary"
                    }`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>

            <div className="row g-2 align-items-center mb-3">
              <div className="col-lg-6">
                <div className="input-group">
                  <span className="input-group-text bg-white">Search</span>
                  <select
                    className="form-select"
                    style={{ maxWidth: 170 }}
                    value={searchField}
                    onChange={(e) => setSearchField(e.target.value)}
                  >
                    <option value="Campaign name">Campaign name</option>
                    <option value="Voucher code">Voucher code</option>
                  </select>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter keyword"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-auto">
                <button className="btn btn-outline-danger px-4">Search</button>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Name | Code</th>
                  <th>Type</th>
                  <th>Applied products</th>
                  <th>Target buyers</th>
                  <th>Discount</th>
                  <th>Max uses</th>
                  <th>Used</th>
                  <th>Voucher time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vouchersQueryResult.isLoading && (
                  <tr>
                    <td colSpan={9} className="text-center text-muted py-5">
                      Loading vouchers...
                    </td>
                  </tr>
                )}
                {filteredVouchers.map((voucher) => (
                  <tr key={voucher.id}>
                    <td>
                      <div className="d-flex align-items-start gap-3">
                        <div
                          className="rounded-3 text-white fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{
                            width: 48,
                            height: 48,
                            background: voucher.iconBg,
                          }}
                        >
                          {voucher.iconText}
                        </div>
                        <div>
                          <div className="d-inline-flex align-items-center px-2 py-1 rounded-pill bg-light text-muted small mb-2">
                            {voucher.status === "ended"
                              ? formatUiStatusLabel("ended")
                              : voucher.status === "running"
                                ? formatUiStatusLabel("running")
                                : formatUiStatusLabel("upcoming")}
                          </div>
                          <div className="fw-semibold">{voucher.name}</div>
                          <div className="small text-muted">
                            Voucher code: {voucher.code}
                          </div>
                          <div className="d-flex flex-wrap gap-2 mt-2">
                            {voucher.origin.map((tag) => (
                              <span
                                key={tag}
                                className="badge text-bg-light border text-secondary fw-normal"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{voucher.typeLabel}</td>
                    <td>{voucher.applyScope}</td>
                    <td>{voucher.audience}</td>
                    <td>{voucher.discount}</td>
                    <td>{voucher.maxUses}</td>
                    <td>{voucher.used}</td>
                    <td>{voucher.timeRange}</td>
                    <td>
                      <div className="d-flex flex-column align-items-start gap-1">
                        <button
                          className="btn btn-link btn-sm p-0 text-decoration-none"
                          onClick={() => openEditVoucher(voucher)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-link btn-sm p-0 text-decoration-none"
                          onClick={() => openVoucherDetails(voucher.id)}
                        >
                          Details
                        </button>
                        <button
                          className="btn btn-link btn-sm p-0 text-decoration-none"
                          onClick={() => openVoucherOrders(voucher.id)}
                        >
                          Orders
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!vouchersQueryResult.isLoading && filteredVouchers.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center text-muted py-5">
                      No vouchers found for this shop.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isShopVoucherModalOpen && (
        <ShopVoucherCreateModal
          form={shopVoucherForm}
          shopId={shop?.id}
          campaigns={campaigns}
          isCampaignsLoading={campaignsQuery.isLoading}
          isSaving={
            createVoucherMutation.isPending || updateVoucherMutation.isPending
          }
          isEditing={editingVoucherId !== null && editingVoucherType === "shop"}
          saveError={saveError}
          onClearError={() => setSaveError(null)}
          onClose={() => {
            setIsShopVoucherModalOpen(false);
            setEditingVoucherId(null);
            setEditingVoucherType(null);
          }}
          onConfirm={handleCreateShopVoucher}
          onChange={updateShopVoucherForm}
        />
      )}

      {isProductVoucherModalOpen && (
        <ProductVoucherCreateModal
          form={productVoucherForm}
          shopId={shop?.id}
          campaigns={campaigns}
          products={products}
          isCampaignsLoading={campaignsQuery.isLoading}
          isProductsLoading={productsQuery.isLoading}
          isSaving={
            createVoucherMutation.isPending || updateVoucherMutation.isPending
          }
          isEditing={
            editingVoucherId !== null && editingVoucherType === "product"
          }
          saveError={saveError}
          onClearError={() => setSaveError(null)}
          onClose={() => {
            setIsProductVoucherModalOpen(false);
            setEditingVoucherId(null);
            setEditingVoucherType(null);
          }}
          onConfirm={handleCreateProductVoucher}
          onChange={updateProductVoucherForm}
          onToggleProduct={toggleSelectedProduct}
        />
      )}

      {isCategoryVoucherModalOpen && (
        <CategoryVoucherCreateModal
          form={categoryVoucherForm}
          shopId={shop?.id}
          campaigns={campaigns}
          categories={shopCategories}
          isCampaignsLoading={campaignsQuery.isLoading}
          isSaving={
            createVoucherMutation.isPending || updateVoucherMutation.isPending
          }
          isEditing={
            editingVoucherId !== null && editingVoucherType === "category"
          }
          saveError={saveError}
          onClearError={() => setSaveError(null)}
          onClose={() => {
            setIsCategoryVoucherModalOpen(false);
            setEditingVoucherId(null);
            setEditingVoucherType(null);
          }}
          onConfirm={handleCreateCategoryVoucher}
          onChange={updateCategoryVoucherForm}
          onToggleCategory={toggleSelectedCategory}
        />
      )}

      {selectedDetailsVoucher && selectedDetailsRules && selectedDetailsRulesDisplay && (
        <VoucherActionModal
          title={`Voucher details: ${selectedDetailsVoucher.code}`}
          onClose={() => setDetailsVoucherId(null)}
        >
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="border rounded-4 p-3 h-100">
                <h6 className="mb-3">Summary</h6>
                <div className="small text-muted mb-2">Title</div>
                <div className="mb-3">{selectedDetailsVoucher.title}</div>
                <div className="small text-muted mb-2">Description</div>
                <div className="mb-3">
                  {selectedDetailsVoucher.description || "No description"}
                </div>
                <div className="small text-muted mb-2">Voucher status</div>
                <div className="mb-3">{selectedDetailsVoucher.status}</div>
                <div className="small text-muted mb-2">Voucher type</div>
                <div className="mb-3">
                  {selectedDetailsRules.scopeRules.some(
                    (rule) =>
                      rule.scopeType === "PRODUCT" &&
                      rule.includeExclude === "INCLUDE",
                  )
                    ? "Product-specific voucher"
                    : "Shop-wide voucher"}
                </div>
                <div className="small text-muted mb-2">Usage window</div>
                <div className="mb-0">
                  {formatDateTimeRange(
                    selectedDetailsVoucher.validFrom,
                    selectedDetailsVoucher.validTo,
                  )}
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="border rounded-4 p-3 h-100">
                <h6 className="mb-3">Rules dump</h6>
                <pre
                  className="mb-0 small"
                  style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                >
                  {JSON.stringify(selectedDetailsRulesDisplay, null, 2)}
                </pre>
              </div>
            </div>
            <div className="col-12">
              <div className="border rounded-4 p-3">
                <h6 className="mb-3">Voucher payload dump</h6>
                <pre
                  className="mb-0 small"
                  style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                >
                  {JSON.stringify(selectedDetailsVoucher, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </VoucherActionModal>
      )}

      {selectedOrdersVoucher && selectedOrdersRules && (
        <VoucherActionModal
          title={`Voucher orders: ${selectedOrdersVoucher.code}`}
          onClose={() => setOrdersVoucherId(null)}
        >
          <div className="d-flex gap-4 flex-wrap mb-3">
            <div>
              <div className="small text-muted">Voucher</div>
              <div className="fw-semibold">{selectedOrdersVoucher.title}</div>
            </div>
            <div>
              <div className="small text-muted">Claimed</div>
              <div className="fw-semibold">
                {voucherOrdersQuery.data?.length ?? 0}
              </div>
            </div>
            <div>
              <div className="small text-muted">Applied products</div>
              <div className="fw-semibold">
                {selectedOrdersRules.scopeRules.filter(
                  (rule) => rule.scopeType === "PRODUCT",
                ).length || "All"}
              </div>
            </div>
          </div>
          <div className="table-responsive border rounded-4">
            <table className="table table-sm align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Order ID</th>
                  <th>Buyer</th>
                  <th>Order value</th>
                  <th>Discount</th>
                  <th>Redeemed at</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {voucherOrdersQuery.isLoading && (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      Loading voucher orders...
                    </td>
                  </tr>
                )}
                {!voucherOrdersQuery.isLoading &&
                  voucherOrderRows.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.buyer}</td>
                      <td>₫{order.orderValue.toLocaleString()}</td>
                      <td>₫{order.discountAmount.toLocaleString()}</td>
                      <td>{order.redeemedAt}</td>
                      <td>{order.status}</td>
                    </tr>
                  ))}
                {!voucherOrdersQuery.isLoading && voucherOrderRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      No redemption data found for this voucher.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </VoucherActionModal>
      )}

      <style jsx>{`
        .voucher-hero {
          background:
            radial-gradient(circle at top left, rgba(255, 123, 0, 0.08), transparent 30%),
            linear-gradient(180deg, #ffffff 0%, #fff8f4 100%);
        }

        .voucher-surface {
          border-color: rgba(15, 23, 42, 0.06) !important;
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.04);
        }

        .voucher-page-alert {
          position: sticky;
          top: 1rem;
          z-index: 20;
          max-width: 520px;
          margin-left: auto;
          margin-bottom: 1rem;
        }

        .mini-stat {
          min-width: 130px;
          padding: 0.85rem 1rem;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 1rem;
          background: linear-gradient(180deg, #ffffff 0%, #fffaf7 100%);
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .mini-stat strong {
          font-size: 1.25rem;
          line-height: 1;
          color: #111827;
        }

        .mini-stat__label {
          color: #6b7280;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          font-weight: 700;
        }

        .voucher-create-card {
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease;
        }

        .voucher-create-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
          border-color: rgba(238, 77, 45, 0.28) !important;
        }

        .product-select-card {
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            transform 0.2s ease;
        }

        .product-select-card:hover {
          transform: translateY(-1px);
          border-color: rgba(238, 77, 45, 0.32) !important;
        }
      `}</style>
    </div>
  );
};

export default Page;
