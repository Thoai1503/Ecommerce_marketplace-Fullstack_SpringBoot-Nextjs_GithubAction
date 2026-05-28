"use client";

import { useUserAuth } from "@/context/UserAuthContext";
import { API_URL } from "@/helper/api";
import { Cart, useAddToCartMutation } from "@/types/data/Cart";
import { ICart } from "@/validators/cart";
import { IProduct, IProductAttribute } from "@/validators/product";
import { IProductVariant } from "@/validators/productVariant";
import { message } from "antd";
import Image from "next/image";
import { useEffect, useState } from "react";

const sanitizeProductDescription = (html?: string | null) => {
  if (!html) return "";

  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object[\s\S]*?>[\s\S]*?<\/object>/gi, "")
    .replace(/<embed[\s\S]*?>[\s\S]*?<\/embed>/gi, "")
    .replace(/\son\w+=(["']).*?\1/gi, "")
    .replace(/\s(?:href|src)=(["'])javascript:.*?\1/gi, "");
};

const getDescriptionText = (html: string) =>
  html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getProductAttributeName = (attribute: any) =>
  String(
    attribute?.attributeName ??
      attribute?.attribute_name ??
      attribute?.name ??
      attribute?.attribute?.name ??
      `Attribute #${attribute?.attributeId ?? attribute?.attribute_id ?? attribute?.id}`,
  ).trim();

const getProductAttributeValue = (attribute: any) => {
  const rawValue =
    attribute?.attributeValue ??
    attribute?.attribute_value ??
    attribute?.value ??
    attribute?.attributeValueName ??
    attribute?.attribute_value_name ??
    attribute?.attribute_value?.value ??
    attribute?.attributeValue?.value ??
    attribute?.valueText ??
    attribute?.value_text ??
    attribute?.valueNumber ??
    attribute?.value_number ??
    attribute?.valueDate ??
    attribute?.value_date ??
    "";
  const value = rawValue == null ? "" : String(rawValue).trim();
  const unit = String(
    attribute?.unitSymbol ?? attribute?.unit_symbol ?? "",
  ).trim();

  if (!value) return "";
  if (unit && !value.toLowerCase().includes(unit.toLowerCase())) {
    return `${value} ${unit}`;
  }

  return value;
};

type ProductDetailPayload = IProduct & {
  attributes?: IProductAttribute[];
  sku?: string;
  productAttributes?: IProductAttribute[];
  product_attributes?: IProductAttribute[];
  product_attribute?: IProductAttribute[];
  product_description?: string | null;
};

const getProductDescription = (product: ProductDetailPayload) =>
  product.description ?? product.product_description ?? "";

const getProductAttributes = (product: ProductDetailPayload) => {
  const source =
    product.attributes ??
    product.productAttributes ??
    product.product_attributes ??
    product.product_attribute;

  return Array.isArray(source) ? source : [];
};

const readJsonResponse = async <T,>(response: Response): Promise<T | null> => {
  const text = await response.text();
  if (!text.trim()) return null;

  try {
    return JSON.parse(text) as T;
  } catch (error) {
    console.warn("API response is not valid JSON:", response.url, error);
    return null;
  }
};

type ProductDetailProps = {
  data: IProduct;

  productSlug?: string; // ← Thêm prop này để fix lỗi
};

const ProductDetail = ({ data, productSlug }: ProductDetailProps) => {
  const { userId } = useUserAuth();
  const [shop, setShop] = useState<any>(null);
  console.log("Product Detail User ID:", userId);
  Cart.setup({ path: "/api/cart", baseUrl: API_URL });
  const { mutate: addToCart } = useAddToCartMutation();
  const [shopProducts, setShopProducts] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [variant, setVariant] = useState<IProductVariant | null>(null);
  const [clientProduct, setClientProduct] = useState<IProduct | null>(null);
  const detailData = (clientProduct ?? data) as ProductDetailPayload;
  const productId = Number(detailData?.id ?? data?.id ?? 0);
  const productImages = Array.isArray(detailData.images)
    ? detailData.images
    : [];
  const productAttributes = getProductAttributes(detailData);
  const visibleAttributes = productAttributes.filter(
    (attribute) =>
      getProductAttributeName(attribute) || getProductAttributeValue(attribute),
  );
  const descriptionHtml = sanitizeProductDescription(
    getProductDescription(detailData),
  );
  const descriptionText = getDescriptionText(descriptionHtml);
  const hasDescription =
    descriptionText.length > 0 || /<img[\s>]/i.test(descriptionHtml);
  const shopDescription = String(
    shop?.shop_description ??
      shop?.shopDescription ??
      (detailData as any)?.shop?.shop_description ??
      (detailData as any)?.shop?.shopDescription ??
      "",
  ).trim();
  const [mainImage, setMainImage] = useState(
    productImages[0]?.image_url || "/assets/images/ecommerce/product-1.jpg",
  );
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistSaving, setWishlistSaving] = useState(false);
  const sellerOwnerUserId = Number(shop?.user_id ?? shop?.userId ?? 0);
  const isOwnShopProduct =
    Boolean(userId) &&
    sellerOwnerUserId > 0 &&
    Number(userId) === sellerOwnerUserId;

  const formatPrice = (price?: number) => {
    if (!price) return "";
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  useEffect(() => {
    if (!userId || !productId) {
      setIsWishlisted(false);
      return;
    }

    let cancelled = false;

    const fetchWishlistStatus = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/wishlist/status?user_id=${userId}&product_id=${productId}`,
          { cache: "no-store" },
        );

        if (!res.ok) return;

        const data = await res.json();
        if (!cancelled) {
          setIsWishlisted(Boolean(data?.isWishlisted ?? data?.is_wishlisted));
        }
      } catch (error) {
        console.error("Failed to fetch wishlist status:", error);
      }
    };

    fetchWishlistStatus();

    return () => {
      cancelled = true;
    };
  }, [productId, userId]);

  useEffect(() => {
    if (!productId) return;

    let cancelled = false;

    const fetchFreshProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/product/${productId}`, {
          cache: "no-store",
        });
        if (!res.ok) return;

        const freshProduct = await res.json();
        console.log("Fresh product detail:", freshProduct);

        if (!cancelled) {
          setClientProduct(freshProduct);
        }
      } catch (error) {
        console.error("Failed to refresh product detail:", error);
      }
    };

    fetchFreshProduct();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  useEffect(() => {
    if (
      productImages.length > 0 &&
      (!mainImage || mainImage === "/assets/images/ecommerce/product-1.jpg")
    ) {
      setMainImage(productImages[0].image_url);
    }
  }, [mainImage, productImages]);

  useEffect(() => {
    if (!detailData?.shop_id) return;

    const fetchData = async () => {
      const shopId = detailData.shop_id;

      const fallbackShop = (detailData as any)?.shop ?? null;

      try {
        const shopRes = await fetch(`${API_URL}/shops/${shopId}`);
        const shopJson = shopRes.ok
          ? await readJsonResponse<any>(shopRes)
          : null;

        setShop(shopJson ?? fallbackShop);
      } catch (err) {
        console.error("Failed to fetch shop detail:", err);
        setShop(fallbackShop);
      }

      try {
        const prodRes = await fetch(`${API_URL}/product/shop/${shopId}`);
        const prodJson = prodRes.ok
          ? await readJsonResponse<any>(prodRes)
          : null;
        let list: any[] = [];

        if (Array.isArray(prodJson)) list = prodJson;
        else if (Array.isArray(prodJson?.data)) list = prodJson.data;
        else if (Array.isArray(prodJson?.products)) list = prodJson.products;

        setShopProducts(list);
      } catch (err) {
        console.error("Failed to fetch shop products:", err);
        setShopProducts([]);
      }
    };

    fetchData();
  }, [detailData?.shop_id]);

  const displayImage = hoveredImage || mainImage;

  if (isOwnShopProduct) {
    return (
      <div className="container py-5">
        <div className="alert alert-info rounded-4 border-0 shadow-sm">
          Sản phẩm của chính shop bạn không hiển thị ở giao diện mua hàng khi
          đang đăng nhập bằng tài khoản này.
        </div>
      </div>
    );
  }

  const handleAddToCart = (cart: ICart) => {
    if (isOwnShopProduct) {
      message.warning("Bạn không thể mua sản phẩm của chính shop mình.");
      return;
    }
    if (!userId) {
      const notifyCartUpdated = () => {
        window.dispatchEvent(new Event("cart-updated"));
      };

      if (selectedVariant === null) {
        message.warning("Vui lòng chọn phân loại sản phẩm");
        return;
      }
      const preLoginCart = localStorage.getItem("preLoginCart")
        ? JSON.parse(localStorage.getItem("preLoginCart") || "[]")
        : [];
      if (preLoginCart.length >= 1) {
        const existingItemIndex = preLoginCart.findIndex((item: ICart) => {
          return (
            item.product_id === cart.product_id &&
            item.variant_id === cart.variant_id
          );
        });
        if (existingItemIndex !== -1) {
          preLoginCart[existingItemIndex].quantity += cart.quantity;
          localStorage.setItem("preLoginCart", JSON.stringify(preLoginCart));
          notifyCartUpdated();
          message.success(
            "Sản phẩm đã được thêm vào giỏ hàng trước khi đăng nhập. Vui lòng kiểm tra giỏ hàng của bạn.",
          );
          return;
        } else {
          const pushedItem = [...preLoginCart, cart];
          localStorage.setItem("preLoginCart", JSON.stringify(pushedItem));
          notifyCartUpdated();
          message.success(
            "Sản phẩm đã được thêm vào giỏ hàng trước khi đăng nhập. Vui lòng kiểm tra giỏ hàng của bạn.",
          );
          return;
        }
      }
      preLoginCart.push(cart);

      localStorage.setItem("preLoginCart", JSON.stringify(preLoginCart));
      notifyCartUpdated();

      message.success(
        "Sản phẩm đã được thêm vào giỏ hàng trước khi đăng nhập. Vui lòng kiểm tra giỏ hàng của bạn.",
      );
      //      message.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
      return;
    }
    if (selectedVariant === null) {
      message.warning("Vui lòng chọn phân loại sản phẩm");
      return;
    }
    const formData = new FormData();
    Object.entries(cart).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    addToCart(cart, {
      onSuccess: (data) => {
        console.log("Added to cart:", data);
        window.dispatchEvent(new Event("cart-updated"));
        message.success("Thêm vào giỏ hàng thành công");
      },
      onError: (error) => {
        message.error(error.message);
      },
    });
  };

  const handleWishlistToggle = async () => {
    if (isOwnShopProduct) {
      message.warning("Bạn không thể lưu sản phẩm của chính shop mình.");
      return;
    }

    if (!userId) {
      message.warning("Vui lòng đăng nhập để thêm sản phẩm vào wishlist.");
      return;
    }

    if (!productId || wishlistSaving) return;

    const nextIsWishlisted = !isWishlisted;
    setWishlistSaving(true);
    setIsWishlisted(nextIsWishlisted);

    try {
      const res = await fetch(
        nextIsWishlisted
          ? `${API_URL}/api/wishlist`
          : `${API_URL}/api/wishlist?user_id=${userId}&product_id=${productId}`,
        {
          method: nextIsWishlisted ? "POST" : "DELETE",
          headers: nextIsWishlisted
            ? {
                "Content-Type": "application/json",
              }
            : undefined,
          body: nextIsWishlisted
            ? JSON.stringify({
                user_id: userId,
                product_id: productId,
              })
            : undefined,
        },
      );

      if (!res.ok) {
        throw new Error((await res.text()) || "Unable to update wishlist");
      }

      const payload = await res.json();
      setIsWishlisted(
        Boolean(
          payload?.isWishlisted ?? payload?.is_wishlisted ?? nextIsWishlisted,
        ),
      );
      window.dispatchEvent(new Event("wishlist-updated"));
      message.success(
        nextIsWishlisted
          ? "Đã thêm sản phẩm vào wishlist"
          : "Đã xóa sản phẩm khỏi wishlist",
      );
    } catch (error: any) {
      setIsWishlisted(!nextIsWishlisted);
      message.error(error?.message || "Không thể cập nhật wishlist");
    } finally {
      setWishlistSaving(false);
    }
  };

  useEffect(() => {
    if (detailData) {
      if (detailData.variants) {
        if (detailData.variants.length < 2 && detailData.variants.length > 0) {
          setVariant(detailData.variants[0]);
          setSelectedVariant(Number(detailData.variants[0].id));
        }
      }
    }
  }, [detailData]);
  console.log("Product Detail Props:", JSON.stringify(data, null, 2));
  console.log("Product Detail Data:", JSON.stringify(detailData, null, 2));
  console.log("Product Detail id:", userId);

  // Trong ProductDetail.tsx
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: detailData.product_name,
    description: getDescriptionText(descriptionHtml),
    image: productImages.map((img) => img.image_url),
    sku: detailData.sku || `P${productId}`,
    mpn: detailData.sku || `P${productId}`,
    brand: {
      "@type": "Brand",
      name: "NEXAMART",
    },
    offers: {
      "@type": "Offer",
      url: `https://nexamart.duckdns.org/product/${productSlug}`,
      priceCurrency: "VND",
      price: variant?.price ?? detailData.price,
      priceValidUntil: "2027-12-31",
      availability:
        detailData.stock_quantity > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: shop?.shop_name || "NEXAMART",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.4",
      reviewCount: "592",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container my-5">
        <div className="app-content-area">
          <div className="container-fluid">
            <div>
              <div className="row">
                <div className="col-12">
                  <div className="card">
                    <div className="card-body p-5">
                      <div className="row">
                        {/* Left - Gallery */}
                        <div className="col-xl-6">
                          <div className="product" id="product">
                            <div className="position-relative overflow-hidden rounded border">
                              <Image
                                src={displayImage}
                                alt="Product image"
                                className="img-fluid transition-all"
                                width={600}
                                height={600}
                                priority
                                style={{
                                  transition: "all 0.3s ease-in-out",
                                }}
                              />
                            </div>
                          </div>

                          {/* Thumbnails */}
                          <div className="product-tools mt-4">
                            <div
                              className="thumbnails row g-3"
                              id="product-thumbnails"
                            >
                              {productImages.map((pro) => (
                                <div className="col-3" key={pro.id}>
                                  <div
                                    className={`thumbnails-img border rounded overflow-hidden cursor-pointer position-relative ${
                                      mainImage === pro.image_url
                                        ? "border-primary border-3"
                                        : ""
                                    }`}
                                    onMouseEnter={() =>
                                      setHoveredImage(pro.image_url)
                                    }
                                    onMouseLeave={() => setHoveredImage(null)}
                                    onClick={() => setMainImage(pro.image_url)}
                                    style={{
                                      cursor: "pointer",
                                      transition: "all 0.2s ease",
                                    }}
                                  >
                                    <Image
                                      src={pro.image_url}
                                      alt={`Thumbnail ${pro.id}`}
                                      className="img-fluid"
                                      width={150}
                                      height={150}
                                      style={{
                                        transition: "transform 0.2s ease",
                                      }}
                                    />
                                    {/* Overlay khi hover */}
                                    <div
                                      className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-25 opacity-0"
                                      style={{
                                        transition: "opacity 0.2s ease",
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Right - Product Info */}
                        <div className="col-xl-6 col-12">
                          <div className="my-5 mx-xl-10">
                            <h3>{detailData.product_name}</h3>
                            <div className="mb-3">
                              <span className="me-2 text-dark fw-bold">
                                4.4{" "}
                                <i className="bi bi-star-fill text-success"></i>
                              </span>
                              <span>592 Customer Reviews</span>
                            </div>
                            <hr className="my-3" />
                            <div className="mb-5">
                              <h4 className="mb-1">
                                {formatPrice(
                                  variant?.price ?? detailData.price,
                                )}
                                đ
                                {detailData.original_price && (
                                  <span className="text-muted text-decoration-line-through ms-2">
                                    {formatPrice(detailData.original_price)}đ
                                  </span>
                                )}
                              </h4>

                              <small className="text-muted">
                                inclusive of all taxes
                              </small>
                            </div>
                            {/* Color */}
                            <div className="mb-4">
                              <h4 className="mb-3">Classify</h4>

                              <div className="d-flex flex-wrap gap-3">
                                {/* Variant 1 - màu xanh */}
                                {/* <div
                                  className={`variant-item text-center position-relative border rounded p-2 ${selectedVariant === "xanh" ? "border-danger border-2" : "border-secondary"}`}
                                  onClick={() => setSelectedVariant("xanh")}
                                  style={{ width: "110px", cursor: "pointer" }}
                                >
                                  <Image
                                    src="/assets/images/ecommerce/product-1.jpg"
                                    alt="Màu xanh"
                                    width={80}
                                    height={80}
                                    className="img-fluid rounded mb-2"
                                  />
                                  <div className="small fw-medium">màu xanh</div>
                                  {selectedVariant === "xanh" && (
                                    <i className="bi bi-check-circle-fill text-danger position-absolute top-0 end-0 m-1"></i>
                                  )}
                                </div> */}

                                {/* Variant 2 - màu xám */}
                                {/* <div
                                  className={`variant-item text-center position-relative border rounded p-2 ${selectedVariant === "xam" ? "border-danger border-2" : "border-secondary"}`}
                                  onClick={() => setSelectedVariant("xam")}
                                  style={{ width: "110px", cursor: "pointer" }}
                                >
                                  <Image
                                    src="/assets/images/ecommerce/product-2.jpg"
                                    alt="Màu xám"
                                    width={80}
                                    height={80}
                                    className="img-fluid rounded mb-2"
                                  />
                                  <div className="small fw-medium">màu xám</div>
                                  {selectedVariant === "xam" && (
                                    <i className="bi bi-check-circle-fill text-danger position-absolute top-0 end-0 m-1"></i>
                                  )}
                                </div> */}

                                {detailData.variants &&
                                  detailData.variants.length > 1 &&
                                  detailData.variants.map((variant) => (
                                    <div
                                      key={variant.id}
                                      className={`variant-item text-center position-relative border rounded p-2 ${selectedVariant === variant.id ? "border-danger border-2" : "border-secondary"}`}
                                      onClick={() => {
                                        setSelectedVariant(variant.id);
                                        setVariant(variant);
                                      }}
                                      style={{
                                        width: "110px",
                                        cursor: "pointer",
                                      }}
                                    >
                                      <Image
                                        src={
                                          variant.image_url ||
                                          "/assets/images/ecommerce/product-1.jpg"
                                        }
                                        alt={
                                          (variant as any).name ||
                                          variant.sku ||
                                          detailData.product_name ||
                                          "Product variant"
                                        }
                                        width={80}
                                        height={80}
                                        className="img-fluid rounded mb-2"
                                      />
                                      <div className="small fw-medium">
                                        {variant.sku}
                                      </div>
                                      {selectedVariant == variant.id && (
                                        <i className="bi bi-check-circle-fill text-danger position-absolute top-0 end-0 m-1"></i>
                                      )}
                                    </div>
                                  ))}
                              </div>
                            </div>
                            {/* Buttons */}
                            <div className="row g-3">
                              <div className="col-md-6">
                                <button
                                  className="btn btn-danger w-100"
                                  disabled={isOwnShopProduct}
                                  onClick={() => {
                                    handleAddToCart({
                                      user_id: userId!,
                                      product_id: detailData.id,
                                      variant_id: Number(selectedVariant),
                                      quantity: 1,
                                    });
                                  }}
                                >
                                  <i className="bi bi-cart me-2"></i>
                                  {isOwnShopProduct
                                    ? "Cannot Buy Own Product"
                                    : "Add To Cart"}
                                </button>
                              </div>
                              <div className="col-md-6">
                                <button
                                  className={`btn w-100 ${
                                    isWishlisted
                                      ? "btn-outline-danger"
                                      : "btn-outline-secondary"
                                  }`}
                                  disabled={wishlistSaving || isOwnShopProduct}
                                  onClick={handleWishlistToggle}
                                  aria-pressed={isWishlisted}
                                >
                                  <i
                                    className={`bi ${
                                      isWishlisted
                                        ? "bi-heart-fill"
                                        : "bi-heart"
                                    } me-2`}
                                  ></i>
                                  {wishlistSaving
                                    ? "Saving..."
                                    : isWishlisted
                                      ? "Wishlisted"
                                      : "Wishlist"}
                                </button>
                              </div>
                            </div>
                            {isOwnShopProduct && (
                              <div className="alert alert-warning mt-3 mb-0 py-2">
                                You cannot buy products from your own shop.
                              </div>
                            )}
                            <hr className="mt-4 mb-2" />
                            variant
                          </div>
                        </div>
                      </div>
                      <div className="shop-header mt-4 p-4 rounded text-white">
                        <div className="d-flex justify-content-between align-items-center flex-wrap">
                          {/* LEFT */}
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={
                                shop?.shop_logo ||
                                "/assets/images/avatar-shop.png"
                              }
                              width={70}
                              height={70}
                              className="rounded-circle border border-white"
                            />

                            <div>
                              <div className="fw-bold fs-5">
                                {shop?.shop_name || "Loading..."}
                              </div>

                              <small className="opacity-75">
                                Online recently
                              </small>
                              {shopDescription && (
                                <div className="small opacity-75 mt-1 shop-description">
                                  {shopDescription}
                                </div>
                              )}

                              <div className="mt-2 d-flex gap-2">
                                <button className="btn btn-outline-light btn-sm">
                                  💬 Chat Now
                                </button>

                                <button
                                  className="btn btn-outline-light btn-sm"
                                  onClick={() =>
                                    (window.location.href = `/shop/${detailData.shop_id}`)
                                  }
                                >
                                  🏪 View Shop
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* RIGHT */}
                          <div className="d-flex gap-5 text-center mt-3 mt-md-0">
                            <div>
                              <div className="small opacity-75">Products</div>
                              <div className="stat-number">
                                {shopProducts.length}
                              </div>
                            </div>

                            <div>
                              <div className="small opacity-75">Ratings</div>
                              <div className="stat-number">
                                {shop?.rating || 0}
                              </div>
                            </div>

                            <div>
                              <div className="small opacity-75">
                                Response Rate
                              </div>
                              <div className="stat-number">
                                {shop?.response_rate || 0}%
                              </div>
                            </div>

                            <div>
                              <div className="small opacity-75">
                                Response Time
                              </div>
                              <div className="stat-number">
                                {shop?.response_time || 0}h
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Accordion */}
                      <div className="accordion" id="ecommerceAccordion">
                        <div className="accordion-item">
                          <h2 className="accordion-header">
                            <button
                              className="accordion-button"
                              type="button"
                              aria-expanded="true"
                            >
                              Product Details
                            </button>
                          </h2>
                          <div
                            id="productDetails"
                            className="product-details-panel"
                          >
                            <div className="accordion-body product-details-body">
                              <div className="product-detail-grid">
                                <div className="product-detail-row">
                                  <div className="product-detail-label">
                                    Description
                                  </div>
                                  <div className="product-detail-value">
                                    {hasDescription ? (
                                      <div
                                        className="product-description"
                                        dangerouslySetInnerHTML={{
                                          __html: descriptionHtml,
                                        }}
                                      />
                                    ) : (
                                      <span className="text-muted">
                                        Chưa có mô tả sản phẩm.
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {visibleAttributes.length > 0 ? (
                                  visibleAttributes.map((attribute) => (
                                    <div
                                      className="product-detail-row"
                                      key={attribute.id}
                                    >
                                      <div className="product-detail-label">
                                        {getProductAttributeName(attribute)}
                                      </div>
                                      <div className="product-detail-value">
                                        {getProductAttributeValue(attribute) ||
                                          "-"}
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="product-detail-row">
                                    <div className="product-detail-label">
                                      Product Attributes
                                    </div>
                                    <div className="product-detail-value text-muted">
                                      Chưa có thuộc tính sản phẩm.
                                    </div>
                                  </div>
                                )}

                                <div className="product-detail-row">
                                  <div className="product-detail-label">
                                    Shop Description
                                  </div>
                                  <div className="product-detail-value">
                                    {shopDescription || (
                                      <span className="text-muted">
                                        Chưa có mô tả shop.
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="accordion-item">
                          <h2 className="accordion-header">
                            <button
                              className="accordion-button collapsed"
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target="#specifications"
                            >
                              Specifications
                            </button>
                          </h2>
                          <div
                            id="specifications"
                            className="accordion-collapse collapse"
                            data-bs-parent="#ecommerceAccordion"
                          >
                            <div className="accordion-body product-details-body">
                              <table className="table table-striped">
                                <tbody>
                                  <tr>
                                    <th className="w-25">Weight</th>
                                    <td>
                                      {detailData.weight
                                        ? `${detailData.weight} g`
                                        : "-"}
                                    </td>
                                  </tr>
                                  <tr>
                                    <th>Dimensions</th>
                                    <td>
                                      {[
                                        detailData.length,
                                        detailData.width,
                                        detailData.height,
                                      ].every(Boolean)
                                        ? `${detailData.length} x ${detailData.width} x ${detailData.height} cm`
                                        : "-"}
                                    </td>
                                  </tr>
                                  <tr>
                                    <th>Stock</th>
                                    <td>{detailData.stock_quantity ?? "-"}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Ratings & Reviews */}
                      <div className="mt-5">
                        <h3 className="mb-4">Ratings & Reviews</h3>

                        <div className="row align-items-center mb-4">
                          <div className="col-md-4 text-center mb-4 mb-md-0">
                            <h2 className="display-3 fw-bold">4.5</h2>
                            <div className="text-success">
                              <i className="bi bi-star-fill"></i>
                              <i className="bi bi-star-fill"></i>
                              <i className="bi bi-star-fill"></i>
                              <i className="bi bi-star-fill"></i>
                              <i className="bi bi-star-fill"></i>
                            </div>
                            <p className="mb-0">595 Verified Buyers</p>
                          </div>

                          <div className="col-md-8">
                            <div className="d-flex align-items-center mb-2">
                              <div className="text-nowrap me-3 text-muted">
                                5 <i className="bi bi-star-fill ms-1"></i>
                              </div>
                              <div
                                className="progress w-100"
                                style={{ height: "6px" }}
                              >
                                <div
                                  className="progress-bar bg-success"
                                  role="progressbar"
                                  style={{ width: "60%" }}
                                  aria-valuenow={60}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                ></div>
                              </div>
                              <span className="text-muted ms-3">420</span>
                            </div>
                          </div>
                        </div>

                        {/* Sample Reviews */}
                        <div className="border-top py-4">
                          <span className="badge bg-light text-dark border px-3 py-2 rounded-pill mb-2">
                            4.4 <i className="bi bi-star-fill text-success"></i>
                          </span>
                          <p>
                            It's awesome, I never thought about Dash UI that
                            awesome shoes...
                          </p>
                          <div className="text-muted small">
                            James Ennis{" "}
                            <span className="ms-3">28 Nov 2023</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .thumbnails-img:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          .thumbnails-img:hover .bg-dark {
            opacity: 1 !important;
          }

          .thumbnails-img img:hover {
            transform: scale(1.1);
          }

          .variant-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }

          .shop-header {
            background: linear-gradient(135deg, #1cc7d0, #1a4fff);
            transition: 0.3s;
          }

          .shop-header:hover {
            opacity: 0.95;
          }

          .stat-number {
            color: #ffd700; /* vàng */
            font-weight: bold;
            font-size: 18px;
          }

          .product-details-body {
            display: block !important;
            min-height: 160px;
            background: #ffffff;
            color: #111827;
            padding: 24px;
            overflow: visible !important;
          }

          .product-details-panel {
            display: block !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            visibility: visible !important;
          }

          .product-detail-grid {
            display: block;
            border: 1px solid #dbe3ef;
            border-radius: 8px;
            overflow: hidden;
            background: #ffffff;
          }

          .product-detail-row {
            display: grid;
            grid-template-columns: minmax(160px, 220px) minmax(0, 1fr);
            border-bottom: 1px solid #dbe3ef;
          }

          .product-detail-row:last-child {
            border-bottom: 0;
          }

          .product-detail-label {
            background: #f8fafc;
            color: #4b5563;
            font-weight: 600;
            padding: 14px 16px;
            border-right: 1px solid #dbe3ef;
          }

          .product-detail-value {
            color: #111827;
            padding: 14px 16px;
            min-width: 0;
            word-break: break-word;
          }

          .product-description :global(img) {
            max-width: 100%;
            height: auto;
          }

          .product-description :global(p) {
            color: #111827;
            font-size: 15px;
            line-height: 1.7;
          }

          .product-description :global(p:last-child) {
            margin-bottom: 0;
          }

          @media (max-width: 576px) {
            .product-detail-row {
              grid-template-columns: 1fr;
            }

            .product-detail-label {
              border-right: 0;
              border-bottom: 1px solid #dbe3ef;
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default ProductDetail;
