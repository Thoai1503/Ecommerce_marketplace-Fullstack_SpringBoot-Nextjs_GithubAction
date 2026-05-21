import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../services/auth_service.dart';

/// Simple auth state provider for checking login status
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});

/// Get the current logged-in user ID (if any)
final currentUserIdProvider = FutureProvider<int?>((ref) async {
  final authService = AuthService();
  return await authService.getStoredUserId();
});

class AuthState {
  final bool isLoggedIn;
  final int? userId;
  final String? email;
  final String? fullName;

  AuthState({this.isLoggedIn = false, this.userId, this.email, this.fullName});

  AuthState copyWith({
    bool? isLoggedIn,
    int? userId,
    String? email,
    String? fullName,
  }) {
    return AuthState(
      isLoggedIn: isLoggedIn ?? this.isLoggedIn,
      userId: userId ?? this.userId,
      email: email ?? this.email,
      fullName: fullName ?? this.fullName,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(AuthState()) {
    _initializeAuth();
  }

  final AuthService _authService = AuthService();

  /// Initialize auth state on startup
  Future<void> _initializeAuth() async {
    try {
      final userId = await _authService.getStoredUserId();
      final email = await _authService.getStoredEmail();
      final fullName = await _authService.getStoredFullName();

      state = AuthState(
        isLoggedIn: userId != null,
        userId: userId,
        email: email,
        fullName: fullName,
      );
    } catch (e) {
      state = AuthState(isLoggedIn: false);
    }
  }

  /// Call this after successful login to update auth state
  Future<void> refreshAuthState() async {
    await _initializeAuth();
  }

  /// Logout and clear auth state
  Future<void> logout() async {
    try {
      await _authService.logout();
      state = AuthState(isLoggedIn: false);
    } catch (e) {
      state = AuthState(isLoggedIn: false);
    }
  }
}
