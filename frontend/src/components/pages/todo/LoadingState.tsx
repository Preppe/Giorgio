import { Loader2 } from "lucide-react";

export const LoadingState = () => {
  return (
    <div className="h-screen bg-background text-foreground overflow-hidden flex flex-col items-center justify-center">
      <div className="space-y-4 text-center">
        <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary/60" />
        <div>
          <h3 className="text-primary font-medium">Loading Todo List</h3>
          <p className="text-primary/60 text-sm mt-1">Please wait...</p>
        </div>
      </div>
    </div>
  );
};