class Product {
  final int id;
  final int? shopId;
  final String? productSlug;
  final int? categoryId;
  final String? description;
  final String? imageUrl;
  final double? originalPrice;
  final double? price;
  final String? categoryName;
  final String productName;
  final int? stockQuantity;
  final int? soldCount;
  final double? rating;
  final int? reviewCount;
  final int? weight;
  final int? length;
  final int? width;
  final int? height;
  final int? brandId;
  final int? isActive;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Product({
    required this.id,
    this.shopId,
    this.productSlug,
    this.categoryId,
    this.description,
    this.imageUrl,
    this.originalPrice,
    this.price,
    this.categoryName,
    required this.productName,
    this.stockQuantity,
    this.soldCount,
    this.rating,
    this.reviewCount,
    this.weight,
    this.length,
    this.width,
    this.height,
    this.brandId,
    this.isActive,
    this.createdAt,
    this.updatedAt,
  });

  /// Factory constructor to create a Product instance from JSON
  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] ?? 0,
      shopId: json['shop_id'],
      productSlug: json['product_slug'],
      categoryId: json['category_id'],
      description: json['description'],
      imageUrl: json['image_url'],
      originalPrice: _parseDouble(json['original_price']),
      price: _parseDouble(json['price']),
      categoryName: json['category_name'],
      productName: json['product_name'] ?? 'Unknown Product',
      stockQuantity: json['stock_quantity'],
      soldCount: json['sold_count'],
      rating: _parseDouble(json['rating']),
      reviewCount: json['review_count'],
      weight: json['weight'],
      length: json['length'],
      width: json['width'],
      height: json['height'],
      brandId: json['brand_id'],
      isActive: json['is_active'],
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : null,
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : null,
    );
  }

  /// Convert Product instance to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'shop_id': shopId,
      'product_slug': productSlug,
      'category_id': categoryId,
      'description': description,
      'image_url': imageUrl,
      'original_price': originalPrice,
      'price': price,
      'category_name': categoryName,
      'product_name': productName,
      'stock_quantity': stockQuantity,
      'sold_count': soldCount,
      'rating': rating,
      'review_count': reviewCount,
      'weight': weight,
      'length': length,
      'width': width,
      'height': height,
      'brand_id': brandId,
      'is_active': isActive,
      'created_at': createdAt?.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
    };
  }

  /// Helper method to parse double values safely
  static double? _parseDouble(dynamic value) {
    if (value == null) return null;
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) return double.tryParse(value);
    return null;
  }

  /// Format price with Vietnamese locale
  String get formattedPrice {
    final amount = price?.toStringAsFixed(0) ?? '0';
    return '${int.parse(amount).toString()}đ';
  }

  /// Format original price with Vietnamese locale
  String get formattedOriginalPrice {
    final amount = originalPrice?.toStringAsFixed(0) ?? '0';
    return '${int.parse(amount).toString()}đ';
  }

  /// Calculate discount percentage
  int? get discountPercentage {
    if (price == null || originalPrice == null || originalPrice == 0) {
      return null;
    }
    return (((originalPrice! - price!) / originalPrice!) * 100).toInt();
  }

  @override
  String toString() {
    return 'Product(id: $id, name: $productName, price: $price, category: $categoryName)';
  }
}
