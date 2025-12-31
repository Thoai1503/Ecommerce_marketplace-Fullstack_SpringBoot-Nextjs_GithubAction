// Original JSON format from your database
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
  dbCategories: DbCategory[]
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

    // Nếu attribute_id chưa tồn tại trong Map
    if (!attributeMap.has(attrId)) {
      attributeMap.set(attrId, {
        id: attrId,
        attribute_id: attrId,
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
        if (unit != 0 && unit != undefined && unit != null) {
          attr.values.push(`${value} ${item.attribute.unit_id}`);
        } else {
          attr.values.push(`${value}`);
        }
      }
    }
  });

  // Chuyển Map thành Array
  return Array.from(attributeMap.values());
}
