import { Loader2 } from 'lucide-react';

import React from 'react';

const Loading = () => {
  return (
    <div className="flex flex-1 items-center justify-center w-full min-h-[50vh]">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />

        <p className="text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;
