import { DbCategory } from "@/helper/utils";
import http from "@/lib/http";
import { IProduct } from "@/validators/product";
import { ProductImage } from "./types";
import { Shop } from "@/validators/shop";
import { IProductVariant } from "@/validators/productVariant";

export interface SellerBrandOption {
  id: number;
  name: string;
  slug?: string;
  logo?: string | null;
}

export interface SellerAttributeValueOption {
  id: number;
  attributeId: number;
  unitId: number | null;
  value: string;
}

export interface SellerUnitOption {
  id: number;
  label: string;
  symbol: string;
  values: SellerAttributeValueOption[];
}

export interface SellerAttributeOption {
  id: number;
  name: string;
  slug?: string;
  units: SellerUnitOption[];
  values: SellerAttributeValueOption[];
}

export interface SellerCategoryProductOptions {
  brands: SellerBrandOption[];
  attributes: SellerAttributeOption[];
}

export interface ProductAttributePayload {
  productId: number;
  attributeId: number;
  attributeValueId?: number | null;
  valueText?: string | null;
  valueNumber?: number | null;
  valueDate?: string | null;
  unitId?: number | null;
}

type ProductAttributeRequestBody = {
  attributeId: number;
  attributeValueId?: number;
  valueText?: string;
  valueNumber?: number;
  valueDate?: string;
  unitId?: number;
};

export type ProductCreatePayload = Partial<IProduct> & {
  attributes?: ProductAttributePayload[];
};

type SellerAttributeBase = Omit<SellerAttributeOption, "units" | "values">;

const asArray = (data: unknown): any[] => (Array.isArray(data) ? data : []);

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getStatus = (item: any) =>
  item?.status ?? item?.is_active ?? item?.isActive;

const isActive = (item: any) => {
  const status = getStatus(item);
  return (
    status === undefined ||
    status === null ||
    status === 1 ||
    status === "ACTIVE"
  );
};

const getAttributeId = (item: any) =>
  toNumber(item?.attributeId ?? item?.attribute_id);
const getCategoryBrandId = (item: any) =>
  toNumber(item?.brand_id ?? item?.brandId);
const getUnitId = (item: any) => toNumber(item?.unit_id ?? item?.unitId);

export const addProduct = async (
  product: ProductCreatePayload,
): Promise<IProduct> => {
  const { attributes: _attributes, ...productBody } = product;

  return await http
    .post("/seller/product", productBody)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};
export const getProductById = async (id: number): Promise<IProduct> => {
  return await http
    .get(`/seller/product/${id}`)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const getAllCategory = async (): Promise<DbCategory[]> => {
  return await http
    .get("/api/categories")
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const getCategoryProductOptions = async (
  categoryId: number,
): Promise<SellerCategoryProductOptions> => {
  if (!categoryId) return { brands: [], attributes: [] };

  const [
    categoryBrandsRes,
    brandsRes,
    categoryAttributesRes,
    attributesRes,
    attributeUnitsRes,
    unitsRes,
    valuesRes,
  ] = await Promise.all([
    http.get(`/api/category-brand/category/${categoryId}`),
    http.get("/api/brands"),
    http.get(`/api/category-attribute/category/${categoryId}`),
    http.get("/api/attributes"),
    http.get("/api/attribute-unit"),
    http.get("/api/units"),
    http.get("/api/attribute-value"),
  ]);

  const brandsById = new Map<number, SellerBrandOption>(
    asArray(brandsRes.data)
      .filter(isActive)
      .map((brand): [number, SellerBrandOption] => [
        toNumber(brand.id),
        {
          id: toNumber(brand.id),
          name: brand.name,
          slug: brand.slug,
          logo: brand.logo ?? null,
        },
      ]),
  );

  const brands = asArray(categoryBrandsRes.data)
    .filter(isActive)
    .reduce<SellerBrandOption[]>((acc, categoryBrand) => {
      const brand = brandsById.get(getCategoryBrandId(categoryBrand));
      if (brand) acc.push(brand);
      return acc;
    }, []);

  const attributesById = new Map<number, SellerAttributeBase>(
    asArray(attributesRes.data)
      .filter(isActive)
      .map((attribute): [number, SellerAttributeBase] => [
        toNumber(attribute.id),
        {
          id: toNumber(attribute.id),
          name: attribute.name,
          slug: attribute.slug,
        },
      ]),
  );

  const unitsById = new Map(
    asArray(unitsRes.data)
      .filter(isActive)
      .map((unit) => [
        toNumber(unit.id),
        {
          id: toNumber(unit.id),
          label: unit.label,
          symbol: unit.symbol,
        },
      ]),
  );

  const attributeUnits = asArray(attributeUnitsRes.data).filter(isActive);

  const values = asArray(valuesRes.data).map(
    (value): SellerAttributeValueOption => ({
      id: toNumber(value.id),
      attributeId: getAttributeId(value),
      unitId: getUnitId(value) || null,
      value: String(value.value ?? ""),
    }),
  );

  const attributes = asArray(categoryAttributesRes.data)
    .filter(isActive)
    .reduce<SellerAttributeOption[]>((acc, categoryAttribute) => {
      const attributeId = getAttributeId(categoryAttribute);
      const attribute = attributesById.get(attributeId);

      if (!attribute) return acc;

      const units = attributeUnits
        .filter((attributeUnit) => getAttributeId(attributeUnit) === attributeId)
        .map((attributeUnit) => {
          const unit = unitsById.get(getUnitId(attributeUnit));
          if (!unit) return null;

          return {
            ...unit,
            values: values.filter(
              (value) =>
                value.attributeId === attributeId && value.unitId === unit.id,
            ),
          };
        })
        .filter((unit): unit is SellerUnitOption => Boolean(unit));

      acc.push({
        ...attribute,
        units,
        values: values.filter(
          (value) => value.attributeId === attributeId && value.unitId === null,
        ),
      });

      return acc;
    }, []);

  return { brands, attributes };
};

export const saveProductAttributes = async (
  productId: number,
  attributes: ProductAttributePayload[],
) => {
  const payload = attributes.map((attribute): ProductAttributeRequestBody => {
    const item: ProductAttributeRequestBody = {
      attributeId: attribute.attributeId,
    };

    if (attribute.attributeValueId != null) {
      item.attributeValueId = attribute.attributeValueId;
    }

    if (attribute.valueText?.trim()) {
      item.valueText = attribute.valueText.trim();
    }

    if (attribute.valueNumber != null) {
      item.valueNumber = attribute.valueNumber;
    }

    if (attribute.valueDate) {
      item.valueDate = attribute.valueDate;
    }

    if (attribute.unitId != null) {
      item.unitId = attribute.unitId;
    }

    return item;
  });

  return await http
    .post(`/seller/product/${productId}/attributes`, payload)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const uploadToProduct = async (
  id: number,
  formData: FormData,
): Promise<any> => {
  return await http
    .post(`/seller/product-image/product/${id}`, formData)
    .then((res) => {
      alert("Upload successful: " + JSON.stringify(res.data));
      return res.data;
    })
    .catch((error) => {
      throw error;
    });
};

export const getProductImageByProductId = async (
  product_id: number,
): Promise<ProductImage[]> => {
  return await http
    .get(`/seller/product-image/product/${product_id}`)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const getShopByUserId = async (user_id: number): Promise<Shop> => {
  return await http
    .get(`/seller/shop/user/${user_id}`)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const createProductVariant = async (
  productVariant: IProductVariant,
): Promise<IProductVariant> => {
  return await http
    .post("/seller/product-variant", productVariant)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const updateVariantImage = async (
  variantId: number,
  formData: FormData,
): Promise<any> => {
  return await http
    .post(`/seller/product-variant/${variantId}/image`, formData)
    .then((res) => {
      alert("Upload successful: " + JSON.stringify(res.data));
      return res.data;
    })
    .catch((error) => {
      throw error;
    });
};
