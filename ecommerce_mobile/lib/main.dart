import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'features/home/pages/home_page.dart';
import 'filter_page.dart';
import 'features/cart/pages/cart_page.dart';
import 'features/product/pages/product_detail_page.dart';
import 'features/auth/pages/login_page.dart';
import 'features/auth/pages/profile_page.dart';
import 'core/api_client.dart';
import 'services/auth_service.dart';
import 'features/voucher/pages/voucher_page.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize API clients with interceptors
  ApiClient.initialize();
  // Restore session (reads token from storage before first API calls)
  await AuthService().initializeSession();

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
      initialRoute: '/login',
      routes: {
        '/': (context) => const HomePage(),
        '/filter': (context) => const FilterPage(),
        '/cart': (context) => const CartPage(),
        '/product-detail': (context) => const ProductDetailPage(),
        '/login': (context) => const LoginPage(),
        '/profile': (context) => const ProfilePage(),
        '/vouchers': (context) => AuthService().isLoggedInSync
            ? const VoucherPage()
            : const LoginPage(),
      },
    );
  }
}
