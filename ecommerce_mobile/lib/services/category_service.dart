import '../core/api_client.dart';
import '../models/category.dart';

class CategoryService {
  final BaseApiService api;

  CategoryService({BaseApiService? api}) : api = api ?? BaseApiService();

  Future<List<Category>> fetchAll() {
    return api.get<List<Category>>(
      '/api/categories',
      decoder: _decodeCategoryList,
    );
  }

  Future<Category> getById(int id) {
    return api.get<Category>(
      '/api/categories/$id',
      decoder: (json) => Category.fromJson(json as Map<String, dynamic>),
    );
  }

  List<Category> _decodeCategoryList(dynamic json) {
    if (json is List) {
      return json
          .map((item) => Category.fromJson(item as Map<String, dynamic>))
          .toList();
    }

    if (json is Map<String, dynamic> && json.containsKey('data')) {
      final data = json['data'];
      if (data is List) {
        return data
            .map((item) => Category.fromJson(item as Map<String, dynamic>))
            .toList();
      }
    }

    throw HttpError(
      message: 'Unexpected category response format',
      status: 500,
    );
  }
}
