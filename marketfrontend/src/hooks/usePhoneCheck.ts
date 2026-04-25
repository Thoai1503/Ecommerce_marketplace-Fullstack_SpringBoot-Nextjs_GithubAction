import { useEffect, useState } from "react";
import http from "@/lib/http";
import { useDebouncedValue } from "./useDebouncedValue";

export type PhoneCheckStatus =
  | "idle"
  | "checking"
  | "available"
  | "taken"
  | "invalid"
  | "error";

// VN mobile: 10 số, bắt đầu 0, đầu số 3/5/7/8/9
const PHONE_RE = /^0[35789][0-9]{8}$/;

/** Chuẩn hoá +84xxx hoặc 84xxx → 0xxx, loại bỏ space/dash */
export function normalizeVNPhone(raw: string): string {
  let p = (raw || "").replace(/[\s-]/g, "");
  if (p.startsWith("+84")) p = "0" + p.substring(3);
  else if (p.startsWith("84") && p.length === 11) p = "0" + p.substring(2);
  return p;
}

/**
 * usePhoneCheck — debounce + gọi GET /users/phone-exists.
 * @param phone raw input từ form
 * @param options.skip bỏ qua check (edit mode khi SĐT không đổi)
 * @param options.delay debounce ms (default 400)
 */
export function usePhoneCheck(
  phone: string,
  options: { skip?: boolean; delay?: number } = {},
) {
  const { skip = false, delay = 400 } = options;
  const normalized = normalizeVNPhone(phone);
  const debounced = useDebouncedValue(normalized, delay);
  const [status, setStatus] = useState<PhoneCheckStatus>("idle");

  useEffect(() => {
    if (skip) { setStatus("idle"); return; }
    if (!debounced) { setStatus("idle"); return; }
    if (!PHONE_RE.test(debounced)) { setStatus("invalid"); return; }

    let cancelled = false;
    setStatus("checking");
    (async () => {
      try {
        const res = await http.get<{ exists: boolean; invalid?: boolean }>(
          `/users/phone-exists?phone=${encodeURIComponent(debounced)}`,
        );
        if (cancelled) return;
        if (res.data.invalid) setStatus("invalid");
        else setStatus(res.data.exists ? "taken" : "available");
      } catch (e) {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => { cancelled = true; };
  }, [debounced, skip]);

  return status;
}
