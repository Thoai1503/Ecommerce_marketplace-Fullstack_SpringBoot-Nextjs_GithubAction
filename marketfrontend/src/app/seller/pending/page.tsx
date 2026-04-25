"use client";

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Clock, Mail, CheckCircle2, Home, LogIn, Phone, Shield, XCircle, RefreshCw, Loader2, CalendarClock } from 'lucide-react';
import { API_URL } from '@/helper/api';

type ShopStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'BLOCKED';

function formatVNDateTime(d: Date) {
  const days = ['CN', 'T.2', 'T.3', 'T.4', 'T.5', 'T.6', 'T.7'];
  const dow = days[d.getDay()];
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dow}, ${dd}/${mm}/${yy} lúc ${hh}:${mi}`;
}

function PendingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'email của bạn';

  const [status, setStatus] = useState<ShopStatus>('PENDING');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [createdAt, setCreatedAt] = useState<Date | null>(null);
  const [checking, setChecking] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null);
  const [toast, setToast] = useState<{ type: 'info' | 'success'; text: string } | null>(null);

  const fetchStatus = useCallback(async (manual = false) => {
    try {
      const userRaw = localStorage.getItem('user');
      if (!userRaw) return;
      const user = JSON.parse(userRaw);
      const userId = user?.id;
      if (!userId) return;

      if (manual) setChecking(true);
      const res = await fetch(`${API_URL}/shops/by-user/${userId}`);
      const shop = res.ok ? await res.json() : null;
      if (!shop) {
        if (manual) setToast({ type: 'info', text: 'Chưa có thông tin hồ sơ.' });
        return;
      }
      if (shop.status) setStatus(shop.status as ShopStatus);
      if (shop.rejection_reason) setRejectionReason(shop.rejection_reason);
      if (shop.created_at) setCreatedAt(new Date(shop.created_at));
      localStorage.setItem('shop', JSON.stringify(shop));
      setLastCheckedAt(new Date());

      if (manual) {
        if (shop.status === 'ACTIVE') {
          setToast({ type: 'success', text: '🎉 Hồ sơ đã được duyệt! Đang chuyển hướng...' });
          setTimeout(() => router.push('/seller/dashboard'), 1200);
        } else if (shop.status === 'PENDING') {
          setToast({ type: 'info', text: 'Hồ sơ vẫn đang chờ admin xét duyệt.' });
        } else if (shop.status === 'REJECTED') {
          setToast({ type: 'info', text: 'Hồ sơ đã bị từ chối. Xem lý do bên dưới.' });
        }
      }
    } catch {
      if (manual) setToast({ type: 'info', text: 'Không kiểm tra được trạng thái. Vui lòng thử lại.' });
    } finally {
      if (manual) setChecking(false);
    }
  }, [router]);

  // Fetch lần đầu khi load trang
  useEffect(() => {
    fetchStatus(false);
  }, [fetchStatus]);

  // Auto-clear toast sau 4s
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const isRejected = status === 'REJECTED';

  // Tính ETA: created_at + 24h (fallback: now + 24h nếu chưa có createdAt)
  const etaDate = createdAt ? new Date(createdAt.getTime() + 24 * 60 * 60 * 1000) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-[32px] shadow-2xl shadow-blue-500/10 border border-white p-8 lg:p-12 relative overflow-hidden">
        {/* Decorative blob */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/60 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-100/60 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>

        <div className="relative z-10">
          {/* Icon + Heading */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-6">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl ${
                isRejected
                  ? 'bg-gradient-to-br from-rose-500 to-rose-700 shadow-rose-500/30'
                  : 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-blue-500/30'
              }`}>
                {isRejected
                  ? <XCircle size={44} className="text-white" strokeWidth={2} />
                  : <Clock size={44} className="text-white" strokeWidth={2} />}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center shadow-md ${
                isRejected ? 'bg-rose-400' : 'bg-amber-400'
              }`}>
                <span className="text-lg">{isRejected ? '✕' : '⏳'}</span>
              </div>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 mb-3 tracking-tight">
              {isRejected ? 'Hồ sơ bị từ chối' : 'Hồ sơ đang chờ duyệt'}
            </h1>
            <p className="text-base text-slate-600 font-medium max-w-md">
              {isRejected ? (
                <>Rất tiếc, hồ sơ của bạn tại <span className="font-bold text-blue-700">VietCommerce Hub</span> chưa được chấp thuận. Xem lý do bên dưới và cập nhật để đăng ký lại.</>
              ) : (
                <>Cảm ơn bạn đã đăng ký làm nhà bán hàng tại <span className="font-bold text-blue-700">VietCommerce Hub</span>. Admin sẽ xem xét hồ sơ trong vòng 24 giờ.</>
              )}
            </p>
          </div>

          {/* REJECTION REASON BANNER */}
          {isRejected && rejectionReason && (
            <div className="bg-rose-50 border-l-4 border-rose-500 border border-rose-200 rounded-2xl p-5 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center shrink-0">
                  <XCircle size={20} className="text-rose-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-rose-900 mb-1 uppercase tracking-wider">Lý do từ chối</p>
                  <p className="text-sm text-rose-800 font-medium leading-relaxed whitespace-pre-wrap">
                    {rejectionReason}
                  </p>
                  <p className="text-xs text-rose-700 mt-3 font-medium">
                    Vui lòng cập nhật thông tin và liên hệ support@vietcommerce.vn nếu cần hỗ trợ.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Toast banner */}
          {toast && (
            <div className={`mb-5 px-4 py-3 rounded-xl border flex items-start gap-2 text-sm font-semibold ${
              toast.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}>
              {toast.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <Clock size={18} className="shrink-0 mt-0.5" />}
              <span>{toast.text}</span>
            </div>
          )}

          {/* ETA card — chỉ hiện khi PENDING và đã có createdAt */}
          {!isRejected && etaDate && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 mb-5 flex items-center gap-4">
              <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                <CalendarClock size={20} className="text-amber-700" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-black text-amber-700 uppercase tracking-wider">Dự kiến có kết quả trước</p>
                <p className="text-base font-black text-amber-900">{formatVNDateTime(etaDate)}</p>
              </div>
            </div>
          )}

          {/* Email confirmation */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <Mail size={22} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-blue-900 mb-1">Email đăng ký của bạn</p>
              <p className="text-base font-black text-blue-700 break-all">{email}</p>
              <p className="text-xs text-blue-600 mt-2 font-medium">
                Chúng tôi sẽ thông báo kết quả xét duyệt qua email này.
              </p>
            </div>
          </div>

          {/* Timeline các bước */}
          <div className="space-y-3 mb-8">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Các bước tiếp theo</h3>

            <StepItem done label="Đăng ký tài khoản" desc="Bạn đã hoàn tất thông tin đăng ký." />
            {isRejected ? (
              <StepItem
                rejected
                label="Admin đã từ chối hồ sơ"
                desc="Bạn có thể cập nhật thông tin và đăng ký lại."
              />
            ) : (
              <StepItem
                active
                label="Admin xét duyệt hồ sơ"
                desc={
                  etaDate
                    ? `Dự kiến duyệt trước: ${formatVNDateTime(etaDate)} (trong vòng 24h).`
                    : 'Quá trình này mất khoảng 24h làm việc.'
                }
              />
            )}
            <StepItem done={isRejected} label="Nhận email kết quả" desc="Thông báo duyệt / từ chối đã được gửi đến email bạn." />
            <StepItem label="Hoàn thiện hồ sơ cửa hàng" desc="Bổ sung logo, địa chỉ, danh mục, giấy phép..." />
            <StepItem label="Bắt đầu đăng sản phẩm" desc="Khi hồ sơ được duyệt, bạn có thể bắt đầu kinh doanh." />
          </div>

          {/* Lưu ý */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8">
            <div className="flex items-start gap-3">
              <Shield size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 font-medium leading-relaxed">
                <p className="font-bold mb-1">Lưu ý quan trọng</p>
                <ul className="list-disc ml-4 space-y-0.5 text-amber-800">
                  <li>Vui lòng kiểm tra email thường xuyên, bao gồm cả thư mục Spam.</li>
                  <li>Nếu sau 48h chưa nhận được phản hồi, liên hệ hỗ trợ qua hotline.</li>
                  <li>Đảm bảo thông tin đăng ký chính xác để tránh bị từ chối.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Nút kiểm tra trạng thái — chỉ hiện khi PENDING */}
          {!isRejected && (
            <div className="mb-3">
              <button
                type="button"
                onClick={() => fetchStatus(true)}
                disabled={checking}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-blue-200 text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-50 hover:border-blue-300 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {checking ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Đang kiểm tra...
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    Kiểm tra trạng thái hồ sơ
                  </>
                )}
              </button>
              {lastCheckedAt && !checking && (
                <p className="text-[11px] text-slate-400 text-center mt-1.5 font-medium">
                  Lần cuối kiểm tra: {lastCheckedAt.toLocaleTimeString('vi-VN')}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all">
              <Home size={16} />
              Về trang chủ
            </Link>
            {isRejected ? (
              <Link href="/seller/register"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20">
                <RefreshCw size={16} />
                Đăng ký lại
              </Link>
            ) : (
              <Link href="/seller/login"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-700 text-white rounded-xl font-bold text-sm hover:bg-blue-800 transition-all shadow-lg shadow-blue-700/20">
                <LogIn size={16} />
                Đăng nhập
              </Link>
            )}
          </div>

          {/* Support */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 font-medium mb-2">Cần hỗ trợ?</p>
            <div className="flex items-center justify-center gap-4 text-xs">
              <a href="mailto:support@vietcommerce.vn" className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold">
                <Mail size={14} /> support@vietcommerce.vn
              </a>
              <span className="text-slate-300">·</span>
              <a href="tel:19001234" className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold">
                <Phone size={14} /> 1900 1234
              </a>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 italic">
              * Thông tin liên hệ là placeholder cho môi trường demo đồ án.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const StepItem = ({ done, active, rejected, label, desc }: { done?: boolean; active?: boolean; rejected?: boolean; label: string; desc: string }) => (
  <div className="flex items-start gap-4 p-3 rounded-xl">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
      rejected ? 'bg-rose-500' : done ? 'bg-green-500' : active ? 'bg-amber-400 animate-pulse' : 'bg-slate-200'
    }`}>
      {rejected ? (
        <XCircle size={18} className="text-white" strokeWidth={2.5} />
      ) : done ? (
        <CheckCircle2 size={18} className="text-white" strokeWidth={2.5} />
      ) : active ? (
        <Clock size={16} className="text-white" strokeWidth={2.5} />
      ) : (
        <div className="w-2 h-2 bg-slate-400 rounded-full" />
      )}
    </div>
    <div className="flex-1 pt-1">
      <p className={`text-sm font-bold ${rejected ? 'text-rose-900' : done ? 'text-slate-900' : active ? 'text-amber-900' : 'text-slate-400'}`}>
        {label}
      </p>
      <p className={`text-xs mt-0.5 font-medium ${rejected ? 'text-rose-700' : done ? 'text-slate-500' : active ? 'text-amber-700' : 'text-slate-400'}`}>
        {desc}
      </p>
    </div>
  </div>
);

export default function PendingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <PendingContent />
    </Suspense>
  );
}
