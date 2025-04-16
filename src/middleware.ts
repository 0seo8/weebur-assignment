import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  if (url.pathname === '/') {
    const searchParams = url.searchParams.toString();
    const redirectPath = `/product-list${searchParams ? `?${searchParams}` : ''}`;

    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/index', '/home'],
};
