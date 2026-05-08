# Flutter Web Integration with Spring Boot Microservices

## 📋 Overview

This document provides instructions for running the **NEXAMART ecommerce_mobile** Flutter Web application connected to your Spring Boot microservices architecture.

### Architecture

```
Flutter Web (Chrome)
     ↓
API Gateway (http://localhost:8000)
     ↓
Marketplace-Platform (http://localhost:8001)
```

## ✅ Prerequisites

### Required Services Running

Before starting the Flutter Web app, ensure these services are running:

1. **API Gateway** (Port 8000)
   ```bash
   cd api-gateway
   # Run with Maven
   mvn spring-boot:run
   ```

2. **Marketplace-Platform** (Port 8001)
   ```bash
   cd Marketplace-platform
   # Run with Maven
   mvn spring-boot:run
   ```

3. **Other Microservices** (as needed):
   - Cart Service (8003)
   - Order Service (8002)
   - Logistic Service (8007)
   - Payment Service (8005)

### Flutter Setup

- Flutter SDK (3.9.2 or higher)
- Chrome browser (for Flutter Web)
- Dart SDK (included with Flutter)

## 🚀 Running the Flutter Web Application

### Option 1: Run on Chrome

```bash
cd ecommerce_mobile

# Get dependencies
flutter pub get

# Run on Chrome
flutter run -d chrome --web-port 3000
```

The app will open at: **http://localhost:3000**

### Option 2: Build for Web Production

```bash
cd ecommerce_mobile

# Build for production
flutter build web --release

# Serve with a simple HTTP server (requires Python or Node.js)
cd build/web
python -m http.server 3000
# or
npx http-server -p 3000
```

## 📡 API Integration Details

### Base URL Configuration

The Flutter app is configured to communicate with the API Gateway at:
```
Base URL: http://localhost:8000
```

All requests follow this routing:
- **Categories**: `GET /api/categories` → Marketplace-Platform
- **Products**: `GET /product` → Marketplace-Platform
- **Product Search**: `GET /product/search?keyword=...` → Marketplace-Platform

### Available API Endpoints

#### Categories

```dart
// Initialize services
final categoryService = CategoryService();

// Fetch all categories
List<Category> categories = await categoryService.fetchAll();

// Fetch category by ID
Category category = await categoryService.getById(1);
```

**Endpoint**: `GET /api/categories`

**Response**:
```json
[
  {
    "id": 1,
    "category_name": "Electronics",
    "category_slug": "electronics",
    "category_icon": "📱",
    "level": 0,
    "is_active": 1,
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
  }
]
```

#### Products

```dart
// Initialize services
final productService = ProductService();

// Fetch all products
List<Product> products = await productService.fetchAll();

// Fetch product by ID
Product product = await productService.getById(1);

// Search products with filters
List<Product> results = await productService.search(
  keyword: 'laptop',
  categoryId: 1,
  minPrice: 10000,
  maxPrice: 50000,
  sort: 'popular',
  page: 1,
  limit: 24,
);

// Fetch products by category
List<Product> categoryProducts = await productService.fetchByCategory(1);
```

**Endpoints**:
- `GET /product` - Get all products
- `GET /product/{id}` - Get product by ID
- `GET /product/search` - Search products with filters

**Product Response Example**:
```json
{
  "id": 1,
  "shop_id": 1,
  "product_name": "Gaming Laptop",
  "product_slug": "gaming-laptop",
  "category_id": 1,
  "category_name": "Electronics",
  "description": "High-performance gaming laptop",
  "image_url": "https://example.com/image.jpg",
  "price": 25000000,
  "original_price": 30000000,
  "stock_quantity": 50,
  "sold_count": 100,
  "rating": 4.5,
  "review_count": 25,
  "brand_id": 1,
  "is_active": 1,
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

## 🎨 UI Components

### HomePage Architecture

The main page consists of:

1. **Categories Carousel** (Horizontal Scrolling)
   - Displays all categories from the database
   - Includes "All Products" option
   - Click to filter products by category
   - Responsive design with visual feedback

2. **Products Grid** (2-Column Layout)
   - Shows products in a responsive grid
   - Professional card-based design
   - Product image with BoxFit.cover
   - Discount badge for sales
   - Price display with discount calculation
   - Rating and sold count
   - Hover effects on web

### Styling Features

- **Cards**: Material Design 3 cards with shadows and rounded corners
- **Images**: Professional image display with proper aspect ratios
- **Typography**: Clear hierarchy with bold category names and product titles
- **Colors**: Blue primary color matching your brand
- **Responsive**: Works on desktop browsers (Chrome, Firefox, Safari, Edge)

## 🔧 Configuration

### API Client Configuration

File: `lib/core/api_client.dart`

**Key Configuration**:
```dart
static const String apiBaseUrl = 'http://localhost:8000';
static const Duration requestTimeout = Duration(seconds: 30);
```

To change the API Gateway URL:
1. Open `lib/core/api_client.dart`
2. Update `apiBaseUrl` constant
3. Run `flutter pub get` and restart the app

### Service Configuration

The app uses specific service classes that extend the base API client:

- `CategoryService` - Handles category-related API calls
- `ProductService` - Handles product-related API calls

All services use the shared `BaseApiService` from `lib/core/api_client.dart`.

### Theme Configuration

File: `lib/main.dart`

The app uses Material Design 3 with:
- Primary color: Blue
- Background color: Light gray (#F8F9FA)
- Card elevation: 2
- Border radius: 12

## 🌐 CORS Handling (Flutter Web)

Flutter Web handles CORS automatically for localhost development. The API Gateway is configured to allow:
- Origins: `http://localhost:*`
- Methods: GET, POST, PUT, DELETE, OPTIONS
- Headers: Content-Type, Accept

**Note**: For production deployment, update CORS settings in the API Gateway configuration.

## 📊 Data Models

### Category Model

```dart
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
}
```

### Product Model

```dart
class Product {
  final int id;
  final int? shopId;
  final String productName;
  final String? productSlug;
  final int? categoryId;
  final String? categoryName;
  final String? description;
  final String? imageUrl;
  final double? price;
  final double? originalPrice;
  final int? stockQuantity;
  final int? soldCount;
  final double? rating;
  final int? reviewCount;
  final int? brandId;
  final int? isActive;
  
  // Helper methods
  int? get discountPercentage { ... }
  String get formattedPrice { ... }
  String get formattedOriginalPrice { ... }
}
```

## 🐛 Troubleshooting

### Issue: Connection Refused Error

**Problem**: "Connection refused: http://localhost:8000"

**Solutions**:
1. Ensure API Gateway is running on port 8000
2. Check if the backend services are started
3. Verify localhost binding: `netstat -tuln | grep 8000`

### Issue: CORS Errors

**Problem**: "Response to preflight request doesn't pass access control check"

**Solutions**:
1. Ensure API Gateway has CORS enabled for localhost
2. Check if the request headers are correct
3. Restart the API Gateway

### Issue: Images Not Loading

**Problem**: Images from external URLs are not displaying

**Solutions**:
1. Check image URLs in the database
2. Ensure images are publicly accessible
3. Check browser console for specific error messages

### Issue: Slow Loading

**Solutions**:
1. Reduce number of products fetched (use pagination)
2. Optimize images on the backend
3. Implement image caching in the Flutter app
4. Check network latency: use Chrome DevTools

## 📱 Responsive Design

The Flutter Web app is optimized for:
- **Desktop**: Full 2-column product grid
- **Tablet**: Responsive layout adjustment
- **Mobile Web**: Single column, optimized touch targets

## 🚀 Performance Optimization

### Current Optimizations
- Image lazy loading
- Future caching in FutureBuilder
- Efficient ListView and GridView rendering
- Error handling and retry logic

### Future Enhancements
- Implement product pagination
- Add search debouncing
- Cache API responses locally
- Implement image caching with cached_network_image package
- Add product favorites/wishlist

## 📦 Dependencies

- `flutter`: ^3.9.2
- `http`: ^1.1.0
- `shared_preferences`: ^2.0.20
- `cupertino_icons`: ^1.0.8

To add more dependencies:
```bash
flutter pub add package_name
```

## 📝 Development Notes

### File Structure

```
ecommerce_mobile/
├── lib/
│   ├── core/
│   │   ├── api_client.dart          # Base API client (Axios-style)
│   │   ├── constants.dart           # App constants
│   │   └── ...
│   ├── models/
│   │   ├── category.dart
│   │   └── product.dart
│   ├── services/
│   │   ├── category_service.dart    # Category-specific API calls
│   │   ├── product_service.dart     # Product-specific API calls
│   │   └── ...
│   ├── features/
│   │   └── home/
│   │       ├── pages/
│   │       │   └── home_page.dart
│   │       └── widgets/
│   │           ├── category_card.dart
│   │           ├── category_grid.dart
│   │           └── product_card.dart
│   ├── shared/
│   │   └── widgets/
│   │       └── layout/
│   │           ├── web_header.dart
│   │           └── web_footer.dart
│   ├── hooks/
│   │   └── use_home_data.dart
│   ├── filter_page.dart
│   └── main.dart
├── web/
│   └── index.html
├── pubspec.yaml
└── README.md
```

### Adding New Features

1. **New Feature Module**: Create `lib/features/feature_name/` with `pages/` and `widgets/` subfolders
2. **New Page**: Create file in `lib/features/feature_name/pages/` and add route in `main.dart`
3. **New API Endpoint**: Add method in `lib/services/` or create new service file
4. **New Model**: Create file in `lib/models/` with fromJson and toJson methods
5. **Shared Component**: Create widget in `lib/shared/widgets/` for reusable UI elements
6. **Core Logic**: Add to `lib/core/` for shared business logic and API clients

## 🔗 API Gateway Routing Configuration

File: `api-gateway/src/main/resources/application.properties`

Current configuration:
```properties
# Cart Service
spring.cloud.gateway.routes[0].id=cart-service
spring.cloud.gateway.routes[0].uri=http://cart-service:8003
spring.cloud.gateway.routes[0].predicates[0]=Path=/api/cart/**

# Order Service
spring.cloud.gateway.routes[1].id=order-service
spring.cloud.gateway.routes[1].uri=http://order-service:8002
spring.cloud.gateway.routes[1].predicates[0]=Path=/api/orders/**

# Logistic Service
spring.cloud.gateway.routes[2].id=logistic-service
spring.cloud.gateway.routes[2].uri=http://logistic-service:8007
spring.cloud.gateway.routes[2].predicates[0]=Path=/api/logistics/**

# Catch-all (Marketplace Platform)
spring.cloud.gateway.routes[3].id=marketplace-platform
spring.cloud.gateway.routes[3].uri=http://localhost:8001
spring.cloud.gateway.routes[3].predicates[0]=Path=/**

server.port=8000
```

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the API Gateway logs
3. Check Flutter console output with `flutter run -v`
4. Inspect browser DevTools (F12 → Network tab)

## 🎯 Next Steps

1. ✅ Start all microservices
2. ✅ Run Flutter Web app with `flutter run -d chrome`
3. ✅ Test category browsing
4. ✅ Test product grid
5. ✅ Implement search functionality
6. ✅ Add product detail page
7. ✅ Implement shopping cart
8. ✅ Add checkout flow

---

**Last Updated**: May 8, 2026
**Flutter Version**: 3.9.2+
**API Gateway Port**: 8000
