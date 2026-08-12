'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { statusBadge } from '@/features/dashboard/lib/status-style';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

export function PullRequestTable({ pullRequests }: { pullRequests: any[] }) {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>PR #</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Repository</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Base Branch</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Reviewed At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pullRequests.map((pr: any) => (
            <React.Fragment key={pr.id}>
              <TableRow
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleRow(pr.id)}
              >
                <TableCell>
                  {expandedRows[pr.id] ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </TableCell>
                <TableCell className="font-medium">#{pr.prNumber}</TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="text-left cursor-help underline decoration-dotted underline-offset-4">
                        {pr.title.length > 30
                          ? pr.title.substring(0, 30) + '...'
                          : pr.title}
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[400px] whitespace-pre-wrap bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-900">
                        <p>{pr.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>{pr.repoFullName}</TableCell>
                <TableCell>{pr.authorLogin || 'Unknown'}</TableCell>
                <TableCell>{pr.baseBranch}</TableCell>
                <TableCell>
                  <span
                    className={statusBadge(
                      pr.status === 'reviewed'
                        ? 'success'
                        : pr.status === 'pending' || pr.status === 'open'
                          ? 'info'
                          : 'neutral'
                    )}
                  >
                    {pr.status}
                  </span>
                </TableCell>
                <TableCell>
                  {pr.reviewedAt
                    ? format(new Date(pr.reviewedAt), 'MMM d, yyyy')
                    : 'Not reviewed'}
                </TableCell>
              </TableRow>
              {expandedRows[pr.id] && (
                <TableRow className="bg-muted/30">
                  <TableCell colSpan={8} className="p-0 border-b max-w-[0vw]">
                    <div className="p-4 pl-12 md:p-6 md:pl-16 overflow-x-auto max-w-full">
                      {pr.reviewComment ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-4 [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-4 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:mb-3 [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:mb-4 [&_a]:text-blue-500 [&_a]:underline">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code({
                                node,
                                inline,
                                className,
                                children,
                                ...props
                              }: any) {
                                const match = /language-(\w+)/.exec(
                                  className || ''
                                );
                                return !inline && match ? (
                                  <SyntaxHighlighter
                                    {...props}
                                    style={vscDarkPlus}
                                    language={match[1]}
                                    PreTag="div"
                                    className="rounded-md my-4"
                                  >
                                    {String(children).replace(/\n$/, '')}
                                  </SyntaxHighlighter>
                                ) : (
                                  <code
                                    {...props}
                                    className="bg-muted px-1.5 py-0.5 rounded-md text-sm font-mono"
                                  >
                                    {children}
                                  </code>
                                );
                              },
                            }}
                          >
                            {pr.reviewComment}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          No review comment available for this pull request.
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
