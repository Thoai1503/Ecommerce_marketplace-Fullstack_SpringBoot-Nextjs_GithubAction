import 'package:flutter/material.dart';
import '../../../../models/category.dart';
import 'category_card.dart';

class CategoryGrid extends StatelessWidget {
  final List<Category> categories;
  final int selectedCategoryId;
  final Function(int) onCategorySelected;

  const CategoryGrid({
    super.key,
    required this.categories,
    required this.selectedCategoryId,
    required this.onCategorySelected,
  });

  @override
  Widget build(BuildContext context) {
    // Filter to only level 0 (parent) categories
    final parentCategories = categories
        .where((cat) => cat.level != null && cat.level == 0)
        .toList();

    // Take first 8 categories plus "All"
    final displayCategories = [
      Category(id: -1, categoryName: 'All'),
      ...parentCategories.take(15),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 24),
          child: Text(
            'Categories',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
        ),
        const SizedBox(height: 16),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 5, // 5 columns for web layout
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              childAspectRatio: 1.2,
            ),
            itemCount: displayCategories.length,
            itemBuilder: (context, index) {
              final category = displayCategories[index];
              return CategoryCard(
                title: category.categoryName,
                icon: category.categoryIcon ?? '📦',
                isSelected: selectedCategoryId == category.id,
                onTap: () => onCategorySelected(category.id),
              );
            },
          ),
        ),
      ],
    );
  }
}
