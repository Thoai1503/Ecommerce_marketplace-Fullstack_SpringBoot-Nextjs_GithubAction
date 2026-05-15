import 'package:flutter/material.dart';
import '../../../services/auth_service.dart';
import '../../../shared/widgets/layout/header/web_header.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  final AuthService _authService = AuthService();

  Future<Map<String, String?>> _loadProfile() async {
    final userId = await _authService.getStoredUserId();
    final email = await _authService.getStoredEmail();
    final fullName = await _authService.getStoredFullName();
    return {'userId': userId?.toString(), 'email': email, 'fullName': fullName};
  }

  Future<void> _logout() async {
    await _authService.logout();
    if (!mounted) return;
    Navigator.of(context).pushNamedAndRemoveUntil('/login', (route) => false);
  }

  @override
  Widget build(BuildContext context) {
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
                  child: FutureBuilder<Map<String, String?>>(
                    future: _loadProfile(),
                    builder: (context, snapshot) {
                      if (snapshot.connectionState != ConnectionState.done) {
                        return const Center(child: CircularProgressIndicator());
                      }

                      final profile = snapshot.data;
                      final fullName = profile?['fullName']?.trim();
                      final email = profile?['email']?.trim();
                      final userId = profile?['userId']?.trim();
                      final isAuthenticated = fullName != null || email != null;

                      if (!isAuthenticated) {
                        return Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Text(
                              'You are not signed in.',
                              style: TextStyle(fontSize: 20),
                            ),
                            const SizedBox(height: 12),
                            ElevatedButton(
                              onPressed: () {
                                Navigator.of(context).pushNamed('/login');
                              },
                              child: const Text('Sign in'),
                            ),
                          ],
                        );
                      }

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
                                    child: Text(initials),
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
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
                                          email ?? '',
                                          style: const TextStyle(fontSize: 16),
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
                                  style: const TextStyle(fontSize: 16),
                                ),
                              const SizedBox(height: 12),
                              const Divider(),
                              const SizedBox(height: 12),
                              const Text(
                                'Account details',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 12),
                              Text('Full name: ${fullName ?? 'Unknown'}'),
                              Text('Email: ${email ?? 'Unknown'}'),
                              const SizedBox(height: 24),
                              ElevatedButton(
                                onPressed: _logout,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Theme.of(
                                    context,
                                  ).colorScheme.error,
                                ),
                                child: const Text('Log out'),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
