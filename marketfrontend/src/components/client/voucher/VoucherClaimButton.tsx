"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { API_URL } from "@/helper/api";
import { useUserAuth } from "@/context/UserAuthContext";

type Props = {
  voucherId: number;
  voucherCode: string;
  voucherStatus?: string | null;
  claimStartAt?: string | null;
  claimEndAt?: string | null;
  totalQuota?: number | null;
  claimedCount?: number | null;
  className?: string;
  style?: CSSProperties;
};

type UserVoucher = {
  id: number;
  userId: number;
  voucherId: number;
  status: string;
};

const parseUserId = (value: unknown): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const formatDate = (value?: string | null) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString("vi-VN");
};

const getFallbackUserId = (): number | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return parseUserId(parsed?.id ?? parsed?.userId ?? parsed?.user_id);
  } catch {
    return null;
  }
};

const getUserIdFromCookie = (): number | null => {
  if (typeof document === "undefined") return null;

  const matched = document.cookie
    .split("; ")
    .find((item) => item.startsWith("user="));

  if (!matched) return null;

  return parseUserId(matched.split("=")[1]);
};

export default function VoucherClaimButton({
  voucherId,
  voucherCode,
  voucherStatus,
  claimStartAt,
  claimEndAt,
  totalQuota,
  claimedCount,
  className,
  style,
}: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const auth = useUserAuth();
  const [fallbackUserId, setFallbackUserId] = useState<number | null>(null);

  useEffect(() => {
    setFallbackUserId(getFallbackUserId() ?? getUserIdFromCookie());
  }, [auth.userId]);

  const currentUserId = auth.userId ?? fallbackUserId;

  const userVouchersQuery = useQuery({
    queryKey: ["user-vouchers", currentUserId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/user-vouchers/user/${currentUserId}`);
      if (!res.ok) {
        throw new Error("Unable to load claimed vouchers");
      }
      return (await res.json()) as UserVoucher[];
    },
    enabled: Boolean(currentUserId),
  });

  const claimedVoucherIds = useMemo(() => {
    const list = Array.isArray(userVouchersQuery.data) ? userVouchersQuery.data : [];
    return new Set(
      list
        .filter((item) => !["CANCELLED", "EXPIRED"].includes(String(item.status)))
        .map((item) => Number(item.voucherId)),
    );
  }, [userVouchersQuery.data]);

  const isAlreadyClaimed = claimedVoucherIds.has(Number(voucherId));
  const now = Date.now();
  const claimStart = claimStartAt ? new Date(claimStartAt).getTime() : null;
  const claimEnd = claimEndAt ? new Date(claimEndAt).getTime() : null;
  const isVoucherActive = voucherStatus === "ACTIVE";
  const isBeforeClaimStart = claimStart !== null && now < claimStart;
  const isAfterClaimEnd = claimEnd !== null && now > claimEnd;
  const isClaimWindowOpen = !isBeforeClaimStart && !isAfterClaimEnd;
  const isQuotaAvailable =
    typeof totalQuota !== "number" ||
    typeof claimedCount !== "number" ||
    totalQuota <= 0 ||
    claimedCount < totalQuota;

  const disabledReason = !isVoucherActive
    ? "Voucher inactive"
    : isBeforeClaimStart
      ? `Nhận từ ${formatDate(claimStartAt)}`
      : isAfterClaimEnd
        ? `Hết nhận ${formatDate(claimEndAt)}`
      : !isQuotaAvailable
        ? "Voucher hết lượt"
        : null;

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!currentUserId) {
        throw new Error("Vui lòng đăng nhập để nhặt voucher");
      }

      const res = await fetch(`${API_URL}/api/user-vouchers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUserId,
          voucherId: Number(voucherId),
          claimChannel: "WEB",
          status: "CLAIMED",
        }),
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Nhặt voucher thất bại");
      }

      return res.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["user-vouchers", currentUserId],
      });
      window.alert(`Đã nhặt voucher ${voucherCode}`);
    },
    onError: (error: any) => {
      window.alert(error?.message || "Nhặt voucher thất bại");
    },
  });

  const handleClaim = () => {
    const resolvedUserId =
      auth.userId ?? fallbackUserId ?? getFallbackUserId() ?? getUserIdFromCookie();

    if (!resolvedUserId) {
      router.push("/login?redirect=voucher");
      return;
    }

    if (isAlreadyClaimed || disabledReason) {
      return;
    }

    setFallbackUserId(resolvedUserId);
    claimMutation.mutate();
  };

  const buttonLabel = isAlreadyClaimed
    ? "Đã nhặt"
    : claimMutation.isPending
      ? "Đang nhặt..."
      : disabledReason
        ? disabledReason
        : "Nhặt voucher";

  return (
    <button
      className={className}
      type="button"
      style={style}
      onClick={handleClaim}
      disabled={isAlreadyClaimed || Boolean(disabledReason) || claimMutation.isPending}
      title={isAlreadyClaimed ? "Bạn đã nhặt voucher này" : disabledReason || ""}
    >
      {buttonLabel}
    </button>
  );
}
