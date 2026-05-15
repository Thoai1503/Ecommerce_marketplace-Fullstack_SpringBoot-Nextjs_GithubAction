import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/cart_item_model.dart';
import '../models/cart_model.dart';
import '../core/api_client.dart';

/// CartService handles all cart-related API calls
/// Uses dedicated cart-service (port 8003) microservice
class CartService {
  /// Use dedicated cart service client
  final Dio dio = ApiClient.cartDio;

  /// Get the current user ID from shared preferences
  Future<int?> _getUserId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt('user_id');
  }

  /// Fetch cart items for the logged-in user
  /// Endpoint: GET /api/cart/user/{userId}
  Future<CartModel> getCart() async {
    final userId = await _getUserId();
    if (userId == null) {
      throw Exception('User not logged in');
    }

    try {
      final response = await dio.get('/api/cart/user/$userId');

      debugPrint('Cart data fetched successfully for user $userId');

      final items = (response.data as List)
          .map((e) => CartItemModel.fromJson(e))
          .toList();

      final subtotal = items.fold<double>(
        0,
        (sum, item) => sum + (item.price * item.quantity),
      );

      return CartModel(
        items: items,
        subtotal: subtotal,
        discount: 0,
        total: subtotal,
      );
    } catch (e) {
      debugPrint('Error fetching cart: $e');
      rethrow;
    }
  }

  /// Add item to cart
  /// Endpoint: POST /api/cart
  /// Body: { product_id, user_id, quantity }
  Future<void> addToCart({
    required String productId,
    required int quantity,
  }) async {
    final userId = await _getUserId();
    if (userId == null) {
      throw Exception('User not logged in');
    }

    try {
      await dio.post(
        '/api/cart',
        data: {
          'product_id': int.parse(productId),
          'user_id': userId,
          'quantity': quantity,
        },
      );
      debugPrint('Item $productId added to cart (qty: $quantity)');
    } catch (e) {
      debugPrint('Error adding to cart: $e');
      rethrow;
    }
  }

  /// Remove item from cart
  /// Endpoint: DELETE /api/cart/{cartItemId}
  Future<void> removeItem(String productId) async {
    final userId = await _getUserId();
    if (userId == null) {
      throw Exception('User not logged in');
    }

    try {
      await dio.delete('/api/cart/$productId');
      debugPrint('Item $productId removed from cart');
    } catch (e) {
      debugPrint('Error removing from cart: $e');
      rethrow;
    }
  }

  /// Update cart item quantity
  /// Endpoint: PUT /api/cart/{cartItemId}
  /// Body: { quantity }
  Future<void> updateQuantity({
    required String productId,
    required int quantity,
  }) async {
    final userId = await _getUserId();
    if (userId == null) {
      throw Exception('User not logged in');
    }

    try {
      await dio.put('/api/cart/$productId', data: {'quantity': quantity});
      debugPrint('Cart item $productId updated to quantity $quantity');
    } catch (e) {
      debugPrint('Error updating quantity: $e');
      rethrow;
    }
  }

  /// Apply voucher code to cart
  /// Endpoint: POST /api/cart/apply-voucher
  Future<void> applyVoucher(String code) async {
    final userId = await _getUserId();
    if (userId == null) {
      throw Exception('User not logged in');
    }

    try {
      await dio.post('/api/cart/apply-voucher', data: {'code': code});
      debugPrint('Voucher $code applied successfully');
    } catch (e) {
      debugPrint('Error applying voucher: $e');
      rethrow;
    }
  }
}
