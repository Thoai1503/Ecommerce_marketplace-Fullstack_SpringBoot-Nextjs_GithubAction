import 'dart:async';

import 'package:flutter/foundation.dart' as foundation;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/api_client.dart';
import 'features/auth/pages/login_page.dart';
import 'features/cart/pages/cart_page.dart';
import 'features/home/pages/home_page.dart';
import 'features/product/pages/product_detail_page.dart';
import 'features/voucher/pages/voucher_page.dart';
import 'features/auth/pages/profile_page.dart';
import 'filter_page.dart';
import 'services/auth_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize API clients with interceptors
  ApiClient.initialize();

  // Restore auth session before rendering the app so HomePage can safely
  // render guest mode without requiring an auth gate wrapper.
  await AuthService().initializeSession();

  // Global Flutter error handler for better diagnostics
  FlutterError.onError = (details) {
    debugPrint('[FlutterError] ${details.exception}');
    debugPrint(details.stack?.toString() ?? 'no-stack');
    if (foundation.kDebugMode) FlutterError.dumpErrorToConsole(details);
  };

  // Provide a global ErrorWidget so build-time exceptions render a friendly UI
  ErrorWidget.builder = (FlutterErrorDetails details) {
    final exception = details.exception;
    debugPrint('[ErrorWidget] $exception');
    return Scaffold(body: Center(child: Text('Build error: $exception')));
  };

  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NEXAMART - Ecommerce Marketplace',
      theme: ThemeData(
        useMaterial3: true,
        primarySwatch: Colors.blue,
        primaryColor: Colors.blue,
        scaffoldBackgroundColor: const Color(0xFFF8F9FB),
        appBarTheme: const AppBarTheme(
          elevation: 1,
          backgroundColor: Colors.white,
          foregroundColor: Colors.black,
        ),
        cardTheme: const CardThemeData(
          elevation: 2,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(12)),
          ),
        ),
      ),
      debugShowCheckedModeBanner: false,
      // ✅ GUEST MODE: App goes directly to HomePage, no AuthGate wrapper
      home: const HomePage(),
      routes: {
        '/home': (_) => const HomePage(),
        '/filter': (_) => const FilterPage(),
        '/cart': (_) => const CartPage(),
        '/product-detail': (_) => const ProductDetailPage(),
        '/profile': (_) => const ProfilePage(),
        '/vouchers': (_) => const VoucherPage(),
        '/login': (_) => const LoginPage(),
      },
    );
  }
}
