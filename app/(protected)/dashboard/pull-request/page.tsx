import { requireAuth } from '@/features/auth/actions/auth';
import { getUserInstallationId } from '@/features/github/server/installation';
import { getAllPullrequests } from '@/features/pull-request/server/fetch-pull-request';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { PullRequestTable } from '@/features/pull-request/components/pull-request-table';

export default async function PullRequestPage() {
  const session = await requireAuth();
  const installationId = await getUserInstallationId(session.user.id);

  if (!installationId) {
    return (
      <div className="p-8">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle>GitHub App Not Connected</CardTitle>
            <CardDescription>
              Please connect the GitHub app to view your pull requests.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/github" className={buttonVariants()}>
              Go to Settings
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  let pullRequests: any[] = [];
  let error = false;

  try {
    pullRequests = await getAllPullrequests(installationId);
  } catch (err) {
    console.error('Failed to fetch pull requests:', err);
    error = true;
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pull Requests</h1>
        <p className="text-muted-foreground">
          View and manage pull requests from your connected repositories.
        </p>
      </div>

      <div className="space-y-4">
        {error ? (
          <Card>
            <CardContent className="p-8 text-center text-destructive">
              We ran into a problem while fetching your pull requests. Please
              try again later.
            </CardContent>
          </Card>
        ) : pullRequests && pullRequests.length > 0 ? (
          <PullRequestTable pullRequests={pullRequests} />
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No pull requests found.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
