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
