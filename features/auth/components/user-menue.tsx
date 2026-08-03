'use client';

import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const DEFAULT_PLAN = 'Free';

export type UserMenuUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export type UserMenueTriggerVariant = 'compact' | 'profile'; //shows

type UserMenuProps = {
  user: UserMenuUser;
  variant?: UserMenueTriggerVariant;
  plan?: string;
  className?: string;
};

export function getDisplayName(user: UserMenuUser) {
  return user.name?.trim() || user.email?.split('@')[0] || 'User';
}

export function getInitials(user: UserMenuUser) {
  return getDisplayName(user)
    .split(' ')
    .map((namePart) => namePart?.[0] || '')
    .join('')
    .slice(0, 3)
    .toUpperCase();
}

export function UserMenu({
  user,
  variant = 'compact',
  plan,
  className,
}: UserMenuProps) {
  const router = useRouter();
  const name = getDisplayName(user);
  const initials = getInitials(user);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      router.refresh();
      router.push('/');
    } catch (error) {
      console.log(error);
    }
  };

  const content = (
    <div
      className={cn(
        'flex w-full items-center justify-between gap-4',
        className
      )}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <Avatar className="size-9">
          <AvatarImage src={user.image || undefined} />
          <AvatarFallback className="bg-muted-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        {variant === 'profile' && (
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-sm font-semibold truncate max-w-[120px]">
              {name}
            </span>
            <span className="text-xs text-muted-foreground truncate max-w-[120px]">
              {user.email}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="h-auto w-auto p-0 hover:bg-transparent"
          />
        }
      >
        {content}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="flex justify-between">
            Plan
            <Badge variant="secondary">{plan || DEFAULT_PLAN}</Badge>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-red-600 focus:text-red-600 focus:bg-red-100 cursor-pointer"
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
