import { auth } from '@/lib/auth';
import { getSafeCallbackPath, SIGN_IN_PATH } from './index';
import { NextRequest, NextResponse } from 'next/server';

function redirectToSignIn(requst: NextRequest, pathName: string) {
  const signInUrl = new URL(SIGN_IN_PATH, requst.url);

  signInUrl.searchParams.set('callbackUrl', `${pathName}${requst.nextUrl.search}`);
  return NextResponse.redirect(signInUrl);
}

function getPostAuthRedirectPath(requst: NextRequest): string {
  const callback = requst.nextUrl.searchParams.get('callbackUrl');
  return getSafeCallbackPath(callback);
}

//auth middleware handler

// '/' -> is always public path
// '/sign-in' -> logged in users redirected away from guest process
export async function handleAuthProxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/') {
    //checking if path name is equal to home
    return NextResponse.next();
  }
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (pathname === SIGN_IN_PATH) {
    if (session) {
      const redirectPath = getPostAuthRedirectPath(request);
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    return redirectToSignIn(request, pathname);
  }

  return NextResponse.next();
}
