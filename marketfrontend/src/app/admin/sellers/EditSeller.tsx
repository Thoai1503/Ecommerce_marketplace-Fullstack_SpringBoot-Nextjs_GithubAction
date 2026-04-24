
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSellerDetail } from '../../../hooks/admin/useSellers';
import { 
  ChevronLeft, Save, UploadCloud, Store, MapPin, Contact, 
  ShieldCheck, Globe, AlertCircle, Key, Info, RefreshCw, 
  CheckCircle2, Lock, Mail, UserPlus, Eye, EyeOff
} from 'lucide-react';
import { SellerStatus } from '../../../types/index';
import ToastComponent, { ToastType } from '../../../components/ui/Toast';
import { z } from 'zod';
import Breadcrumbs from '../../../components/ui/Breadcrumbs';

// --- ZOD SCHEMA ---
const sellerSchema = z.object({
  brandTitle: z.string().min(1, "Tên thương hiệu là bắt buộc."),
  category: z.string().min(1),
  website: z.string().optional().refine(val => !val || /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(val), "Địa chỉ website không hợp lệ."),
  location: z.string().min(1, "Địa chỉ kho/văn phòng là bắt buộc."),
  email: z.string().min(1, "Email là bắt buộc.").email("Định dạng email không hợp lệ."),
  phone: z.string().min(1, "Số điện thoại là bắt buộc.").regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, "Số điện thoại không đúng định dạng VN."),
  status: z.enum(['ACTIVE', 'BLOCKED', 'PENDING']),
  ownerName: z.string().min(1, "Tên người đại diện là bắt buộc."),
  password: z.string().optional(),
});

export default function EditSeller() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const isEditMode = !!id;
  
  const { seller, isLoading, createSeller, updateSeller, isSaving } = useSellerDetail(id || '');
  
  // --- STATE ---
  const [formData, setFormData] = useState({
    brandTitle: '',
    category: 'Fashion',
    website: '',
    location: '',
    email: '',
    phone: '',
    status: 'PENDING' as SellerStatus,
    ownerName: '',
    logoUrl: '', 
  });

  // Password Management
  const [authMethod, setAuthMethod] = useState<'invite' | 'manual'>('invite');
  const [manualPassword, setManualPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Validation & UI State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ id: string; message: string; type: ToastType } | null>(null);
  const [isCheckDuplicating, setIsCheckDuplicating] = useState(false);

  // Load data for Edit Mode
  useEffect(() => {
    if (isEditMode && seller) {
      setFormData({
        brandTitle: seller.brandTitle,
        category: seller.category,
        website: seller.website || '',
        location: seller.location,
        email: seller.email,
        phone: seller.phone,
        status: seller.status,
        ownerName: seller.ownerName,
        logoUrl: seller.logoUrl,
      });
    }
  }, [isEditMode, seller]);

  // --- LOGIC ---

  // Mock Async Validation (Check duplicate email/phone)
  const checkDuplicate = async (field: 'email' | 'phone', value: string) => {
    if (!value) return false;
    setIsCheckDuplicating(true);
    // Simulate API delay
    await new Promise(r => setTimeout(r, 600)); 
    setIsCheckDuplicating(false);
    
    // Mock logic: fail if email/phone contains "exist"
    if (value.toLowerCase().includes('exist')) {
       return true;
    }
    return false;
  };

  const validateForm = async () => {
    // 1. Zod Sync Validation
    const payloadToValidate = {
      ...formData,
      password: (!isEditMode && authMethod === 'manual') ? manualPassword : undefined
    };

    // If manual auth, require password min 8 chars
    const extendedSchema = sellerSchema.superRefine((data, ctx) => {
      if (data.password !== undefined && data.password.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Mật khẩu phải có ít nhất 8 ký tự.",
          path: ["password"],
        });
      }
    });

    const result = extendedSchema.safeParse(payloadToValidate);

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        newErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(newErrors);
      return false;
    }

    // 2. Async Validation (Duplicates) - Only if sync valid and Not Edit Mode
    if (!isEditMode) {
       const isEmailDuplicate = await checkDuplicate('email', formData.email);
       if (isEmailDuplicate) {
         setErrors(prev => ({ ...prev, email: "Email này đã được sử dụng trên hệ thống." }));
         return false;
       }
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (action: 'save' | 'save_and_add') => {
    const isValid = await validateForm();
    if (!isValid) {
      setToast({ id: Date.now().toString(), message: "Vui lòng kiểm tra lại thông tin nhập liệu.", type: "error" });
      return;
    }

    try {
      if (isEditMode) {
        await updateSeller(formData);
        setToast({ id: Date.now().toString(), message: "Cập nhật thông tin thành công!", type: "success" });
        setTimeout(() => router.push('/admin/sellers'), 1000);
      } else {
        // Create Logic
        await createSeller({
           ...formData,
           logoUrl: formData.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.brandTitle)}&background=random`
        });
        
        setToast({ id: Date.now().toString(), message: `Đã tạo tài khoản cho "${formData.brandTitle}"!`, type: "success" });
        
        if (action === 'save_and_add') {
           // Reset form completely for next entry
           setFormData({
             brandTitle: '', category: 'Fashion', website: '', location: '',
             email: '', phone: '', status: 'PENDING', ownerName: '', logoUrl: ''
           });
           setManualPassword('');
           setAuthMethod('invite');
           window.scrollTo(0, 0);
        } else {
           setTimeout(() => router.push('/admin/sellers'), 1000);
        }
      }
    } catch (e) {
      setToast({ id: Date.now().toString(), message: "Đã có lỗi xảy ra. Vui lòng thử lại.", type: "error" });
    }
  };

  if (isEditMode && isLoading) return (
    <div className="p-20 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-bold text-slate-400">Đang tải dữ liệu...</p>
    </div>
  );

  return (
    <div className="p-6 lg:p-10 animate-in fade-in duration-500 max-w-6xl mx-auto pb-24 space-y-6">
      {toast && <ToastComponent toast={toast} onClose={(id) => setToast(null)} />}

      <Breadcrumbs items={[
        { label: 'Sellers', path: '/admin/sellers' },
        { label: isEditMode ? 'Edit Seller' : 'Add Seller' }
      ]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/admin/sellers')}
              className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-500"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                {isEditMode ? 'Chỉnh sửa Seller' : 'Thêm Nhà bán hàng'}
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">
                {isEditMode ? `Cập nhật thông tin cho mã: ${seller?.accountCode}` : 'Thiết lập hồ sơ và tài khoản cho đối tác mới.'}
              </p>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/admin/sellers')}
              className="px-5 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all border-0 bg-transparent"
            >
              Hủy
            </button>
            
            {!isEditMode && (
               <button 
                 onClick={() => handleSubmit('save_and_add')}
                 disabled={isSaving || isCheckDuplicating}
                 className="hidden md:flex items-center gap-2 px-5 py-3 bg-white border-2 border-blue-100 text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-50 transition-all shadow-sm disabled:opacity-50"
               >
                 <RefreshCw size={18} /> Lưu & Thêm tiếp
               </button>
            )}

            <button 
              onClick={() => handleSubmit('save')}
              disabled={isSaving || isCheckDuplicating}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all border-0 disabled:opacity-50"
            >
              {isSaving ? 'Đang xử lý...' : isEditMode ? <><Save size={18} /> Lưu thay đổi</> : <><UserPlus size={18} /> Tạo tài khoản</>}
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Main Form */}
        <div className="lg:col-span-2 space-y-8">
           
           {/* Section 1: Store Info */}
           <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-8 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-4">
                 <Store size={18} className="text-blue-500" /> Thông tin cửa hàng
              </h3>

              <div className="space-y-6">
                 {/* Logo Upload Mock */}
                 <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all cursor-pointer overflow-hidden relative group">
                       {formData.logoUrl ? (
                          <>
                            <img src={formData.logoUrl} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                               <UploadCloud size={24} className="text-white" />
                            </div>
                          </>
                       ) : (
                          <>
                            <UploadCloud size={24} className="mb-1" />
                            <span className="text-[10px] font-bold uppercase">Logo</span>
                          </>
                       )}
                    </div>
                    <div className="flex-1">
                       <label className="text-sm font-bold text-slate-700 block mb-2">
                          Tên thương hiệu (Brand Title) <span className="text-red-500">*</span>
                       </label>
                       <input 
                         type="text" 
                         value={formData.brandTitle}
                         onChange={(e) => {
                            setFormData({...formData, brandTitle: e.target.value});
                            if (errors.brandTitle) setErrors({...errors, brandTitle: ''});
                         }}
                         className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-4 text-sm font-bold transition-all ${errors.brandTitle ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-500/10'}`}
                         placeholder="VD: ZARA International"
                       />
                       {errors.brandTitle && <p className="text-xs text-red-500 mt-1 font-bold flex items-center gap-1"><AlertCircle size={10} /> {errors.brandTitle}</p>}
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700">Danh mục chính</label>
                       <div className="relative">
                          <select 
                             value={formData.category}
                             onChange={(e) => setFormData({...formData, category: e.target.value})}
                             className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-medium appearance-none cursor-pointer"
                          >
                             <option value="Fashion">Fashion</option>
                             <option value="Electronics">Electronics</option>
                             <option value="Watches">Watches</option>
                             <option value="Home & Living">Home & Living</option>
                             <option value="Accessories">Accessories</option>
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700">Website</label>
                       <div className="relative">
                          <input 
                            type="text" 
                            value={formData.website}
                            onChange={(e) => {
                               setFormData({...formData, website: e.target.value});
                               if (errors.website) setErrors({...errors, website: ''});
                            }}
                            className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-4 text-sm font-medium transition-all ${errors.website ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-500/10'}`}
                            placeholder="www.example.com"
                          />
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                       </div>
                       {errors.website && <p className="text-xs text-red-500 mt-1 font-bold">{errors.website}</p>}
                    </div>
                 </div>
              </div>
           </div>

           {/* Section 2: Contact Info */}
           <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-8 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-4">
                 <Contact size={18} className="text-purple-500" /> Thông tin liên hệ
              </h3>

              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Tên người đại diện (Owner Name) <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={formData.ownerName}
                      onChange={(e) => {
                         setFormData({...formData, ownerName: e.target.value});
                         if (errors.ownerName) setErrors({...errors, ownerName: ''});
                      }}
                      className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-4 text-sm font-medium transition-all ${errors.ownerName ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-purple-500/10'}`}
                      placeholder="VD: Nguyễn Văn A"
                    />
                    {errors.ownerName && <p className="text-xs text-red-500 mt-1 font-bold">{errors.ownerName}</p>}
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700">Email (Tài khoản chính) <span className="text-red-500">*</span></label>
                       <input 
                         type="email" 
                         value={formData.email}
                         onChange={(e) => {
                            setFormData({...formData, email: e.target.value});
                            if (errors.email) setErrors({...errors, email: ''});
                         }}
                         className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-4 text-sm font-medium transition-all ${errors.email ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-purple-500/10'}`}
                         placeholder="email@example.com"
                       />
                       {errors.email && <p className="text-xs text-red-500 mt-1 font-bold">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700">Số điện thoại <span className="text-red-500">*</span></label>
                       <input 
                         type="text" 
                         value={formData.phone}
                         onChange={(e) => {
                            setFormData({...formData, phone: e.target.value});
                            if (errors.phone) setErrors({...errors, phone: ''});
                         }}
                         className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-4 text-sm font-medium transition-all ${errors.phone ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-purple-500/10'}`}
                         placeholder="09xxx"
                       />
                       {errors.phone && <p className="text-xs text-red-500 mt-1 font-bold">{errors.phone}</p>}
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Địa chỉ kho/văn phòng <span className="text-red-500">*</span></label>
                    <div className="relative">
                       <input 
                         type="text" 
                         value={formData.location}
                         onChange={(e) => {
                            setFormData({...formData, location: e.target.value});
                            if (errors.location) setErrors({...errors, location: ''});
                         }}
                         className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-4 text-sm font-medium transition-all ${errors.location ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-purple-500/10'}`}
                         placeholder="VD: 123 Đường ABC, Quận 1..."
                       />
                       <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    </div>
                    {errors.location && <p className="text-xs text-red-500 mt-1 font-bold">{errors.location}</p>}
                 </div>
              </div>
           </div>
        </div>

        {/* RIGHT COLUMN: Settings & Auth */}
        <div className="space-y-8">
           
           {/* Section 3: Auth & Password (CREATE MODE ONLY) */}
           {!isEditMode && (
              <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 space-y-4 animate-in slide-in-from-right-4 duration-500">
                 <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <Key size={18} className="text-slate-600" /> Thiết lập mật khẩu
                 </h3>
                 
                 <div className="space-y-4">
                    {/* Method Toggle */}
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                       <button 
                         onClick={() => setAuthMethod('invite')}
                         className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authMethod === 'invite' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                       >
                         Gửi Email Mời
                       </button>
                       <button 
                         onClick={() => setAuthMethod('manual')}
                         className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authMethod === 'manual' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                       >
                         Tạo Thủ Công
                       </button>
                    </div>

                    {/* Content based on selection */}
                    {authMethod === 'invite' ? (
                       <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                          <div className="flex items-start gap-3">
                             <div className="p-2 bg-blue-100 rounded-lg text-blue-600 shrink-0">
                                <Mail size={18} />
                             </div>
                             <div>
                                <p className="text-sm font-bold text-blue-900">Email kích hoạt</p>
                                <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                                   Hệ thống sẽ gửi link đặt mật khẩu đến <strong>{formData.email || 'email này'}</strong>. Seller tự thiết lập mật khẩu khi đăng nhập lần đầu.
                                </p>
                             </div>
                          </div>
                       </div>
                    ) : (
                       <div className="space-y-3">
                          <label className="text-xs font-bold text-slate-500 uppercase">Mật khẩu khởi tạo <span className="text-red-500">*</span></label>
                          <div className="relative">
                             <input 
                               type={showPassword ? "text" : "password"}
                               value={manualPassword}
                               onChange={(e) => {
                                  setManualPassword(e.target.value);
                                  if (errors.password) setErrors({...errors, password: ''});
                               }}
                               className={`w-full pl-10 pr-10 py-3 bg-white border rounded-xl focus:outline-none focus:ring-4 text-sm font-bold tracking-wider ${errors.password ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-500/10'}`}
                               placeholder="Nhập mật khẩu..."
                             />
                             <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                             <button 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                             >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                             </button>
                          </div>
                          {errors.password ? (
                             <p className="text-xs text-red-500 font-bold flex items-center gap-1"><AlertCircle size={10} /> {errors.password}</p>
                          ) : (
                             <div className="flex gap-2">
                                <span className={`h-1 flex-1 rounded-full ${manualPassword.length > 0 ? (manualPassword.length < 8 ? 'bg-red-200' : 'bg-green-400') : 'bg-slate-100'}`}></span>
                                <span className={`h-1 flex-1 rounded-full ${manualPassword.length >= 8 ? 'bg-green-400' : 'bg-slate-100'}`}></span>
                                <span className={`h-1 flex-1 rounded-full ${manualPassword.length >= 12 ? 'bg-green-400' : 'bg-slate-100'}`}></span>
                             </div>
                          )}
                          <p className="text-[10px] text-slate-400 flex items-center gap-1">
                             <Info size={10} /> Hãy chia sẻ mật khẩu này cho Seller.
                          </p>
                       </div>
                    )}
                 </div>
              </div>
           )}

           {/* Section 4: Status Management */}
           <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 space-y-6">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                 <ShieldCheck size={18} className="text-green-500" /> Trạng thái hoạt động
              </h3>
              
              <div className="space-y-4">
                 <div className="grid grid-cols-1 gap-3">
                    {[
                       { id: 'PENDING', label: 'PENDING (Chờ duyệt)', desc: 'Chưa thể đăng bán, chờ admin duyệt hồ sơ.' },
                       { id: 'ACTIVE', label: 'ACTIVE (Hoạt động)', desc: 'Được phép đăng bán và truy cập hệ thống.' },
                       { id: 'BLOCKED', label: 'BLOCKED (Khóa)', desc: 'Tài khoản bị vô hiệu hóa tạm thời.' }
                    ].map((st) => (
                       <button 
                          key={st.id}
                          onClick={() => setFormData({...formData, status: st.id as SellerStatus})}
                          className={`flex flex-col items-start p-3 rounded-xl border-2 transition-all text-left relative ${
                             formData.status === st.id 
                             ? (st.id === 'ACTIVE' ? 'bg-green-50 border-green-500' : st.id === 'BLOCKED' ? 'bg-red-50 border-red-500' : 'bg-amber-50 border-amber-500')
                             : 'bg-white border-slate-100 hover:border-slate-300'
                          }`}
                       >
                          <div className="flex items-center justify-between w-full">
                             <span className={`text-xs font-black uppercase ${
                                formData.status === st.id 
                                ? (st.id === 'ACTIVE' ? 'text-green-700' : st.id === 'BLOCKED' ? 'text-red-700' : 'text-amber-700') 
                                : 'text-slate-600'
                             }`}>
                                {st.label}
                             </span>
                             {formData.status === st.id && <CheckCircle2 size={16} className="text-current" />}
                          </div>
                          <span className="text-[10px] text-slate-500 mt-1 font-medium leading-tight">{st.desc}</span>
                       </button>
                    ))}
                 </div>
              </div>
           </div>

           {/* Read-only Stats (Only show in Edit Mode) */}
           {isEditMode && seller && (
              <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 space-y-4">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Thống kê nhanh</h3>
                 
                 <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-sm font-medium text-slate-600">Ngày đăng ký</span>
                    <span className="text-sm font-bold text-slate-800">{new Date(seller.createdAt).toLocaleDateString()}</span>
                 </div>
                 <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-sm font-medium text-slate-600">Tổng sản phẩm</span>
                    <span className="text-sm font-bold text-slate-800">{seller.totalProducts}</span>
                 </div>
                 <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-sm font-medium text-slate-600">Tổng doanh thu</span>
                    <span className="text-sm font-bold text-blue-600">{(seller.totalRevenue / 1000000).toFixed(1)}M</span>
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
}
