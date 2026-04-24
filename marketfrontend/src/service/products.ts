
import { mockGet } from '../lib/http';
import { Product, ProductStatus } from '@/types/index';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const BASE_PRODUCTS: Product[] = [
  {
    id: 'p1',
    productCode: 'PRD-0001',
    name: 'iPhone 15 Pro Max 256GB - Titan Tự Nhiên',
    description: 'iPhone 15 Pro Max. Thiết kế titan bền bỉ và nhẹ. Chip A17 Pro. Nút Tác Vụ tùy chỉnh. Hệ thống camera iPhone mạnh mẽ nhất.',
    sku: 'APL-IP15PM-256',
    images: ['https://images.unsplash.com/photo-1696446701796-da61225697cc?w=200&q=80'],
    category: 'Điện thoại',
    price: 28990000,
    originalPrice: 32000000,
    stock: 45,
    status: 'APPROVED',
    sellerId: 's1',
    sellerName: 'Apple Store VN',
    sellerAvatar: 'https://ui-avatars.com/api/?name=Apple+Store&background=000&color=fff',
    attributes: { 'Thương hiệu': 'Apple', 'Màu sắc': 'Titan Tự Nhiên', 'Dung lượng': '256GB' },
    createdAt: '2023-12-01T08:00:00Z',
    viewCount: 1250
  },
  {
    id: 'p2',
    productCode: 'PRD-0002',
    name: 'MacBook Air M2 13 inch 8GB/256GB',
    description: 'MacBook Air M2 được thiết kế lại hoàn toàn siêu mỏng, nhẹ và mạnh mẽ.',
    sku: 'APL-MBA-M2-256',
    images: ['https://images.unsplash.com/photo-1611186871348-b1ec696e5237?w=200&q=80'],
    category: 'Laptop',
    price: 24500000,
    stock: 12,
    status: 'APPROVED',
    sellerId: 's2',
    sellerName: 'STAY-GO Official',
    sellerAvatar: 'https://ui-avatars.com/api/?name=Stay+Go&background=3b82f6&color=fff',
    attributes: { 'Thương hiệu': 'Apple', 'Chip': 'M2', 'RAM': '8GB' },
    createdAt: '2023-11-15T10:30:00Z',
    viewCount: 850
  },
  {
    id: 'p3',
    productCode: 'PRD-0003',
    name: 'Tai nghe Sony WH-1000XM5 Chống ồn',
    description: 'Tai nghe chống ồn tốt nhất thị trường với thời lượng pin 30 giờ.',
    sku: 'SNY-WH1000-XM5',
    images: ['https://images.unsplash.com/photo-1670054131709-646738c80084?w=200&q=80'],
    category: 'Phụ kiện',
    price: 8490000,
    stock: 50,
    status: 'PENDING', // Đang chờ duyệt
    sellerId: 's3',
    sellerName: 'Sony Center',
    sellerAvatar: 'https://ui-avatars.com/api/?name=Sony&background=000&color=fff',
    attributes: { 'Thương hiệu': 'Sony', 'Loại': 'Over-ear' },
    createdAt: '2024-03-10T14:20:00Z',
    viewCount: 320
  },
  {
    id: 'p4',
    productCode: 'PRD-0004',
    name: 'Ốp lưng MagSafe Silicone iPhone 15',
    description: 'Ốp lưng chính hãng Apple, hỗ trợ sạc MagSafe.',
    sku: 'APL-CASE-15-SIL',
    images: ['https://images.unsplash.com/photo-1603891128711-11b4b03bb138?w=200&q=80'],
    category: 'Phụ kiện',
    price: 1290000,
    stock: 150,
    status: 'DRAFT',
    sellerId: 's1',
    sellerName: 'Apple Store VN',
    sellerAvatar: 'https://ui-avatars.com/api/?name=Apple+Store&background=000&color=fff',
    createdAt: '2024-02-05T09:15:00Z',
    viewCount: 45
  },
  {
    id: 'p5',
    productCode: 'PRD-0005',
    name: 'Giày Thể Thao Hunter X',
    description: 'Giày thể thao nam cao cấp, thoáng khí.',
    sku: 'BTS-HUNTER-X',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80'],
    category: 'Thời trang',
    price: 650000,
    stock: 25,
    status: 'REJECTED',
    rejectReason: 'Hình ảnh sản phẩm bị mờ, vui lòng cập nhật lại.',
    sellerId: 's4',
    sellerName: 'Biti\'s Official',
    sellerAvatar: 'https://ui-avatars.com/api/?name=Bitis&background=orange&color=fff',
    createdAt: '2024-03-12T09:00:00Z',
    viewCount: 150
  },
  {
    id: 'p6',
    productCode: 'PRD-0006',
    name: 'Đồng hồ thông minh Smart Watch S8',
    description: 'Đồng hồ thông minh giá rẻ, đầy đủ tính năng.',
    sku: 'SMT-W-S8',
    images: ['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=200&q=80'],
    category: 'Đồng hồ',
    price: 450000,
    stock: 100,
    status: 'PENDING',
    sellerId: 's5',
    sellerName: 'Tech Gadget Store',
    sellerAvatar: 'https://ui-avatars.com/api/?name=Tech+Store&background=purple&color=fff',
    createdAt: '2024-03-15T08:30:00Z',
    viewCount: 60
  }
];

// Generate 120 items to simulate ~12 pages of data
const MOCK_PRODUCTS: Product[] = Array.from({ length: 120 }, (_, i) => {
  const base = BASE_PRODUCTS[i % BASE_PRODUCTS.length];
  return {
    ...base,
    id: `${base.id}_${i}`,
    productCode: `PRD-${String(1000 + i)}`,
    name: `${base.name} (V${i+1})`,
    viewCount: Math.floor(Math.random() * 5000),
  };
});

export const getProducts = async (): Promise<Product[]> => {
  return await mockGet('/admin/products', MOCK_PRODUCTS);
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  await delay(800);
  const productIndex = MOCK_PRODUCTS.findIndex(p => p.id === id);
  if (productIndex > -1) {
    MOCK_PRODUCTS[productIndex].viewCount = (MOCK_PRODUCTS[productIndex].viewCount || 0) + 1;
    return { ...MOCK_PRODUCTS[productIndex] };
  }
  return undefined;
};

export const deleteProducts = async (ids: string[]): Promise<boolean> => {
  await delay(800);
  console.log('Deleted products:', ids);
  // In a real app, you would filter MOCK_PRODUCTS here. For demo, we assume success.
  return true;
};

export const approveProduct = async (id: string): Promise<boolean> => {
  await delay(600);
  console.log('Approved product:', id);
  const product = MOCK_PRODUCTS.find(p => p.id === id);
  if (product) product.status = 'APPROVED';
  return true;
};

export const rejectProduct = async (id: string, reason: string): Promise<boolean> => {
  await delay(600);
  console.log('Rejected product:', id, 'Reason:', reason);
  const product = MOCK_PRODUCTS.find(p => p.id === id);
  if (product) product.status = 'REJECTED';
  return true;
};

export const duplicateProduct = async (product: Product): Promise<Product> => {
  await delay(800);
  const newProduct: Product = {
    ...product,
    id: `p${Date.now()}`,
    productCode: `PRD-${Date.now().toString().slice(-4)}`,
    name: `${product.name} (Copy)`,
    status: 'DRAFT',
    createdAt: new Date().toISOString(),
    viewCount: 0
  };
  MOCK_PRODUCTS.unshift(newProduct);
  return newProduct;
};

export const updateProductStatus = async (id: string, status: ProductStatus): Promise<boolean> => {
  await delay(600);
  const product = MOCK_PRODUCTS.find(p => p.id === id);
  if (product) product.status = status;
  return true;
};
