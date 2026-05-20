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
      onGenerateRoute: (RouteSettings settings) {
        final isLoggedIn = AuthService().isLoggedInSync;

        Widget page;
        switch (settings.name) {
          case '/':
            page = isLoggedIn ? const HomePage() : const LoginPage();
            break;
          case '/filter':
            page = isLoggedIn ? const FilterPage() : const LoginPage();
            break;
          case '/cart':
            page = isLoggedIn ? const CartPage() : const LoginPage();
            break;
          case '/product-detail':
            page = isLoggedIn ? const ProductDetailPage() : const LoginPage();
            break;
          case '/profile':
            page = isLoggedIn ? const ProfilePage() : const LoginPage();
            break;
          case '/vouchers':
            page = isLoggedIn ? const VoucherPage() : const LoginPage();
            break;
          case '/login':
            page = isLoggedIn ? const HomePage() : const LoginPage();
            break;
          default:
            page = isLoggedIn ? const HomePage() : const LoginPage();
        }

        return MaterialPageRoute(builder: (_) => page, settings: settings);
      },
    );
  }
}
