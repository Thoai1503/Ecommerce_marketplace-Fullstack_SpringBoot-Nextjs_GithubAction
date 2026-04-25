import { useEffect, useState } from "react";

/**
 * useDebouncedValue — trả về giá trị sau khi user ngừng thay đổi `delay` ms.
 * Dùng cho input search, email uniqueness check, ...
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}
