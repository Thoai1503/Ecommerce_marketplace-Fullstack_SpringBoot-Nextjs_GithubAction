import 'package:flutter_riverpod/flutter_riverpod.dart';

import '/../models/voucher_model.dart';
import '/../services/voucher_service.dart';

final voucherProvider =
    StateNotifierProvider<
      VoucherNotifier,
      AsyncValue<List<VoucherModel>>
    >(
      (ref) => VoucherNotifier(),
    );

class VoucherNotifier
    extends StateNotifier<AsyncValue<List<VoucherModel>>> {
  VoucherNotifier()
      : super(const AsyncLoading()) {
    loadVouchers();
  }

  final VoucherService _service =
      VoucherService();

  Future<void> loadVouchers() async {
    try {
      final vouchers =
          await _service.getVouchers();

      state = AsyncData(vouchers);
    } catch (e) {
      state = AsyncError(
        e,
        StackTrace.current,
      );
    }
  }

  Future<void> claimVoucher(
    int voucherId,
  ) async {
    await _service.claimVoucher(voucherId);

    await loadVouchers();
  }
}