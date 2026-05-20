import 'package:dio/dio.dart';

import '../core/api_client.dart';
import '../models/voucher_model.dart';

class VoucherService {
  final Dio dio = ApiClient.authDio;

  Future<List<VoucherModel>> getVouchers() async {
    final response = await dio.get('/vouchers');

    return (response.data as List)
        .map((e) => VoucherModel.fromJson(e))
        .toList();
  }

  Future<void> claimVoucher(int voucherId) async {
    await dio.post('/vouchers/$voucherId/claim');
  }
}
