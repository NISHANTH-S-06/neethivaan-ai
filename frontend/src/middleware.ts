import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes requiring authentication (any valid token)
const protectedRoutes = ['/dashboard', '/cases', '/complaints', '/profile', '/chat', '/fir', '/analysis', '/tracking', '/reports'];

// Routes requiring admin role specifically
const adminRoutes = ['/admin'];

// Routes requiring lawyer role specifically  
const lawyerRoutes = ['/lawyer'];

// Auth pages (redirect away if already logged in)
const authRoutes = ['/login', '/register', '/auth/login', '/auth/register'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;
  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  const isAdmin = adminRoutes.some((r) => pathname.startsWith(r));
  const isLawyer = lawyerRoutes.some((r) => pathname.startsWith(r));
  const isAuth = authRoutes.some((r) => pathname.startsWith(r));

  // Block unauthenticated users from protected routes
  if ((isProtected || isAdmin || isLawyer) && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Block wrong role from admin routes
  if (isAdmin && token && role !== 'admin') {
    return NextResponse.redirect(new URL('/citizen/dashboard', request.url));
  }


  // Block wrong role from lawyer routes
  if (isLawyer && token && role !== 'lawyer' && role !== 'admin') {
    return NextResponse.redirect(new URL('/citizen/dashboard', request.url));
  }


  // Block logged-in users away from auth pages
  if (isAuth && token) {
    const onboardingCompletedStr = request.cookies.get('onboarding_completed')?.value;
    if (onboardingCompletedStr === 'false') {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
    const destination = role === 'admin' ? '/admin/dashboard' : role === 'lawyer' ? '/lawyer/dashboard' : '/citizen/dashboard';

    return NextResponse.redirect(new URL(destination, request.url));
  }

  // Redirect to onboarding if not completed
  if (token && isProtected && !pathname.startsWith('/onboarding')) {
    const onboardingCompletedStr = request.cookies.get('onboarding_completed')?.value;
    if (onboardingCompletedStr === 'false') {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
