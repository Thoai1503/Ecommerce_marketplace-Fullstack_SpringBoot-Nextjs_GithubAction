import http from "@/lib/http";

export const checkOutAPI = async (
  paymentInfo: any,
  token?: string,
): Promise<any> => {
  alert(
    `Gửi yêu cầu thanh toán với thông tin:\nSố tiền: ${paymentInfo.amount}\nPhương thức: ${paymentInfo.method}\nMã đơn hàng: ${paymentInfo.orderId}\nThông tin đơn hàng: ${paymentInfo.orderInfo}\nBank code: ${paymentInfo.bankCode}`,
  );
  return await http.post(
    `/api/payments/create-url?orderInfo=${encodeURIComponent(paymentInfo.orderId)}&ordertype=other&amount=${paymentInfo.amount}&bankCode=${paymentInfo.bankCode}&orderId=${paymentInfo.orderId}&payType=${paymentInfo.method}`,

    {
      orderId: paymentInfo.orderId,
      amount: paymentInfo.amount,
      paymentProvider: paymentInfo.method,
      orderInfo: paymentInfo.orderInfo,
      bankCode: paymentInfo.bankCode,
    },
  );
};
