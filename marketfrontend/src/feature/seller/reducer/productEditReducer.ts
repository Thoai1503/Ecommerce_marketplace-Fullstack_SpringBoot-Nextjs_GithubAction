import { RootState } from "@/lib/store";
import { Product } from "@/validators/product";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ProductImage } from "../types";
import { getProductById } from "../service";

interface ProductFormState {
  loading: boolean;
  error: string | null;
  success: boolean;
  product: Product | null;
  image: ProductImage[] | null;
}

export const initialProductFormState: ProductFormState = {
  loading: false,
  error: null,
  success: false,
  product: null,
  image: null,
};

export const fetchProduct = createAsyncThunk<Product, number>(
  "product/fetch",
  async (id: number) => {
    const data = await getProductById(id);
    return data;
  },
);

const productEditSlice = createSlice({
  name: "productEdit",
  initialState: initialProductFormState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
        state.success = true;
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch product";
        state.success = false;
      });
  },
});

export const selectProduct = (state: RootState) => state.productForm.product;

export default productEditSlice.reducer;
export const {} = productEditSlice.actions;
