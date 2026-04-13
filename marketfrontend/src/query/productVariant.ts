import { getProductVariantById } from "@/service/productVariant";

export const productVariantQuery = {
  detail: (id: number) => ({
    queryKey: ["productVariant", id],
    queryFn: () => getProductVariantById(id),
  }),
};
