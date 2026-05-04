
import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Menu, Moon, Sun, Monitor, ChevronDown, Check, User, Settings as SettingsIcon, History, LogOut, LayoutDashboard } from 'lucide-react';
import NotificationsDropdown from './NotificationsDropdown';
import ToastComponent, { ToastType } from '../../components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/Logo';

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

type Theme = 'light' | 'dark' | 'system';

const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuClick }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  
  const [theme, setTheme] = useState<Theme>('system');
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [toast, setToast] = useState<{ id: string; message: string; type: ToastType } | null>(null);
  const [currentDate, setCurrentDate] = useState<string>('');

  // Format ngày hiện tại (client-side, tránh hydration mismatch)
  useEffect(() => {
    const d = new Date();
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dow = days[d.getDay()];
    const dd = d.getDate();
    const mm = d.getMonth() + 1;
    const yy = d.getFullYear();
    setCurrentDate(`${dow}, ${dd} tháng ${mm}, ${yy}`);
  }, []);

  const themeDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Load theme from localStorage on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme;
      if (savedTheme) {
        setTheme(savedTheme);
      }
    }
  }, []);

  // Logic xử lý chuyển đổi giao diện
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const root = window.document.documentElement;
    const applyTheme = (t: Theme) => {
      root.classList.remove('light', 'dark');
      if (t === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(t);
      }
    };

    applyTheme(theme);
    localStorage.setItem('theme', theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') applyTheme('system');
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Đóng các dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setIsThemeOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = (path: string) => {
    if (path.includes('/orders')) return 'Đơn hàng';
    if (path.includes('/products')) return 'Sản phẩm';
    if (path.includes('/customers')) return 'Khách hàng';
    if (path.includes('/categories')) return 'Danh mục';
    if (path.includes('/settings')) return 'Cài đặt';
    if (path.includes('/finance')) return 'Tài chính';
    if (path.includes('/sellers')) return 'Nhà bán hàng';
    return 'Dashboard';
  };

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await logout();
  };

  const navigateTo = (path: string) => {
    router.push(path);
    setIsProfileOpen(false);
  };

  const themeOptions = [
    { id: 'light', label: 'Light', icon: <Sun size={18} /> },
    { id: 'dark', label: 'Dark', icon: <Moon size={18} /> },
    { id: 'system', label: 'System', icon: <Monitor size={18} /> },
  ];

  return (
    <header className="h-24 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 lg:px-10 flex items-center justify-between sticky top-0 z-40 transition-all">
      {toast && <ToastComponent toast={toast} onClose={(id) => setToast(null)} />}
      
      <div className="flex items-center gap-6">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 border-0 bg-transparent transition-all"
        >
          <Menu size={24} />
        </button>

        <div className="lg:hidden flex items-center justify-center">
          <Logo variant="admin" size={32} />
        </div>

        <div className="flex flex-col">
          <h1 className="text-[26px] font-bold text-[#1e293b] dark:text-white leading-tight tracking-tight">
            {getPageTitle(pathname)}
          </h1>
          <span className="text-[13px] font-medium text-slate-400 mt-0.5">
            {currentDate || '\u00A0'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-5">
        <div className="relative group hidden md:block">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
            <Search size={20} strokeWidth={2} />
          </span>
          <input 
            type="text" 
            placeholder="Tìm kiếm..." 
            className="w-64 pl-12 pr-4 py-2.5 bg-slate-50/80 dark:bg-slate-800 border-0 rounded-2xl text-[14px] text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white dark:focus:bg-slate-700 transition-all duration-300"
          />
        </div>

        {/* Theme Switcher */}
        <div className="relative" ref={themeDropdownRef}>
          <button 
            onClick={() => setIsThemeOpen(!isThemeOpen)}
            className={`p-2.5 rounded-xl transition-all border-0 bg-transparent ${isThemeOpen ? 'bg-slate-100 dark:bg-slate-800 text-blue-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            {theme === 'light' ? <Sun size={22} /> : theme === 'dark' ? <Moon size={22} /> : <Monitor size={22} />}
          </button>

          {isThemeOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 animate-in fade-in zoom-in-95 duration-200 overflow-hidden z-50">
              {themeOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    setTheme(option.id as Theme);
                    setIsThemeOpen(false);
                  }}
                  className={`w-[calc(100%-8px)] mx-1 my-0.5 flex items-center justify-between px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all border-0 ${
                    theme === option.id 
                      ? 'bg-[#2ca58d] text-white' 
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 bg-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={theme === option.id ? 'text-white' : 'text-slate-500'}>
                      {option.icon}
                    </span>
                    {option.label}
                  </div>
                  {theme === option.id && <Check size={16} className="text-blue-200 stroke-[3px]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <NotificationsDropdown />

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileDropdownRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`flex items-center gap-3 pl-1 pr-4 py-1 border-2 rounded-[20px] transition-all duration-300 group ml-2 bg-transparent ${isProfileOpen ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30' : 'border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30'}`}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
                alt="Admin" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-200">Admin User</span>
            <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180 text-blue-600' : 'group-hover:text-blue-600'}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50 overflow-hidden">
              <div className="px-5 py-3">
                <p className="text-[15px] font-black text-slate-800 dark:text-white">Tài khoản của tôi</p>
                <p className="text-[11px] font-medium text-slate-400">admin@staygo.com</p>
              </div>
              
              <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2"></div>
              
              <div className="p-2 space-y-1">
                <button 
                  onClick={() => navigateTo('/admin/settings?tab=profile')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-[14px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors border-0 bg-transparent text-left"
                >
                  <User size={18} />
                  Hồ sơ
                </button>
                
                <button 
                  onClick={() => navigateTo('/admin/settings?tab=general')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-[14px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors border-0 bg-transparent text-left"
                >
                  <SettingsIcon size={18} />
                  Cài đặt
                </button>
                
                <button 
                  onClick={() => {
                    setToast({ id: Date.now().toString(), message: "Tính năng Lịch sử hoạt động sẽ sớm ra mắt.", type: "info" });
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-[14px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors border-0 bg-transparent text-left"
                >
                  <History size={18} />
                  Lịch sử hoạt động
                </button>
              </div>
              
              <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2"></div>
              
              <div className="p-2">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-[14px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors border-0 bg-transparent text-left"
                >
                  <LogOut size={18} />
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
