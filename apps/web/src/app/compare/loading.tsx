import { Loader2 } from 'lucide-react';

export default function CompareLoading() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-24 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
