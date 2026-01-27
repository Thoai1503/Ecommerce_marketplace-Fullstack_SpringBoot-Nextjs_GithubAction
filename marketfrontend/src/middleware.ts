import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ANSI color codes cho terminal
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",

  // Màu chữ
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",

  // Màu nền
  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",
};

// Hàm format thời gian
function getFormattedDateTime(): string {
  const now = new Date();

  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}.${milliseconds}`;
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

// Middleware function
export function middleware(request: NextRequest) {
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
        headerName === "authorization" || headerName === "cookie"
          ? "***hidden***"
          : headers[headerName];
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

  // Xử lý response
  const response = NextResponse.next();

  // Tính thời gian xử lý
  const endTime = Date.now();
  const duration = endTime - startTime;

  // Log response
  console.log(colors.cyan + "─".repeat(100) + colors.reset);
  console.log(
    colors.green + "✅ Response:" + colors.reset,
    colors.bright + `${response.status}` + colors.reset,
    colors.dim + `| Thời gian xử lý: ${duration}ms` + colors.reset,
  );
  console.log(colors.cyan + "═".repeat(100) + colors.reset + "\n");

  // Thêm custom headers vào response (optional)
  response.headers.set("X-Request-Time", getFormattedDateTime());
  response.headers.set("X-Processing-Time", `${duration}ms`);

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
