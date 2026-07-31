import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { GithubSigninForm } from '@/features/auth/components/github-signin-form';

export function GithubSignIn() {
  return (
    <Card className="w-full max-w-md border-0 shadow-lg sm:border sm:border-border sm:shadow-sm rounded-none font-mono">
      <CardHeader className="space-y-1 pb-6 text-center">
        <CardTitle className="text-3xl font-bold tracking-tight">
          Welcome back
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Sign in to your account using GitHub
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-8 px-8">
        <GithubSigninForm callbackUrl="/" />
      </CardContent>
    </Card>
  );
}
