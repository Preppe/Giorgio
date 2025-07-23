import { CheckSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const EmptyState = () => {
  return (
    <Card className="hologram-panel border-primary/20 bg-background/40 backdrop-blur-sm">
      <CardContent className="p-8 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
            <CheckSquare className="w-8 h-8 text-primary/60" />
          </div>
          <div>
            <h3 className="text-primary font-medium">No Tasks Yet</h3>
            <p className="text-primary/60 text-sm mt-1">Add your first task to get started</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};