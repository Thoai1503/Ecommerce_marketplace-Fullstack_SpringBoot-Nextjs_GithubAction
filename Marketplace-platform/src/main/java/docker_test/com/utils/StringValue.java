package docker_test.com.utils;

public final class StringValue {

    // User table
    public static final String USER_ID_COL = "id";
    public static final String USER_EMAIL_COL = "email";
    public static final String USER_PHONE_COL = "phone";
    public static final String USER_PASSWORD_COL = "password_hash";
    public static final String USER_FULLNAME_COL = "full_name";
    public static final String USER_AVATAR_COL = "avatar_url";
    public static final String USER_DOB_COL = "date_of_birth";
    public static final String USER_GENDER_COL = "gender";
    public static final String USER_TYPE_COL = "user_type";
    public static final String USER_VERIFIED_COL = "is_verified";
    public static final String USER_ACTIVE_COL = "is_active";
    public static final String USER_CREATED_AT_COL = "created_at";
    public static final String USER_UPDATED_AT_COL = "updated_at";
    public static final String USER_LAST_LOGIN_COL = "last_login";

    // Addresses table
    public static final String ADDRESS_ID_COL = "id";
    public static final String ADDRESS_USER_ID_COL = "user_id";
    public static final String ADDRESS_RECIPIENT_NAME_COL = "recipient_name";
    public static final String ADDRESS_RECIPIENT_PHONE_COL = "recipient_phone";
    public static final String ADDRESS_LINE_COL = "address_line";
    public static final String ADDRESS_WARD_COL = "ward";
    public static final String ADDRESS_DISTRICT_COL = "district";
    public static final String ADDRESS_CITY_COL = "city";
    public static final String ADDRESS_POSTAL_CODE_COL = "postal_code";
    public static final String ADDRESS_IS_DEFAULT_COL = "is_default";
    public static final String ADDRESS_CREATED_AT_COL = "created_at";
    public static final String ADDRESS_UPDATED_AT_COL = "updated_at";

    // Shops table
    public static final String SHOP_ID_COL = "id";
    public static final String SHOP_USER_ID_COL = "user_id";
    public static final String SHOP_NAME_COL = "shop_name";
    public static final String SHOP_DESCRIPTION_COL = "shop_description";
    public static final String SHOP_LOGO_COL = "shop_logo";
    public static final String SHOP_BANNER_COL = "shop_banner";
    public static final String SHOP_BUSINESS_LICENSE_COL = "business_license";
    public static final String SHOP_TAX_CODE_COL = "tax_code";
    public static final String SHOP_RATING_COL = "rating";
    public static final String SHOP_TOTAL_PRODUCTS_COL = "total_products";
    public static final String SHOP_TOTAL_ORDERS_COL = "total_orders";
    public static final String SHOP_RESPONSE_RATE_COL = "response_rate";
    public static final String SHOP_RESPONSE_TIME_COL = "response_time";
    public static final String SHOP_VERIFIED_COL = "is_verified";
    public static final String SHOP_ACTIVE_COL = "is_active";
    public static final String SHOP_CREATED_AT_COL = "created_at";
    public static final String SHOP_UPDATED_AT_COL = "updated_at";

    // Categories table
    public static final String CATEGORY_ID_COL = "id";
    public static final String CATEGORY_PARENT_ID_COL = "parent_id";
    public static final String CATEGORY_NAME_COL = "category_name";
    public static final String CATEGORY_SLUG_COL = "category_slug";
    public static final String CATEGORY_ICON_COL = "category_icon";
    public static final String CATEGORY_LEVEL_COL = "level";
    public static final String CATEGORY_ACTIVE_COL = "is_active";
    public static final String CATEGORY_CREATED_AT_COL = "created_at";
    public static final String CATEGORY_UPDATED_AT_COL = "updated_at";

    // Products table
    public static final String PRODUCT_ID_COL = "id";
    public static final String PRODUCT_SHOP_ID_COL = "shop_id";
    public static final String PRODUCT_CATEGORY_ID_COL = "category_id";
    public static final String PRODUCT_NAME_COL = "product_name";
    public static final String PRODUCT_SLUG_COL = "product_slug";
    public static final String PRODUCT_DESCRIPTION_COL = "description";
    public static final String PRODUCT_PRICE_COL = "price";
    public static final String PRODUCT_ORIGINAL_PRICE_COL = "original_price";
    public static final String PRODUCT_STOCK_QUANTITY_COL = "stock_quantity";
    public static final String PRODUCT_SOLD_COUNT_COL = "sold_count";
    public static final String PRODUCT_RATING_COL = "rating";
    public static final String PRODUCT_REVIEW_COUNT_COL = "review_count";
    public static final String PRODUCT_WEIGHT_COL = "weight";
    public static final String PRODUCT_LENGTH_COL = "length";
    public static final String PRODUCT_WIDTH_COL = "width";
    public static final String PRODUCT_HEIGHT_COL = "height";
    public static final String PRODUCT_BRAND_COL = "brand";
    public static final String PRODUCT_ACTIVE_COL = "is_active";
    public static final String PRODUCT_CREATED_AT_COL = "created_at";
    public static final String PRODUCT_UPDATED_AT_COL = "updated_at";

    // Product Variants table
    public static final String VARIANT_ID_COL = "variant_id";
    public static final String VARIANT_PRODUCT_ID_COL = "product_id";
    public static final String VARIANT_NAME_COL = "variant_name";
    public static final String VARIANT_SKU_COL = "sku";
    public static final String VARIANT_PRICE_COL = "price";
    public static final String VARIANT_STOCK_QUANTITY_COL = "stock_quantity";
    public static final String VARIANT_IMAGE_URL_COL = "image_url";
    public static final String VARIANT_ACTIVE_COL = "is_active";
    public static final String VARIANT_CREATED_AT_COL = "created_at";
    public static final String VARIANT_UPDATED_AT_COL = "updated_at";

    // Product Images table
    public static final String PRODUCT_IMAGE_ID_COL = "image_id";
    public static final String PRODUCT_IMAGE_PRODUCT_ID_COL = "product_id";
    public static final String PRODUCT_IMAGE_URL_COL = "image_url";
    public static final String PRODUCT_IMAGE_DISPLAY_ORDER_COL = "display_order";
    public static final String PRODUCT_IMAGE_THUMBNAIL_COL = "is_thumbnail";
    public static final String PRODUCT_IMAGE_CREATED_AT_COL = "created_at";

    // Attributes table
    public static final String ATTRIBUTE_ID_COL = "id";
    public static final String ATTRIBUTE_NAME_COL = "name";
    public static final String ATTRIBUTE_SLUG_COL = "slug";
    public static final String ATTRIBUTE_DATA_TYPE_COL = "data_type";
    public static final String ATTRIBUTE_STATUS_COL = "status";

    // Attribute Value table
    public static final String ATTR_VALUE_ID_COL = "id";
    public static final String ATTR_VALUE_ATTRIBUTE_ID_COL = "attribute_id";
    public static final String ATTR_VALUE_UNIT_ID_COL = "unit_id";
    public static final String ATTR_VALUE_VALUE_COL = "value";

    // Unit table
    public static final String UNIT_ID_COL = "id";
    public static final String UNIT_LABEL_COL = "label";
    public static final String UNIT_SYMBOL_COL = "symbol";
    public static final String UNIT_STATUS_COL = "status";

    // Product Attributes table
    public static final String PROD_ATTR_ID_COL = "id";
    public static final String PROD_ATTR_PRODUCT_ID_COL = "product_id";
    public static final String PROD_ATTR_ATTRIBUTE_ID_COL = "attribute_id";
    public static final String PROD_ATTR_VALUE_ID_COL = "attribute_value_id";
    public static final String PROD_ATTR_VALUE_TEXT_COL = "value_text";
    public static final String PROD_ATTR_VALUE_NUMBER_COL = "value_number";
    public static final String PROD_ATTR_VALUE_DATE_COL = "value_date";
    public static final String PROD_ATTR_UNIT_ID_COL = "unit_id";
    public static final String PROD_ATTR_CREATED_AT_COL = "created_at";
    public static final String PROD_ATTR_UPDATED_AT_COL = "updated_at";

    // Category Attributes table
    public static final String CAT_ATTR_ID_COL = "id";
    public static final String CAT_ATTR_CATEGORY_ID_COL = "category_id";
    public static final String CAT_ATTR_ATTRIBUTE_ID_COL = "attribute_id";
    public static final String CAT_ATTR_STATUS_COL = "status";

    // Attribute Units table
    public static final String ATTR_UNIT_ID_COL = "id";
    public static final String ATTR_UNIT_ATTRIBUTE_ID_COL = "attribute_id";
    public static final String ATTR_UNIT_UNIT_ID_COL = "unit_id";
    public static final String ATTR_UNIT_STATUS_COL = "status";

    // Cart table
    public static final String CART_ID_COL = "id";
    public static final String CART_USER_ID_COL = "user_id";
    public static final String CART_PRODUCT_ID_COL = "product_id";
    public static final String CART_VARIANT_ID_COL = "variant_id";
    public static final String CART_QUANTITY_COL = "quantity";
    public static final String CART_ADDED_AT_COL = "added_at";
    public static final String CART_UPDATED_AT_COL = "updated_at";

    // Wishlists table
    public static final String WISHLIST_ID_COL = "id";
    public static final String WISHLIST_USER_ID_COL = "user_id";
    public static final String WISHLIST_PRODUCT_ID_COL = "product_id";
    public static final String WISHLIST_ADDED_AT_COL = "added_at";

    // Orders table
    public static final String ORDER_ID_COL = "id";
    public static final String ORDER_NUMBER_COL = "order_number";
    public static final String ORDER_USER_ID_COL = "user_id";
    public static final String ORDER_SHOP_ID_COL = "shop_id";
    public static final String ORDER_ADDRESS_ID_COL = "address_id";
    public static final String ORDER_TOTAL_AMOUNT_COL = "total_amount";
    public static final String ORDER_SHIPPING_FEE_COL = "shipping_fee";
    public static final String ORDER_DISCOUNT_AMOUNT_COL = "discount_amount";
    public static final String ORDER_FINAL_AMOUNT_COL = "final_amount";
    public static final String ORDER_PAYMENT_METHOD_COL = "payment_method";
    public static final String ORDER_PAYMENT_STATUS_COL = "payment_status";
    public static final String ORDER_STATUS_COL = "order_status";
    public static final String ORDER_NOTE_COL = "note";
    public static final String ORDER_VOUCHER_ID_COL = "voucher_id";
    public static final String ORDER_TRACKING_NUMBER_COL = "tracking_number";
    public static final String ORDER_CANCELLED_REASON_COL = "cancelled_reason";
    public static final String ORDER_CANCELLED_AT_COL = "cancelled_at";
    public static final String ORDER_DELIVERED_AT_COL = "delivered_at";
    public static final String ORDER_CREATED_AT_COL = "created_at";
    public static final String ORDER_UPDATED_AT_COL = "updated_at";

    // Order Items table
    public static final String ORDER_ITEM_ID_COL ="id";
    public static final String ORDER_ITEM_ORDER_ID_COL = "order_id";
    public static final String ORDER_ITEM_PRODUCT_ID_COL = "product_id";
    public static final String ORDER_ITEM_VARIANT_ID_COL = "variant_id";
    public static final String ORDER_ITEM_PRODUCT_NAME_COL = "product_name";
    public static final String ORDER_ITEM_VARIANT_NAME_COL = "variant_name";
    public static final String ORDER_ITEM_PRICE_COL = "price";
    public static final String ORDER_ITEM_QUANTITY_COL = "quantity";
    public static final String ORDER_ITEM_TOTAL_PRICE_COL = "total_price";
    public static final String ORDER_ITEM_CREATED_AT_COL = "created_at";

    // Vouchers table
    public static final String VOUCHER_ID_COL = "id";
    public static final String VOUCHER_SHOP_ID_COL = "shop_id";
    public static final String VOUCHER_CODE_COL = "voucher_code";
    public static final String VOUCHER_NAME_COL = "voucher_name";
    public static final String VOUCHER_DESCRIPTION_COL = "description";
    public static final String VOUCHER_DISCOUNT_TYPE_COL = "discount_type";
    public static final String VOUCHER_DISCOUNT_VALUE_COL = "discount_value";
    public static final String VOUCHER_MIN_ORDER_VALUE_COL = "min_order_value";
    public static final String VOUCHER_MAX_DISCOUNT_COL = "max_discount";
    public static final String VOUCHER_USAGE_LIMIT_COL = "usage_limit";
    public static final String VOUCHER_USED_COUNT_COL = "used_count";
    public static final String VOUCHER_START_DATE_COL = "start_date";
    public static final String VOUCHER_END_DATE_COL = "end_date";
    public static final String VOUCHER_ACTIVE_COL = "is_active";
    public static final String VOUCHER_CREATED_AT_COL = "created_at";

    // Voucher Condition Type table
    public static final String VOUCHER_COND_TYPE_ID_COL = "id";
    public static final String VOUCHER_COND_TYPE_CODE_COL = "type_code";
    public static final String VOUCHER_COND_TYPE_NAME_COL = "type_name";
    public static final String VOUCHER_COND_TYPE_DESC_COL = "description";
    public static final String VOUCHER_COND_TYPE_ACTIVE_COL = "is_active";
    public static final String VOUCHER_COND_TYPE_CREATED_AT_COL = "created_at";

    // Voucher Condition table
    public static final String VOUCHER_COND_ID_COL = "id";
    public static final String VOUCHER_COND_VOUCHER_ID_COL = "voucher_id";
    public static final String VOUCHER_COND_TYPES_ID_COL = "condition_type_id";
    public static final String VOUCHER_COND_OPERATOR_COL = "operator";
    public static final String VOUCHER_COND_VALUE_NUMERIC_COL = "value_numeric";
    public static final String VOUCHER_COND_VALUE_NUMERIC_MAX_COL = "value_numeric_max";
    public static final String VOUCHER_COND_VALUE_TEXT_COL = "value_text";
    public static final String VOUCHER_COND_VALUE_JSON_COL = "value_json";
    public static final String VOUCHER_COND_REQUIRED_COL = "is_required";
    public static final String VOUCHER_COND_PRIORITY_COL = "priority";
    public static final String VOUCHER_COND_ERROR_MESSAGE_COL = "error_message";
    public static final String VOUCHER_COND_CREATED_AT_COL = "created_at";
    public static final String VOUCHER_COND_UPDATED_AT_COL = "updated_at";

    // Voucher Usage History table
    public static final String VOUCHER_USAGE_ID_COL = "id";
    public static final String VOUCHER_USAGE_VOUCHER_ID_COL = "voucher_id";
    public static final String VOUCHER_USAGE_USER_ID_COL = "user_id";
    public static final String VOUCHER_USAGE_ORDER_ID_COL = "order_id";
    public static final String VOUCHER_USAGE_DISCOUNT_AMOUNT_COL = "discount_amount";
    public static final String VOUCHER_USAGE_USED_AT_COL = "used_at";

    // Product Reviews table
    public static final String REVIEW_ID_COL = "review_id";
    public static final String REVIEW_PRODUCT_ID_COL = "product_id";
    public static final String REVIEW_USER_ID_COL = "user_id";
    public static final String REVIEW_ORDER_ID_COL = "order_id";
    public static final String REVIEW_RATING_COL = "rating";
    public static final String REVIEW_COMMENT_COL = "comment";
    public static final String REVIEW_ANONYMOUS_COL = "is_anonymous";
    public static final String REVIEW_SHOP_REPLY_COL = "shop_reply";
    public static final String REVIEW_SHOP_REPLIED_AT_COL = "shop_replied_at";
    public static final String REVIEW_CREATED_AT_COL = "created_at";
    public static final String REVIEW_UPDATED_AT_COL = "updated_at";

    // Review Images table
    public static final String REVIEW_IMAGE_ID_COL = "id";
    public static final String REVIEW_IMAGE_REVIEW_ID_COL = "review_id";
    public static final String REVIEW_IMAGE_URL_COL = "image_url";
    public static final String REVIEW_IMAGE_CREATED_AT_COL = "created_at";

    // Flash Sales table
    public static final String FLASH_SALE_ID_COL = "id";
    public static final String FLASH_SALE_PRODUCT_ID_COL = "product_id";
    public static final String FLASH_SALE_PRICE_COL = "sale_price";
    public static final String FLASH_SALE_STOCK_QUANTITY_COL = "stock_quantity";
    public static final String FLASH_SALE_SOLD_QUANTITY_COL = "sold_quantity";
    public static final String FLASH_SALE_START_TIME_COL = "start_time";
    public static final String FLASH_SALE_END_TIME_COL = "end_time";
    public static final String FLASH_SALE_ACTIVE_COL = "is_active";
    public static final String FLASH_SALE_CREATED_AT_COL = "created_at";

    // Shop Followers table
    public static final String FOLLOW_ID_COL = "id";
    public static final String FOLLOW_USER_ID_COL = "user_id";
    public static final String FOLLOW_SHOP_ID_COL = "shop_id";
    public static final String FOLLOW_FOLLOWED_AT_COL = "followed_at";

    // Conversations table
    public static final String CONVERSATION_ID_COL = "id";
    public static final String CONVERSATION_BUYER_ID_COL = "buyer_id";
    public static final String CONVERSATION_SHOP_ID_COL = "shop_id";
    public static final String CONVERSATION_LAST_MESSAGE_COL = "last_message";
    public static final String CONVERSATION_LAST_MESSAGE_AT_COL = "last_message_at";
    public static final String CONVERSATION_CREATED_AT_COL = "created_at";

    // Messages table
    public static final String MESSAGE_ID_COL ="id";
    public static final String MESSAGE_CONVERSATION_ID_COL = "conversation_id";
    public static final String MESSAGE_SENDER_ID_COL = "sender_id";
    public static final String MESSAGE_TEXT_COL = "message_text";
    public static final String MESSAGE_IMAGE_URL_COL = "image_url";
    public static final String MESSAGE_READ_COL = "is_read";
    public static final String MESSAGE_CREATED_AT_COL = "created_at";

    // Notifications table
    public static final String NOTIFICATION_ID_COL = "id";
    public static final String NOTIFICATION_USER_ID_COL = "user_id";
    public static final String NOTIFICATION_TYPE_COL = "type";
    public static final String NOTIFICATION_TITLE_COL = "title";
    public static final String NOTIFICATION_MESSAGE_COL = "message";
    public static final String NOTIFICATION_REFERENCE_ID_COL = "reference_id";
    public static final String NOTIFICATION_READ_COL = "is_read";
    public static final String NOTIFICATION_CREATED_AT_COL = "created_at";

    // Search History table
    public static final String SEARCH_ID_COL = "id";
    public static final String SEARCH_USER_ID_COL = "user_id";
    public static final String SEARCH_QUERY_COL = "search_query";
    public static final String SEARCH_RESULT_COUNT_COL = "result_count";
    public static final String SEARCH_SEARCHED_AT_COL = "searched_at";

    private StringValue() {}
}