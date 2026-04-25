import { useEffect, useState } from "react";
import { SellerStatus } from "@/types/index";

const DRAFT_KEY = "admin_seller_create_draft";
const DRAFT_TTL_MS = 24 * 60 * 60 * 1000; // 24h

export interface SellerFormData {
  brandTitle: string;
  category: string;
  website: string;
  location: string;
  email: string;
  phone: string;
  status: SellerStatus;
  ownerName: string;
  logoUrl: string;
}

export interface SellerDraft {
  formData: SellerFormData;
  authMethod: "invite" | "manual";
  savedAt: number;
}

interface UseSellerDraftOptions {
  enabled: boolean; // chỉ bật ở create mode
  formData: SellerFormData;
  authMethod: "invite" | "manual";
  onRestore: (draft: SellerDraft) => void;
}

/**
 * Auto-save draft form vào localStorage (debounce 500ms) + restore khi mount.
 * Trả về savedAt timestamp (null khi chưa có draft) + clearDraft helper.
 */
export function useSellerDraft({
  enabled,
  formData,
  authMethod,
  onRestore,
}: UseSellerDraftOptions) {
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [hasRestored, setHasRestored] = useState(false);

  // RESTORE on mount
  useEffect(() => {
    if (!enabled) {
      setHasRestored(true);
      return;
    }
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) {
        setHasRestored(true);
        return;
      }
      const draft: SellerDraft = JSON.parse(raw);
      if (!draft?.savedAt || Date.now() - draft.savedAt > DRAFT_TTL_MS) {
        localStorage.removeItem(DRAFT_KEY);
        setHasRestored(true);
        return;
      }
      if (draft.formData) {
        onRestore(draft);
        setSavedAt(draft.savedAt);
      }
    } catch (err) {
      console.warn("[useSellerDraft] restore failed:", err);
    } finally {
      setHasRestored(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // AUTO-SAVE (debounce 500ms)
  useEffect(() => {
    if (!enabled || !hasRestored) return;

    const isEmpty =
      !formData.brandTitle &&
      !formData.email &&
      !formData.phone &&
      !formData.ownerName &&
      !formData.location &&
      !formData.website &&
      !formData.logoUrl;
    if (isEmpty) return;

    const t = setTimeout(() => {
      try {
        const safeLogoUrl = formData.logoUrl.startsWith("blob:") ? "" : formData.logoUrl;
        const draft: SellerDraft = {
          formData: { ...formData, logoUrl: safeLogoUrl },
          authMethod,
          savedAt: Date.now(),
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        setSavedAt(draft.savedAt);
      } catch (err) {
        console.warn("[useSellerDraft] save failed:", err);
      }
    }, 500);

    return () => clearTimeout(t);
  }, [formData, authMethod, enabled, hasRestored]);

  const clear = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
    setSavedAt(null);
  };

  return { savedAt, hasRestored, clear };
}
