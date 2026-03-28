import { useMutation, useQuery } from "@tanstack/react-query";
import { productQuery } from "./query";
import { checkOutAPI } from "@/services/checkout";

export const useHomePage = () => {
  const { data: products } = useQuery(productQuery.list);
  return { products };
};

export const useCheckoutPage = () => {
  const { data: products } = useQuery(productQuery.list);

  const { mutate: checkOut } = useMutation({
    mutationFn: (paymentInfo: any) => checkOutAPI(paymentInfo),
    onSuccess: (data) => {
      if (!data.data.startsWith("http")) {
        alert(data.data);
        return;
      }
      window.location.href = `${data.data}`;
    },
    onError: (error) => {
      alert("Lỗi khi thanh toán: " + error);
    },
  });

  return { products, checkOut };
};
