import { useMutation, useQuery } from "@tanstack/react-query";
import { productQuery } from "./query";
import { checkOutAPI } from "@/services/checkout";
import { calculateFeeOfLOGS } from "@/service/calculateFeeAPI";
import { addBatchCartItems } from "./service";

export const useHomePage = () => {
  const { data: products } = useQuery(productQuery.list);
  return { products };
};

export const useCheckoutPage = () => {
  const { data: products } = useQuery(productQuery.list);

  const { mutate: checkOut } = useMutation({
    mutationFn: (paymentInfo: any) => checkOutAPI(paymentInfo),
    onSuccess: (data) => {
      alert("Data thanh toán: " + JSON.stringify(data));
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
  const {} = useMutation({
    mutationFn: (param: any) => calculateFeeOfLOGS(param),
    onSuccess: (data) => {
      console.log("Fee LOGS:", data);
    },
    onError: (error) => {
      console.error("Lỗi khi tính phí LOGS:", error);
    },
  });

  return { products, checkOut };
<<<<<<< HEAD
};
=======
};

export const useAddBatchCartItemsMutation = () => {
  return useMutation({
    mutationFn: (
      cartItems: {
        user_id: number;
        product_id: number;
        variant_id: number;
        quantity: number;
      }[],
    ) => addBatchCartItems(cartItems),
    // onSuccess: (data) => {
    //   console.log("Batch cart items added:", data);
    // },
    // onError: (error) => {
    //   console.error("Error adding batch cart items:", error);
    // },
  });
};
>>>>>>> 1baaa4b887a4d539478b503d2ca6afaa6be25518
