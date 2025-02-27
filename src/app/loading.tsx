import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <h2 className="mt-4 text-xl font-medium">Loading...</h2>
      <p className="text-muted-foreground mt-2">
        Preparing your Document Q&A experience
      </p>
    </div>
  );
}
