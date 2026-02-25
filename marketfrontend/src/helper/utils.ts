// Original JSON format from your database .
export interface DbCategory {
  id: number;
  parent_id: number;
  category_name: string;
  category_slug: string;
  level: number;
  is_active: number;
}

// Component format
export interface Category {
  id: number;
  name: string;
  slug: string;
  level: number;
  parent_id?: number;
  productCount: number;
  isVisible: boolean;
  isExpanded?: boolean;
  children?: Category[];
}

// Conversion function

export function convertDbCategoriesToComponentFormat(
  dbCategories: DbCategory[],
): Category[] {
  // First, convert each database category to component format
  const categoryMap = new Map<number, Category>();

  dbCategories.forEach((dbCat) => {
    categoryMap.set(dbCat.id, {
      id: dbCat.id,
      name: dbCat.category_name,
      slug: dbCat.category_slug,
      productCount: 0, // You'll need to add this from your database
      isVisible: dbCat.is_active === 1,
      level: dbCat.level,
      isExpanded: false,
      children: [],
    });
  });

  // Build the hierarchical structure
  const rootCategories: Category[] = [];

  dbCategories.forEach((dbCat) => {
    const category = categoryMap.get(dbCat.id)!;

    if (dbCat.parent_id === 0) {
      // This is a root category
      rootCategories.push(category);
    } else {
      // This is a child category
      const parent = categoryMap.get(dbCat.parent_id);
      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(category);
      }
    }
  });

  return rootCategories;
}

// Example usage with your data
const dbCategories: DbCategory[] = [
  {
    id: 2,
    parent_id: 0,
    category_name: "Đồ gia dụng",
    category_slug: "do-gia-dung",
    level: 0,
    is_active: 1,
  },
  {
    id: 5,
    parent_id: 0,
    category_name: "Máy tính bàn",
    category_slug: "may-tinh-ban",
    level: 1,
    is_active: 1,
  },
  {
    id: 4,
    parent_id: 0,
    category_name: "Máy tính & Laptop",
    category_slug: "may-tinh-laptop",
    level: 0,
    is_active: 1,
  },
  {
    id: 3,
    parent_id: 0,
    category_name: "Thời trang nữ ",
    category_slug: "thoi-trang-nu",
    level: 0,
    is_active: 1,
  },
];

// Convert the data
const convertedCategories = convertDbCategoriesToComponentFormat(dbCategories);

console.log("Converted Categories:");
console.log(JSON.stringify(convertedCategories, null, 2));

// Result for your data (all are root categories since parent_id = 0):
/*
[
  {
    "id": 2,
    "name": "Đồ gia dụng",
    "slug": "do-gia-dung",
    "productCount": 0,
    "isVisible": true,
    "isExpanded": false,
    "children": []
  },
  {
    "id": 5,
    "name": "Máy tính bàn",
    "slug": "may-tinh-ban",
    "productCount": 0,
    "isVisible": true,
    "isExpanded": false,
    "children": []
  },
  {
    "id": 4,
    "name": "Máy tính & Laptop",
    "slug": "may-tinh-laptop",
    "productCount": 0,
    "isVisible": true,
    "isExpanded": false,
    "children": []
  },
  {
    "id": 3,
    "name": "Thời trang nữ ",
    "slug": "thoi-trang-nu",
    "productCount": 0,
    "isVisible": true,
    "isExpanded": false,
    "children": []
  }
]
*/

export function filterDistinctAttributes(data: any) {
  const attributeMap = new Map();

  data?.forEach((item: any) => {
    const attrId = item.attribute_id;
    const value = item.attribute.attribute_value.value;
    const unit = item.attribute.unit_id;
    const unit_symbol = item.attribute.attribute_value.unit.symbol;

    // Nếu attribute_id chưa tồn tại trong Map
    if (!attributeMap.has(attrId)) {
      attributeMap.set(attrId, {
        id: attrId,
        //  attribute_id: attrId,
        name: item.attribute.name,
        slug: item.attribute.slug,
        data_type: item.attribute.data_type,
        values: [],
      });
    }

    // Thêm value vào mảng nếu value != null và chưa tồn tại
    if (value !== null && value !== undefined) {
      const attr = attributeMap.get(attrId);
      if (!attr.values.includes(value)) {
        if (unit != 0 && unit_symbol) {
          attr.values.push(`${value} ${unit_symbol}`);
        } else {
          attr.values.push(`${value}`);
        }
      }
    }
  });

  // Chuyển Map thành Array
  return Array.from(attributeMap.values());
}
// utils/slugify.ts

/**
 * Chuyển đổi chuỗi tiếng Việt có dấu thành slug
 * @param text - Chuỗi cần chuyển đổi
 * @returns Chuỗi slug không dấu, viết thường, phân tách bằng dấu gạch ngang
 */
export const slugify = (text: string): string => {
  if (!text) return "";

  // Bảng ánh xạ ký tự có dấu sang không dấu
  const vietnameseMap: Record<string, string> = {
    // Chữ thường
    à: "a",
    á: "a",
    ạ: "a",
    ả: "a",
    ã: "a",
    â: "a",
    ầ: "a",
    ấ: "a",
    ậ: "a",
    ẩ: "a",
    ẫ: "a",
    ă: "a",
    ằ: "a",
    ắ: "a",
    ặ: "a",
    ẳ: "a",
    ẵ: "a",
    è: "e",
    é: "e",
    ẹ: "e",
    ẻ: "e",
    ẽ: "e",
    ê: "e",
    ề: "e",
    ế: "e",
    ệ: "e",
    ể: "e",
    ễ: "e",
    ì: "i",
    í: "i",
    ị: "i",
    ỉ: "i",
    ĩ: "i",
    ò: "o",
    ó: "o",
    ọ: "o",
    ỏ: "o",
    õ: "o",
    ô: "o",
    ồ: "o",
    ố: "o",
    ộ: "o",
    ổ: "o",
    ỗ: "o",
    ơ: "o",
    ờ: "o",
    ớ: "o",
    ợ: "o",
    ở: "o",
    ỡ: "o",
    ù: "u",
    ú: "u",
    ụ: "u",
    ủ: "u",
    ũ: "u",
    ư: "u",
    ừ: "u",
    ứ: "u",
    ự: "u",
    ử: "u",
    ữ: "u",
    ỳ: "y",
    ý: "y",
    ỵ: "y",
    ỷ: "y",
    ỹ: "y",
    đ: "d",
    // Chữ hoa
    À: "A",
    Á: "A",
    Ạ: "A",
    Ả: "A",
    Ã: "A",
    Â: "A",
    Ầ: "A",
    Ấ: "A",
    Ậ: "A",
    Ẩ: "A",
    Ẫ: "A",
    Ă: "A",
    Ằ: "A",
    Ắ: "A",
    Ặ: "A",
    Ẳ: "A",
    Ẵ: "A",
    È: "E",
    É: "E",
    Ẹ: "E",
    Ẻ: "E",
    Ẽ: "E",
    Ê: "E",
    Ề: "E",
    Ế: "E",
    Ệ: "E",
    Ể: "E",
    Ễ: "E",
    Ì: "I",
    Í: "I",
    Ị: "I",
    Ỉ: "I",
    Ĩ: "I",
    Ò: "O",
    Ó: "O",
    Ọ: "O",
    Ỏ: "O",
    Õ: "O",
    Ô: "O",
    Ồ: "O",
    Ố: "O",
    Ộ: "O",
    Ổ: "O",
    Ỗ: "O",
    Ơ: "O",
    Ờ: "O",
    Ớ: "O",
    Ợ: "O",
    Ở: "O",
    Ỡ: "O",
    Ù: "U",
    Ú: "U",
    Ụ: "U",
    Ủ: "U",
    Ũ: "U",
    Ư: "U",
    Ừ: "U",
    Ứ: "U",
    Ự: "U",
    Ử: "U",
    Ữ: "U",
    Ỳ: "Y",
    Ý: "Y",
    Ỵ: "Y",
    Ỷ: "Y",
    Ỹ: "Y",
    Đ: "D",
  };

  // Chuyển đổi ký tự có dấu thành không dấu
  let slug = text
    .split("")
    .map((char) => vietnameseMap[char] || char)
    .join("");

  // Chuyển thành chữ thường
  slug = slug.toLowerCase();

  // Loại bỏ các ký tự đặc biệt, chỉ giữ lại chữ cái, số và khoảng trắng
  slug = slug.replace(/[^a-z0-9\s-]/g, "");

  // Thay thế khoảng trắng và nhiều dấu gạch ngang liên tiếp bằng một dấu gạch ngang
  slug = slug.replace(/[\s-]+/g, "-");

  // Loại bỏ dấu gạch ngang ở đầu và cuối
  slug = slug.replace(/^-+|-+$/g, "");

  return slug;
};

/**
 * Tạo slug unique bằng cách thêm số vào cuối nếu cần
 * @param text - Chuỗi cần chuyển đổi
 * @param existingSlugs - Danh sách các slug đã tồn tại
 * @returns Slug unique
 */
export const generateUniqueSlug = (
  text: string,
  existingSlugs: string[] = [],
): string => {
  const baseSlug = slugify(text);

  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  // Nếu slug đã tồn tại, thêm số vào cuối
  let counter = 1;
  let uniqueSlug = `${baseSlug}-${counter}`;

  while (existingSlugs.includes(uniqueSlug)) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }

  return uniqueSlug;
};

/**
 * Validate slug
 * @param slug - Slug cần validate
 * @returns true nếu slug hợp lệ
 */
export const isValidSlug = (slug: string): boolean => {
  // Slug chỉ chứa chữ cái thường, số và dấu gạch ngang
  // Không bắt đầu hoặc kết thúc bằng dấu gạch ngang
  // Không có nhiều dấu gạch ngang liên tiếp
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

/**
 * Cắt ngắn slug nếu quá dài
 * @param slug - Slug cần cắt
 * @param maxLength - Độ dài tối đa (mặc định 100)
 * @returns Slug đã được cắt
 */
export const truncateSlug = (slug: string, maxLength: number = 100): string => {
  if (slug.length <= maxLength) {
    return slug;
  }

  // Cắt tại vị trí gần nhất với maxLength và là dấu gạch ngang
  const truncated = slug.substring(0, maxLength);
  const lastDashIndex = truncated.lastIndexOf("-");

  if (lastDashIndex > 0) {
    return truncated.substring(0, lastDashIndex);
  }

  return truncated;
};

// Export tất cả functions
export default {
  slugify,
  generateUniqueSlug,
  isValidSlug,
  truncateSlug,
};
