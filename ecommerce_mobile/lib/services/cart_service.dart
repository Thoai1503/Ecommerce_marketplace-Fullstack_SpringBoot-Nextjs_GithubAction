import 'package:dio/dio.dart';
import '../models/cart_item_model.dart';
import '../models/cart_model.dart';
import '../../../core/api_client.dart';

class CartService {
  final Dio dio = ApiClient.dio;

  Future<CartModel> getCart() async {
  final response = await dio.get('/cart/user/18');

  print(response.data);

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
}

  Future<void> addToCart({
    required String productId,
    required int quantity,
  }) async {
    await dio.post(
      '/cart/add',
      data: {
        'productId': productId,
        'quantity': quantity,
      },
    );
  }

  Future<void> removeItem(String productId) async {
    await dio.delete('/cart/remove/$productId');
  }

  Future<void> updateQuantity({
    required String productId,
    required int quantity,
  }) async {
    await dio.put(
      '/cart/update',
      data: {
        'productId': productId,
        'quantity': quantity,
      },
    );
  }

  Future<void> applyVoucher(String code) async {
    await dio.post(
      '/cart/apply-voucher',
      data: {
        'code': code,
      },
    );
  }
}