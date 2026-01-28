import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-amber-600 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400 font-light">Loading...</p>
      </div>
    </div>
  );
}
