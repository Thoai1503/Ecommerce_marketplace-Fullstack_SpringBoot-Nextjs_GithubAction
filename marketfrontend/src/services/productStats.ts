import { z } from "zod";
import http from "@/lib/http";

const trendPointSchema = z.object({
  date: z.string(),
  value: z.number(),
});

const topBuyerSchema = z.object({
  userId: z.number(),
  name: z.string().nullable().optional(),
  orderCount: z.number(),
  totalSpent: z.number(),
});

export const productStatsSchema = z.object({
  revenue: z.object({
    total: z.number(),
    trend: z.array(trendPointSchema),
    comparePrev: z.number(),
  }),
  orders: z.object({
    total: z.number(),
    byDayOfWeek: z.array(z.number()),
  }),
  views: z.object({
    total: z.number(),
    uniqueVisitors: z.number(),
    trend: z.array(trendPointSchema),
  }),
  stockVelocity: z.object({
    avgPerDay: z.number(),
    daysRemaining: z.number().nullable(),
    currentStock: z.number(),
  }),
  topBuyers: z.array(topBuyerSchema),
});

export type ProductStats = z.infer<typeof productStatsSchema>;

export const getProductStats = async (productId: string, days: number): Promise<ProductStats> => {
  const response = await http.get(`/admin/products/${productId}/stats`, { params: { days } });
  return productStatsSchema.parse(response.data.data);
};
