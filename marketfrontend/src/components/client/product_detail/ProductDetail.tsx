"use client";

import { useUserAuth } from "@/context/UserAuthContext";
import { API_URL } from "@/helper/api";
import { Cart, useAddToCartMutation } from "@/types/data/Cart";
import { ICart } from "@/validators/cart";
import { IProduct, IProductAttribute } from "@/validators/product";
import { IProductVariant } from "@/validators/productVariant";
import VoucherClaimButton from "@/components/client/voucher/VoucherClaimButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { message } from "antd";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const getVoucherClaimEndTime = (voucher: any) => {
  const claimEnd = voucher.claimEndAt ?? voucher.claim_end_at;
  if (!claimEnd) return null;

  const time = new Date(claimEnd).getTime();
  return Number.isFinite(time) ? time : null;
};

const isVoucherClaimExpired = (voucher: any) => {
  const claimEndTime = getVoucherClaimEndTime(voucher);
  return claimEndTime !== null && claimEndTime < Date.now();
};

const getVisibleShopVouchers = (vouchers: any[], shopId: unknown) =>
  vouchers
    .filter((voucher: any) => {
      const issuerType = String(
        voucher.issuerType ?? voucher.issuer_type ?? "",
      ).toUpperCase();
      const issuerId = Number(voucher.issuerId ?? voucher.issuer_id ?? 0);
      const status = String(voucher.status ?? "").toUpperCase();

      return (
        issuerType === "SHOP" &&
        issuerId === Number(shopId) &&
        ["ACTIVE", "DRAFT", "PAUSED"].includes(status) &&
        !isVoucherClaimExpired(voucher)
      );
    })
    .sort(
      (a: any, b: any) => Number(b.priority ?? 0) - Number(a.priority ?? 0),
    );

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
  productSlug?: string;
};

const ProductDetail = ({ data, productSlug }: ProductDetailProps) => {
  const { userId } = useUserAuth();
  const [shop, setShop] = useState<any>(null);
  Cart.setup({ path: "/api/cart", baseUrl: API_URL });
  const { mutate: addToCart } = useAddToCartMutation();
  const [shopProducts, setShopProducts] = useState<any[]>([]);
  const [shopVouchers, setShopVouchers] = useState<any[]>([]);
  const [isShopSectionLoading, setIsShopSectionLoading] = useState(true);
  const [isShopDetailLoading, setIsShopDetailLoading] = useState(false);
  const [isShopProductsLoading, setIsShopProductsLoading] = useState(false);
  const [isShopVouchersLoading, setIsShopVouchersLoading] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [variant, setVariant] = useState<IProductVariant | null>(null);
  const [clientProduct, setClientProduct] = useState<IProduct | null>(null);
  const detailData = (clientProduct ?? data) as ProductDetailPayload;
  const productId = Number(detailData?.id ?? data?.id ?? 0);
  const soldCount = Number(
    (detailData as any)?.sold_count ?? (detailData as any)?.soldCount ?? 0,
  );
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
  const topSellingProducts = shopProducts
    .filter((item) => Number(item?.id ?? 0) !== productId)
    .sort(
      (a, b) =>
        Number(b?.sold_count ?? b?.soldCount ?? 0) -
        Number(a?.sold_count ?? a?.soldCount ?? 0),
    )
    .slice(0, 5);

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
    if (!detailData?.shop_id) {
      setIsShopSectionLoading(false);
      return;
    }

    setIsShopSectionLoading(
      isShopDetailLoading || isShopProductsLoading || isShopVouchersLoading,
    );
  }, [
    detailData?.shop_id,
    isShopDetailLoading,
    isShopProductsLoading,
    isShopVouchersLoading,
  ]);

  useEffect(() => {
    if (!detailData?.shop_id) {
      setShop((detailData as any)?.shop ?? null);
      return;
    }

    let cancelled = false;
    const shopId = detailData.shop_id;
    const fallbackShop = (detailData as any)?.shop ?? null;

    const fetchShopDetail = async () => {
      setIsShopDetailLoading(true);

      try {
        const shopRes = await fetch(`${API_URL}/shops/${shopId}`);
        const shopJson = shopRes.ok
          ? await readJsonResponse<any>(shopRes)
          : null;

        if (!cancelled) {
          setShop(shopJson ?? fallbackShop);
        }
      } catch (err) {
        console.error("Failed to fetch shop detail:", err);
        if (!cancelled) {
          setShop(fallbackShop);
        }
      } finally {
        if (!cancelled) {
          setIsShopDetailLoading(false);
        }
      }
    };

    fetchShopDetail();

    return () => {
      cancelled = true;
    };
  }, [detailData?.shop_id]);

  useEffect(() => {
    if (!detailData?.shop_id) {
      setShopProducts([]);
      return;
    }

    let cancelled = false;
    const shopId = detailData.shop_id;

    const fetchShopProducts = async () => {
      setIsShopProductsLoading(true);

      try {
        const prodRes = await fetch(`${API_URL}/product/shop/${shopId}`);
        const prodJson = prodRes.ok
          ? await readJsonResponse<any>(prodRes)
          : null;
        let list: any[] = [];

        if (Array.isArray(prodJson)) list = prodJson;
        else if (Array.isArray(prodJson?.data)) list = prodJson.data;
        else if (Array.isArray(prodJson?.products)) list = prodJson.products;

        if (!cancelled) {
          setShopProducts(list);
        }
      } catch (err) {
        console.error("Failed to fetch shop products:", err);
        if (!cancelled) {
          setShopProducts([]);
        }
      } finally {
        if (!cancelled) {
          setIsShopProductsLoading(false);
        }
      }
    };

    fetchShopProducts();

    return () => {
      cancelled = true;
    };
  }, [detailData?.shop_id]);

  useEffect(() => {
    if (!detailData?.shop_id) {
      setShopVouchers([]);
      return;
    }

    let cancelled = false;
    const shopId = detailData.shop_id;

    const fetchShopVouchers = async () => {
      setIsShopVouchersLoading(true);

      try {
        const voucherRes = await fetch(`${API_URL}/api/vouchers`, {
          cache: "no-store",
        });
        const voucherJson = voucherRes.ok
          ? await readJsonResponse<any>(voucherRes)
          : null;
        const vouchers = Array.isArray(voucherJson) ? voucherJson : [];

        if (!cancelled) {
          setShopVouchers(getVisibleShopVouchers(vouchers, shopId));
        }
      } catch (err) {
        console.error("Failed to fetch shop vouchers:", err);
        if (!cancelled) {
          setShopVouchers([]);
        }
      } finally {
        if (!cancelled) {
          setIsShopVouchersLoading(false);
        }
      }
    };

    fetchShopVouchers();

    return () => {
      cancelled = true;
    };
  }, [detailData?.shop_id]);

  const displayImage = hoveredImage || mainImage;

  if (isOwnShopProduct) {
    return (
      <div className="container py-5">
        <div className="alert alert-info rounded-3 border-0 shadow-sm">
          <i className="bi bi-info-circle me-2"></i>
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
            "Sản phẩm đã được thêm vào giỏ hàng trước khi đăng nhập.",
          );
          return;
        } else {
          const pushedItem = [...preLoginCart, cart];
          localStorage.setItem("preLoginCart", JSON.stringify(pushedItem));
          notifyCartUpdated();
          message.success(
            "Sản phẩm đã được thêm vào giỏ hàng trước khi đăng nhập.",
          );
          return;
        }
      }
      preLoginCart.push(cart);

      localStorage.setItem("preLoginCart", JSON.stringify(preLoginCart));
      notifyCartUpdated();

      message.success(
        "Sản phẩm đã được thêm vào giỏ hàng trước khi đăng nhập.",
      );
      return;
    }
    if (selectedVariant === null) {
      message.warning("Vui lòng chọn phân loại sản phẩm");
      return;
    }
    addToCart(cart, {
      onSuccess: (data) => {
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
      <div className="product-detail-wrapper">
        {/* PRODUCT IMAGE & INFO SECTION */}
        <div className="product-main-section">
          <div className="container-lg">
            <div className="product-grid">
              {/* LEFT - GALLERY */}
              <div className="product-gallery-col">
                <div className="product-gallery">
                  {/* Main Image */}
                  <div className="main-image-container">
                    <Image
                      src={displayImage}
                      alt="Product image"
                      width={600}
                      height={600}
                      priority
                      className="main-image"
                    />
                    {detailData.stock_quantity === 0 && (
                      <div className="stock-badge">Hết hàng</div>
                    )}
                  </div>

                  {/* Thumbnails */}
                  <div className="thumbnails-container">
                    {productImages.map((pro) => (
                      <div
                        key={pro.id}
                        className={`thumbnail ${
                          mainImage === pro.image_url ? "active" : ""
                        }`}
                        onMouseEnter={() => setHoveredImage(pro.image_url)}
                        onMouseLeave={() => setHoveredImage(null)}
                        onClick={() => setMainImage(pro.image_url)}
                      >
                        <Image
                          src={pro.image_url}
                          alt={`Thumbnail`}
                          width={100}
                          height={100}
                          className="thumbnail-image"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT - PRODUCT INFO */}
              <div className="product-info-col">
                <div className="product-info-container">
                  {/* Title */}
                  <h1 className="product-title">{detailData.product_name}</h1>

                  {/* Rating & Sales */}
                  <div className="rating-section">
                    <div className="rating-row">
                      <div className="rating-stars">
                        <span className="rating-value">4.4</span>
                        <div className="stars">
                          {[...Array(5)].map((_, i) => (
                            <i key={i} className="bi bi-star-fill"></i>
                          ))}
                        </div>
                        <span className="rating-count">(592 đánh giá)</span>
                      </div>
                      <div className="sales-count">
                        <span className="label">Đã bán:</span>
                        <span className="value">
                          {soldCount.toLocaleString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="divider"></div>

                  {/* Price */}
                  <div className="price-section">
                    <div className="current-price">
                      {formatPrice(variant?.price ?? detailData.price)}
                      <span className="currency">₫</span>
                    </div>
                    {detailData.original_price && (
                      <div className="original-price">
                        {formatPrice(detailData.original_price)}₫
                      </div>
                    )}
                    {detailData.original_price && (
                      <div className="discount-badge">
                        -
                        {Math.round(
                          ((detailData.original_price -
                            (variant?.price ?? detailData.price)) /
                            detailData.original_price) *
                            100,
                        )}
                        %
                      </div>
                    )}
                  </div>

                  {/* Variants */}
                  {detailData.variants && detailData.variants.length > 0 && (
                    <div className="variants-section">
                      <div className="section-title">Chọn loại sản phẩm</div>
                      <div className="variants-grid">
                        {detailData.variants.map((v) => (
                          <div
                            key={v.id}
                            className={`variant-option ${
                              selectedVariant === v.id ? "selected" : ""
                            }`}
                            onClick={() => {
                              setSelectedVariant(v.id);
                              setVariant(v);
                            }}
                          >
                            <div className="variant-image">
                              <Image
                                src={
                                  v.image_url ||
                                  "/assets/images/ecommerce/product-1.jpg"
                                }
                                alt={v.sku}
                                width={80}
                                height={80}
                              />
                            </div>
                            <div className="variant-info">
                              <span className="variant-name">{v.sku}</span>
                              <span className="variant-price">
                                {formatPrice(v.price)}₫
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stock Info */}
                  <div className="stock-section">
                    <span className="label">Kho hàng:</span>
                    <span
                      className={`value ${detailData.stock_quantity > 0 ? "in-stock" : "out-of-stock"}`}
                    >
                      {detailData.stock_quantity > 0
                        ? `${detailData.stock_quantity} sản phẩm`
                        : "Hết hàng"}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="action-buttons">
                    <button
                      className="btn-add-to-cart"
                      disabled={
                        isOwnShopProduct || detailData.stock_quantity === 0
                      }
                      onClick={() => {
                        handleAddToCart({
                          user_id: userId!,
                          product_id: detailData.id,
                          variant_id: Number(selectedVariant),
                          quantity: 1,
                        });
                      }}
                    >
                      <i className="bi bi-bag-fill"></i>
                      {detailData.stock_quantity === 0
                        ? "Hết hàng"
                        : "Thêm vào giỏ"}
                    </button>
                    <button
                      className={`btn-wishlist ${
                        isWishlisted ? "wishlisted" : ""
                      }`}
                      disabled={wishlistSaving || isOwnShopProduct}
                      onClick={handleWishlistToggle}
                    >
                      <i
                        className={`bi ${
                          isWishlisted ? "bi-heart-fill" : "bi-heart"
                        }`}
                      ></i>
                      {isWishlisted ? "Đã lưu" : "Lưu"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SHOP SECTION */}
        <div className="shop-section">
          <div className="container-lg">
            {isShopSectionLoading ? (
              <div className="shop-loading">
                <Skeleton style={{ height: "200px", borderRadius: "12px" }} />
              </div>
            ) : (
              <div className="shop-card">
                <div className="shop-left">
                  <img
                    src={shop?.shop_logo || "/assets/images/avatar-shop.png"}
                    alt="Shop logo"
                    className="shop-avatar"
                  />
                  <div className="shop-info">
                    <h3 className="shop-name">{shop?.shop_name}</h3>
                    <p className="shop-status">Online gần đây</p>
                    {shopDescription && (
                      <p className="shop-desc">{shopDescription}</p>
                    )}
                    <div className="shop-actions">
                      <button className="shop-btn">
                        <i className="bi bi-chat-left-dots"></i> Chat
                      </button>
                      <button
                        className="shop-btn"
                        onClick={() =>
                          (window.location.href = `/shop/${detailData.shop_id}`)
                        }
                      >
                        <i className="bi bi-shop"></i> Xem cửa hàng
                      </button>
                    </div>
                  </div>
                </div>

                <div className="shop-stats">
                  <div className="stat">
                    <span className="stat-label">Sản phẩm</span>
                    <span className="stat-value">{shopProducts.length}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Đánh giá</span>
                    <span className="stat-value">{shop?.rating || 0}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Tỉ lệ trả lời</span>
                    <span className="stat-value">
                      {shop?.response_rate || 0}%
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Thời gian trả lời</span>
                    <span className="stat-value">
                      {shop?.response_time || 0}h
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CONTENT SECTION */}
        <div className="content-section">
          <div className="container-lg">
            <div className="content-grid">
              {/* MAIN CONTENT */}
              <div className="main-content">
                {/* PRODUCT DETAILS */}
                <div className="details-card">
                  <h2 className="card-title">Thông tin sản phẩm</h2>
                  <div className="details-list">
                    {/* Description */}
                    <div className="detail-item">
                      <span className="detail-label">Mô tả:</span>
                      <div className="detail-value">
                        {hasDescription ? (
                          <div
                            className="product-description"
                            dangerouslySetInnerHTML={{
                              __html: descriptionHtml,
                            }}
                          />
                        ) : (
                          <span className="text-muted">
                            Chưa có mô tả sản phẩm
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Attributes */}
                    {visibleAttributes.length > 0 && (
                      <>
                        {visibleAttributes.map((attribute) => (
                          <div className="detail-item" key={attribute.id}>
                            <span className="detail-label">
                              {getProductAttributeName(attribute)}:
                            </span>
                            <span className="detail-value">
                              {getProductAttributeValue(attribute) || "-"}
                            </span>
                          </div>
                        ))}
                      </>
                    )}

                    {/* Specifications */}
                    <div className="detail-item">
                      <span className="detail-label">Trọng lượng:</span>
                      <span className="detail-value">
                        {detailData.weight ? `${detailData.weight}g` : "-"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Kích thước:</span>
                      <span className="detail-value">
                        {[
                          detailData.length,
                          detailData.width,
                          detailData.height,
                        ].every(Boolean)
                          ? `${detailData.length} x ${detailData.width} x ${detailData.height} cm`
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* RATINGS & REVIEWS */}
                <div className="reviews-card">
                  <h2 className="card-title">Đánh giá từ khách hàng</h2>
                  <div className="reviews-summary">
                    <div className="rating-overview">
                      <div className="average-rating">
                        <div className="rating-number">4.5</div>
                        <div className="rating-stars-large">
                          {[...Array(5)].map((_, i) => (
                            <i key={i} className="bi bi-star-fill"></i>
                          ))}
                        </div>
                        <div className="review-count">Từ 595 đánh giá</div>
                      </div>

                      <div className="rating-breakdown">
                        <div className="rating-row">
                          <span>
                            5 <i className="bi bi-star-fill"></i>
                          </span>
                          <div className="progress">
                            <div
                              className="progress-bar"
                              style={{ width: "60%" }}
                            ></div>
                          </div>
                          <span>420</span>
                        </div>
                      </div>
                    </div>

                    <div className="review-sample">
                      <div className="review-item">
                        <div className="review-rating">
                          4.4 <i className="bi bi-star-fill"></i>
                        </div>
                        <p className="review-text">
                          Sản phẩm rất tốt, vượt quá mong đợi của tôi...
                        </p>
                        <div className="review-meta">
                          James Ennis
                          <span>28 Nov 2023</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SIDEBAR */}
              <div className="sidebar">
                {/* VOUCHERS */}
                <div className="sidebar-card">
                  <h3 className="sidebar-title">
                    <i className="bi bi-ticket-perforated"></i> Mã giảm giá
                  </h3>
                  {isShopSectionLoading ? (
                    <div className="voucher-loading">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton
                          key={i}
                          style={{
                            height: "80px",
                            marginBottom: "8px",
                            borderRadius: "8px",
                          }}
                        />
                      ))}
                    </div>
                  ) : shopVouchers.length > 0 ? (
                    <div className="vouchers-list">
                      {shopVouchers.slice(0, 4).map((voucher) => (
                        <div className="voucher-item" key={voucher.id}>
                          <div className="voucher-code">{voucher.code}</div>
                          <div className="voucher-info">
                            Min đơn:{" "}
                            {Number(
                              voucher.minOrderValue ??
                                voucher.min_order_value ??
                                0,
                            ).toLocaleString("vi-VN")}
                            ₫
                          </div>
                          <VoucherClaimButton
                            voucherId={Number(voucher.id)}
                            voucherCode={voucher.code}
                            voucherStatus={voucher.status}
                            claimStartAt={
                              voucher.claimStartAt ?? voucher.claim_start_at
                            }
                            claimEndAt={
                              voucher.claimEndAt ?? voucher.claim_end_at
                            }
                            totalQuota={Number(
                              voucher.totalQuota ?? voucher.total_quota ?? 0,
                            )}
                            claimedCount={Number(
                              voucher.claimedCount ??
                                voucher.claimed_count ??
                                0,
                            )}
                            claimLabel="Lưu"
                            claimedLabel="Đã lưu"
                            claimingLabel="Đang lưu..."
                            successMessage={`Voucher ${voucher.code} đã được lưu.`}
                            className="voucher-claim-btn"
                            onClaimSuccess={async () => {
                              try {
                                const voucherRes = await fetch(
                                  `${API_URL}/api/vouchers`,
                                  { cache: "no-store" },
                                );
                                const voucherJson = voucherRes.ok
                                  ? await readJsonResponse<any>(voucherRes)
                                  : null;
                                const vouchers = Array.isArray(voucherJson)
                                  ? voucherJson
                                  : [];
                                setShopVouchers(
                                  getVisibleShopVouchers(
                                    vouchers,
                                    detailData.shop_id,
                                  ),
                                );
                              } catch (error) {
                                console.error(
                                  "Failed to refresh vouchers:",
                                  error,
                                );
                              }
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">Chưa có mã giảm giá</div>
                  )}
                </div>

                {/* TOP PRODUCTS */}
                <div className="sidebar-card">
                  <h3 className="sidebar-title">
                    <i className="bi bi-fire"></i> Sản phẩm bán chạy
                  </h3>
                  {isShopSectionLoading ? (
                    <div className="products-loading">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton
                          key={i}
                          style={{
                            height: "70px",
                            marginBottom: "8px",
                            borderRadius: "8px",
                          }}
                        />
                      ))}
                    </div>
                  ) : topSellingProducts.length > 0 ? (
                    <div className="products-list">
                      {topSellingProducts.map((item) => (
                        <Link
                          key={item.id}
                          href={`/${item.product_slug}.p${item.id}?id=${item.id}`}
                          className="product-item"
                        >
                          <img
                            src={
                              item.image_url ||
                              "/assets/images/ecommerce/product-1.jpg"
                            }
                            alt={item.product_name}
                            className="product-item-image"
                          />
                          <div className="product-item-info">
                            <div className="product-item-name">
                              {item.product_name}
                            </div>
                            <div className="product-item-price">
                              {formatPrice(item.price)}₫
                            </div>
                            <div className="product-item-sold">
                              Đã bán:{" "}
                              {Number(item.sold_count ?? 0).toLocaleString(
                                "vi-VN",
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">Chưa có dữ liệu bán chạy</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          * {
            --primary-color: #d70018;
            --primary-dark: #b5000f;
            --text-primary: #1f2937;
            --text-secondary: #6b7280;
            --text-light: #9ca3af;
            --border-color: #e5e7eb;
            --bg-light: #f9fafb;
            --bg-lighter: #fafbfc;
            --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
            --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
          }

          .product-detail-wrapper {
            background: #ffffff;
            font-family:
              -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
              "Ubuntu", "Cantarell", sans-serif;
          }

          /* MAIN SECTION */
          .product-main-section {
            padding: 40px 0;
            border-bottom: 1px solid var(--border-color);
          }

          .product-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 48px;
            align-items: start;
          }

          /* GALLERY */
          .product-gallery {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .main-image-container {
            position: relative;
            background: var(--bg-lighter);
            border-radius: 12px;
            overflow: hidden;
            aspect-ratio: 1;
          }

          .main-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
          }

          .main-image-container:hover .main-image {
            transform: scale(1.02);
          }

          .stock-badge {
            position: absolute;
            top: 12px;
            right: 12px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 600;
          }

          .thumbnails-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 8px;
          }

          .thumbnail {
            aspect-ratio: 1;
            border: 2px solid var(--border-color);
            border-radius: 8px;
            overflow: hidden;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .thumbnail:hover {
            border-color: var(--primary-color);
            box-shadow: var(--shadow-sm);
          }

          .thumbnail.active {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(215, 0, 24, 0.1);
          }

          .thumbnail-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          /* PRODUCT INFO */
          .product-info-col {
            display: flex;
            flex-direction: column;
          }

          .product-title {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--text-primary);
            line-height: 1.3;
            margin-bottom: 16px;
          }

          /* RATING */
          .rating-section {
            margin-bottom: 24px;
          }

          .rating-row {
            display: flex;
            align-items: center;
            gap: 24px;
            flex-wrap: wrap;
          }

          .rating-stars {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .rating-value {
            font-size: 1rem;
            font-weight: 700;
            color: var(--text-primary);
          }

          .stars {
            display: flex;
            gap: 2px;
            color: #fbbf24;
            font-size: 0.875rem;
          }

          .rating-count {
            font-size: 0.875rem;
            color: var(--text-secondary);
          }

          .sales-count {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.875rem;
          }

          .sales-count .label {
            color: var(--text-secondary);
          }

          .sales-count .value {
            font-weight: 600;
            color: var(--text-primary);
          }

          .divider {
            height: 1px;
            background: var(--border-color);
            margin: 24px 0;
          }

          /* PRICE */
          .price-section {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 24px;
          }

          .current-price {
            font-size: 2rem;
            font-weight: 700;
            color: var(--primary-color);
          }

          .currency {
            font-size: 1.25rem;
          }

          .original-price {
            font-size: 1rem;
            color: var(--text-light);
            text-decoration: line-through;
          }

          .discount-badge {
            background: #fecaca;
            color: var(--primary-dark);
            padding: 6px 10px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 0.875rem;
          }

          /* VARIANTS */
          .variants-section {
            margin-bottom: 24px;
          }

          .section-title {
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 12px;
            font-size: 0.95rem;
          }

          .variants-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
            gap: 12px;
          }

          .variant-option {
            border: 2px solid var(--border-color);
            border-radius: 8px;
            padding: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: center;
          }

          .variant-option:hover {
            border-color: var(--primary-color);
          }

          .variant-option.selected {
            border-color: var(--primary-color);
            background: rgba(215, 0, 24, 0.05);
          }

          .variant-image {
            aspect-ratio: 1;
            margin-bottom: 8px;
            overflow: hidden;
            border-radius: 6px;
          }

          .variant-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .variant-name {
            display: block;
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 4px;
          }

          .variant-price {
            display: block;
            font-size: 0.85rem;
            font-weight: 700;
            color: var(--primary-color);
          }

          /* STOCK */
          .stock-section {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 24px;
            padding: 12px 0;
          }

          .stock-section .label {
            font-weight: 600;
            color: var(--text-primary);
          }

          .stock-section .value {
            font-weight: 600;
          }

          .stock-section .value.in-stock {
            color: #10b981;
          }

          .stock-section .value.out-of-stock {
            color: var(--primary-color);
          }

          /* ACTION BUTTONS */
          .action-buttons {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 12px;
          }

          .btn-add-to-cart,
          .btn-wishlist {
            padding: 14px 24px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }

          .btn-add-to-cart {
            background: var(--primary-color);
            color: white;
          }

          .btn-add-to-cart:hover:not(:disabled) {
            background: var(--primary-dark);
            box-shadow: var(--shadow-md);
          }

          .btn-add-to-cart:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .btn-wishlist {
            background: var(--bg-light);
            color: var(--text-secondary);
            border: 1px solid var(--border-color);
            min-width: 50px;
          }

          .btn-wishlist:hover:not(:disabled) {
            border-color: var(--primary-color);
            color: var(--primary-color);
          }

          .btn-wishlist.wishlisted {
            color: var(--primary-color);
            border-color: var(--primary-color);
          }

          /* SHOP SECTION */
          .shop-section {
            padding: 32px 0;
            background: var(--bg-lighter);
            border-bottom: 1px solid var(--border-color);
          }

          .shop-card {
            background: white;
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 24px;
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 32px;
            align-items: center;
          }

          .shop-left {
            display: flex;
            align-items: center;
            gap: 16px;
          }

          .shop-avatar {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid var(--border-color);
          }

          .shop-info {
            flex: 1;
          }

          .shop-name {
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0 0 4px 0;
          }

          .shop-status {
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin: 0 0 8px 0;
          }

          .shop-desc {
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin: 8px 0;
            line-height: 1.4;
          }

          .shop-actions {
            display: flex;
            gap: 8px;
            margin-top: 12px;
          }

          .shop-btn {
            padding: 8px 16px;
            background: var(--bg-light);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 6px;
            color: var(--text-primary);
          }

          .shop-btn:hover {
            background: white;
            border-color: var(--text-light);
          }

          .shop-stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            text-align: center;
          }

          .stat {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .stat-label {
            font-size: 0.75rem;
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 0.5px;
            color: var(--text-secondary);
          }

          .stat-value {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--primary-color);
          }

          /* CONTENT SECTION */
          .content-section {
            padding: 40px 0;
          }

          .content-grid {
            display: grid;
            grid-template-columns: 1fr 320px;
            gap: 32px;
          }

          /* DETAILS CARD */
          .details-card,
          .reviews-card,
          .sidebar-card {
            background: white;
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 24px;
          }

          .card-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 20px;
          }

          .details-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .detail-item {
            display: grid;
            grid-template-columns: 180px 1fr;
            gap: 16px;
            padding: 12px 0;
            border-bottom: 1px solid var(--border-color);
          }

          .detail-item:last-child {
            border-bottom: none;
          }

          .detail-label {
            font-weight: 600;
            color: var(--text-primary);
          }

          .detail-value {
            color: var(--text-secondary);
            line-height: 1.6;
          }

          .product-description {
            line-height: 1.8;
          }

          .product-description :global(p) {
            margin-bottom: 12px;
          }

          .product-description :global(img) {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 16px 0;
          }

          /* REVIEWS CARD */
          .reviews-summary {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 32px;
          }

          .rating-overview {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
          }

          .average-rating {
            text-align: center;
          }

          .rating-number {
            font-size: 2rem;
            font-weight: 700;
            color: var(--primary-color);
          }

          .rating-stars-large {
            display: flex;
            justify-content: center;
            gap: 4px;
            color: #fbbf24;
            font-size: 1.125rem;
            margin: 8px 0;
          }

          .review-count {
            font-size: 0.875rem;
            color: var(--text-secondary);
          }

          .rating-breakdown {
            width: 100%;
          }

          .rating-row {
            display: grid;
            grid-template-columns: 40px 1fr 40px;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;
            font-size: 0.875rem;
          }

          .progress {
            height: 6px;
            background: var(--bg-light);
            border-radius: 3px;
            overflow: hidden;
          }

          .progress-bar {
            height: 100%;
            background: #10b981;
            transition: width 0.3s ease;
          }

          .review-sample {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .review-item {
            padding: 16px;
            background: var(--bg-lighter);
            border-radius: 8px;
          }

          .review-rating {
            display: flex;
            align-items: center;
            gap: 4px;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 8px;
          }

          .review-rating i {
            color: #fbbf24;
            font-size: 0.875rem;
          }

          .review-text {
            font-size: 0.95rem;
            color: var(--text-secondary);
            margin: 0;
            line-height: 1.6;
          }

          .review-meta {
            display: flex;
            justify-content: space-between;
            font-size: 0.8rem;
            color: var(--text-light);
            margin-top: 8px;
          }

          /* SIDEBAR */
          .sidebar {
            display: flex;
            flex-direction: column;
            gap: 24px;
          }

          .sidebar-card {
            position: sticky;
            top: 100px;
          }

          .sidebar-title {
            font-size: 1rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .sidebar-title i {
            color: var(--primary-color);
            font-size: 1.125rem;
          }

          /* VOUCHERS */
          .vouchers-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .voucher-item {
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 12px;
            background: #fef5f5;
            transition: all 0.2s ease;
          }

          .voucher-item:hover {
            border-color: #fca5a5;
            box-shadow: var(--shadow-sm);
          }

          .voucher-code {
            font-weight: 700;
            color: var(--primary-color);
            font-size: 0.875rem;
            margin-bottom: 4px;
          }

          .voucher-info {
            font-size: 0.8rem;
            color: var(--text-secondary);
            margin-bottom: 8px;
          }

          .voucher-claim-btn {
            width: 100% !important;
            padding: 6px 8px !important;
            font-size: 0.75rem !important;
            height: auto !important;
          }

          /* TOP PRODUCTS */
          .products-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .product-item {
            display: grid;
            grid-template-columns: 60px 1fr;
            gap: 10px;
            padding: 10px;
            border-radius: 8px;
            background: var(--bg-light);
            transition: all 0.2s ease;
            text-decoration: none;
            color: inherit;
          }

          .product-item:hover {
            background: #f0f0f0;
          }

          .product-item-image {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 6px;
          }

          .product-item-info {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .product-item-name {
            font-size: 0.8rem;
            font-weight: 600;
            color: var(--text-primary);
            line-height: 1.2;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .product-item-price {
            font-size: 0.875rem;
            font-weight: 700;
            color: var(--primary-color);
          }

          .product-item-sold {
            font-size: 0.75rem;
            color: var(--text-secondary);
          }

          .empty-state {
            text-align: center;
            padding: 20px;
            color: var(--text-light);
            font-size: 0.875rem;
          }

          /* RESPONSIVE */
          @media (max-width: 1024px) {
            .product-grid {
              grid-template-columns: 1fr;
              gap: 32px;
            }

            .content-grid {
              grid-template-columns: 1fr;
            }

            .shop-card {
              grid-template-columns: 1fr;
              gap: 24px;
            }

            .shop-stats {
              grid-template-columns: repeat(2, 1fr);
            }

            .reviews-summary {
              grid-template-columns: 1fr;
            }

            .sidebar-card {
              position: static;
            }
          }

          @media (max-width: 640px) {
            .product-main-section {
              padding: 24px 0;
            }

            .product-title {
              font-size: 1.375rem;
            }

            .current-price {
              font-size: 1.5rem;
            }

            .action-buttons {
              grid-template-columns: 1fr;
            }

            .detail-item {
              grid-template-columns: 100px 1fr;
            }

            .shop-left {
              gap: 12px;
            }

            .shop-avatar {
              width: 60px;
              height: 60px;
            }

            .shop-stats {
              grid-template-columns: repeat(2, 1fr);
            }

            .stat-value {
              font-size: 1rem;
            }

            .rating-row {
              grid-template-columns: 30px 1fr 30px;
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default ProductDetail;
