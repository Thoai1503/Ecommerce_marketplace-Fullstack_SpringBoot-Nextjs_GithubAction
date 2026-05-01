import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { OrderStatus } from "@/types";

export interface OrderFilters {
  status: "ALL" | OrderStatus;
  search: string; // Can search by orderCode or customerName
  paymentStatus: "all" | "PAID" | "UNPAID" | "REFUNDED";
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  minAmount: string; // By amount in VND
  maxAmount: string;
  sortBy: "date" | "amount" | "status";
  sortOrder: "asc" | "desc";
  page: number;
  pageSize: number;
}

const DEFAULT_FILTERS: OrderFilters = {
  status: "ALL",
  search: "",
  paymentStatus: "all",
  startDate: "",
  endDate: "",
  minAmount: "",
  maxAmount: "",
  sortBy: "date",
  sortOrder: "desc",
  page: 1,
  pageSize: 10,
};

/**
 * Hook to manage order filters with URL query persistence
 * Updates URL on filter change, persists filters across navigation
 */
export const useOrderFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<OrderFilters>(DEFAULT_FILTERS);
  const [isHydrated, setIsHydrated] = useState(false); // To prevent updating URL before initial load

  // Load filters from URL on mount
  useEffect(() => {
    const status = (searchParams.get("status") ||
      "ALL") as OrderFilters["status"];
    const search = searchParams.get("search") || "";
    const paymentStatus = (searchParams.get("paymentStatus") ||
      "all") as OrderFilters["paymentStatus"];
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const minAmount = searchParams.get("minAmount") || "";
    const maxAmount = searchParams.get("maxAmount") || "";
    const sortBy = (searchParams.get("sortBy") ||
      "date") as OrderFilters["sortBy"];
    const sortOrder = (searchParams.get("sortOrder") ||
      "desc") as OrderFilters["sortOrder"];
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    setFilters({
      status,
      search,
      paymentStatus,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      sortBy,
      sortOrder,
      page,
      pageSize,
    });

    setIsHydrated(true);
  }, [searchParams]);

  // Update URL query params whenever filters change (debounced)
  const updateUrl = useCallback(
    (newFilters: OrderFilters) => {
      const params = new URLSearchParams();

      // Only add non-default values to keep URL clean
      if (newFilters.status !== "ALL") params.set("status", newFilters.status);
      if (newFilters.search) params.set("search", newFilters.search);
      if (newFilters.paymentStatus !== "all")
        params.set("paymentStatus", newFilters.paymentStatus);
      if (newFilters.startDate) params.set("startDate", newFilters.startDate);
      if (newFilters.endDate) params.set("endDate", newFilters.endDate);
      if (newFilters.minAmount) params.set("minAmount", newFilters.minAmount);
      if (newFilters.maxAmount) params.set("maxAmount", newFilters.maxAmount);
      if (newFilters.sortBy !== "date") params.set("sortBy", newFilters.sortBy);
      if (newFilters.sortOrder !== "desc")
        params.set("sortOrder", newFilters.sortOrder);
      if (newFilters.page !== 1) params.set("page", newFilters.page.toString());
      if (newFilters.pageSize !== 10)
        params.set("pageSize", newFilters.pageSize.toString());

      const queryString = params.toString();
      router.push(`/admin/orders${queryString ? `?${queryString}` : ""}`);
    },
    [router],
  );

  // Update filter value and sync with URL
  const updateFilter = useCallback(
    <K extends keyof OrderFilters>(key: K, value: OrderFilters[K]) => {
      const newFilters = { ...filters, [key]: value, page: 1 }; // Reset to page 1 on filter change
      setFilters(newFilters);
      updateUrl(newFilters);
    },
    [filters, updateUrl],
  );

  // Update page without resetting other filters
  const updatePage = useCallback(
    (page: number) => {
      const newFilters = { ...filters, page };
      setFilters(newFilters);
      updateUrl(newFilters);
    },
    [filters, updateUrl],
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    updateUrl(DEFAULT_FILTERS);
  }, [updateUrl]);

  // Get query params for API call
  const getApiParams = useCallback(() => {
    return {
      status: filters.status === "ALL" ? undefined : filters.status,
      search: filters.search || undefined,
      paymentStatus:
        filters.paymentStatus === "all" ? undefined : filters.paymentStatus,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      minAmount: filters.minAmount ? parseFloat(filters.minAmount) : undefined,
      maxAmount: filters.maxAmount ? parseFloat(filters.maxAmount) : undefined,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      page: filters.page,
      size: filters.pageSize,
    };
  }, [filters]);

  return {
    filters,
    updateFilter,
    updatePage,
    clearFilters,
    getApiParams,
    isHydrated,
  };
};
