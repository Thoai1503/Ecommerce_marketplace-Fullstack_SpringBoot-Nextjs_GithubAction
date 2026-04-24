import { queryOptions } from "@tanstack/react-query";
import { getAttributes, getAttributeById } from "@/service/attributes";

export const attributesQuery = {
  all: () =>
    queryOptions({
      queryKey: ["admin", "attributes"],
      queryFn: getAttributes,
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: ["admin", "attributes", id],
      queryFn: () => getAttributeById(id),
      enabled: !!id,
    }),
  values: (attributeId: string) =>
    queryOptions({
      queryKey: ["admin", "attributes", attributeId, "values"],
      enabled: !!attributeId,
    }),
};
