import type { NextRequest } from 'next/server';
import { handleAuthProxy } from './features/auth/utils/auth-proxy';

export async function proxy(requst: NextRequest) {
  return handleAuthProxy(requst);
}

export const config = {
  matcher: ['/sign-in', '/dashboard', '/dashboard/:path*'],
};
