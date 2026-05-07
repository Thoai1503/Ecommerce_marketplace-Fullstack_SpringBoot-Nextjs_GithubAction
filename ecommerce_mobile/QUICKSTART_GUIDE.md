# 🚀 Quick Start Guide - Flutter Web Integration

## ⚡ Get Running in 5 Minutes

### Step 1: Start Your Microservices

```bash
# Terminal 1 - API Gateway (Port 8000)
cd api-gateway
mvn spring-boot:run

# Terminal 2 - Marketplace Platform (Port 8001)
cd Marketplace-platform
mvn spring-boot:run
```

### Step 2: Launch Flutter Web App

```bash
cd ecommerce_mobile
flutter pub get
flutter run -d chrome --web-port 3000
```

**App opens automatically at**: `http://localhost:3000`

## ✨ What You Get

### 1. **Dart Models** ✅
- `lib/models/category.dart` - Category model with fromJson/toJson
- `lib/models/product.dart` - Product model with price formatting helpers

### 2. **API Service** ✅
- `lib/services/api_service.dart` - Complete HTTP client for Spring Boot microservices
- Endpoints covered:
  - `GET /api/categories` - Fetch all categories
  - `GET /product` - Fetch all products
  - `GET /product/search` - Search with filters
  - `GET /product/{id}` - Get product by ID
  - `GET /product/suggestions` - Auto-complete suggestions

### 3. **Professional UI** ✅
- `lib/pages/home_page.dart` - Marketplace home page with:
  - Horizontal scrolling category carousel
  - 2-column responsive product grid
  - Professional card design with shadows
  - Images with BoxFit.cover for web-like appearance
  - Discount badges, ratings, and sold counts
  - Dynamic filtering by category

### 4. **Updated Configuration** ✅
- `main.dart` - Material Design 3 theme for Flutter Web
- `pubspec.yaml` - Added http package dependency
- `web/index.html` - Updated meta tags for web app

## 📡 API Architecture

```
┌──────────────────────────┐
│   Flutter Web (Chrome)   │
│   http://localhost:3000  │
└────────────┬─────────────┘
             │ (HTTP Requests)
             ▼
┌──────────────────────────────────┐
│   API Gateway                    │
│   http://localhost:8000          │
│   - Routing to microservices     │
│   - CORS enabled for localhost   │
└────────────┬─────────────────────┘
             │
             ├─→ Cart Service (8003)
             ├─→ Order Service (8002)
             ├─→ Logistic Service (8007)
             └─→ Marketplace Platform (8001) ← **Categories & Products**
```

## 🎯 Key Features Implemented

### Categories Section
```dart
// Horizontal ListView with category selection
// Categories are fetched from: GET /api/categories
// Click any category to filter products
// "All" option shows all products
```

### Products Grid
```dart
// 2-column GridView with professional cards
// Each product shows:
// - Image (BoxFit.cover)
// - Product name
// - Price with discount calculation
// - Rating and sold count
// - Discount percentage badge
```

### API Integration
```dart
// All API calls use http package
// Base URL: http://localhost:8000
// Automatic JSON parsing with fromJson factory constructors
// Error handling with try-catch
// 30-second timeout for all requests
```

## 🔧 Configuration Details

### API Gateway Base URL
```dart
// File: lib/services/api_service.dart
static const String apiGatewayBaseUrl = 'http://localhost:8000';
```

### App Theme
```dart
// File: lib/main.dart
theme: ThemeData(
  useMaterial3: true,
  primaryColor: Colors.blue,
  scaffoldBackgroundColor: Color(0xFFF8F9FB),
  cardTheme: CardTheme(elevation: 2),
)
```

## 📊 Data Flow Example

### Fetching Categories:
```
1. HomePage loads
2. initState() calls ApiService.fetchCategories()
3. HTTP GET /api/categories sent to localhost:8000
4. API Gateway routes to marketplace-platform (8001)
5. Backend returns List<Category> JSON
6. Models parse JSON with fromJson()
7. FutureBuilder displays in ListView
8. User clicks category → filterProducts()
```

### Fetching Products:
```
1. Category selected
2. ApiService.fetchProductsByCategory(categoryId)
3. Calls /product/search?categoryId=X
4. Backend returns List<Product> JSON
5. GridView displays in 2-column layout
6. Each card shows image, price, rating, discount
```

## 🌐 Flutter Web Specifics

### CORS Handling
✅ Automatically handled by Flutter Web for localhost
✅ API Gateway configured to allow localhost origins
✅ No additional CORS headers needed for development

### Image Loading
✅ Uses Image.network() for remote URLs
✅ Fallback to placeholder on error
✅ Loading indicator while fetching
✅ BoxFit.cover for professional appearance

### Responsive Design
✅ Adapts to desktop browser sizes
✅ Category carousel: Horizontal scrolling
✅ Product grid: 2 columns on desktop
✅ Touch-friendly tap targets

## 🧪 Testing the Integration

### 1. Check Categories Load
- Open DevTools (F12)
- Network tab should show: `GET /api/categories`
- Response contains array of categories

### 2. Check Products Load
- Same Network tab
- Look for: `GET /product`
- Response contains product array with images

### 3. Test Category Filter
- Click on a category in the carousel
- Network tab shows: `GET /product/search?categoryId=X`
- Grid updates with filtered products

## ⚠️ Common Issues & Fixes

### Issue: "Connection Refused"
```bash
# Check if API Gateway is running
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Restart API Gateway
cd api-gateway
mvn clean spring-boot:run
```

### Issue: "No Products Show"
```bash
# Check if Marketplace Platform is running
lsof -i :8001  # macOS/Linux

# Check database has data
# View logs in Marketplace Platform terminal
```

### Issue: Images Not Loading
```
# In browser DevTools, check Network tab for image URLs
# Ensure image_url field has valid URLs in database
# Check CORS headers on image response
```

### Issue: Slow Loading
```
# Use DevTools Performance tab
# Check Network waterfall to find bottleneck
# Reduce API response size with pagination
```

## 📚 File Reference

### Core Files Created

| File | Purpose | Key Classes |
|------|---------|------------|
| `lib/models/category.dart` | Category data model | `Category` |
| `lib/models/product.dart` | Product data model | `Product` |
| `lib/services/api_service.dart` | HTTP client for APIs | `ApiService` |
| `lib/pages/home_page.dart` | Main marketplace UI | `HomePage` |
| `lib/main.dart` | App entry & routing | `MyApp` |
| `web/index.html` | Web entry point | (HTML) |
| `pubspec.yaml` | Dependencies | (YAML) |

### Documentation

| File | Content |
|------|---------|
| `FLUTTER_WEB_SETUP.md` | Comprehensive setup guide |
| `QUICKSTART_GUIDE.md` | This file |

## 🎨 UI Layout Breakdown

### Header
```
┌─────────────────────────┐
│ Marketplace    [Cart]   │
└─────────────────────────┘
```

### Categories Carousel (Horizontal Scrolling)
```
┌─────────────────────────────────────────┐
│ Categories:                             │
│ [All] [📱] [💻] [📦] [👕] [📚] ...    │ ← Scroll right
└─────────────────────────────────────────┘
```

### Products Grid (2-Column Layout)
```
┌────────────────┐  ┌────────────────┐
│   [Image]      │  │   [Image]      │
│   Product 1    │  │   Product 2    │
│   $Price       │  │   $Price       │
│   ⭐ Rating    │  │   ⭐ Rating    │
└────────────────┘  └────────────────┘
┌────────────────┐  ┌────────────────┐
│   [Image]      │  │   [Image]      │
│   Product 3    │  │   Product 4    │
│   $Price       │  │   $Price       │
│   ⭐ Rating    │  │   ⭐ Rating    │
└────────────────┘  └────────────────┘
```

## 🚀 Next: Advanced Features to Add

1. **Product Search Bar** - Add search input in header
2. **Product Detail Page** - Click product → detail view
3. **Shopping Cart** - Add to cart functionality
4. **User Authentication** - Login/signup integration
5. **Favorites/Wishlist** - Save favorite products
6. **Pagination** - Load more products
7. **Filters** - Price range, rating, etc.

## 📞 API Reference Quick Lookup

### Fetch All Categories
```dart
List<Category> categories = await ApiService.fetchCategories();
// GET /api/categories
```

### Fetch All Products
```dart
List<Product> products = await ApiService.fetchAllProducts();
// GET /product
```

### Search Products
```dart
List<Product> results = await ApiService.searchProducts(
  keyword: 'laptop',
  categoryId: 1,
  minPrice: 10000,
  maxPrice: 50000,
  page: 1,
  limit: 24,
);
// GET /product/search?keyword=...&categoryId=...&minPrice=...&maxPrice=...
```

### Filter by Category
```dart
List<Product> categoryProducts = 
  await ApiService.fetchProductsByCategory(1);
// GET /product/search?categoryId=1
```

## ✅ Verification Checklist

- [ ] API Gateway running on 8000
- [ ] Marketplace Platform running on 8001
- [ ] `flutter pub get` completed successfully
- [ ] `flutter run -d chrome` launched the app
- [ ] Categories appear in horizontal carousel
- [ ] Products display in 2-column grid
- [ ] Category filter works
- [ ] Images load properly
- [ ] No error messages in console
- [ ] Network tab shows successful API calls

## 🎓 Learning Resources

- [Flutter Official Docs](https://flutter.dev/docs)
- [Dart HTTP Package](https://pub.dev/packages/http)
- [Material Design 3](https://material.io/design)
- [Spring Cloud Gateway](https://cloud.spring.io/spring-cloud-gateway/)

---

**You're all set!** 🎉 Your Flutter Web app is now connected to your Spring Boot microservices.

For detailed configuration and troubleshooting, see **FLUTTER_WEB_SETUP.md**
