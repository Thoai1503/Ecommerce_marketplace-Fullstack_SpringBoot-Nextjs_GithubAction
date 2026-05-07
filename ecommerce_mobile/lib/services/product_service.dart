import '../core/api_client.dart';
import '../models/product.dart';

class ProductService {
  final BaseApiService api;

  ProductService({BaseApiService? api}) : api = api ?? BaseApiService();

  Future<List<Product>> fetchAll() {
    return api.get<List<Product>>('/product', decoder: _decodeProductList);
  }

  Future<Product> getById(int id) {
    return api.get<Product>(
      '/product/$id',
      decoder: (json) => Product.fromJson(json as Map<String, dynamic>),
    );
  }

  Future<List<Product>> fetchByCategory(int categoryId) {
    return api.get<List<Product>>(
      '/product/search',
      queryParameters: {'categoryId': categoryId.toString()},
      decoder: _decodeProductList,
    );
  }

  Future<List<Product>> search({
    String? keyword,
    int? categoryId,
    int? brandId,
    double? minPrice,
    double? maxPrice,
    String sort = 'popular',
    int page = 1,
    int limit = 24,
  }) {
    final queryParameters = <String, String>{
      'sort': sort,
      'page': page.toString(),
      'limit': limit.toString(),
    };

    if (keyword != null && keyword.isNotEmpty) {
      queryParameters['keyword'] = keyword;
    }
    if (categoryId != null) {
      queryParameters['categoryId'] = categoryId.toString();
    }
    if (brandId != null) {
      queryParameters['brandId'] = brandId.toString();
    }
    if (minPrice != null) {
      queryParameters['minPrice'] = minPrice.toString();
    }
    if (maxPrice != null) {
      queryParameters['maxPrice'] = maxPrice.toString();
    }

    return api.get<List<Product>>(
      '/product/search',
      queryParameters: queryParameters,
      decoder: _decodeProductList,
    );
  }

  List<Product> _decodeProductList(dynamic json) {
    if (json is List) {
      return json
          .map((item) => Product.fromJson(item as Map<String, dynamic>))
          .toList();
    }

    if (json is Map<String, dynamic>) {
      if (json.containsKey('products') && json['products'] is List) {
        return (json['products'] as List)
            .map((item) => Product.fromJson(item as Map<String, dynamic>))
            .toList();
      }
    }

    throw HttpError(message: 'Unexpected product response format', status: 500);
  }
}
