import 'package:flutter/material.dart';
import 'filter_page.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NEXAMART',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        scaffoldBackgroundColor: const Color(0xFFF8F9FB),
      ),
      debugShowCheckedModeBanner: false,
      initialRoute: '/',
      routes: {
        '/': (context) => const HomePage(),
        '/filter': (context) => const FilterPage(),
      },
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            const Icon(Icons.shopping_bag, color: Colors.blue),
            const SizedBox(width: 8),
            const Text(
              'NEXAMART',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
          ],
        ),
        actions: [
          IconButton(icon: const Icon(Icons.shopping_cart), onPressed: () {}),
        ],
        backgroundColor: Colors.white,
        elevation: 1,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Thanh tìm kiếm
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: TextField(
                decoration: InputDecoration(
                  hintText: 'Find your favorite products, brands, and shops...',
                  prefixIcon: const Icon(Icons.search),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(30),
                  ),
                  filled: true,
                  fillColor: Colors.white,
                  contentPadding: const EdgeInsets.symmetric(
                    vertical: 0,
                    horizontal: 16,
                  ),
                ),
              ),
            ),
            // Dãy icon tính năng
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _FeatureIcon(title: 'Freeship', icon: Icons.local_shipping),
                  _FeatureIcon(title: 'Flash Sale', icon: Icons.flash_on),
                  _FeatureIcon(title: 'Mall', icon: Icons.store_mall_directory),
                  _FeatureIcon(title: 'Mã giảm giá', icon: Icons.card_giftcard),
                ],
              ),
            ),
            // Danh mục
            Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: 16.0,
                vertical: 8,
              ),
              child: Row(
                children: [
                  const Icon(Icons.menu, color: Colors.deepPurple),
                  const SizedBox(width: 8),
                  const Text(
                    'Category',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  const Spacer(),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.pushNamed(context, '/filter');
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.deepPurple,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                      ),
                    ),
                    child: const Text('Filter'),
                  ),
                ],
              ),
            ),
            // Lưới danh mục
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8.0),
              child: GridView.count(
                crossAxisCount: 4,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                childAspectRatio: 0.8,
                children: const [
                  _CategoryItem(title: "Men's Fashion", icon: Icons.checkroom),
                  _CategoryItem(
                    title: "Phones & Accessories",
                    icon: Icons.phone_android,
                  ),
                  _CategoryItem(title: "Electronic Devices", icon: Icons.tv),
                  _CategoryItem(
                    title: "Computers & Laptops",
                    icon: Icons.laptop,
                  ),
                  _CategoryItem(title: "Bookstore", icon: Icons.menu_book),
                  _CategoryItem(title: "Health", icon: Icons.health_and_safety),
                  _CategoryItem(title: "Women's Shoes", icon: Icons.woman),
                  _CategoryItem(
                    title: "Women's Purse",
                    icon: Icons.shopping_bag,
                  ),
                  _CategoryItem(
                    title: "Women's Accessories & Jewelry",
                    icon: Icons.ring_volume,
                  ),
                  _CategoryItem(
                    title: "Department Store Online",
                    icon: Icons.store,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FeatureIcon extends StatelessWidget {
  final String title;
  final IconData icon;
  const _FeatureIcon({required this.title, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        CircleAvatar(
          backgroundColor: Colors.white,
          child: Icon(icon, color: Colors.deepPurple),
        ),
        const SizedBox(height: 4),
        Text(title, style: const TextStyle(fontSize: 12)),
      ],
    );
  }
}

class _CategoryItem extends StatelessWidget {
  final String title;
  final IconData icon;
  const _CategoryItem({required this.title, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 2,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 36, color: Colors.deepPurple),
          const SizedBox(height: 8),
          Text(
            title,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }
}
