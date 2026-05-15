import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/api_client.dart';
import '../core/constants.dart';

/// Global auth state notifier - broadcasts login status changes
class _AuthStateNotifier {
  static final _instance = _AuthStateNotifier._internal();
  bool _isLoggedIn = false;

  factory _AuthStateNotifier() => _instance;
  _AuthStateNotifier._internal();

  bool get isLoggedIn => _isLoggedIn;

  void setLoggedIn(bool value) {
    _isLoggedIn = value;
    debugPrint('[AuthState] Login status changed to: $_isLoggedIn');
  }
}

class AuthService {
  /// Use dedicated auth service client
  final Dio dio = ApiClient.authDio;
  static const String _tokenKey = 'auth_token';
  static const String _userIdKey = 'user_id';
  static const String _emailKey = 'user_email';
  static const String _fullNameKey = 'user_full_name';
  static final _authState = _AuthStateNotifier();

  /// Maximum retry attempts for login
  static const int _maxRetries = 3;

  /// Get stored authentication token from local storage
  Future<String?> getStoredToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  /// Get stored user ID from local storage
  Future<int?> getStoredUserId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt(_userIdKey);
  }

  /// Get stored user email from local storage
  Future<String?> getStoredEmail() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_emailKey);
  }

  /// Get stored user full name from local storage
  Future<String?> getStoredFullName() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_fullNameKey);
  }

  /// Check if user is already logged in
  Future<bool> isLoggedIn() async {
    final token = await getStoredToken();
    final userId = await getStoredUserId();
    final loggedIn = token != null && userId != null;
    debugPrint(
      '[AuthService] isLoggedIn check: $loggedIn (token: ${token != null}, userId: $userId)',
    );
    return loggedIn;
  }

  /// Get current login status (non-async)
  bool get isLoggedInSync => _authState.isLoggedIn;

  /// Force sync check from storage (use when needed)
  Future<bool> isLoggedInSyncFresh() async {
    return await isLoggedIn();
  }

  /// Perform real login using Marketplace-platform auth endpoint with retry mechanism
  /// Logs in with test account credentials and stores JWT token + userId
  Future<Map<String, dynamic>> login({
    String email = testAuthEmail,
    String password = testAuthPassword,
    int retryCount = 0,
  }) async {
    try {
      debugPrint(
        '[AuthService] Attempting login (attempt ${retryCount + 1}/$_maxRetries) with email: $email',
      );

      // Call Marketplace-platform /api/v1/auth/login endpoint
      final response = await dio.post(
        '/user/login',
        data: {'email': email, 'password': password},
      );

      debugPrint(
        '[AuthService] Login response received: ${response.statusCode}',
      );

      final data = response.data;
      debugPrint('[AuthService] Response data: $data');

      // Parse response - handle multiple response structures
      final token =
          data['accessToken'] ??
          data['data']['token'] ??
          data['token'] ??
          data['access_token'];

      final userId =
          data['id'] ??
          data['data']?['user']?['id'] ??
          data['userId'] ??
          data['user_id'];

      final userEmail =
          data['email'] ?? data['data']?['user']?['email'] ?? email;
      final fullName =
          data['fullName'] ??
          data['data']?['user']?['fullName'] ??
          data['user']?['fullName'] ??
          data['user']?['name'] ??
          data['data']?['user']?['name'] ??
          '';

      if (token == null || userId == null) {
        final errorMsg =
            'Invalid login response: Missing token or userId. Response: $data';
        debugPrint('[AuthService] ERROR: $errorMsg');
        return {'success': false, 'error': errorMsg};
      }

      // Store token and userId in shared preferences
      final prefs = await SharedPreferences.getInstance();
      final userIdInt = userId is String ? int.parse(userId) : userId;

      await prefs.setString(_tokenKey, token);
      await prefs.setInt(_userIdKey, userIdInt);
      await prefs.setString(_emailKey, userEmail);
      await prefs.setString(_fullNameKey, fullName);

      // Add token to default headers for subsequent requests
      ApiClient.dio.options.headers['Authorization'] = 'Bearer $token';
      ApiClient.authDio.options.headers['Authorization'] = 'Bearer $token';
      ApiClient.cartDio.options.headers['Authorization'] = 'Bearer $token';

      // Update global auth state
      _authState.setLoggedIn(true);

      debugPrint('[AuthService] ✅ Login successful!');
      debugPrint('[AuthService]   User: $userIdInt');
      debugPrint('[AuthService]   Email: $userEmail');
      debugPrint('[AuthService]   Full name: $fullName');
      debugPrint(
        '[AuthService]   Token stored: ${prefs.containsKey(_tokenKey)}',
      );
      debugPrint('[AuthService]   Token length: ${token.length}');

      return {
        'success': true,
        'token': token,
        'userId': userIdInt,
        'email': userEmail,
      };
    } on DioException catch (e) {
      debugPrint('[AuthService] ❌ DioException: ${e.type}');
      debugPrint('[AuthService]   Message: ${e.message}');
      debugPrint('[AuthService]   Response status: ${e.response?.statusCode}');

      // Retry on connection error (max 3 attempts)
      if ((e.type == DioExceptionType.connectionError ||
              e.type == DioExceptionType.receiveTimeout) &&
          retryCount < _maxRetries - 1) {
        debugPrint(
          '[AuthService] 🔄 Retrying login after ${(retryCount + 1) * 2} seconds...',
        );
        await Future.delayed(Duration(seconds: (retryCount + 1) * 2));
        return login(
          email: email,
          password: password,
          retryCount: retryCount + 1,
        );
      }

      final String fallbackMessage = e.message ?? 'Unknown connection error';
      final bool isConnectionError =
          e.type == DioExceptionType.connectionError ||
          e.type == DioExceptionType.receiveTimeout;
      final errorMsg = isConnectionError
          ? 'Backend unreachable or CORS issue: $fallbackMessage'
          : 'Login failed: $fallbackMessage (status: ${e.response?.statusCode})';
      return {'success': false, 'error': errorMsg, 'dio_error': true};
    } catch (e) {
      debugPrint('[AuthService] ❌ Unexpected error during login: $e');
      final errorMsg = 'Unexpected error: $e';
      return {'success': false, 'error': errorMsg};
    }
  }

  /// Initialize session from stored credentials
  /// This is called on app startup to restore user session
  /// With automatic retry on connection failure
  Future<bool> initializeSession({int retryCount = 0}) async {
    try {
      final token = await getStoredToken();
      final userId = await getStoredUserId();

      debugPrint('[AuthService] ========================================');
      debugPrint('[AuthService] Initializing session...');
      debugPrint('[AuthService] Token found: ${token != null}');
      debugPrint('[AuthService] UserId found: $userId');
      debugPrint('[AuthService] ========================================');

      if (token != null && userId != null) {
        // Add token to default headers
        ApiClient.dio.options.headers['Authorization'] = 'Bearer $token';
        ApiClient.authDio.options.headers['Authorization'] = 'Bearer $token';
        ApiClient.cartDio.options.headers['Authorization'] = 'Bearer $token';

        // Update global auth state
        _authState.setLoggedIn(true);

        debugPrint('[AuthService] ✅ Session restored: User $userId');
        return true;
      }

      _authState.setLoggedIn(false);
      return false;
    } catch (e) {
      debugPrint('[AuthService] ❌ Session initialization error: $e');
      _authState.setLoggedIn(false);
      return false;
    }
  }

  /// Logout user and clear stored credentials
  Future<void> logout() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_tokenKey);
      await prefs.remove(_userIdKey);
      await prefs.remove(_emailKey);
      await prefs.remove(_fullNameKey);

      // Remove token from all API clients
      ApiClient.dio.options.headers.remove('Authorization');
      ApiClient.authDio.options.headers.remove('Authorization');
      ApiClient.cartDio.options.headers.remove('Authorization');

      // Update global auth state
      _authState.setLoggedIn(false);

      debugPrint('[AuthService] User logged out');
    } catch (e) {
      debugPrint('[AuthService] Logout error: $e');
      _authState.setLoggedIn(false);
    }
  }

  /// Verify token is still valid by calling /api/v1/auth/verify endpoint
  Future<bool> verifyToken() async {
    try {
      final response = await dio.get('/api/v1/auth/verify');
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Token verification failed: $e');
      return false;
    }
  }
}
