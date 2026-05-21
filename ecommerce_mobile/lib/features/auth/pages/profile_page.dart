import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/widgets/layout/header/web_header.dart';
import '../providers/auth_provider.dart';

class ProfilePage extends ConsumerStatefulWidget {
  const ProfilePage({super.key});

  @override
  ConsumerState<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends ConsumerState<ProfilePage> {
  Future<void> _handleLogout() async {
    await ref.read(authProvider.notifier).logout();
    if (!mounted) return;
    // ✅ Navigate back to home after logout
    Navigator.of(context).pushNamedAndRemoveUntil('/home', (route) => false);
  }

  Future<void> _handleLogin() async {
    // ✅ ACTION-BASED AUTH: Open login and wait for result
    final loggedIn = await Navigator.of(context).pushNamed<bool>('/login');
    if (loggedIn == true && mounted) {
      // Refresh the profile after login
      setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    // ✅ Watch auth state from Riverpod
    final authState = ref.watch(authProvider);
    final isLoggedIn = authState.isLoggedIn;
    final fullName = authState.fullName;
    final email = authState.email;
    final userId = authState.userId;

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: Column(
        children: [
          const WebHeader(),
          Expanded(
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 900),
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: !isLoggedIn
                      ? // ✅ GUEST MODE: Show login prompt
                        Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            const Text(
                              'You are not signed in.',
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const SizedBox(height: 12),
                            const Text(
                              'Sign in to view your profile, orders, and account details.',
                              style: TextStyle(
                                fontSize: 16,
                                color: Colors.grey,
                              ),
                            ),
                            const SizedBox(height: 24),
                            ElevatedButton(
                              onPressed: _handleLogin,
                              child: const Text('Sign in to Account'),
                            ),
                          ],
                        )
                      : // ✅ AUTHENTICATED MODE: Show profile card
                        _buildProfileCard(fullName, email, userId),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileCard(String? fullName, String? email, int? userId) {
    final initials =
        fullName
            ?.split(' ')
            .where((part) => part.isNotEmpty)
            .map((part) => part[0])
            .take(2)
            .join()
            .toUpperCase() ??
        'U';

    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 32,
                  child: Text(
                    initials,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        fullName ?? 'Guest User',
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        email ?? 'No email',
                        style: const TextStyle(
                          fontSize: 16,
                          color: Colors.grey,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            if (userId != null)
              Text(
                'User ID: $userId',
                style: const TextStyle(fontSize: 14, color: Colors.grey),
              ),
            const SizedBox(height: 12),
            const Divider(),
            const SizedBox(height: 12),
            const Text(
              'Account Details',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 12),
            Text(
              'Full name: ${fullName ?? 'Unknown'}',
              style: const TextStyle(fontSize: 14),
            ),
            Text(
              'Email: ${email ?? 'Unknown'}',
              style: const TextStyle(fontSize: 14),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _handleLogout,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.redAccent,
              ),
              child: const Text('Log Out'),
            ),
          ],
        ),
      ),
    );
  }
}
