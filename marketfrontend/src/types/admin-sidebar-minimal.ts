/**
 * Type definitions cho Admin Sidebar Menu - PHIÊN BẢN TỐI GIẢN
 * Giảm từ 24 items xuống 12 items chính
 */

import {
  LayoutDashboard,
  Package,
  ClipboardList,
  ShoppingBag,
  Sparkles,
  DollarSign,
  Settings,
  Users,
  Shield,
  Store,
  Ticket,
  MessageCircle,
  LucideIcon,
} from "lucide-react";

export type MenuSection = "GENERAL" | "USERS" | "OTHER";

export interface MenuSubItem {
  id: string;
  label: string;
  href: string;
}

export interface MenuItem {
  id: string;
  icon: LucideIcon;
  label: string;
  href?: string;
  section: MenuSection;
  subItems?: MenuSubItem[];
}

export const menuSections: Record<MenuSection, string> = {
  GENERAL: "GENERAL",
  USERS: "USERS",
  OTHER: "OTHER",
};

export const adminMenuItems: MenuItem[] = [
  // ========== GENERAL SECTION (7 items) ==========
  {
    id: "dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/admin",
    section: "GENERAL",
  },
  {
    id: "products",
    icon: Package,
    label: "Products",
    href: "/admin/products",
    section: "GENERAL",
    subItems: [
      { id: "products-all", label: "All Products", href: "/admin/products" },
      { id: "products-create", label: "Create", href: "/admin/products/new" },
      { id: "products-pending", label: "Pending", href: "/admin/products?status=pending" },
    ],
  },
  {
    id: "category",
    icon: ClipboardList,
    label: "Category",
    href: "/admin/category",
    section: "GENERAL",
    subItems: [
      { id: "category-list", label: "List", href: "/admin/category" },
      { id: "category-create", label: "Create", href: "/admin/category/new" },
    ],
  },
  {
    id: "orders",
    icon: ShoppingBag,
    label: "Orders",
    href: "/admin/orders",
    section: "GENERAL",
    subItems: [
      { id: "orders-all", label: "All Orders", href: "/admin/orders" },
      { id: "orders-pending", label: "Pending", href: "/admin/orders?status=pending" },
      { id: "orders-completed", label: "Completed", href: "/admin/orders?status=completed" },
    ],
  },
  {
    id: "attributes",
    icon: Sparkles,
    label: "Attributes",
    href: "/admin/attribute",
    section: "GENERAL",
  },
  {
    id: "finance",
    icon: DollarSign,
    label: "Finance",
    href: "/admin/finance",
    section: "GENERAL",
    subItems: [
      { id: "finance-overview", label: "Overview", href: "/admin/finance" },
      { id: "finance-purchases", label: "Purchases", href: "/admin/finance/purchases" },
      { id: "finance-invoices", label: "Invoices", href: "/admin/finance/invoices" },
      { id: "finance-reports", label: "Reports", href: "/admin/finance/reports" },
    ],
  },
  {
    id: "settings",
    icon: Settings,
    label: "Settings",
    href: "/admin/settings",
    section: "GENERAL",
  },

  // ========== USERS SECTION (3 items) ==========
  {
    id: "customers",
    icon: Users,
    label: "Customers",
    href: "/admin/customers",
    section: "USERS",
  },
  {
    id: "sellers",
    icon: Store,
    label: "Sellers",
    href: "/admin/sellers",
    section: "USERS",
  },
  {
    id: "user-management",
    icon: Shield,
    label: "User Management",
    href: "/admin/users",
    section: "USERS",
    subItems: [
      { id: "users-roles", label: "Roles", href: "/admin/users/roles" },
      { id: "users-permissions", label: "Permissions", href: "/admin/users/permissions" },
    ],
  },

  // ========== OTHER SECTION (2 items) ==========
  {
    id: "coupons",
    icon: Ticket,
    label: "Coupons",
    href: "/admin/coupons",
    section: "OTHER",
  },
  {
    id: "reviews",
    icon: MessageCircle,
    label: "Reviews",
    href: "/admin/reviews",
    section: "OTHER",
  },
];

/**
 * Helper function để lấy menu items theo section
 */
export function getMenuItemsBySection(section: MenuSection): MenuItem[] {
  return adminMenuItems.filter((item) => item.section === section);
}

/**
 * Helper function để tìm menu item theo id
 */
export function findMenuItemById(id: string): MenuItem | undefined {
  return adminMenuItems.find((item) => item.id === id);
}

/**
 * Helper function để kiểm tra route có active không
 */
export function isMenuItemActive(item: MenuItem, currentPath: string): boolean {
  if (item.href === currentPath) return true;
  
  if (item.subItems) {
    return item.subItems.some((subItem) => {
      // Handle dynamic routes
      const subHref = subItem.href.replace("[id]", ".*");
      const regex = new RegExp(`^${subHref.replace(/\//g, "\\/")}$`);
      return regex.test(currentPath) || currentPath.startsWith(item.href || "");
    });
  }
  
  return false;
}
