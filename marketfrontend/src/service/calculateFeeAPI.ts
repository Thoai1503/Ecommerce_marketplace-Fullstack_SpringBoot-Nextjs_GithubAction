import { ADDRESS_KEY, LOGISTICS_FEE_API } from "@/helper/api";
import { CalculateFeePayload } from "@/types";

export const calculateFeeOfLOGS = async (
  params: CalculateFeePayload,
): Promise<number> => {
  // const { from_district_id, to_district_id, weight, length, width, height } =
  params;
  try {
    const response = await fetch(LOGISTICS_FEE_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Token: ADDRESS_KEY,
      },
      body: JSON.stringify(params),
    });
    if (!response.ok) {
      throw new Error("Failed to calculate fee");
    }

    const data = await response.json();
    console.log("Calculated fee:", data);
    return data.data.total;
  } catch (error) {
    console.error("Error calculating fee:", error);
    throw error;
  }
};
