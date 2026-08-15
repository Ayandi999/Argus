'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { githubRepoKeys } from '@/features/github/lib/repos-query';
import { syncRepoCodeBase } from '../actions/repo-action';
import { Button } from '@/components/ui/button';
import { RepoSyncStatus } from '../types';
import { toast } from 'sonner';
import { 
  Download, 
  Brain, 
  RefreshCw, 
  CheckCircle2 
} from 'lucide-react';

const AnimatedDots = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 400); // changes every 400ms
    return () => clearInterval(interval);
  }, []);

  return <span className="inline-block w-4 text-left">{dots}</span>;
};

type SyncRepoButtonProps = {
  repoFullName: string;
  branch: string;
  syncStatus: RepoSyncStatus | null;
};

function isSyncing(status: RepoSyncStatus | null, mutationPending: boolean) {
  if (mutationPending) return true;
  return ['pending', 'syncing', 'fetching', 'memorizing'].includes(status || '');
}

const SyncRepoButton = ({
  repoFullName,
  branch,
  syncStatus,
}: SyncRepoButtonProps) => {
  const queryClient = useQueryClient();

  const syncRepo = useMutation({
    mutationFn: () => syncRepoCodeBase(repoFullName, branch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: githubRepoKeys.all });
      toast.success(`Repo ${repoFullName} synced successfully`);
    },
    onError: (error) => {
      toast.error(`Failed to sync repo ${repoFullName}: ${error.message}`);
    },
  });

  const syncing = isSyncing(syncStatus, syncRepo.isPending);
  const isSynced = syncStatus === 'synced';

  const renderIconAndText = () => {
    switch (syncStatus) {
      case 'fetching':
        return (
          <>
            <Download className="absolute left-3 h-4 w-4" />
            Fetching<AnimatedDots />
          </>
        );
      case 'memorizing':
        return (
          <>
            <Brain className="absolute left-3 h-4 w-4 animate-pulse" />
            Memorizing<AnimatedDots />
          </>
        );
      case 'synced':
        return (
          <>
            <CheckCircle2 className="absolute left-3 h-4 w-4 text-green-500" />
            Re-sync
          </>
        );
      default:
        if (syncing) {
          return (
            <>
              <RefreshCw className="absolute left-3 h-4 w-4 animate-spin text-muted-foreground" />
              Syncing<AnimatedDots />
            </>
          );
        }
        return (
          <>
            <RefreshCw className="absolute left-3 h-4 w-4" />
            Sync
          </>
        );
    }
  };

  return (
    <Button
      size="sm"
      variant={isSynced ? "secondary" : "outline"}
      disabled={syncing}
      onClick={() => syncRepo.mutate()}
      className="w-[155px] relative transition-all duration-300"
    >
      {renderIconAndText()}
    </Button>
  );
};

export default SyncRepoButton;
