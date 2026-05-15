import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../models/product.dart';
import '../../../shared/widgets/layout/header/web_header.dart';
import '../../../features/cart/providers/cart_provider.dart';
import '../../../features/product/services/stock_service.dart';
import '../../../services/auth_service.dart';

class ProductDetailPage extends ConsumerStatefulWidget {
  final Product? product;

  const ProductDetailPage({super.key, this.product});

  @override
  ConsumerState<ProductDetailPage> createState() => _ProductDetailPageState();
}

class _ProductDetailPageState extends ConsumerState<ProductDetailPage> {
  int _quantity = 1;
  int _currentStock = 0;
  bool _isLoadingAdd = false;
  bool _isLoadingStock = true;

  @override
  void initState() {
    super.initState();
    _currentStock = widget.product?.stockQuantity ?? 0;
    _loadStock();
  }

  Future<void> _loadStock() async {
    final product = widget.product;
    if (product == null) return;

    setState(() {
      _isLoadingStock = true;
    });

    final fetchedStock = await StockService().getStockQuantity(
      product.id,
      fallback: product.stockQuantity ?? 0,
    );

    if (!mounted) return;

    setState(() {
      _currentStock = fetchedStock;
      _isLoadingStock = false;
      if (_quantity > _currentStock) {
        _quantity = _currentStock > 0 ? _currentStock : 1;
      }
    });
  }

  int _getEffectiveStock() {
    return _currentStock;
  }

  @override
  Widget build(BuildContext context) {
    final product = widget.product;

    if (product == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Product Detail')),
        body: const Center(child: Text('Product not found')),
      );
    }

    final isMobile = MediaQuery.of(context).size.width < 900;

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FB),
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(80),
        child: const WebHeader(),
      ),
      body: SingleChildScrollView(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 1200),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
              child: isMobile
                  ? _buildMobileLayout(product)
                  : _buildDesktopLayout(product),
            ),
          ),
        ),
      ),
    );
  }

  /// Desktop layout: 2 columns (image + details)
  Widget _buildDesktopLayout(Product product) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Left column: Product Image
        Expanded(flex: 1, child: _buildProductImage(product)),
        const SizedBox(width: 48),
        // Right column: Product Details
        Expanded(flex: 1, child: _buildProductDetails(product)),
      ],
    );
  }

  /// Mobile layout: Stacked
  Widget _buildMobileLayout(Product product) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildProductImage(product),
        const SizedBox(height: 32),
        _buildProductDetails(product),
      ],
    );
  }

  /// Product image section
  Widget _buildProductImage(Product product) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: AspectRatio(
          aspectRatio: 1,
          child: Image.network(
            product.imageUrl ?? 'https://via.placeholder.com/400?text=No+Image',
            fit: BoxFit.cover,
            errorBuilder: (context, error, stackTrace) {
              return Container(
                color: Colors.grey[300],
                child: const Center(
                  child: Icon(Icons.image_not_supported, size: 64),
                ),
              );
            },
            loadingBuilder: (context, child, loadingProgress) {
              if (loadingProgress == null) return child;
              return const Center(child: CircularProgressIndicator());
            },
          ),
        ),
      ),
    );
  }

  /// Product details section
  Widget _buildProductDetails(Product product) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Category
        if (product.categoryName != null && product.categoryName!.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Text(
              product.categoryName!,
              style: const TextStyle(
                fontSize: 12,
                color: Colors.grey,
                fontWeight: FontWeight.w500,
                letterSpacing: 0.5,
              ),
            ),
          ),

        // Product Name
        Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: Text(
            product.productName,
            style: const TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
              height: 1.3,
            ),
          ),
        ),

        // Rating and Reviews
        if (product.rating != null && product.rating! > 0)
          Padding(
            padding: const EdgeInsets.only(bottom: 24),
            child: Row(
              children: [
                Row(
                  children: List.generate(
                    5,
                    (index) => Icon(
                      index < product.rating!.toInt()
                          ? Icons.star
                          : Icons.star_border,
                      color: Colors.amber,
                      size: 18,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  '${product.rating}/5',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                if (product.reviewCount != null && product.reviewCount! > 0)
                  Padding(
                    padding: const EdgeInsets.only(left: 8),
                    child: Text(
                      '${product.reviewCount} reviews',
                      style: const TextStyle(fontSize: 14, color: Colors.grey),
                    ),
                  ),
              ],
            ),
          ),

        // Price Section
        Padding(
          padding: const EdgeInsets.only(bottom: 32),
          child: Row(
            children: [
              Text(
                '\$${product.price?.toStringAsFixed(2) ?? '0.00'}',
                style: const TextStyle(
                  fontSize: 36,
                  fontWeight: FontWeight.bold,
                  color: Colors.blue,
                ),
              ),
              if (product.originalPrice != null &&
                  product.originalPrice! > (product.price ?? 0))
                Padding(
                  padding: const EdgeInsets.only(left: 16),
                  child: Text(
                    '\$${product.originalPrice?.toStringAsFixed(2)}',
                    style: TextStyle(
                      fontSize: 18,
                      decoration: TextDecoration.lineThrough,
                      color: Colors.grey[500],
                    ),
                  ),
                ),
            ],
          ),
        ),

        // Description
        if (product.description != null && product.description!.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(bottom: 32),
            child: Text(
              product.description!,
              style: const TextStyle(
                fontSize: 14,
                color: Colors.grey,
                height: 1.6,
              ),
            ),
          ),

        // Quantity Control
        Padding(
          padding: const EdgeInsets.only(bottom: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Padding(
                padding: EdgeInsets.only(bottom: 8),
                child: Text(
                  'Quantity',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: Colors.black87,
                  ),
                ),
              ),
              Container(
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey[300]!),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      onPressed: _quantity > 1
                          ? () => setState(() => _quantity--)
                          : null,
                      icon: const Icon(Icons.remove),
                      splashRadius: 20,
                    ),
                    Container(
                      width: 60,
                      alignment: Alignment.center,
                      child: Text(
                        '$_quantity',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    IconButton(
                      onPressed:
                          _quantity < _getEffectiveStock() && _currentStock > 0
                          ? () => setState(() => _quantity++)
                          : null,
                      icon: const Icon(Icons.add),
                      splashRadius: 20,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        // Add to Cart Button
        SizedBox(
          width: double.infinity,
          height: 56,
          child: ElevatedButton(
            onPressed: _isLoadingAdd || _currentStock == 0
                ? null
                : _handleAddToCart,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue,
              foregroundColor: Colors.white,
              disabledBackgroundColor: Colors.grey[300],
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              elevation: 2,
            ),
            child: _isLoadingAdd
                ? const SizedBox(
                    height: 24,
                    width: 24,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                : Text(
                    _currentStock == 0 ? 'Out of Stock' : 'Add to Cart',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
          ),
        ),

        // Stock Indicator
        Padding(
          padding: const EdgeInsets.only(top: 16),
          child: Text(
            _buildStockIndicator(product),
            style: TextStyle(
              fontSize: 12,
              color: _getEffectiveStock() > 0 ? Colors.green : Colors.redAccent,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ],
    );
  }

  /// Build stock indicator text with dev mode fallback
  String _buildStockIndicator(Product product) {
    if (_isLoadingStock) {
      return 'Checking stock...';
    }

    final effectiveStock = _getEffectiveStock();

    if (effectiveStock > 0) {
      return 'In stock ($effectiveStock available)';
    }

    return 'Out of stock';
  }

  Future<void> _handleAddToCart() async {
    setState(() => _isLoadingAdd = true);

    try {
      debugPrint('[ProductDetail] Add to cart button clicked');

      final authService = AuthService();
      final userId = await authService.getStoredUserId();

      debugPrint('[ProductDetail] Retrieved userId: $userId');

      if (userId == null) {
        debugPrint('[ProductDetail] ❌ User not logged in');
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Please log in to add items to cart'),
              backgroundColor: Colors.redAccent,
              duration: Duration(seconds: 3),
            ),
          );
        }
        return;
      }

      debugPrint('[ProductDetail] ✅ User authenticated. Adding to cart...');

      // Add to cart
      await ref
          .read(cartProvider.notifier)
          .addItem(widget.product!.id.toString());

      debugPrint('[ProductDetail] ✅ Item added to cart successfully');

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${widget.product!.productName} added to cart!'),
            backgroundColor: Colors.green,
            duration: const Duration(seconds: 2),
          ),
        );
      }
      await _loadStock();
    } catch (e) {
      debugPrint('[ProductDetail] ❌ Error adding to cart: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error adding to cart: $e'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoadingAdd = false);
      }
    }
  }
}
