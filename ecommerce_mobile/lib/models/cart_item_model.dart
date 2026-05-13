class CartItemModel {
  final String productId;
  final String productName;
  final String image;
  int quantity;
  final double price;
  final String variantName;

  CartItemModel({
    required this.productId,
    required this.productName,
    required this.image,
    required this.quantity,
    required this.price,
    required this.variantName,
  });

  factory CartItemModel.fromJson(
    Map<String, dynamic> json,
  ) {
    final product = json['product'] ?? {};
    final variant = json['productVariant'] ?? {};

    return CartItemModel(
      productId: product['id'].toString(),

      productName: product['name'] ?? '',

      image: variant['imageUrl'] ?? '',

      quantity: json['quantity'] ?? 1,

      price: (variant['price'] ?? 0).toDouble(),

      variantName: variant['variantName'] ?? '',
    );
  }
}