/// Microservices Configuration
/// These base URLs point to different Spring Boot microservices
library;

import 'package:flutter/foundation.dart';

/// ==================== BASE URL CONFIGURATION ====================
///
/// For Flutter Web: use localhost so browser requests target the local backend host.
/// For Flutter Mobile/Desktop: use the loopback IP address unless your device uses another host.
///
/// NOTE: When running Flutter Web in a browser with disabled web security:
/// flutter run -d chrome --web-browser-flag "--disable-web-security"
///
/// This bypasses CORS restrictions during local development.

String _backendHost(int port) =>
    'http://${kIsWeb ? 'localhost' : '127.0.0.1'}:$port';

/// Marketplace-platform (Auth Service) - Port 8001
String get authServiceUrl => _backendHost(8001);

/// Cart-service - Handles shopping cart operations - Port 8003
String get cartServiceUrl => _backendHost(8003);

/// Stock-service - Handles inventory quantity lookups - Port 8009
String get stockServiceUrl => _backendHost(8009);

/// Order-service - Handles orders (future integration) - Port 8004
String get orderServiceUrl => _backendHost(8004);

/// Payment-service - Handles payments (future integration) - Port 8005
String get paymentServiceUrl => _backendHost(8005);

/// API Gateway (fallback) - Routes to all services - Port 8000
String get apiGatewayUrl => _backendHost(8000);

/// Legacy base URL (kept for backward compatibility)
String get apiBaseUrl => apiGatewayUrl;

/// ==================== CORS & HEADERS ====================
/// These headers are added to all API requests to avoid CORS issues during development.
const Map<String, String> defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

/// ==================== SHARED PREFERENCES KEYS ====================
const String accessTokenKey = 'accessToken';
const String refreshTokenKey = 'refreshToken';
const String expiresInKey = 'expiresIn';

/// ==================== AUTH CREDENTIALS ====================
/// Test account credentials for auto-login
const String testAuthEmail = 'tuletelu117@gmail.com';
const String testAuthPassword = 'tu422003';
