import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className="px-1">
      <div
        className={cn(
          "relative flex items-center justify-start p-4 rounded-lg",
          "bg-primary/5 border-l-2 border-primary/30",
          "backdrop-blur-sm",
          className
        )}
      >
        <div className="flex items-center space-x-3">
          {/* Giorgio Avatar */}
          <div className="flex-shrink-0">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-white/80 animate-pulse" />
            </div>
          </div>

          {/* Typing Animation */}
          <div className="flex items-center space-x-1">
            <span className="text-primary text-sm font-medium">Giorgio sta scrivendo...</span>
            <div className="flex space-x-1 ml-2">
              <div
                className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        </div>

        {/* Subtle scanning effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-30 animate-pulse rounded-lg" />
      </div>
    </div>
  );
}