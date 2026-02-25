import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware để bảo vệ routes
 * Chạy trước khi request đến page
 * 
 * Flow:
 * 1. Check token từ cookie hoặc header
 * 2. Verify token với backend (optional - có thể verify ở layout)
 * 3. Check role nếu cần
 * 4. Redirect nếu không có quyền
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ============================================
  // STATIC FILES / PUBLIC ASSETS - Always allow
  // ============================================
  // Bỏ qua các tài nguyên tĩnh trong /public (vd: /assets/*, /image/*) và các file đuôi phổ biến
  if (
    pathname.startsWith('/assets') ||
    pathname.startsWith('/image') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/fonts') ||
    pathname.startsWith('/favicon') ||
    /\.(?:css|js|map|ico|txt|xml|json|woff2?|ttf|eot|otf|mp4|webm|mp3|wav)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }
  
  // ============================================
  // PUBLIC ROUTES - Không cần authentication
  // Lưu ý: thêm các trang login dành riêng cho admin/seller
  // để không bị redirect vòng về /login (user)
  // ============================================
  const publicRoutes = ['/login', '/register', '/', '/auth/login', '/auth/seller-login'];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // ============================================
  // GET TOKEN - Từ cookie hoặc header
  // ============================================
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  // ============================================
  // NO TOKEN - Redirect về login
  // ============================================
  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname); // Lưu URL để redirect lại sau khi login
    return NextResponse.redirect(url);
  }

  // ============================================
  // PROTECTED ROUTES: /admin/*
  // ============================================
  if (pathname.startsWith('/admin')) {
    // TODO: Verify token và check role (Admin)
    // Có thể verify ở đây hoặc để layout verify
    
    // Tạm thời: Nếu có token thì cho qua
    // Trong production, nên verify token với backend
    // const userRole = await verifyTokenAndGetRole(token);
    // if (userRole !== 'admin') {
    //   return NextResponse.redirect(new URL('/unauthorized', request.url));
    // }
  }

  // ============================================
  // PROTECTED ROUTES: /seller/*
  // ============================================
  if (pathname.startsWith('/seller')) {
    // TODO: Verify token và check role (Seller hoặc Admin)
    // const userRole = await verifyTokenAndGetRole(token);
    // if (userRole !== 'seller' && userRole !== 'admin') {
    //   return NextResponse.redirect(new URL('/unauthorized', request.url));
    // }
  }

  // ============================================
  // ALLOW REQUEST - Cho phép tiếp tục
  // ============================================
  return NextResponse.next();
}

// ============================================
// CONFIG: Áp dụng middleware cho routes nào
// ============================================
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

/**
 * Helper function để verify token và get user role
 * Uncomment và implement khi cần
 */
// async function verifyTokenAndGetRole(token: string): Promise<string | null> {
//   try {
//     const response = await fetch(`${process.env.API_URL}/auth/verify`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     if (response.ok) {
//       const user = await response.json();
//       return user.role; // 'admin', 'seller', 'user'
//     }
//   } catch (error) {
//     console.error('Token verification failed:', error);
//   }
//   return null;
// }
