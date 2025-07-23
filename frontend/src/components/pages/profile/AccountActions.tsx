import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface AccountActionsProps {
  onLogout: () => void;
}

export const AccountActions = ({ onLogout }: AccountActionsProps) => {
  return (
    <Card className="hologram-panel border-primary/20 bg-background/40 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-primary">Account Actions</CardTitle>
        <CardDescription className="text-primary/60">Manage your account settings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Separator className="bg-primary/20" />
          <Button
            variant="outline"
            onClick={onLogout}
            className="w-full justify-start border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};