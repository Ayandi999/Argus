'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  DEFAULT_AUTH_CALLBACK,
  getSafeCallbackPath,
  SIGN_IN_PATH,
} from '@/features/auth/utils';

export async function signinWithGithub(formData: FormData) {
  const callback = formData.get('callbackUrl');
  const redirectTo = getSafeCallbackPath(typeof callback === 'string' ? callback : null)
  const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3000';
  const result = await auth.api.signInSocial({
    body: {
      provider: 'github',
      callbackURL: `${baseUrl}${redirectTo}`,
    },
    headers: await headers(),
  });

  if (result.url) {
    redirect(result.url);
  }
}

//Funtions for Route protection starts here
export async function getServerSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireAuth(redirectTo = SIGN_IN_PATH) {
  const session = await getServerSession();
  if (!session) {
    redirect(redirectTo);
  }
  return session;
}

export async function requireUnAuth(redirectTo = DEFAULT_AUTH_CALLBACK) {
  const session = await getServerSession();
  if (session) {
    redirect(redirectTo);
  }
}
