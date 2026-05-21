import 'package:flutter/material.dart';
import '../../../../services/auth_service.dart';
import '../../../../features/auth/pages/login_page.dart' as auth_pages;

class WebHeader extends StatelessWidget {
  const WebHeader({super.key});

  Future<void> _openProtectedRoute(BuildContext context, String route) async {
    final loggedIn = AuthService().isLoggedInSync;
    if (loggedIn) {
      Navigator.pushNamed(context, route);
      return;
    }

    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui lòng đăng nhập'),
          backgroundColor: Colors.orangeAccent,
        ),
      );
    }

    final result = await Navigator.of(context).push<bool>(
      MaterialPageRoute(builder: (_) => const auth_pages.LoginPage()),
    );

    if (result == true && context.mounted) {
      Navigator.pushNamed(context, route);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 80,
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Row(
        children: [
          // Logo
          InkWell(
            onTap: () => Navigator.pushNamed(context, '/'),
            child: const Text(
              'NexaMart',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.blue,
              ),
            ),
          ),
          const SizedBox(width: 48),
          // Search Bar
          Expanded(
            child: Container(
              height: 48,
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(24),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      decoration: InputDecoration(
                        hintText: 'Search products...',
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16,
                        ),
                      ),
                    ),
                  ),
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: Colors.blue,
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: const Icon(Icons.search, color: Colors.white),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 48),
          // Action Icons + user name
          Row(
            children: [
              IconButton(
                onPressed: () => _openProtectedRoute(context, '/cart'),
                icon: const Icon(Icons.shopping_cart_outlined),
                tooltip: 'Cart',
              ),
              IconButton(
                onPressed: () => _openProtectedRoute(context, '/vouchers'),
                icon: const Icon(Icons.notifications_outlined),
                tooltip: 'Notifications',
              ),
              IconButton(
                onPressed: () => _openProtectedRoute(context, '/profile'),
                icon: const Icon(Icons.person_outline),
                tooltip: 'Profile',
              ),
              const SizedBox(width: 12),
              FutureBuilder<String?>(
                future: AuthService().getStoredFullName(),
                builder: (context, snap) {
                  final name = snap.data;
                  if (name == null || name.isEmpty) return const SizedBox();
                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: Text(
                      name,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
        ],
      ),
    );
  }
}
