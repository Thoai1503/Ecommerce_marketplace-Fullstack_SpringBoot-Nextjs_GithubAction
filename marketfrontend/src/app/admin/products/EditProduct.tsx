
"use client";

import React, { useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProductDetail } from '@/hooks/admin/useProducts';
import { useCategories } from '@/hooks/admin/useCategories';
import { useSellers } from '@/hooks/admin/useSellers';
import { useProductImageUpload } from '@/hooks/admin/useProductImageUpload';
import { Save, X, UploadCloud, ArrowLeft, DollarSign, Percent, Package, Tag, Layers, Sparkles, Wand2, Trash2, Store, Loader2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { FormSkeleton } from '@/components/ui/Skeleton';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

// --- ZOD SCHEMA ---
const productSchema = z.object({
  name: z.string().min(3, "Tên sản phẩm phải có ít nhất 3 ký tự."),
  sku: z.string().min(1, "Mã SKU là bắt buộc.").transform(v => v.toUpperCase()),
  description: z.string().optional(),
  price: z.number().min(1000, "Giá phải lớn hơn 1.000₫"),
  originalPrice: z.number().optional(),
  stock: z.number().min(0, "Tồn kho không được âm"),
  category: z.string().min(1, "Vui lòng chọn danh mục."),
  sellerId: z.string().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'DRAFT', 'HIDDEN']),
  attributes: z.record(z.string(), z.string()).optional(),
  images: z.array(z.string()).min(1, "Cần ít nhất 1 hình ảnh sản phẩm."),
}).superRefine((data, ctx) => {
  if (data.originalPrice !== undefined && data.originalPrice > 0 && data.originalPrice < data.price) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['originalPrice'],
      message: 'Giá gốc phải lớn hơn hoặc bằng giá bán.',
    });
  }
});

type ProductFormValues = z.infer<typeof productSchema>;

// Translate common backend errors to Vietnamese
const extractErrorMessage = (e: any, fallback: string): string => {
  const data = e?.response?.data;
  if (typeof data === 'object' && data?.message) return data.message;
  if (typeof data === 'string' && data) {
    if (/SQLException|Duplicate entry|SQL/i.test(data)) {
      return 'Dữ liệu bị trùng hoặc không hợp lệ.';
    }
    if (data === 'product_name is required') return 'Tên sản phẩm là bắt buộc.';
    if (data === 'price is required and must be >= 0') return 'Giá bán là bắt buộc và phải lớn hơn 0.';
    if (data === 'category_id is required') return 'Danh mục là bắt buộc.';
    if (data === 'shop_id is required') return 'Nhà bán hàng là bắt buộc.';
    if (data === 'Shop not found') return 'Không tìm thấy nhà bán hàng.';
    if (data === 'Product not found') return 'Không tìm thấy sản phẩm.';
    return data;
  }
  return e?.message || fallback;
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const id = params?.id;
  const isEditMode = !!id;
  const { data: product, isLoading, createProduct, updateProduct, isSaving } = useProductDetail(id || '');
  const { categories } = useCategories();
  const { sellers } = useSellers();
  const { success, info, warning, error } = useToast();

  // Active sellers only
  const activeSellers = useMemo(
    () => (sellers || []).filter((s) => s.status === 'ACTIVE'),
    [sellers],
  );

  // RHF Setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty }
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      description: '',
      price: 0,
      originalPrice: 0,
      stock: 0,
      category: '',
      sellerId: '',
      status: 'PENDING',
      attributes: {},
      images: [],
    }
  });

  const watchedImages = watch('images');
  const watchedPrice = watch('price');
  const watchedOriginalPrice = watch('originalPrice');
  const watchedAttributes = (watch('attributes') || {}) as Record<string, string>;
  const watchedName = watch('name');
  const watchedCategory = watch('category');
  const watchedSellerId = watch('sellerId');

  const [isGeneratingDesc, setIsGeneratingDesc] = React.useState(false);

  // Image upload hook
  const imageUpload = useProductImageUpload({
    onAppend: (urls) => {
      setValue('images', [...watchedImages, ...urls], { shouldDirty: true, shouldValidate: true });
    },
    onToast: (msg, type) => {
      if (type === 'success') success(msg);
      else if (type === 'error') error(msg);
      else if (type === 'warning') warning(msg);
      else info(msg);
    },
  });

  // Load product data
  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        sku: product.sku,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice || 0,
        stock: product.stock,
        category: product.category,
        sellerId: product.sellerId,
        status: product.status,
        attributes: (product.attributes && Object.keys(product.attributes).length > 0)
          ? product.attributes
          : { 'Thương hiệu': '', 'Xuất xứ': '' },
        images: product.images,
      });
    }
  }, [product, reset]);

  const discountPercent = useMemo(() => {
    const original = Number(watchedOriginalPrice);
    const price = Number(watchedPrice);
    if (original > price && original > 0) {
      return Math.round(((original - price) / original) * 100);
    }
    return 0;
  }, [watchedPrice, watchedOriginalPrice]);

  const onSubmit = async (data: ProductFormValues) => {
    try {
      if (!isEditMode && !data.sellerId) {
        warning('Vui lòng chọn nhà bán hàng.');
        return;
      }

      if (isEditMode && id) {
        await updateProduct({
          name: data.name,
          sku: data.sku,
          description: data.description,
          price: data.price,
          originalPrice: data.originalPrice,
          stock: data.stock,
          category: data.category,
          status: data.status === 'DRAFT' ? 'PENDING' : data.status,
          images: data.images,
        });
        success('Đã cập nhật sản phẩm thành công!');
      } else {
        await createProduct({
          name: data.name,
          sku: data.sku,
          description: data.description,
          price: data.price,
          originalPrice: data.originalPrice,
          stock: data.stock,
          category: data.category,
          sellerId: data.sellerId,
          status: data.status === 'DRAFT' ? 'PENDING' : data.status,
          images: data.images,
        });
        success('Đã tạo sản phẩm thành công!');
      }
      setTimeout(() => router.push('/admin/products'), 800);
    } catch (e: any) {
      console.error('[EditProduct] submit error:', e);
      error(extractErrorMessage(e, 'Đã có lỗi xảy ra. Vui lòng thử lại.'));
    }
  };

  const handleAttributeChange = (key: string, value: string) => {
    setValue('attributes', { ...watchedAttributes, [key]: value }, { shouldDirty: true });
  };

  const addAttribute = () => {
    const newKey = `New Attribute ${Object.keys(watchedAttributes).length + 1}`;
    setValue('attributes', { ...watchedAttributes, [newKey]: '' }, { shouldDirty: true });
  };

  const removeAttribute = (keyToRemove: string) => {
    const newAttributes = { ...watchedAttributes };
    delete newAttributes[keyToRemove];
    setValue('attributes', newAttributes, { shouldDirty: true });
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const newImages = watchedImages.filter((_, index) => index !== indexToRemove);
    setValue('images', newImages, { shouldDirty: true, shouldValidate: true });
  };

  const handleGenerateDescription = () => {
    if (!watchedName) {
      warning('Vui lòng nhập tên sản phẩm trước.');
      return;
    }
    setIsGeneratingDesc(true);
    setTimeout(() => {
      const attrsText = Object.entries(watchedAttributes)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
      const categoryName = categories.find((c) => c.id === watchedCategory)?.name || watchedCategory;
      const generatedText = `Trải nghiệm tuyệt vời cùng ${watchedName}!\n\n` +
        `Sản phẩm thuộc dòng ${categoryName} cao cấp, được thiết kế tinh xảo. ` +
        `${watchedName} nổi bật với hiệu năng vượt trội.\n\n` +
        `Điểm nổi bật:\n` +
        (attrsText ? `- ${attrsText.replace(/, /g, '\n- ')}\n` : `- Chất lượng đảm bảo chính hãng\n- Thiết kế hiện đại\n`) +
        `- Giá trị vượt trội: ${Number(watchedPrice).toLocaleString()}₫\n` +
        `\nMua ngay hôm nay!`;
      setValue('description', generatedText, { shouldDirty: true });
      setIsGeneratingDesc(false);
      success('Đã tạo nội dung xong!');
    }, 1500);
  };

  const selectedSeller = activeSellers.find((s) => s.id === watchedSellerId);

  if (isEditMode && isLoading) return <FormSkeleton />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 lg:p-10 animate-in fade-in duration-500 max-w-5xl mx-auto pb-24 space-y-6">
      <Breadcrumbs items={[
        { label: 'Sản phẩm', path: '/admin/products' },
        { label: isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới' }
      ]} />

      <div className="flex items-center justify-between sticky top-0 z-20 bg-[#f8fafc]/90 backdrop-blur py-4 -my-4 px-2">
         <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.push('/admin/products')}
              className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-500"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-800">{isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h1>
              <p className="text-sm text-slate-500 font-medium">Cập nhật thông tin chi tiết.</p>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/admin/products')}
              className="px-6 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all border-0 bg-transparent"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isSaving || (isEditMode && !isDirty)}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all border-0 disabled:opacity-50 disabled:shadow-none"
            >
              <Save size={18} /> {(isSubmitting || isSaving) ? 'Đang lưu...' : (isEditMode ? 'Lưu thay đổi' : 'Tạo sản phẩm')}
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">

          {/* General Info */}
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 space-y-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Layers size={16} /> Thông tin chung
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Tên sản phẩm <span className="text-red-500">*</span></label>
                <input
                  {...register('name')}
                  className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-4 text-sm font-medium transition-shadow ${errors.name ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-500/10'}`}
                  placeholder="Nhập tên sản phẩm..."
                />
                {errors.name && <p className="text-xs text-red-500 font-bold">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Mã SKU <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input
                        {...register('sku')}
                        className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-4 text-sm font-black uppercase tracking-wider ${errors.sku ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-500/10'}`}
                      />
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    </div>
                    {errors.sku && <p className="text-xs text-red-500 font-bold">{errors.sku.message}</p>}
                 </div>

                 <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Danh mục <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select
                        {...register('category')}
                        className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-4 text-sm font-bold appearance-none cursor-pointer ${errors.category ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-500/10'}`}
                      >
                        <option value="">-- Chọn danh mục --</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    </div>
                    {errors.category && <p className="text-xs text-red-500 font-bold">{errors.category.message}</p>}
                 </div>
              </div>

              {/* Seller selector */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Nhà bán hàng {!isEditMode && <span className="text-red-500">*</span>}</label>
                {isEditMode ? (
                  <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600">
                    <Store size={16} className="text-slate-400" />
                    {product?.sellerName || '(Không xác định)'}
                    <span className="ml-auto text-xs font-medium text-slate-400">Không thể đổi seller</span>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      {...register('sellerId')}
                      className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-4 text-sm font-bold appearance-none cursor-pointer ${errors.sellerId ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-500/10'}`}
                    >
                      <option value="">-- Chọn nhà bán hàng --</option>
                      {activeSellers.map((s) => (
                        <option key={s.id} value={s.id}>{s.brandTitle}</option>
                      ))}
                    </select>
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  </div>
                )}
                {selectedSeller && !isEditMode && (
                  <p className="text-xs text-slate-500 font-medium">Email: {selectedSeller.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                   <label className="text-sm font-bold text-slate-700">Mô tả sản phẩm</label>
                   <button
                      type="button"
                      onClick={handleGenerateDescription}
                      disabled={isGeneratingDesc}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg text-xs font-bold hover:shadow-lg transition-all disabled:opacity-70 border-0"
                   >
                      {isGeneratingDesc ? <Wand2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      {isGeneratingDesc ? 'AI đang viết...' : 'AI Magic Writer'}
                   </button>
                </div>
                <textarea
                  {...register('description')}
                  rows={8}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-medium transition-shadow resize-none leading-relaxed"
                  placeholder="Mô tả chi tiết..."
                ></textarea>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <UploadCloud size={16} /> Hình ảnh
                </h3>
                <span className="text-xs font-bold text-slate-400">{watchedImages.length} hình ảnh</span>
             </div>

             {imageUpload.isUploading && (
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full transition-all"
                    style={{ width: `${imageUpload.uploadProgress}%` }}
                  />
                </div>
             )}

             <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                <div onClick={imageUpload.clickFileInput} className={`w-32 h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center shrink-0 bg-slate-50 transition-all ${imageUpload.isUploading ? 'border-blue-300 text-blue-400 cursor-wait' : 'border-slate-300 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-500 cursor-pointer'}`}>
                   {imageUpload.isUploading ? (
                     <>
                       <Loader2 size={24} className="mb-2 animate-spin" />
                       <span className="text-xs font-bold uppercase">Đang tải...</span>
                     </>
                   ) : (
                     <>
                       <UploadCloud size={24} className="mb-2" />
                       <span className="text-xs font-bold uppercase">Thêm ảnh</span>
                     </>
                   )}
                   <input type="file" ref={imageUpload.fileInputRef} onChange={imageUpload.handleFileChange} className="hidden" multiple accept="image/*" />
                </div>

                {watchedImages.map((img, idx) => (
                  <div key={idx} className="relative w-32 h-32 shrink-0 rounded-2xl overflow-hidden border border-slate-200 group bg-white">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <button
                         type="button"
                         onClick={() => handleRemoveImage(idx)}
                         className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                       >
                         <X size={16} />
                       </button>
                    </div>
                  </div>
                ))}
             </div>
             {errors.images && <p className="text-xs text-red-500 font-bold">{errors.images.message}</p>}
          </div>

          {/* Attributes */}
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Tag size={16} /> Thuộc tính
                </h3>
                <button type="button" onClick={addAttribute} className="text-xs font-bold text-blue-600 hover:underline">+ Thêm thuộc tính</button>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {Object.entries(watchedAttributes).map(([key, value], idx) => (
                 <div key={idx} className="flex flex-col gap-1 p-3 bg-slate-50 rounded-xl border border-slate-100 relative group">
                    <input
                      className="bg-transparent text-xs font-bold text-slate-500 uppercase mb-1 outline-none border-b border-transparent focus:border-blue-300"
                      defaultValue={key}
                      onBlur={(e) => {
                         const newKey = e.target.value;
                         if (newKey !== key) {
                             const newAttrs = { ...watchedAttributes };
                             delete newAttrs[key];
                             newAttrs[newKey] = value;
                             setValue('attributes', newAttrs, { shouldDirty: true });
                         }
                      }}
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleAttributeChange(key, e.target.value)}
                      className="w-full bg-white px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-blue-400"
                    />
                    <button
                      type="button"
                      onClick={() => removeAttribute(key)}
                      className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 space-y-6 sticky top-24">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <DollarSign size={16} /> Giá & Kho hàng
            </h3>

            <div className="space-y-4">
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase">Giá gốc</label>
                 <div className="relative">
                   <input
                     type="number"
                     {...register('originalPrice', { valueAsNumber: true })}
                     className={`w-full pl-4 pr-10 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-4 text-sm font-bold text-slate-500 ${errors.originalPrice ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-500/10'}`}
                   />
                   <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₫</span>
                 </div>
                 {errors.originalPrice && <p className="text-xs text-red-500 font-bold">{errors.originalPrice.message}</p>}
               </div>

               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase">Giá bán</label>
                 <div className="relative">
                   <input
                     type="number"
                     {...register('price', { valueAsNumber: true })}
                     className={`w-full pl-4 pr-10 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-4 text-lg font-black text-blue-600 ${errors.price ? 'border-red-300 focus:ring-red-100' : 'border-blue-100 focus:ring-blue-500/10'}`}
                   />
                   <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₫</span>
                 </div>
                 {errors.price && <p className="text-xs text-red-500 font-bold">{errors.price.message}</p>}
               </div>

               {discountPercent > 0 && (
                 <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 animate-in zoom-in">
                    <Percent size={16} />
                    <span className="text-xs font-bold">Giảm <span className="text-sm font-black">{discountPercent}%</span></span>
                 </div>
               )}

               <div className="h-px bg-slate-100 my-2"></div>

               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase">Tồn kho</label>
                 <div className="relative">
                   <input
                     type="number"
                     {...register('stock', { valueAsNumber: true })}
                     className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-bold"
                   />
                   <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                 </div>
               </div>

               <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Trạng thái</label>
                  <select
                    {...register('status')}
                    className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-bold appearance-none cursor-pointer"
                  >
                    <option value="PENDING">Chờ duyệt</option>
                    <option value="APPROVED">Đang bán</option>
                    <option value="HIDDEN">Đang ẩn</option>
                  </select>
               </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
