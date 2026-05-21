import 'package:dio/dio.dart';

import '../core/api_client.dart';
import '../models/voucher_model.dart';

class VoucherService {
  final Dio dio = ApiClient.authDio;

  Future<List<VoucherModel>> getVouchers() async {
    final endpoints = ['/api/v1/vouchers', '/api/vouchers', '/vouchers'];

    Response? response;
    for (final endpoint in endpoints) {
      try {
        response = await dio.get(endpoint);
        if (response.statusCode == 200) {
          break;
        }
      } catch (_) {
        continue;
      }
    }

    if (response == null || response.statusCode != 200) {
      throw Exception('Unable to load vouchers from port 8001');
    }

    return (response.data as List)
        .map((e) => VoucherModel.fromJson(e))
        .toList();
  }

  Future<void> claimVoucher(int voucherId) async {
    final endpoints = [
      '/api/v1/vouchers/$voucherId/claim',
      '/api/vouchers/$voucherId/claim',
      '/vouchers/$voucherId/claim',
    ];

    Response? response;
    for (final endpoint in endpoints) {
      try {
        response = await dio.post(endpoint);
        if (response.statusCode == 200 || response.statusCode == 201) {
          return;
        }
      } catch (_) {
        continue;
      }
    }

    throw Exception('Unable to claim voucher $voucherId via port 8001');
  }
}
