import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../services/auth_service.dart';

final userProvider =
    StateNotifierProvider<UserNotifier, AsyncValue<Map<String, dynamic>>>((
      ref,
    ) {
      return UserNotifier();
    });

/// Get the current user ID
final userIdProvider = FutureProvider<int?>((ref) async {
  final authService = AuthService();
  return await authService.getStoredUserId();
});

class UserNotifier extends StateNotifier<AsyncValue<Map<String, dynamic>>> {
  UserNotifier() : super(const AsyncLoading()) {
    initializeUser();
  }

  final AuthService _authService = AuthService();

  Future<void> initializeUser() async {
    try {
      // Try to initialize session (restore or auto-login)
      final success = await _authService.initializeSession();

      if (success) {
        final userId = await _authService.getStoredUserId();
        final email = await _authService.getStoredEmail();
        final fullName = await _authService.getStoredFullName();

        state = AsyncData({
          'userId': userId,
          'email': email,
          'fullName': fullName,
          'isLoggedIn': true,
        });
      } else {
        state = AsyncError('Failed to initialize session', StackTrace.current);
      }
    } catch (e) {
      state = AsyncError(e, StackTrace.current);
    }
  }

  Future<void> logout() async {
    try {
      await _authService.logout();
      state = const AsyncData({
        'userId': null,
        'email': null,
        'isLoggedIn': false,
      });
    } catch (e) {
      state = AsyncError(e, StackTrace.current);
    }
  }
}
