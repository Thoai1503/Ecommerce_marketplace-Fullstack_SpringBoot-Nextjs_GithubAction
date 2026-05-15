import 'package:dio/dio.dart';
import '../../../core/api_client.dart';

class StockService {
  final Dio dio = ApiClient.stockDio;

  Future<int> getStockQuantity(int productId, {int fallback = 0}) async {
    final endpoints = <String>[
      '/api/v1/stock/product/$productId',
      '/api/v1/stock/$productId',
      '/stock/product/$productId',
      '/api/stock/product/$productId',
      '/stock/$productId',
      '/api/stock/$productId',
    ];

    for (final endpoint in endpoints) {
      try {
        final response = await dio.get(endpoint);
        if (response.statusCode == 200) {
          final parsed = _parseStock(response.data);
          if (parsed != null) {
            return parsed;
          }
        }
      } catch (e) {
        // Continue trying other endpoints.
      }
    }

    return fallback;
  }

  int? _parseStock(dynamic data) {
    if (data == null) return null;

    if (data is Map<String, dynamic>) {
      final int? stock = _extractInt(data, [
        'stock_quantity',
        'stock',
        'quantity',
        'available_stock',
        'availableQuantity',
        'availableQuantity',
        'inventory',
      ]);
      if (stock != null) return stock;
      if (data.containsKey('data')) {
        return _parseStock(data['data']);
      }
    }

    if (data is int) {
      return data;
    }

    if (data is String) {
      return int.tryParse(data);
    }

    return null;
  }

  int? _extractInt(Map<String, dynamic> map, List<String> keys) {
    for (final key in keys) {
      if (!map.containsKey(key)) continue;
      final value = map[key];
      if (value is int) return value;
      if (value is String) {
        final parsed = int.tryParse(value);
        if (parsed != null) return parsed;
      }
    }
    return null;
  }
}
