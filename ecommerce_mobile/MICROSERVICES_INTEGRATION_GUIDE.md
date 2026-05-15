# Microservices Integration Testing Guide

## Quick Start

### 1. Ensure All Backend Services are Running

```bash
# Terminal 1: Marketplace-platform (Auth Service) - Port 8010
cd Marketplace-platform
./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=local"

# Terminal 2: Cart-service - Port 8003
cd cart-service
./mvnw spring-boot:run

# Terminal 3: API Gateway - Port 8000
cd api-gateway
./mvnw spring-boot:run
```

### 2. Update Backend Database

Ensure test user exists:
```sql
-- Add to your database
INSERT INTO users (email, password, name, full_name, user_type, role)
VALUES ('admin@nexamart.com', 'hashed_password_of_Admin@123', 'Admin', 'Administrator', 'admin', 'ADMIN');
```

### 3. Start Flutter App

```bash
cd ecommerce_mobile
flutter run -d chrome  # or your device
```

---

## Expected Behavior

### On App Startup
1. App initializes API clients with interceptors
2. AuthService checks shared_preferences for stored token
3. If no token found:
   - Performs auto-login with admin@nexamart.com / Admin@123
   - Receives JWT token from Marketplace-platform
   - Stores token + userId in shared_preferences
   - Injects Bearer token to all API clients
4. App loads home page with real user context

### When Adding Product to Cart
1. User clicks product → navigates to ProductDetailPage
2. User sets quantity and clicks "Add to Cart"
3. CartService calls POST /api/cart (cart-service:8003)
4. Request includes real userId from AuthService
5. Cart updated on backend
6. Success notification shown to user

### When Viewing Cart
1. User clicks cart icon
2. CartPage calls CartService.getCart()
3. Fetches GET /api/cart/user/{userId}
4. Displays items with professional layout
5. Order summary shows real calculations

---

## API Endpoint Reference

### Auth Service (Marketplace-platform) - Port 8010

#### POST /auth/login
**Request:**
```json
{
  "email": "admin@nexamart.com",
  "password": "Admin@123"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "admin@nexamart.com",
  "fullName": "Administrator",
  "accessToken": "eyJhbGc...",
  "tokenType": "Bearer",
  "expiresIn": 86400,
  "user": {
    "id": 1,
    "email": "admin@nexamart.com",
    "name": "Admin",
    "role": "ADMIN"
  }
}
```

#### GET /auth/verify
**Headers:** Authorization: Bearer {token}
**Response (200 OK):** Token is valid

---

### Cart Service - Port 8003

#### GET /api/cart/user/{userId}
**Headers:** Authorization: Bearer {token}
**Response (200 OK):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "product": {
      "id": 101,
      "product_name": "Product Name",
      "price": 29.99
    },
    "quantity": 2,
    "added_at": "2024-01-01T10:00:00"
  }
]
```

#### POST /api/cart
**Headers:** Authorization: Bearer {token}
**Request:**
```json
{
  "product_id": 101,
  "user_id": 1,
  "quantity": 1
}
```
**Response (201 Created):**
```json
{
  "id": 1,
  "product_id": 101,
  "quantity": 1
}
```

#### PUT /api/cart/{cartItemId}
**Headers:** Authorization: Bearer {token}
**Request:**
```json
{
  "quantity": 3
}
```
**Response (200 OK):** Item updated

#### DELETE /api/cart/{cartItemId}
**Headers:** Authorization: Bearer {token}
**Response (204 No Content):** Item deleted

---

## Troubleshooting

### Issue: "Connection refused on localhost:8010"
**Solution:** Ensure Marketplace-platform is running on port 8010
```bash
# Check if service is running
netstat -an | grep 8010

# Or restart service with correct port
./mvnw spring-boot:run -Dspring-boot.run.arguments="--server.port=8010"
```

### Issue: "Login error: null"
**Solution:** Check database has admin user with correct credentials
```sql
SELECT * FROM users WHERE email = 'admin@nexamart.com';
```

### Issue: "User not logged in" when adding to cart
**Solution:** Ensure auth session is initialized
- Check shared_preferences has auth_token: `flutter pub run shared_preferences_test`
- Verify token is valid and not expired

### Issue: "Cart items not showing"
**Solution:** Verify cart-service is running on port 8003
```bash
# Test endpoint directly
curl -H "Authorization: Bearer {token}" http://localhost:8003/api/cart/user/1
```

### Issue: "CORS errors"
**Solution:** Ensure API Gateway has CORS enabled for http://localhost:*
- Check Marketplace-platform application.properties
- Verify cart-service allows requests from Flutter (localhost:*)

---

## Local Development Environment Variables

Create `.env` file in ecommerce_mobile:
```
# Backend Services
AUTH_SERVICE_URL=http://localhost:8010
CART_SERVICE_URL=http://localhost:8003
ORDER_SERVICE_URL=http://localhost:8004
PAYMENT_SERVICE_URL=http://localhost:8005

# Test Credentials
TEST_EMAIL=admin@nexamart.com
TEST_PASSWORD=Admin@123
TEST_USER_ID=1
```

Update `lib/core/constants.dart` to load from .env if needed.

---

## Debugging Tips

### Enable Full Logging
In `lib/main.dart`:
```dart
// Add to ApiClient initialization
if (kDebugMode) {
  ApiClient.dio.interceptors.add(LoggingInterceptor());
  ApiClient.authDio.interceptors.add(LoggingInterceptor());
  ApiClient.cartDio.interceptors.add(LoggingInterceptor());
}
```

### Check Stored Credentials
```dart
// Add to debug console
final authService = AuthService();
print('Token: ${await authService.getStoredToken()}');
print('UserId: ${await authService.getStoredUserId()}');
print('Email: ${await authService.getStoredEmail()}');
```

### Monitor Network Requests
- Use Chrome DevTools (F12) if running on web
- Use Android Studio logcat for Android
- Use Xcode console for iOS

---

## Performance Considerations

### Token Management
- Current: Token stored indefinitely
- Recommended: Add token expiration check
- Future: Implement refresh token rotation

### API Response Caching
- Cart items are fetched fresh on each view
- Consider implementing cache for performance
- Use Riverpod to cache cart state

### Error Handling
- Current: Basic try-catch with debugPrint
- Recommended: Add user-facing error messages
- Future: Implement exponential backoff retry logic

---

## Integration Checklist

- [ ] All backend services running
- [ ] Test user created in database
- [ ] Flutter app builds without errors
- [ ] App auto-logs in on startup
- [ ] Token stored in shared_preferences
- [ ] Product detail page shows correctly
- [ ] Add to cart works with real userId
- [ ] Cart displays items from backend
- [ ] Order summary calculations correct
- [ ] Logout clears stored credentials

---

## Production Deployment

### Environment-Specific Configuration

**Development (localhost)**
```dart
const String authServiceUrl = 'http://localhost:8010';
const String cartServiceUrl = 'http://localhost:8003';
```

**Staging**
```dart
const String authServiceUrl = 'http://staging-auth.example.com';
const String cartServiceUrl = 'http://staging-cart.example.com';
```

**Production**
```dart
const String authServiceUrl = 'https://auth.nexamart.com';
const String cartServiceUrl = 'https://api.nexamart.com/cart';
```

Use build configurations to switch:
```bash
flutter run --dart-define=ENVIRONMENT=production
```

---

## References

- Marketplace-platform: `/Marketplace-platform/README.md`
- Cart-service: `/cart-service/README.md`
- API Gateway: `/api-gateway/README.md`
- Flutter Riverpod: https://riverpod.dev
- Dio HTTP Client: https://pub.dev/packages/dio

