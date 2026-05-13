import 'cart_item_model.dart';

class CartModel {
  final List<CartItemModel> items;
  final double subtotal;
  final double discount;
  final double total;

  CartModel({
    required this.items,
    required this.subtotal,
    required this.discount,
    required this.total,
  });

  factory CartModel.fromJson(Map<String, dynamic> json) {
    return CartModel(
      items: (json['items'] as List)
          .map((e) => CartItemModel.fromJson(e))
          .toList(),
      subtotal: (json['subtotal'] as num).toDouble(),
      discount: (json['discount'] as num).toDouble(),
      total: (json['total'] as num).toDouble(),
    );
  }
}
