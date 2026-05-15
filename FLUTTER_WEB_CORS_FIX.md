# Flutter Web CORS & Login Fix - Implementation Guide

## Summary of Changes

This document outlines the fixes applied to resolve the `DioExceptionType.connectionError (XMLHttpRequest onError)` issue when logging in via Flutter Web.

### Problem
- Flutter Web running on a different port than the backend (e.g., localhost:5173) fails with CORS errors
- Using `127.0.0.1` in browser contexts can cause additional resolution issues
- Marketplace-platform auth controller lacked `@CrossOrigin` annotation

### Solution
1. **Backend URL Detection** — Dynamic routing based on platform (web vs. mobile)
2. **CORS Headers** — Added proper CORS headers to all Dio clients
3. **Backend CORS Support** — Added `@CrossOrigin(origins = "*")` to AuthController
4. **Error Messages** — Improved error messaging for connection failures
5. **Auth Endpoint** — Corrected login endpoint path to `/auth/login`

---

## Changes Made

### 1. Flutter Mobile App - `lib/core/constants.dart`

**Before:**
```dart
const String authServiceUrl = 'http://127.0.0.1:8010';
```

**After:**
```dart
import 'package:flutter/foundation.dart';

String _backendHost(int port) => 'http://${kIsWeb ? 'localhost' : '127.0.0.1'}:$port';

String get authServiceUrl => _backendHost(8010);
String get cartServiceUrl => _backendHost(8003);
String get stockServiceUrl => _backendHost(8009);
String get apiGatewayUrl => _backendHost(8000);

const Map<String, String> defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};
```

**Rationale:**
- When running on Flutter Web, `localhost` is properly resolved by the browser
- When running on mobile/desktop, `127.0.0.1` is used for loopback
- CORS headers are sent in all requests to signal intent to backend

### 2. Flutter Mobile App - `lib/core/api_client.dart`

**Updated Dio clients to use `defaultHeaders`:**
```dart
static final Dio dio = Dio(
  BaseOptions(
    baseUrl: apiGatewayUrl,
    connectTimeout: const Duration(seconds: 30),
    receiveTimeout: const Duration(seconds: 30),
    headers: {...defaultHeaders},  // Spread operator for consistency
  ),
);

// Same for authDio, cartDio, stockDio
```

**Rationale:**
- Ensures all clients inherit the same CORS headers
- Centralizes header management in constants

### 3. Flutter Mobile App - `lib/services/auth_service.dart`

**Login endpoint path corrected:**
```dart
final response = await dio.post(
  '/auth/login',  // Changed from '/api/v1/auth/login'
  data: {'email': email, 'password': password},
);
```

**Error message improved:**
```dart
final String fallbackMessage = e.message ?? 'Unknown connection error';
final bool isConnectionError =
    e.type == DioExceptionType.connectionError ||
    e.type == DioExceptionType.receiveTimeout;
final errorMsg = isConnectionError
    ? 'Backend unreachable or CORS issue: $fallbackMessage'
    : 'Login failed: $fallbackMessage (status: ${e.response?.statusCode})';
```

**Rationale:**
- AuthController is mapped to `/auth`, not `/api/v1/auth`
- Better error messaging helps diagnose CORS vs. backend issues
- Users now see "Backend unreachable or CORS issue" instead of just "Connection Error"

### 4. Marketplace-platform - `AuthController.java`

**Added @CrossOrigin annotation:**
```java
import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/auth")
public class AuthController {
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req, HttpServletResponse response) {
        // ...
    }
}
```

**Rationale:**
- Allows requests from any origin (sufficient for development)
- Complies with W3C CORS specification
- Browser no longer blocks preflight OPTIONS requests

---

## Running Flutter Web with CORS Disabled (Full Command)

When developing locally and hitting any remaining CORS issues:

```bash
flutter run -d chrome --web-browser-flag "--disable-web-security"
```

**Explanation:**
- `-d chrome` — Run on Chrome browser (or `edge`, `firefox`)
- `--web-browser-flag "--disable-web-security"` — Bypasses CORS restrictions
- **⚠️ WARNING:** This flag disables all browser security for that instance—use only during local development

**Alternative for development (recommended):**

If your backend and Flutter Web are running locally, the CORS fixes above should be sufficient. Only use `--disable-web-security` if you still encounter CORS issues after verifying:

1. ✅ Backend is running on localhost:8010
2. ✅ AuthController has `@CrossOrigin(origins = "*")`
3. ✅ Flutter Web is using `localhost` (not `127.0.0.1`)
4. ✅ Dio clients include CORS headers

---

## Testing the Fix

### Step 1: Start Backend Services

Ensure Marketplace-platform is running on port 8010:
```bash
# In Marketplace-platform root
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

Or via Docker:
```bash
docker run -p 8010:8000 marketplace-platform:latest
```

### Step 2: Run Flutter Web

```bash
cd ecommerce_mobile
flutter run -d chrome
```

### Step 3: Test Login

1. Navigate to login page (should be initial route `/login`)
2. Fill in test credentials:
   - Email: `tuletelu117@gmail.com`
   - Password: `tu422003`
3. Click "Login"
4. Expected: redirects to home page (`/`)
5. If error occurs, check browser console (F12) for detailed error message

### Debugging Tips

If login still fails:

1. **Check Network Tab (F12 → Network)**
   - Look for OPTIONS preflight request
   - Verify it returns 200 (not 403/405)
   - Check response headers for `Access-Control-Allow-Origin: *`

2. **Check Console (F12 → Console)**
   - Look for CORS error messages
   - Check Dio debug logs in VS Code debug console

3. **Verify Backend Endpoint**
   ```bash
   curl -X POST http://localhost:8010/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"tuletelu117@gmail.com","password":"tu422003"}'
   ```

4. **Enable Full Web Security Disable (Last Resort)**
   ```bash
   flutter run -d chrome --web-browser-flag "--disable-web-security"
   ```

---

## Configuration Reference

| Service | Port | URL (Web) | URL (Mobile) |
|---------|------|-----------|--------------|
| Marketplace-platform (Auth) | 8010 | `http://localhost:8010` | `http://127.0.0.1:8010` |
| Cart Service | 8003 | `http://localhost:8003` | `http://127.0.0.1:8003` |
| Stock Service | 8009 | `http://localhost:8009` | `http://127.0.0.1:8009` |
| API Gateway | 8000 | `http://localhost:8000` | `http://127.0.0.1:8000` |

---

## Files Modified

1. ✅ `ecommerce_mobile/lib/core/constants.dart` — Platform-aware URL detection
2. ✅ `ecommerce_mobile/lib/core/api_client.dart` — CORS headers in all clients
3. ✅ `ecommerce_mobile/lib/services/auth_service.dart` — Endpoint path + better error messages
4. ✅ `Marketplace-platform/src/main/java/.../controllers/AuthController.java` — @CrossOrigin annotation
5. ✅ `ecommerce_mobile/lib/features/auth/pages/login_page.dart` — Already configured ✓

---

## Next Steps

- [ ] Test login on Flutter Web with Chrome
- [ ] Verify token is stored in shared_preferences
- [ ] Test navigation to home page after login
- [ ] Test cart operations require valid token
- [ ] Test stock service integration

---

## Additional Resources

- [Flutter Web CORS & Cookies](https://flutter.dev/docs/development/platform-integration/web/embedding-flutter-web)
- [Dio CORS Headers](https://pub.dev/packages/dio)
- [Spring Boot @CrossOrigin](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/CrossOrigin.html)
- [MDN CORS Overview](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
