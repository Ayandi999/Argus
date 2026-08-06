import { infiniteQueryOptions } from '@tanstack/react-query';
import { DashboardRepo } from '@/features/dashboard/lib/types';

type GithubReposPage = {
  repos: DashboardRepo[];
  totalCount: number;
  page: number;
  hasMore: boolean;
};

export const githubRepoKeys = {
  ///basic things to get the cache function basically if we have it in cache give it to me
  all: ['github', 'repos'] as const,
};

const REPOS_STALE_TIME = 10 * 60 * 1000;

export const githubReposInfiniteQuery = infiniteQueryOptions({
  
  queryKey: [...githubRepoKeys.all, 'list'],
  queryFn: async ({ pageParam }) => {
    console.log(`Fetching from /api/github/repo?page=${pageParam}...`);
    const response = await fetch(`/api/github/repo?page=${pageParam}`);
    console.log(`Fetch response status:`, response.status);

    if (!response.ok) throw new Error('Failed to load repo');

    return response.json();
  },
  initialPageParam: 1,
  getNextPageParam: (lastPage) => {
    if (lastPage.hasMore) {
      return lastPage.page + 1;
    }
  },
  staleTime: REPOS_STALE_TIME,
});
