import 'package:flutter/material.dart';

import '/../models/voucher_model.dart';

class VoucherCard extends StatelessWidget {
  final VoucherModel voucher;
  final VoidCallback onClaim;

  const VoucherCard({super.key, required this.voucher, required this.onClaim});

  String getTitle() {
    if (voucher.discountType == 'FIXED') {
      return 'Save ${voucher.discountAmount}';
    }

    if (voucher.discountType == 'PERCENT') {
      return 'Save ${voucher.discountPercent}%';
    }

    if (voucher.discountType == 'FREE_SHIPPING') {
      return 'Free Shipping';
    }

    return voucher.title;
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),

      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),

      child: Padding(
        padding: const EdgeInsets.all(12),

        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,

          children: [
            Container(
              width: 80,
              height: 80,

              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),

                gradient: const LinearGradient(
                  colors: [Colors.red, Colors.orange],
                ),
              ),

              child: const Center(
                child: Text(
                  'NEXAMART',

                  textAlign: TextAlign.center,

                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ),
            ),

            const SizedBox(width: 12),

            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,

                mainAxisSize: MainAxisSize.min,

                children: [
                  Text(
                    voucher.code,

                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                  ),

                  const SizedBox(height: 4),

                  Text(
                    getTitle(),

                    maxLines: 2,

                    overflow: TextOverflow.ellipsis,

                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                  const SizedBox(height: 4),

                  Text(
                    voucher.description ?? '',

                    maxLines: 2,

                    overflow: TextOverflow.ellipsis,

                    style: const TextStyle(fontSize: 12),
                  ),

                  const SizedBox(height: 8),

                  Wrap(
                    alignment: WrapAlignment.spaceBetween,

                    crossAxisAlignment: WrapCrossAlignment.center,

                    spacing: 8,

                    runSpacing: 8,

                    children: [
                      Text(
                        'Exp: ${voucher.validTo ?? ''}',

                        style: const TextStyle(fontSize: 12),
                      ),

                      SizedBox(
                        height: 36,

                        child: ElevatedButton(
                          onPressed: onClaim,

                          child: const Text('Claim'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
