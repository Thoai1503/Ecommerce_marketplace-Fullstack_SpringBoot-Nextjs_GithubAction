import 'package:flutter/material.dart';
import '../models/category.dart';
import '../models/product.dart';
import '../services/category_service.dart';
import '../services/product_service.dart';

class HomeData extends ChangeNotifier {
  final CategoryService _categoryService;
  final ProductService _productService;

  HomeData({CategoryService? categoryService, ProductService? productService})
    : _categoryService = categoryService ?? CategoryService(),
      _productService = productService ?? ProductService();

  bool isLoading = false;
  String? errorMessage;
  int selectedCategoryId = -1;
  List<Category> categories = [];
  List<Product> products = [];

  Future<void> initialize() async {
    await _loadHomeData();
  }

  Future<void> _loadHomeData() async {
    isLoading = true;
    errorMessage = null;
    notifyListeners();

    try {
      final fetchedCategories = await _categoryService.fetchAll();
      final fetchedProducts = await _productService.fetchAll();
      categories = fetchedCategories;
      products = fetchedProducts;
      selectedCategoryId = -1;
    } catch (e) {
      errorMessage = e.toString();
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> selectCategory(int categoryId) async {
    if (selectedCategoryId == categoryId && selectedCategoryId != -1) {
      return;
    }

    selectedCategoryId = categoryId;
    isLoading = true;
    errorMessage = null;
    notifyListeners();

    try {
      if (categoryId == -1) {
        products = await _productService.fetchAll();
      } else {
        products = await _productService.fetchByCategory(categoryId);
      }
    } catch (e) {
      errorMessage = e.toString();
      products = [];
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  String get titleText {
    return selectedCategoryId == -1 ? 'All Products' : 'Category Products';
  }
}
