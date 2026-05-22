
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCustomerDetail } from '@/hooks/admin/useCustomers';
import { ChevronLeft, Save, User, Mail, Phone, ShieldCheck, UploadCloud, MapPin } from 'lucide-react';
import { CustomerStatus } from '@/types';
import { useToast } from '@/context/ToastContext';
import { FormSkeleton } from '@/components/ui/Skeleton';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export default function EditCustomer() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { customer, isLoading, updateCustomer } = useCustomerDetail(id || '');
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    status: 'ACTIVE' as CustomerStatus,
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        status: customer.status,
      });
    }
  }, [customer]);

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.email || !formData.phone) {
      error("Please fill in all the information.");
      return;
    }

    try {
      await updateCustomer(formData);
      success("Customer updated successfully!");
      setTimeout(() => router.push(`/admin/customers/${id}`), 1000);
    } catch (err) {
      console.error(err);
      error("Error occurred while updating the customer.");
    }
  };

  if (isLoading) return <FormSkeleton />;

  if (!customer) return <div className="p-20 text-center">Customer not found</div>;

  return (
    <div className="p-6 lg:p-10 animate-in fade-in duration-500 max-w-5xl mx-auto pb-24 space-y-6">
      <Breadcrumbs items={[
        { label: 'Customers', path: '/admin/customers' },
        { label: 'Edit Customer' }
      ]} />

      {/* Header */}
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push(`/admin/customers/${id}`)}
              className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-500"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-800">Edit Customer Information</h1>
              <p className="text-sm text-slate-500 font-medium mt-1">Update customer profile {customer.accountCode}</p>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push(`/admin/customers/${id}`)}
              className="px-6 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all border-0 bg-transparent"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all border-0"
            >
              <Save size={18} /> Save Changes
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-8 space-y-6">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <User size={16} /> Personal Information
              </h3>

              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Full Name <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-medium"
                      placeholder="Enter full name..."
                    />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700">Email <span className="text-red-500">*</span></label>
                       <div className="relative">
                         <input 
                           type="email" 
                           value={formData.email}
                           onChange={(e) => setFormData({...formData, email: e.target.value})}
                           className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-medium"
                         />
                         <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700">Phone Number <span className="text-red-500">*</span></label>
                       <div className="relative">
                         <input 
                           type="text" 
                           value={formData.phone}
                           onChange={(e) => setFormData({...formData, phone: e.target.value})}
                           className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-medium"
                         />
                         <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Addresses Read-only view (Enhancement) */}
           <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-8 space-y-6">
              <div className="flex items-center justify-between">
                 <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={16} /> Shipping Address
                 </h3>
                 <span className="text-xs font-bold text-slate-400">Edit on the detail page</span>
              </div>
              <div className="space-y-3">
                 {customer.addresses.map((addr, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                       <span className="text-sm font-medium text-slate-700 truncate">{addr.fullAddress}</span>
                       {addr.isDefault && <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded">Default</span>}
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right Column - Status & Avatar */}
        <div className="space-y-8">
           
           <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 space-y-6">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Status</h3>
              
              <div className="space-y-4">
                <div className="relative">
                   <select 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as CustomerStatus})}
                      className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-bold appearance-none cursor-pointer"
                   >
                      <option value="ACTIVE">✅ Active</option>
                      <option value="INACTIVE">⚪ Inactive</option>
                      <option value="BANNED">❌ Banned</option>
                   </select>
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                 <div className="flex justify-between items-center mb-1">
                   <span className="text-xs font-bold text-slate-500 uppercase">Join Date</span>
                   <span className="text-xs font-bold text-slate-700">{new Date(customer.joinedAt).toLocaleDateString()}</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-xs font-bold text-slate-500 uppercase">Last Purchase Date</span>
                   <span className="text-xs font-bold text-slate-700">{customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : 'N/A'}</span>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 space-y-6">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Avatar</h3>
              <div className="flex flex-col items-center">
                 <div className="w-24 h-24 rounded-full border-4 border-slate-100 overflow-hidden mb-4 relative group cursor-pointer">
                    <img src={customer.avatar} alt="" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <UploadCloud size={24} className="text-slate-600" />
                    </div>
                 </div>
                 <button className="text-xs font-bold text-blue-600 hover:underline">Change Image</button>
              </div>
           </div>
           
        </div>
      </div>
    </div>
  );
}
