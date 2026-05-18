import 'package:dio/dio.dart';

import '../models/voucher_model.dart';

class VoucherService {
  final Dio dio = Dio(
    BaseOptions(
      baseUrl: 'http://localhost:8000/api',
    ),
  );

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