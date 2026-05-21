import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../models/cart_model.dart';
import '../../../services/cart_service.dart';

final cartProvider = StateNotifierProvider<CartNotifier, AsyncValue<CartModel>>(
  (ref) => CartNotifier(),
);

class CartNotifier extends StateNotifier<AsyncValue<CartModel>> {
  CartNotifier() : super(const AsyncLoading()) {
    loadCart();
  }

  final CartService _service = CartService();

  Future<void> loadCart() async {
    try {
      final cart = await _service.getCart();

      state = AsyncData(cart);
    } catch (e) {
      state = AsyncError(e, StackTrace.current);
    }
  }

  Future<void> addItem(String productId, int quantity) async {
    await _service.addToCart(productId: productId, quantity: quantity);

    await loadCart();
  }

  Future<void> removeItem(String productId) async {
    await _service.removeItem(productId);

    await loadCart();
  }

  Future<void> updateQuantity(String productId, int quantity) async {
    await _service.updateQuantity(productId: productId, quantity: quantity);

    await loadCart();
  }

  Future<void> applyVoucher(String code) async {
    await _service.applyVoucher(code);

    await loadCart();
  }
}
