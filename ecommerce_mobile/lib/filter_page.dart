import 'package:flutter/material.dart';

class FilterPage extends StatefulWidget {
  const FilterPage({super.key});

  @override
  State<FilterPage> createState() => _FilterPageState();
}

class _FilterPageState extends State<FilterPage> {
  // Filter states
  String? selectedCategory;
  RangeValues priceRange = const RangeValues(0, 1000);
  bool freeship = false;
  bool flashSale = false;

  final List<String> categories = [
    "Men's Fashion",
    "Phones & Accessories",
    "Electronic Devices",
    "Computers & Laptops",
    "Bookstore",
    "Health",
    "Women's Shoes",
    "Women's Purse",
    "Women's Accessories & Jewelry",
    "Department Store Online",
  ];

  // Fake product data
  final List<Map<String, dynamic>> allProducts = [
    {
      'name': 'T-shirt Men',
      'price': 120,
      'category': "Men's Fashion",
      'freeship': true,
      'flashSale': false,
    },
    {
      'name': 'iPhone 14',
      'price': 900,
      'category': "Phones & Accessories",
      'freeship': false,
      'flashSale': true,
    },
    {
      'name': 'Samsung TV',
      'price': 700,
      'category': "Electronic Devices",
      'freeship': true,
      'flashSale': true,
    },
    {
      'name': 'MacBook Pro',
      'price': 1500,
      'category': "Computers & Laptops",
      'freeship': false,
      'flashSale': false,
    },
    {
      'name': 'Novel Book',
      'price': 50,
      'category': "Bookstore",
      'freeship': true,
      'flashSale': false,
    },
    {
      'name': 'Vitamin C',
      'price': 30,
      'category': "Health",
      'freeship': false,
      'flashSale': false,
    },
    {
      'name': 'High Heels',
      'price': 200,
      'category': "Women's Shoes",
      'freeship': true,
      'flashSale': true,
    },
    {
      'name': 'Leather Purse',
      'price': 180,
      'category': "Women's Purse",
      'freeship': false,
      'flashSale': false,
    },
    {
      'name': 'Gold Ring',
      'price': 500,
      'category': "Women's Accessories & Jewelry",
      'freeship': true,
      'flashSale': false,
    },
    {
      'name': 'Online Blender',
      'price': 90,
      'category': "Department Store Online",
      'freeship': true,
      'flashSale': true,
    },
  ];

  List<Map<String, dynamic>> get filteredProducts {
    return allProducts.where((product) {
      final inCategory =
          selectedCategory == null || product['category'] == selectedCategory;
      final inPrice =
          product['price'] >= priceRange.start &&
          product['price'] <= priceRange.end;
      final matchFreeship = !freeship || product['freeship'] == true;
      final matchFlashSale = !flashSale || product['flashSale'] == true;
      return inCategory && inPrice && matchFreeship && matchFlashSale;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Filter'),
        backgroundColor: Colors.deepPurple,
        foregroundColor: Colors.white,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Category',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: categories
                  .map(
                    (cat) => ChoiceChip(
                      label: Text(cat, style: const TextStyle(fontSize: 12)),
                      selected: selectedCategory == cat,
                      onSelected: (selected) {
                        setState(() {
                          selectedCategory = selected ? cat : null;
                        });
                      },
                    ),
                  )
                  .toList(),
            ),
            const SizedBox(height: 24),
            const Text(
              'Price Range',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            RangeSlider(
              values: priceRange,
              min: 0,
              max: 1000,
              divisions: 20,
              labels: RangeLabels(
                '${priceRange.start.round()}',
                '${priceRange.end.round()}',
              ),
              onChanged: (values) {
                setState(() {
                  priceRange = values;
                });
              },
            ),
            const SizedBox(height: 24),
            const Text(
              'Other Filters',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            SwitchListTile(
              title: const Text('Freeship'),
              value: freeship,
              onChanged: (val) {
                setState(() {
                  freeship = val;
                });
              },
            ),
            SwitchListTile(
              title: const Text('Flash Sale'),
              value: flashSale,
              onChanged: (val) {
                setState(() {
                  flashSale = val;
                });
              },
            ),
            const SizedBox(height: 16),
            const Text(
              'Products',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 8),
            Expanded(
              child: filteredProducts.isEmpty
                  ? const Center(child: Text('No products found.'))
                  : ListView.builder(
                      itemCount: filteredProducts.length,
                      itemBuilder: (context, index) {
                        final product = filteredProducts[index];
                        return Card(
                          margin: const EdgeInsets.symmetric(vertical: 6),
                          child: ListTile(
                            title: Text(product['name']),
                            subtitle: Text(
                              '${product['category']} • ${product['price']}₫',
                            ),
                            trailing: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                if (product['freeship'])
                                  const Icon(
                                    Icons.local_shipping,
                                    color: Colors.green,
                                    size: 18,
                                  ),
                                if (product['flashSale'])
                                  const Icon(
                                    Icons.flash_on,
                                    color: Colors.red,
                                    size: 18,
                                  ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
