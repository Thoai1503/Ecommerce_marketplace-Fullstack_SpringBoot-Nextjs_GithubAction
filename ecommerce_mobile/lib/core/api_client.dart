import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'constants.dart';

/// Main API client with configurable base URL
/// Default uses API Gateway, but can be overridden for specific microservices
class ApiClient {
  static final Dio dio = Dio(
    BaseOptions(
      baseUrl: apiGatewayUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {...defaultHeaders},
    ),
  );

  /// Dedicated Auth Service client (points to Marketplace-platform)
  static final Dio authDio = Dio(
    BaseOptions(
      baseUrl: authServiceUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {...defaultHeaders},
    ),
  );

  /// Dedicated Cart Service client (points to cart-service)
  static final Dio cartDio = Dio(
    BaseOptions(
      baseUrl: cartServiceUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {...defaultHeaders},
    ),
  );

  /// Dedicated Stock Service client (points to stock-service)
  static final Dio stockDio = Dio(
    BaseOptions(
      baseUrl: stockServiceUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {...defaultHeaders},
    ),
  );

  /// Initialize API interceptors and auth headers
  static void initialize() {
    debugPrint('[ApiClient] Initializing API client with base URLs:');
    debugPrint('  Gateway: $apiGatewayUrl');
    debugPrint('  Auth: $authServiceUrl');
    debugPrint('  Cart: $cartServiceUrl');

    // Add interceptor to include auth token in all requests
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          _addAuthHeaders(options);
          debugPrint(
            '[ApiClient.dio] Request: ${options.method} ${options.path}',
          );
          return handler.next(options);
        },
        onError: (error, handler) {
          debugPrint('[ApiClient.dio] Error: ${error.message}');
          return handler.next(error);
        },
      ),
    );

    // Same for auth dio
    authDio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          _addAuthHeaders(options);
          debugPrint(
            '[ApiClient.authDio] Request: ${options.method} ${options.path}',
          );
          return handler.next(options);
        },
        onError: (error, handler) {
          debugPrint('[ApiClient.authDio] Error: ${error.message}');
          return handler.next(error);
        },
      ),
    );

    // Same for cart dio
    cartDio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          _addAuthHeaders(options);
          debugPrint(
            '[ApiClient.cartDio] Request: ${options.method} ${options.path}',
          );
          return handler.next(options);
        },
        onError: (error, handler) {
          debugPrint('[ApiClient.cartDio] Error: ${error.message}');
          return handler.next(error);
        },
      ),
    );

    // Stock service Dio client
    stockDio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          _addAuthHeaders(options);
          debugPrint(
            '[ApiClient.stockDio] Request: ${options.method} ${options.path}',
          );
          return handler.next(options);
        },
        onError: (error, handler) {
          debugPrint('[ApiClient.stockDio] Error: ${error.message}');
          return handler.next(error);
        },
      ),
    );
  }

  /// Add authorization header to request
  static Future<void> _addAuthHeaders(RequestOptions options) async {
    final token = await _getStoredToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
      debugPrint('[ApiClient] Bearer token added to request');
    } else {
      debugPrint('[ApiClient] No token found - request sent without auth');
    }
  }

  /// Get stored authentication token
  static Future<String?> _getStoredToken() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('auth_token');
      if (token != null) {
        debugPrint(
          '[ApiClient] Token retrieved from storage (length: ${token.length})',
        );
      }
      return token;
    } catch (e) {
      debugPrint('[ApiClient] Error retrieving token: $e');
      return null;
    }
  }
}

class HttpError implements Exception {
  final int? status;
  final String message;
  final Map<String, dynamic>? errors;
  final int? code;
  final bool error;

  HttpError({
    this.status,
    required this.message,
    this.errors,
    this.code,
    this.error = true,
  });

  @override
  String toString() {
    return 'HttpError(status: $status, message: $message, code: $code, errors: $errors)';
  }

  factory HttpError.fromResponse(http.Response response) {
    String message = 'Request failed with status ${response.statusCode}';
    Map<String, dynamic>? errors;
    int? code;

    try {
      final body = jsonDecode(response.body);
      if (body is Map<String, dynamic>) {
        message =
            body['message']?.toString() ?? body['error']?.toString() ?? message;
        final rawErrors = body['errors'];
        if (rawErrors is Map<String, dynamic>) {
          errors = rawErrors;
        } else if (rawErrors != null) {
          errors = {'errors': rawErrors};
        }
        code = body['code'] is int
            ? body['code'] as int
            : int.tryParse(body['code']?.toString() ?? '');
      }
    } catch (_) {
      // Ignore JSON parse problems and use default message.
    }

    return HttpError(
      status: response.statusCode,
      message: message,
      errors: errors,
      code: code,
    );
  }

  factory HttpError.fromException(Exception exception) {
    return HttpError(message: exception.toString(), error: true);
  }
}

class BaseApiService {
  final String baseUrl;
  final http.Client client;

  BaseApiService({String? baseUrl, http.Client? client})
    : baseUrl = baseUrl ?? apiBaseUrl,
      client = client ?? http.Client();

  Future<Uri> _buildUri(
    String path, [
    Map<String, String>? queryParameters,
  ]) async {
    final normalizedPath = path.startsWith('/') ? path : '/$path';
    return Uri.parse(
      '$baseUrl$normalizedPath',
    ).replace(queryParameters: queryParameters);
  }

  Future<String?> _getAccessToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(accessTokenKey);
  }

  Future<String?> _getRefreshToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(refreshTokenKey);
  }

  Future<void> _saveTokens({
    required String accessToken,
    String? refreshToken,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(accessTokenKey, accessToken);
    if (refreshToken != null) {
      await prefs.setString(refreshTokenKey, refreshToken);
    }
  }

  Future<void> _clearTokens() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(accessTokenKey);
    await prefs.remove(refreshTokenKey);
    await prefs.remove(expiresInKey);
  }

  Future<Map<String, String>> _buildHeaders(
    Map<String, String>? headers, {
    bool withAuth = true,
  }) async {
    final defaultHeaders = <String, String>{
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    if (headers != null) {
      defaultHeaders.addAll(headers);
    }

    if (withAuth) {
      final accessToken = await _getAccessToken();
      if (accessToken != null && accessToken.isNotEmpty) {
        defaultHeaders['Authorization'] = 'Bearer $accessToken';
      }
    }

    return defaultHeaders;
  }

  Future<bool> _refreshToken() async {
    final refreshToken = await _getRefreshToken();
    if (refreshToken == null || refreshToken.isEmpty) {
      await _clearTokens();
      return false;
    }

    final uri = await _buildUri('/auth/refresh');
    final response = await client.post(
      uri,
      headers: await _buildHeaders(null, withAuth: false),
      body: jsonEncode({'refreshToken': refreshToken}),
    );

    if (response.statusCode != 200) {
      await _clearTokens();
      return false;
    }

    final responseBody = jsonDecode(response.body);
    final payload =
        responseBody is Map<String, dynamic> && responseBody.containsKey('data')
        ? responseBody['data']
        : responseBody;

    if (payload is! Map<String, dynamic>) {
      await _clearTokens();
      return false;
    }

    final newAccessToken = payload['accessToken'] ?? payload['token'];
    final newRefreshToken = payload['refreshToken'] ?? payload['refresh_token'];

    if (newAccessToken is String && newAccessToken.isNotEmpty) {
      await _saveTokens(
        accessToken: newAccessToken,
        refreshToken: newRefreshToken is String && newRefreshToken.isNotEmpty
            ? newRefreshToken
            : refreshToken,
      );
      return true;
    }

    await _clearTokens();
    return false;
  }

  Future<http.Response> _executeRequest(
    Future<http.Response> Function() requestFactory,
  ) async {
    final response = await requestFactory();
    if (response.statusCode == 401) {
      final refreshed = await _refreshToken();
      if (refreshed) {
        return await requestFactory();
      }
    }
    return response;
  }

  Future<T> _decodeResponse<T>(
    http.Response response,
    T Function(dynamic json) decoder,
  ) async {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      final decodedJson = response.body.isEmpty
          ? null
          : jsonDecode(response.body);
      return decoder(decodedJson);
    }
    throw HttpError.fromResponse(response);
  }

  Future<T> get<T>(
    String path, {
    required T Function(dynamic json) decoder,
    Map<String, String>? queryParameters,
    Map<String, String>? headers,
    bool withAuth = true,
  }) async {
    try {
      final uri = await _buildUri(path, queryParameters);
      final response = await _executeRequest(() async {
        return client.get(
          uri,
          headers: await _buildHeaders(headers, withAuth: withAuth),
        );
      });
      return _decodeResponse(response, decoder);
    } on HttpError {
      rethrow;
    } catch (e) {
      throw HttpError.fromException(e as Exception);
    }
  }

  Future<T> post<T>(
    String path, {
    required T Function(dynamic json) decoder,
    Map<String, String>? queryParameters,
    Map<String, String>? headers,
    Object? body,
    bool withAuth = true,
  }) async {
    try {
      final uri = await _buildUri(path, queryParameters);
      final response = await _executeRequest(() async {
        return client.post(
          uri,
          headers: await _buildHeaders(headers, withAuth: withAuth),
          body: body != null ? jsonEncode(body) : null,
        );
      });
      return _decodeResponse(response, decoder);
    } on HttpError {
      rethrow;
    } catch (e) {
      throw HttpError.fromException(e as Exception);
    }
  }

  Future<T> put<T>(
    String path, {
    required T Function(dynamic json) decoder,
    Map<String, String>? queryParameters,
    Map<String, String>? headers,
    Object? body,
    bool withAuth = true,
  }) async {
    try {
      final uri = await _buildUri(path, queryParameters);
      final response = await _executeRequest(() async {
        return client.put(
          uri,
          headers: await _buildHeaders(headers, withAuth: withAuth),
          body: body != null ? jsonEncode(body) : null,
        );
      });
      return _decodeResponse(response, decoder);
    } on HttpError {
      rethrow;
    } catch (e) {
      throw HttpError.fromException(e as Exception);
    }
  }

  Future<T> delete<T>(
    String path, {
    required T Function(dynamic json) decoder,
    Map<String, String>? queryParameters,
    Map<String, String>? headers,
    Object? body,
    bool withAuth = true,
  }) async {
    try {
      final uri = await _buildUri(path, queryParameters);
      final response = await _executeRequest(() async {
        return client.delete(
          uri,
          headers: await _buildHeaders(headers, withAuth: withAuth),
          body: body != null ? jsonEncode(body) : null,
        );
      });
      return _decodeResponse(response, decoder);
    } on HttpError {
      rethrow;
    } catch (e) {
      throw HttpError.fromException(e as Exception);
    }
  }
}
