"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSellerAuth } from "@/context/SellerAuthContext";
import http from "@/lib/http";
import { getUserInfoById } from "@/service/userInfo";
import {
  ArrowUpRight,
  Banknote,
  Building2,
  Clock3,
  CreditCard,
  Download,
  HandCoins,
  Landmark,
  Wallet,
} from "lucide-react";

const currency = (value: number) =>
  value.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });

type WalletTransaction = {
  id: number;
  date: string;
  type: "Doanh thu đơn hàng" | "Hoàn tiền" | "Phí sàn" | "Rút tiền";
  description: string;
  amount: number;
  balanceAfter: number;
  status: "Hoàn thành" | "Đang xử lý" | "Đã hủy";
  isIncome: boolean;
};

const mockTransactions: WalletTransaction[] = [
  {
    id: 1,
    date: "2026-05-23 08:14",
    type: "Doanh thu đơn hàng",
    description: "Đơn #260520UNSABP05 - Apple MFi cable",
    amount: 28050,
    balanceAfter: 2239537,
    status: "Hoàn thành",
    isIncome: true,
  },
  {
    id: 2,
    date: "2026-05-21 18:22",
    type: "Doanh thu đơn hàng",
    description: "Đơn #260516HM2QKKRR - Pin sạc dự phòng",
    amount: 28050,
    balanceAfter: 2211487,
    status: "Hoàn thành",
    isIncome: true,
  },
  {
    id: 3,
    date: "2026-05-21 12:10",
    type: "Doanh thu đơn hàng",
    description: "Đơn #260513AS3HTSVG - Máy điều tốc PWM",
    amount: 274660,
    balanceAfter: 2183437,
    status: "Hoàn thành",
    isIncome: true,
  },
  {
    id: 4,
    date: "2026-05-20 16:43",
    type: "Phí sàn",
    description: "Khấu trừ phí nền tảng cho 1 giao dịch",
    amount: -15750,
    balanceAfter: 1908777,
    status: "Hoàn thành",
    isIncome: false,
  },
  {
    id: 5,
    date: "2026-05-19 09:35",
    type: "Rút tiền",
    description: "Yêu cầu rút về tài khoản ngân hàng",
    amount: -500000,
    balanceAfter: 1924527,
    status: "Đang xử lý",
    isIncome: false,
  },
];

const quickStats = [
  {
    label: "Số dư khả dụng",
    value: 2239537,
    hint: "Có thể rút hoặc dùng để bù trừ",
    icon: <Wallet className="text-emerald-600" size={22} />,
    tone: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Đang tạm giữ",
    value: 320000,
    hint: "Đơn đang chờ hoàn tất hoặc đối soát",
    icon: <Clock3 className="text-amber-600" size={22} />,
    tone: "bg-amber-50 text-amber-600",
  },
  {
    label: "Đã rút trong tháng",
    value: 850000,
    hint: "Tổng giao dịch rút tiền thành công",
    icon: <HandCoins className="text-blue-600" size={22} />,
    tone: "bg-blue-50 text-blue-600",
  },
  {
    label: "Doanh thu ước tính",
    value: 3567000,
    hint: "Trước khi trừ phí và hoàn tiền",
    icon: <Banknote className="text-violet-600" size={22} />,
    tone: "bg-violet-50 text-violet-600",
  },
];

type SellerWalletApi = {
  id?: number;
  userId?: number;
  user_id?: number;
  walletCode?: string;
  wallet_code?: string;
  currency?: string;
  balance?: number;
  availableBalance?: number;
  available_balance?: number;
  pendingBalance?: number;
  pending_balance?: number;
  status?: string;
};

const parseNumber = (value: unknown, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const normalizeWallet = (raw: SellerWalletApi): SellerWalletApi => ({
  ...raw,
  userId: parseNumber(raw.userId ?? raw.user_id, 0),
  balance: parseNumber(
    raw.balance ?? raw.availableBalance ?? raw.available_balance,
    0,
  ),
  availableBalance: parseNumber(
    raw.availableBalance ?? raw.available_balance,
    0,
  ),
  pendingBalance: parseNumber(raw.pendingBalance ?? raw.pending_balance, 0),
  walletCode: raw.walletCode ?? raw.wallet_code ?? "",
});

const buildWalletCode = (ownerUserId: number) => `WALLET-U${ownerUserId}`;

export default function SellerWalletPage() {
  const { shop, userId } = useSellerAuth();
  const ownerUserId = Number(shop?.user_id ?? userId ?? 0);
  const [wallet, setWallet] = useState<SellerWalletApi | null>(null);
  const [isCheckingWallet, setIsCheckingWallet] = useState(true);
  const [needsWalletCreation, setNeedsWalletCreation] = useState(false);
  const [walletError, setWalletError] = useState("");
  const [password, setPassword] = useState("");
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [createWalletError, setCreateWalletError] = useState("");
  const [createWalletSuccess, setCreateWalletSuccess] = useState("");

  const shopName = shop?.shop_name || shop?.shop_description || "Seller Shop";
  const shopInitial = shopName.charAt(0).toUpperCase();

  const fetchWallet = async (targetUserId: number) => {
    try {
      setIsCheckingWallet(true);
      setWalletError("");
      const response = await http.get(`/api/wallets/user/${targetUserId}`);
      setWallet(normalizeWallet(response?.data || {}));
      setNeedsWalletCreation(false);
    } catch (error: any) {
      const status = Number(error?.response?.status || 0);
      if (status === 404) {
        setWallet(null);
        setNeedsWalletCreation(true);
      } else {
        setWallet(null);
        setNeedsWalletCreation(false);
        setWalletError(
          error?.response?.data || "Không thể tải ví. Vui lòng thử lại sau.",
        );
      }
    } finally {
      setIsCheckingWallet(false);
    }
  };

  useEffect(() => {
    if (!Number.isFinite(ownerUserId) || ownerUserId <= 0) {
      setIsCheckingWallet(false);
      setNeedsWalletCreation(false);
      setWalletError("Không xác định được user của shop hiện tại.");
      return;
    }

    fetchWallet(ownerUserId);
  }, [ownerUserId]);

  const handleCreateWallet = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!ownerUserId || ownerUserId <= 0) {
      setCreateWalletError("Không xác định được user để tạo ví.");
      return;
    }
    if (!password.trim()) {
      setCreateWalletError("Vui lòng nhập mật khẩu.");
      return;
    }

    try {
      setIsCreatingWallet(true);
      setCreateWalletError("");
      setCreateWalletSuccess("");

      let email = "";
      if (typeof window !== "undefined") {
        try {
          const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
          if (Number(storedUser?.id || 0) === ownerUserId) {
            email = String(storedUser?.email || "").trim();
          }
        } catch {
          email = "";
        }
      }

      if (!email) {
        const userInfo = await getUserInfoById(ownerUserId);
        email = String(userInfo?.email || "").trim();
      }

      if (!email) {
        setCreateWalletError(
          "Không tìm thấy email của user hiện tại để xác thực mật khẩu.",
        );
        return;
      }

      await http.post("/users/login", { email, password });

      try {
        await http.post("/api/wallets", {
          userId: ownerUserId,
          walletCode: buildWalletCode(ownerUserId),
          currency: "VND",
        });
      } catch (createError: any) {
        const status = Number(createError?.response?.status || 0);
        if (status !== 409) {
          throw createError;
        }

        await http.post("/api/wallets", {
          userId: ownerUserId,
          walletCode: `${buildWalletCode(ownerUserId)}-${Date.now()}`,
          currency: "VND",
        });
      }

      setCreateWalletSuccess("Tạo ví thành công.");
      setPassword("");
      await fetchWallet(ownerUserId);
    } catch (error: any) {
      const status = Number(error?.response?.status || 0);
      if (status === 400 || status === 401) {
        setCreateWalletError("Mật khẩu không đúng. Vui lòng thử lại.");
      } else {
        setCreateWalletError(
          error?.response?.data || "Tạo ví thất bại. Vui lòng thử lại.",
        );
      }
    } finally {
      setIsCreatingWallet(false);
    }
  };

  const summary = useMemo(() => {
    const income = mockTransactions
      .filter((item) => item.isIncome)
      .reduce((sum, item) => sum + item.amount, 0);
    const expense = mockTransactions
      .filter((item) => !item.isIncome)
      .reduce((sum, item) => sum + Math.abs(item.amount), 0);

    return { income, expense };
  }, []);

  const availableBalance = parseNumber(
    wallet?.availableBalance ?? wallet?.available_balance ?? wallet?.balance,
    2239537,
  );
  const pendingBalance = parseNumber(
    wallet?.pendingBalance ?? wallet?.pending_balance,
    320000,
  );

  if (isCheckingWallet) {
    return (
      <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <div
          className="card border-0 shadow-sm"
          style={{ maxWidth: 520, width: "100%" }}
        >
          <div className="card-body p-4 text-center">
            <h5 className="fw-bold mb-2">Đang kiểm tra ví...</h5>
            <p className="text-muted mb-0">Vui lòng đợi trong giây lát.</p>
          </div>
        </div>
      </div>
    );
  }

  if (needsWalletCreation) {
    return (
      <div className="bg-light min-vh-100">
        <div className="bg-white border-bottom py-3 px-4">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-danger text-white rounded p-2 d-flex align-items-center justify-content-center">
              <Wallet size={24} />
            </div>
            <div>
              <h5 className="mb-0 fw-bold">Số Dư TK Shopee</h5>
              <small className="text-muted">
                Xác thực để khởi tạo ví seller
              </small>
            </div>
          </div>
        </div>

        <div className="container-fluid p-4">
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6 col-xl-5">
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-2">Shop chưa có ví</h5>
                  <p className="text-muted mb-4">
                    Nhập mật khẩu tài khoản của user shop để xác thực và tạo ví.
                  </p>

                  <form onSubmit={handleCreateWallet}>
                    <div className="mb-3">
                      <label
                        htmlFor="wallet-password"
                        className="form-label fw-semibold"
                      >
                        Mật khẩu tài khoản
                      </label>
                      <input
                        id="wallet-password"
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Nhập mật khẩu"
                        autoComplete="current-password"
                        disabled={isCreatingWallet}
                      />
                    </div>

                    {createWalletError && (
                      <div className="alert alert-danger py-2" role="alert">
                        {createWalletError}
                      </div>
                    )}
                    {createWalletSuccess && (
                      <div className="alert alert-success py-2" role="alert">
                        {createWalletSuccess}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="btn btn-danger w-100 fw-bold"
                      disabled={isCreatingWallet}
                    >
                      {isCreatingWallet
                        ? "Đang xác thực..."
                        : "Xác thực và tạo ví"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      <div className="bg-white border-bottom py-3 px-4">
        <div className="d-flex align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-danger text-white rounded p-2 d-flex align-items-center justify-content-center">
              <Wallet size={24} />
            </div>
            <div>
              <h5 className="mb-0 fw-bold">Số Dư TK Shopee</h5>
              <small className="text-muted">Seller wallet mock view</small>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-link text-dark text-decoration-none">
              <ArrowUpRight size={18} />
            </button>
            <div className="d-flex align-items-center">
              <div
                className="bg-primary rounded-circle text-white d-flex align-items-center justify-content-center me-2 fw-bold"
                style={{ width: "32px", height: "32px" }}
              >
                {shopInitial}
              </div>
              <span className="small text-dark">{shopName}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid p-4">
        {walletError && (
          <div className="alert alert-warning" role="alert">
            {walletError}
          </div>
        )}

        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body p-4">
            <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 align-items-start align-items-lg-center">
              <div>
                <h6 className="fw-bold mb-2">Tổng Quan</h6>
                <div className="d-flex align-items-center gap-3 flex-wrap">
                  <div>
                    <small className="text-muted d-block">Số dư</small>
                    <div className="h3 fw-bold mb-0 text-dark">
                      {currency(availableBalance)}
                    </div>
                  </div>
                  <button className="btn btn-warning btn-sm fw-bold text-white">
                    Yêu Cầu Thanh Toán
                  </button>
                </div>
              </div>

              <div className="border-start ps-lg-4 w-100 w-lg-auto">
                <div className="d-flex justify-content-between align-items-start gap-3">
                  <div>
                    <div className="fw-bold text-dark">Tài khoản ngân hàng</div>
                    <div className="small text-primary mt-1">
                      VCB - NH TMCP Ngoại Thương Việt Nam
                    </div>
                    <div className="small text-muted">**** 1026</div>
                    <div className="small text-success">Đã xác thực</div>
                  </div>
                  <div className="text-primary small fw-bold">
                    Xem thêm &gt;
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-4">
          {quickStats.map((item) => (
            <div key={item.label} className="col-12 col-md-6 col-xl-3">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start gap-3">
                    <div>
                      <small className="text-muted text-uppercase fw-bold">
                        {item.label}
                      </small>
                      <div className="h4 fw-bold mt-2 mb-1">
                        {item.label === "Số dư khả dụng"
                          ? currency(availableBalance)
                          : item.label === "Đang tạm giữ"
                            ? currency(pendingBalance)
                            : currency(item.value)}
                      </div>
                      <small className="text-muted">{item.hint}</small>
                    </div>
                    <div className={`rounded p-2 ${item.tone}`}>
                      {item.icon}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-4 mb-4">
          <div className="col-12 col-xl-8">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
                  <div>
                    <h6 className="fw-bold mb-1">Tổng quan ví</h6>
                    <small className="text-muted">
                      Số liệu mô phỏng từ doanh thu, phí sàn và rút tiền.
                    </small>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge text-bg-success px-3 py-2">
                      + {currency(summary.income)}
                    </span>
                    <span className="badge text-bg-danger px-3 py-2">
                      - {currency(summary.expense)}
                    </span>
                  </div>
                </div>

                <div className="row g-4">
                  <div className="col-12 col-md-6">
                    <div className="rounded-4 border border-success-subtle bg-success text-white p-4 h-100">
                      <div className="d-flex justify-content-between align-items-start gap-3">
                        <div>
                          <small className="text-uppercase fw-bold text-white-50">
                            Số dư hiện tại
                          </small>
                          <div className="display-6 fw-bold mt-2 mb-0">
                            {currency(availableBalance)}
                          </div>
                        </div>
                        <Landmark size={30} className="text-white" />
                      </div>
                      <div className="mt-4 d-flex justify-content-between small text-white-50">
                        <span>Hạn mức rút</span>
                        <span>{currency(2000000)}</span>
                      </div>
                      <div className="progress mt-2" style={{ height: 8 }}>
                        <div
                          className="progress-bar bg-white"
                          style={{ width: "72%" }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="rounded-4 border border-light bg-light p-4 h-100">
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <small className="text-uppercase fw-bold text-muted">
                            Tài khoản ngân hàng
                          </small>
                          <div className="fw-bold text-dark mt-2">
                            VCB - NH TMCP Ngoại Thương Việt Nam
                          </div>
                        </div>
                        <div
                          className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                          style={{ width: 44, height: 44 }}
                        >
                          <Building2 size={20} />
                        </div>
                      </div>

                      <div className="bg-white border rounded-3 p-3 mt-3">
                        <div className="small text-muted">Số tài khoản</div>
                        <div className="fw-bold text-dark">
                          1026 •••• •••• 1026
                        </div>
                        <div className="d-flex flex-wrap gap-2 mt-2">
                          <span className="badge text-bg-success">
                            Đã xác thực
                          </span>
                          <span className="badge text-bg-secondary">
                            Mặc định
                          </span>
                        </div>
                      </div>

                      <div className="text-end mt-3">
                        <button className="btn btn-link text-primary fw-bold text-decoration-none p-0">
                          Xem thêm &gt;
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-4">
            <div className="card shadow-sm border-0 h-100 mb-4 mb-xl-0">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div>
                    <h6 className="fw-bold mb-1">Thao tác nhanh</h6>
                    <small className="text-muted">
                      Dữ liệu giả lập để demo
                    </small>
                  </div>
                  <CreditCard className="text-muted" size={20} />
                </div>

                <div className="d-grid gap-3">
                  <QuickAction
                    icon={<Wallet size={18} />}
                    title="Rút tiền về ngân hàng"
                    description="Tạo lệnh rút từ số dư khả dụng"
                    tone="bg-success-subtle text-success"
                  />
                  <QuickAction
                    icon={<HandCoins size={18} />}
                    title="Đối soát đơn hàng"
                    description="Kiểm tra dòng tiền theo từng đơn"
                    tone="bg-primary-subtle text-primary"
                  />
                  <QuickAction
                    icon={<Download size={18} />}
                    title="Xuất báo cáo"
                    description="Tải file giao dịch theo tháng"
                    tone="bg-warning-subtle text-warning"
                  />
                </div>
              </div>
            </div>

            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h6 className="fw-bold mb-3">Ghi chú</h6>
                <p className="small text-muted mb-0">
                  Đây là view mock cho seller wallet. Khi có API thật, chỉ cần
                  thay dữ liệu giả lập bằng dữ liệu backend mà không phải đổi
                  layout.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body">
            <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
              <div>
                <h6 className="fw-bold mb-1">Giao dịch gần đây</h6>
                <small className="text-muted">
                  Dòng tiền vào/ra của ví seller theo dữ liệu giả lập.
                </small>
              </div>
              <div className="btn-group btn-group-sm" role="group">
                <button className="btn btn-danger">Tất cả</button>
                <button className="btn btn-outline-danger">Tiền vào</button>
                <button className="btn btn-outline-danger">Tiền ra</button>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Ngày</th>
                    <th>Loại Giao Dịch | Mô Tả</th>
                    <th>Order ID</th>
                    <th>Dòng tiền</th>
                    <th className="text-end">Số Tiền</th>
                    <th className="text-end">Số Dư Sau</th>
                    <th className="text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTransactions.map((item) => (
                    <tr key={item.id}>
                      <td className="text-muted small">{item.date}</td>
                      <td>
                        <div className="d-flex align-items-start gap-3">
                          <div
                            className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${item.isIncome ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}
                            style={{ width: 40, height: 40 }}
                          >
                            {item.isIncome ? (
                              <ArrowUpRight size={16} />
                            ) : (
                              <Banknote size={16} />
                            )}
                          </div>
                          <div>
                            <div className="fw-bold text-dark">{item.type}</div>
                            <div className="small text-muted mt-1">
                              {item.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-muted">
                        {item.type === "Doanh thu đơn hàng"
                          ? item.description.match(/#\w+/)?.[0] || "-"
                          : "-"}
                      </td>
                      <td>
                        <span
                          className={`badge ${item.isIncome ? "text-bg-success" : "text-bg-danger"}`}
                        >
                          {item.isIncome ? "Tiền vào" : "Tiền ra"}
                        </span>
                      </td>
                      <td
                        className={`text-end fw-bold ${item.isIncome ? "text-success" : "text-danger"}`}
                      >
                        {item.isIncome ? "+" : "-"}
                        {currency(Math.abs(item.amount))}
                      </td>
                      <td className="text-end fw-semibold text-dark">
                        {currency(item.balanceAfter)}
                      </td>
                      <td className="text-center">
                        <span
                          className={`badge ${item.status === "Hoàn thành" ? "text-bg-secondary" : item.status === "Đang xử lý" ? "text-bg-warning" : "text-bg-danger"}`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-12 col-lg-5">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <h6 className="fw-bold mb-3">Tóm tắt nhanh</h6>
                <div className="d-grid gap-3">
                  <MiniRow
                    label="Tổng tiền vào"
                    value={currency(summary.income)}
                  />
                  <MiniRow
                    label="Tổng tiền ra"
                    value={currency(summary.expense)}
                  />
                  <MiniRow label="Đơn chờ đối soát" value="3" />
                  <MiniRow label="Tỷ lệ hoàn tiền" value="0.8%" />
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-7">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <h6 className="fw-bold mb-3">Hành động bổ sung</h6>
                <div className="row g-3">
                  <div className="col-md-4">
                    <button className="btn btn-outline-secondary w-100 text-start rounded-3 py-3 h-100">
                      <div className="fw-bold text-dark">Xem sao kê tháng</div>
                      <div className="small text-muted mt-1">
                        Tải dữ liệu giao dịch theo tháng
                      </div>
                    </button>
                  </div>
                  <div className="col-md-4">
                    <button className="btn btn-outline-secondary w-100 text-start rounded-3 py-3 h-100">
                      <div className="fw-bold text-dark">Lịch sử rút tiền</div>
                      <div className="small text-muted mt-1">
                        Kiểm tra các lệnh đã gửi
                      </div>
                    </button>
                  </div>
                  <div className="col-md-4">
                    <button className="btn btn-outline-secondary w-100 text-start rounded-3 py-3 h-100">
                      <div className="fw-bold text-dark">Cài đặt ngân hàng</div>
                      <div className="small text-muted mt-1">
                        Cập nhật tài khoản nhận tiền
                      </div>
                    </button>
                  </div>
                </div>
                <div className="mt-4 alert alert-light border mb-0 small text-muted">
                  Đây là view mock cho seller wallet. Khi có API thật, chỉ cần
                  thay dữ liệu giả lập bằng dữ liệu backend mà không phải đổi
                  layout.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  icon,
  title,
  description,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  tone: string;
}) {
  return (
    <div className="d-flex align-items-center gap-3 rounded-3 border border-light bg-white p-3 shadow-sm">
      <div className={`rounded-3 p-2 ${tone}`}>{icon}</div>
      <div className="min-w-0 flex-grow-1">
        <p className="mb-1 fw-bold text-dark">{title}</p>
        <p className="mb-0 small text-muted">{description}</p>
      </div>
    </div>
  );
}

function MiniRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="d-flex align-items-center justify-content-between rounded-3 bg-light px-3 py-2">
      <span className="small text-muted">{label}</span>
      <span className="fw-bold text-dark">{value}</span>
    </div>
  );
}
