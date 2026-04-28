import { ADDRESS_KEY, API_URL, LOGISTICS_FEE_API } from "@/helper/api";
import { CalculateFeePayload } from "@/types";

export const calculateFeeOfLOGS = async (
  params: CalculateFeePayload,
): Promise<number> => {
  try {
    const response = await fetch(`${API_URL}/api/logistics/calculate-fee`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (response.ok) {
      const data = await response.json();
      return Number(data?.total ?? 0);
    }
  } catch {
    // Fallback for local environments where api-gateway/logistic-service
    // is not up yet but the external fee provider is still reachable.
  }

  if (!LOGISTICS_FEE_API) {
    throw new Error("Failed to calculate fee");
  }

  try {
    const fallbackResponse = await fetch(LOGISTICS_FEE_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Token: ADDRESS_KEY,
      },
      body: JSON.stringify(params),
    });

    if (!fallbackResponse.ok) {
      throw new Error("Failed to calculate fee");
    }

    const fallbackData = await fallbackResponse.json();
    return Number(fallbackData?.data?.total ?? 0);
  } catch (error) {
    console.error("Error calculating fee:", error);
    throw error;
  }
};
