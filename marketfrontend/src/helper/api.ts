const FALLBACK_LOCAL_API_URL = "http://localhost:8000";
const FALLBACK_UPLOAD_API_URL = "http://localhost:5000";
const FALLBACK_ADDRESS_LOOKUP_API_URL = "https://provinces.open-api.vn/api/";

// Browser-side base URL. Prefer explicit public env, then fall back for local dev.
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ;

// Server-side base URL for Next server components/routes.
export const INTERNAL_API =
  process.env.INTERNAL_API ||
  process.env.NEXT_PUBLIC_API_URL ||
  FALLBACK_LOCAL_API_URL;

export const PROVINCE_API = process.env.NEXT_PUBLIC_PROVINCE_API;
export const ADDRESS_KEY =
  process.env.NEXT_PUBLIC_ADDRESS_KEY?.toString() || "";
export const LOGISTICS_FEE_API =
  process.env.NEXT_PUBLIC_LOGISTICS_FEE_API?.toString() || "";
export const UPLOAD_API_URL =
  process.env.NEXT_PUBLIC_UPLOAD_API || FALLBACK_UPLOAD_API_URL;
export const ADDRESS_LOOKUP_API_URL =
  process.env.NEXT_PUBLIC_ADDRESS_LOOKUP_API || FALLBACK_ADDRESS_LOOKUP_API_URL;
