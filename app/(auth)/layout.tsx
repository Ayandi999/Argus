import { requireUnAuth } from '@/features/auth/actions/auth';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUnAuth(); //basically if user is not logged in then only allw hin to access this
  return <div>{children}</div>;
}
