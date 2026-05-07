class Category {
  final int id;
  final int? parentId;
  final String categoryName;
  final String? categorySlug;
  final String? categoryIcon;
  final int? level;
  final int? isActive;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Category({
    required this.id,
    this.parentId,
    required this.categoryName,
    this.categorySlug,
    this.categoryIcon,
    this.level,
    this.isActive,
    this.createdAt,
    this.updatedAt,
  });

  /// Factory constructor to create a Category instance from JSON
  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'] ?? 0,
      parentId: json['parent_id'],
      categoryName: json['category_name'] ?? '',
      categorySlug: json['category_slug'],
      categoryIcon: json['category_icon'],
      level: json['level'],
      isActive: json['is_active'],
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : null,
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : null,
    );
  }

  /// Convert Category instance to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'parent_id': parentId,
      'category_name': categoryName,
      'category_slug': categorySlug,
      'category_icon': categoryIcon,
      'level': level,
      'is_active': isActive,
      'created_at': createdAt?.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
    };
  }

  @override
  String toString() {
    return 'Category(id: $id, name: $categoryName, icon: $categoryIcon)';
  }
}
