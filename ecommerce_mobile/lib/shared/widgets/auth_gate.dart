import 'package:flutter/material.dart';
import '../../services/auth_service.dart';
import '../../features/auth/pages/login_page.dart';

/// AuthGate: Safely returns the child only when the synchronous auth flag
/// indicates the user is logged in. Never force-null any token/userId.
/// If not logged in, it immediately returns the `LoginPage` and avoids
/// constructing the guarded child widget to prevent startup crashes.
class AuthGate extends StatelessWidget {
  final Widget child;

  const AuthGate({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    // Use a defensive try/catch, but do NOT access any token/userId
    // properties directly that might be null. Rely on the synchronous
    // auth flag which is set during startup session initialization.
    bool loggedIn = false;
    try {
      loggedIn = AuthService().isLoggedInSync;
    } catch (e) {
      debugPrint('[AuthGate] Error reading auth state: $e');
      loggedIn = false;
    }

    if (!loggedIn) {
      // Return login page early and avoid building the guarded child.
      return const LoginPage();
    }

    return child;
  }
}
