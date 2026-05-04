import { z } from "zod";
import http from "@/lib/http";

const fraudRuleSchema = z.object({
  rule: z.string(),
  severity: z.string(),
  message: z.string(),
  score: z.number(),
});

export const fraudCheckSchema = z.object({
  productId: z.number(),
  fraudScore: z.number(),
  concerns: z.array(z.string()).default([]),
  recommendation: z.string(),
  reasoning: z.string().optional(),
  checkedBy: z.string().optional(),
  checkedAt: z.string().optional(),
  triggeredRules: z.array(fraudRuleSchema).optional().default([]),
});

export type FraudCheckResult = z.infer<typeof fraudCheckSchema>;

export const getFraudCheck = async (productId: string): Promise<FraudCheckResult> => {
  const response = await http.get(`/admin/products/${productId}/fraud-check`);
  return fraudCheckSchema.parse(response.data.data);
};

export const rerunFraudCheck = async (productId: string): Promise<FraudCheckResult> => {
  const response = await http.post(`/admin/products/${productId}/fraud-check`);
  return fraudCheckSchema.parse(response.data.data);
};
