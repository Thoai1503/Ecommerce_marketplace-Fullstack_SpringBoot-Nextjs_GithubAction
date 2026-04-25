import { useEffect, useState } from "react";
import http from "@/lib/http";
import { useDebouncedValue } from "./useDebouncedValue";

export type EmailCheckStatus =
  | "idle"
  | "checking"
  | "available"
  | "taken"
  | "invalid"
  | "disposable"
  | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * useEmailCheck — debounce + gọi GET /users/exists để kiểm tra email.
 * @param email raw input từ form
 * @param options.skip bỏ qua check (ví dụ edit mode khi email không đổi)
 * @param options.delay debounce ms (default 400)
 */
export function useEmailCheck(
  email: string,
  options: { skip?: boolean; delay?: number } = {},
) {
  const { skip = false, delay = 400 } = options;
  const debounced = useDebouncedValue(email.trim(), delay);
  const [status, setStatus] = useState<EmailCheckStatus>("idle");

  useEffect(() => {
    if (skip) {
      setStatus("idle");
      return;
    }
    if (!debounced) {
      setStatus("idle");
      return;
    }
    if (!EMAIL_RE.test(debounced)) {
      setStatus("invalid");
      return;
    }

    let cancelled = false;
    setStatus("checking");
    (async () => {
      try {
        const res = await http.get<{ exists: boolean; disposable?: boolean }>(
          `/users/exists?email=${encodeURIComponent(debounced)}`,
        );
        if (cancelled) return;
        if (res.data.disposable) setStatus("disposable");
        else if (res.data.exists) setStatus("taken");
        else setStatus("available");
      } catch (e) {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [debounced, skip]);

  return status;
}
