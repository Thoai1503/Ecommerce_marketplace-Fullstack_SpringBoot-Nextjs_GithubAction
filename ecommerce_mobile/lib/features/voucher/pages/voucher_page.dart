import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/voucher_provider.dart';
import '../widgets/voucher_card.dart';

class VoucherPage extends ConsumerWidget {
  const VoucherPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final voucherState = ref.watch(voucherProvider);

    return SafeArea(
      child: Scaffold(
        appBar: AppBar(title: const Text('Vouchers')),

        body: voucherState.when(
          loading: () => const Center(child: CircularProgressIndicator()),

          error: (e, _) => Center(child: Text(e.toString())),

          data: (vouchers) {
            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: vouchers.length,
              itemBuilder: (context, index) {
                final voucher = vouchers[index];

                return VoucherCard(
                  voucher: voucher,

                  onClaim: () async {
                    await ref
                        .read(voucherProvider.notifier)
                        .claimVoucher(voucher.id);

                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Claimed ${voucher.code}')),
                      );
                    }
                  },
                );
              },
            );
          },
        ),
      ),
    );
  }
}
