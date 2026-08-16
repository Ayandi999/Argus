'use client';

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { githubRepoKeys } from '@/features/github/lib/repos-query';
import { syncRepoCodeBase } from '../actions/repo-action';
import { Button } from '@/components/ui/button';
import { RepoSyncStatus } from '../types';
import { toast } from 'sonner';
import { 
  Download, 
  Brain, 
  RefreshCw 
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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

  const renderIcon = () => {
    switch (syncStatus) {
      case 'fetching':
        return <Download className="h-4 w-4" />;
      case 'memorizing':
        return <Brain className="h-4 w-4" />;
      case 'synced':
        return <RefreshCw className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180 text-green-500" />;
      default:
        if (syncing) {
          return <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />;
        }
        return <RefreshCw className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />;
    }
  };

  const getTooltipText = () => {
    switch (syncStatus) {
      case 'fetching':
        return 'Fetching...';
      case 'memorizing':
        return 'Memorizing...';
      case 'synced':
        return 'Re-sync';
      default:
        if (syncing) {
          return 'Syncing...';
        }
        return 'Sync';
    }
  };

  return (
    <TooltipProvider delay={0}>
      <Tooltip>
        <TooltipTrigger render={
          <span className="inline-block">
            <Button
              size="icon"
              variant={isSynced ? "secondary" : "outline"}
              disabled={syncing}
              onClick={() => syncRepo.mutate()}
              className="group relative transition-all duration-300"
            >
              {renderIcon()}
            </Button>
          </span>
        } />
        <TooltipContent>
          <p>{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SyncRepoButton;

