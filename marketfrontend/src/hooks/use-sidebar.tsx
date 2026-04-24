"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

interface SidebarContextValue {
  /** Sidebar có đang collapsed không (desktop) */
  isCollapsed: boolean;
  /** Sidebar mobile có đang mở không */
  isMobileOpen: boolean;
  /** Toggle collapsed state */
  toggleSidebar: () => void;
  /** Set collapsed state */
  setCollapsed: (collapsed: boolean) => void;
  /** Toggle mobile sidebar */
  toggleMobileSidebar: () => void;
  /** Set mobile sidebar open state */
  setMobileOpen: (open: boolean) => void;
  /** Đang ở mobile view không */
  isMobile: boolean;
}

/** Props cho SidebarProvider */
interface SidebarProviderProps {
  children: ReactNode;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
  /** Key để lưu vào localStorage */
  storageKey?: string;
  /** Breakpoint cho mobile (px) */
  mobileBreakpoint?: number;
}
const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

export function SidebarProvider({
  children,
  defaultCollapsed = false,
  storageKey = "sidebar-collapsed",
  mobileBreakpoint = 1024, // lg breakpoint
}: SidebarProviderProps) {
  // State: Collapsed (desktop)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) {
        return stored === "true";
      }
    }
    return defaultCollapsed;
  });

  // State: Mobile open
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // State: Is mobile view
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < mobileBreakpoint;
    }
    return false;
  });

  // Effect: Resize listener
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < mobileBreakpoint;
      setIsMobile(mobile);
      
      // Tự động đóng mobile sidebar khi resize lên desktop
      if (!mobile && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileBreakpoint, isMobileOpen]);

  // Effect: Lưu collapsed state vào localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, String(isCollapsed));
  }, [isCollapsed, storageKey]);

  // Effect: Disable body scroll khi mobile sidebar mở
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  // Handler: Toggle collapsed
  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setIsMobileOpen((prev) => !prev);
    } else {
      setIsCollapsed((prev) => !prev);
    }
  }, [isMobile]);

  // Handler: Set collapsed
  const setCollapsed = useCallback((collapsed: boolean) => {
    setIsCollapsed(collapsed);
  }, []);

  // Handler: Toggle mobile
  const toggleMobileSidebar = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  // Handler: Set mobile open
  const setMobileOpen = useCallback((open: boolean) => {
    setIsMobileOpen(open);
  }, []);

  const value: SidebarContextValue = {
    isCollapsed,
    isMobileOpen,
    toggleSidebar,
    setCollapsed,
    toggleMobileSidebar,
    setMobileOpen,
    isMobile,
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarContextValue {
  const context = useContext(SidebarContext);
  
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  
  return context;
}
