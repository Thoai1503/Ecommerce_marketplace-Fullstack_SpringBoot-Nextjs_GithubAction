class VoucherModel {
  final int id;
  final String code;
  final String title;
  final String discountType;
  final double? discountAmount;
  final double? discountPercent;
  final double minOrderValue;
  final int totalQuota;
  final int claimedCount;
  final String issuerType;
  final String status;
  final String? validTo;
  final String? description;

  VoucherModel({
    required this.id,
    required this.code,
    required this.title,
    required this.discountType,
    this.discountAmount,
    this.discountPercent,
    required this.minOrderValue,
    required this.totalQuota,
    required this.claimedCount,
    required this.issuerType,
    required this.status,
    this.validTo,
    this.description,
  });

  factory VoucherModel.fromJson(
    Map<String, dynamic> json,
  ) {
    return VoucherModel(
      id: json['id'],
      code: json['code'] ?? '',
      title: json['title'] ?? '',
      discountType: json['discountType'] ?? '',
      discountAmount:
          (json['discountAmount'] as num?)?.toDouble(),
      discountPercent:
          (json['discountPercent'] as num?)?.toDouble(),
      minOrderValue:
          (json['minOrderValue'] as num?)?.toDouble() ?? 0,
      totalQuota: json['totalQuota'] ?? 0,
      claimedCount: json['claimedCount'] ?? 0,
      issuerType: json['issuerType'] ?? '',
      status: json['status'] ?? '',
      validTo: json['validTo'],
      description: json['description'],
    );
  }
}