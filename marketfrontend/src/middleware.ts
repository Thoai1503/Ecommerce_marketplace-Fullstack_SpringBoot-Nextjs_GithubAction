import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ANSI color codes cho terminal
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",
};

// Hàm format thời gian log
function getFormattedDateTime(): string {
  const now = new Date();

  // Format theo timezone Việt Nam
  const vnTime = new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const parts = Object.fromEntries(vnTime.map((p) => [p.type, p.value]));

  const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

  return `${parts.day}/${parts.month}/${parts.year} ${parts.hour}:${parts.minute}:${parts.second}.${milliseconds}`;
}

// Hàm lấy màu theo HTTP method
function getMethodColor(method: string): string {
  switch (method) {
    case "GET":
      return colors.green;
    case "POST":
      return colors.blue;
    case "PUT":
      return colors.yellow;
    case "DELETE":
      return colors.red;
    case "PATCH":
      return colors.magenta;
    default:
      return colors.white;
  }
}

// Hàm lấy màu theo status code
function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return colors.green;
  if (status >= 300 && status < 400) return colors.cyan;
  if (status >= 400 && status < 500) return colors.yellow;
  if (status >= 500) return colors.red;
  return colors.white;
}

type AuthRole = "admin" | "seller" | "buyer";

type VerifiedSession = {
  id: number;
  role: AuthRole;
  userType?: string;
};

const AUTH_API_URL =
  process.env.INTERNAL_API ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

const buyerProtectedPaths = ["/profile", "/purchase", "/checkout", "/orders"];

function normalizeAuthRole(role?: string | null): AuthRole | null {
  const normalized = role?.trim().toLowerCase();

  if (normalized === "admin") return "admin";
  if (normalized === "seller" || normalized === "both") return "seller";
  if (normalized === "buyer" || normalized === "user") return "buyer";

  return null;
}

function isPathOrChild(pathname: string, basePath: string) {
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}

function isBuyerProtectedPath(pathname: string) {
  return buyerProtectedPaths.some((path) => isPathOrChild(pathname, path));
}

function redirectToLogin(request: NextRequest) {
  const target = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", target);
  return NextResponse.redirect(loginUrl);
}

async function getVerifiedSession(
  request: NextRequest,
): Promise<VerifiedSession | null> {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    const res = await fetch(`${AUTH_API_URL}/auth/verify`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const role =
      normalizeAuthRole(data?.userType) ??
      normalizeAuthRole(data?.role) ??
      normalizeAuthRole(request.cookies.get("role")?.value);
    const id = Number(data?.id ?? request.cookies.get("user")?.value ?? 0);

    if (!role || !Number.isFinite(id) || id <= 0) {
      return null;
    }

    return {
      id,
      role,
      userType: data?.userType,
    };
  } catch (err) {
    console.log("Auth verify error:", err);
    return null;
  }
}

// Middleware function
export async function middleware(request: NextRequest) {
  console.log("=== RUNTIME ENV ===");
  console.log("NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);
  console.log("NEXT_PUBLIC_ADDRESS_KEY:", process.env.NEXT_PUBLIC_ADDRESS_KEY);
  console.log(
    "NEXT_PUBLIC_PROVINCE_API:",
    process.env.NEXT_PUBLIC_PROVINCE_API,
  );
  console.log("INTERNAL_API:", process.env.INTERNAL_API);
  console.log("PATH:", request.nextUrl.pathname);
  console.log("===================");

  const role = request.cookies.get("role")?.value;
  console.log("Auth: " + role);

  const startTime = Date.now();

  // Lấy thông tin request
  const method = request.method;
  const url = request.url;
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams.toString();
  const headers = Object.fromEntries(request.headers.entries());
  const ip =
    (headers["x-forwarded-for"] as string) ||
    (headers["x-real-ip"] as string) ||
    "unknown";
  const userAgent = headers["user-agent"] || "unknown";
  const referer = headers["referer"] || "direct";

  // Log request body nếu là POST/PUT/PATCH
  let requestBody = null;
  if (["POST", "PUT", "PATCH"].includes(method)) {
    try {
      // Clone request để có thể đọc body mà không ảnh hưởng đến request gốc
      const clonedRequest = request.clone();
      requestBody = await clonedRequest.text();
    } catch (error) {
      requestBody = "Could not parse body";
    }
  }

  // Log thông tin request với màu sắc
  console.log("\n" + colors.cyan + "═".repeat(100) + colors.reset);
  console.log(
    colors.bright + colors.yellow + `📥 INCOMING REQUEST` + colors.reset,
  );
  console.log(colors.cyan + "═".repeat(100) + colors.reset);

  // Thời gian
  console.log(
    colors.magenta + "🕐 Thời gian:" + colors.reset,
    colors.bright + getFormattedDateTime() + colors.reset,
  );

  // Method và URL
  console.log(
    getMethodColor(method) + `📍 ${method}` + colors.reset,
    colors.bright +
      colors.cyan +
      pathname +
      colors.reset +
      (searchParams ? colors.dim + `?${searchParams}` + colors.reset : ""),
  );

  // Full URL
  console.log(
    colors.blue + "🔗 Full URL:" + colors.reset,
    colors.dim + url + colors.reset,
  );

  // IP Address
  console.log(
    colors.green + "🌐 IP Address:" + colors.reset,
    colors.bright + ip + colors.reset,
  );

  // User Agent
  console.log(
    colors.yellow + "💻 User Agent:" + colors.reset,
    colors.dim + userAgent + colors.reset,
  );

  // Referer
  console.log(
    colors.magenta + "🔙 Referer:" + colors.reset,
    colors.dim + referer + colors.reset,
  );

  // Headers (chọn lọc một số headers quan trọng)
  console.log(colors.cyan + "📋 Headers:" + colors.reset);
  const importantHeaders = [
    "host",
    "content-type",
    "authorization",
    "cookie",
    "accept",
    "accept-language",
    "cache-control",
  ];

  importantHeaders.forEach((headerName) => {
    if (headers[headerName]) {
      const value =
        // headerName === "authorization" || headerName === "cookie"
        //   ? "***hidden***"
        //   :
        headers[headerName];
      console.log(
        "   " + colors.dim + `${headerName}:` + colors.reset,
        colors.bright + value + colors.reset,
      );
    }
  });

  // Query Parameters
  if (searchParams) {
    console.log(colors.yellow + "🔍 Query Params:" + colors.reset);
    request.nextUrl.searchParams.forEach((value, key) => {
      console.log(
        "   " + colors.dim + `${key}:` + colors.reset,
        colors.bright + value + colors.reset,
      );
    });
  }

  // Request Body
  if (requestBody) {
    console.log(colors.blue + "📦 Request Body:" + colors.reset);
    try {
      const parsed = JSON.parse(requestBody);
      console.log(colors.dim + JSON.stringify(parsed, null, 2) + colors.reset);
    } catch {
      console.log(colors.dim + requestBody.substring(0, 500) + colors.reset);
    }
  }
  // if (!role && pathname.startsWith("/admin")) {
  //   return NextResponse.redirect(new URL("/admin", request.url));
  // }

  // if (!role?.startsWith("admin") && pathname.startsWith("/admin")) {
  //   return NextResponse.redirect(new URL("/", request.url));
  // }

  let verifiedSession: VerifiedSession | null | undefined;
  const resolveSession = async () => {
    if (verifiedSession !== undefined) {
      return verifiedSession;
    }

    verifiedSession = await getVerifiedSession(request);
    return verifiedSession;
  };

  const sessionForAdminLock = await resolveSession();
  if (
    sessionForAdminLock?.role === "admin" &&
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/api")
  ) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/forbidden") {
    const session = sessionForAdminLock;

    if (!session) {
      return redirectToLogin(request);
    }

    if (session.role !== "admin") {
      return NextResponse.redirect(new URL("/admin/forbidden", request.url));
    }
  }

  if (isBuyerProtectedPath(pathname)) {
    const session = await resolveSession();

    if (!session) {
      return redirectToLogin(request);
    }

    if (session.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // Xử lý response
  // ===== SELLER GUARD =====
  if (pathname.startsWith("/seller")) {
    const token = request.cookies.get("token")?.value;
    const session = await resolveSession();
    const userId = session?.id
      ? String(session.id)
      : request.cookies.get("user")?.value;

    // chưa login
    if (!userId || !token || !session) {
      return redirectToLogin(request);
    }

    if (session.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    let hasShop = false;
    let isComplete = false;

    try {
      const res = await fetch(
        `${process.env.INTERNAL_API}/shops/check?user_id=${userId}`,
        {
          method: "GET",
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.ok) {
        const data = await res.json();
        hasShop = Boolean(data?.hasShop);
        isComplete = Boolean(data?.isComplete);
      }
    } catch (err) {
      console.log("Check shop error:", err);
    }

    const isCreateShop = pathname === "/seller/createshop";

    if (!isCreateShop && session.role !== "seller") {
      return NextResponse.redirect(new URL("/seller/createshop", request.url));
    }

    console.log("Seller check → hasShop:", hasShop);

    // ❌ chưa có shop hoặc shop chưa hoàn thành thông tin → ép vào createshop
    if ((!hasShop || !isComplete) && !isCreateShop) {
      return NextResponse.redirect(new URL("/seller/createshop", request.url));
    }

    // ❌ đã có shop hoàn chỉnh → cấm createshop
    if (hasShop && isComplete && isCreateShop) {
      return NextResponse.redirect(new URL("/seller", request.url));
    }
  }

  // ===== RESPONSE =====
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Tính thời gian xử lý
  const endTime = Date.now();
  const duration = endTime - startTime;

  // Log response
  console.log(colors.cyan + "─".repeat(100) + colors.reset);
  console.log(
    getStatusColor(response.status) + "📤 Response:" + colors.reset,
    colors.bright + `${response.status}` + colors.reset,
    colors.dim + `| Thời gian xử lý: ${duration}ms` + colors.reset,
  );
  console.log(colors.cyan + "═".repeat(100) + colors.reset + "\n");

  // Thêm custom headers vào response
  response.headers.set("X-Request-Time", getFormattedDateTime());
  response.headers.set("X-Processing-Time", `${duration}ms`);
  response.headers.set("X-Request-IP", ip);

  return response;
}

// Config để chỉ định các routes cần áp dụng middleware
export const config = {
  matcher: [
    /*
     * Match tất cả các request paths ngoại trừ:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
