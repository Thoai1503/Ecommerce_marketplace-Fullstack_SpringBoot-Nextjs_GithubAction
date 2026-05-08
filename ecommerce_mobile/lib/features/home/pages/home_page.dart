import 'package:flutter/material.dart';
import '../widgets/category_grid.dart';
import '../widgets/product_card.dart';
import '../../../shared/widgets/layout/web_footer.dart';
import '../../../shared/widgets/layout/web_header.dart';
import '../../../hooks/use_home_data.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final HomeData homeData = HomeData();

  @override
  void initState() {
    super.initState();
    homeData.initialize();
  }

  @override
  void dispose() {
    homeData.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      body: Column(
        children: [
          const WebHeader(),
          Expanded(
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 1200),
                child: AnimatedBuilder(
                  animation: homeData,
                  builder: (context, _) {
                    return SingleChildScrollView(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          CategoryGrid(
                            categories: homeData.categories,
                            selectedCategoryId: homeData.selectedCategoryId,
                            onCategorySelected: homeData.selectCategory,
                          ),
                          const SizedBox(height: 32),
                          _buildProductsSection(),
                          const SizedBox(height: 32),
                          const WebFooter(),
                        ],
                      ),
                    );
                  },
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProductsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          homeData.titleText,
          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        if (homeData.errorMessage != null)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 16),
            child: Text(
              homeData.errorMessage!,
              style: const TextStyle(color: Colors.redAccent),
            ),
          ),
        if (homeData.isLoading && homeData.products.isEmpty)
          const SizedBox(
            height: 200,
            child: Center(child: CircularProgressIndicator()),
          )
        else if (homeData.products.isEmpty)
          const Padding(
            padding: EdgeInsets.only(top: 24),
            child: Center(child: Text('No products available')),
          )
        else
          LayoutBuilder(
            builder: (context, constraints) {
              int crossAxisCount = constraints.maxWidth > 600 ? 4 : 2;
              return GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: crossAxisCount,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 0.75,
                ),
                itemCount: homeData.products.length,
                itemBuilder: (context, index) {
                  return ProductCard(product: homeData.products[index]);
                },
              );
            },
          ),
      ],
    );
  }
}
