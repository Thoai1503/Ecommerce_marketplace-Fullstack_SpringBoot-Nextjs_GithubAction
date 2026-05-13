"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const DEFAULT_FILTERS: OrderShipmentFilters = {
  status: "ALL",
  paymentStatus: "ALL",
  search: "",
  startDate: "",
  endDate: "",
  sortBy: "date",
  sortOrder: "desc",
  page: 1,
  pageSize: 10,
};

export const useOrderShipmentFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<OrderShipmentFilters>(DEFAULT_FILTERS);
  const [isHydrated, setIsHydrated] = useState(false); // To prevent updating URL before initial load

  useEffect(() => {
    //  alert(searchParams.toString());
    const status = (searchParams.get("status") ||
      "ALL") as OrderShipmentFilters["status"];
    const search = searchParams.get("search") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const sortBy = (searchParams.get("sortBy") ||
      "date") as OrderShipmentFilters["sortBy"];
    const sortOrder = (searchParams.get("sortOrder") ||
      "desc") as OrderShipmentFilters["sortOrder"];
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const paymentStatus = (searchParams.get("paymentStatus") ||
      "ALL") as OrderShipmentFilters["paymentStatus"];

    setFilters({
      status,
      search,
      startDate,
      endDate,
      sortBy,
      sortOrder,
      page,
      pageSize,
      paymentStatus,
    });
    setIsHydrated(true); // Mark as hydrated after loading filters from URL
  }, [searchParams]);

  // Update URL when filters change (but only after initial hydration)
  // useEffect(() => {
  //   if (!isHydrated) return; // Don't update URL before initial load
  //   const query = new URLSearchParams();
  //   if (filters.status !== "ALL") query.set("status", filters.status);
  //   if (filters.search) query.set("search", filters.search);
  //   if (filters.startDate) query.set("startDate", filters.startDate);
  //   if (filters.endDate) query.set("endDate", filters.endDate);
  //   if (filters.sortBy !== "date") query.set("sortBy", filters.sortBy);
  //   if (filters.sortOrder !== "desc") query.set("sortOrder", filters.sortOrder);
  //   if (filters.page !== 1) query.set("page", filters.page.toString());
  //   if (filters.pageSize !== 10)
  //     query.set("pageSize", filters.pageSize.toString());
  //   router.push(`?${query.toString()}`);
  // }, [filters, router, isHydrated]);

  const updateUrl = useCallback(
    (newFilters: OrderShipmentFilters) => {
      const query = new URLSearchParams();
      if (newFilters.status !== "ALL") query.set("status", newFilters.status);
      if (newFilters.search) query.set("search", newFilters.search);
      if (newFilters.startDate) query.set("startDate", newFilters.startDate);
      if (newFilters.endDate) query.set("endDate", newFilters.endDate);
      if (newFilters.sortBy !== "date") query.set("sortBy", newFilters.sortBy);
      if (newFilters.sortOrder !== "desc")
        query.set("sortOrder", newFilters.sortOrder);
      if (newFilters.page !== 1) query.set("page", newFilters.page.toString());
      if (newFilters.pageSize !== 10)
        query.set("pageSize", newFilters.pageSize.toString());
      if (newFilters.paymentStatus !== "ALL")
        query.set("paymentStatus", newFilters.paymentStatus.toString());
      router.push(`?${query.toString()}`);
    },
    [router],
  );

  const updateFilters = useCallback(
    <K extends keyof OrderShipmentFilters>(
      key: K,
      value: OrderShipmentFilters[K],
    ) => {
      setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
      updateUrl({ ...filters, [key]: value, page: 1 });
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

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    updateUrl(DEFAULT_FILTERS);
  }, [updateUrl]);

  const apiParams = useMemo(() => {
    return {
      status: filters.status === "ALL" ? undefined : filters.status,
      search: filters.search || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      page: filters.page,
      pageSize: filters.pageSize,
      paymentStatus:
        filters.paymentStatus === "ALL" ? undefined : filters.paymentStatus,
    };
  }, [filters]);

  return {
    filters,
    setFilters,
    updateUrl,
    updateFilters,
    updatePage,
    clearFilters,
    apiParams,
    isHydrated,
  };
};

export interface OrderShipmentFilters {
  status:
    | "ALL"
    | "PENDING"
    | "IN_TRANSIT"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "COMPLETED";
  search: string;
  startDate: string;
  endDate: string;
  sortBy: "date" | "status";
  sortOrder: "asc" | "desc";
  page: number;
  pageSize: number;
  paymentStatus: "ALL" | "PENDING" | "COMPLETED";
}
