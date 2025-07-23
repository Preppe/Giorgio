import { useState } from "react";
import { Edit3, Save, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUpdateProfile } from "@/hooks/auth";
import type { User as UserType } from "@/services/types";

interface ProfileInfoProps {
  user: UserType | null;
  onUpdate?: () => void;
}

export const ProfileInfo = ({ user, onUpdate }: ProfileInfoProps) => {
  const { toast } = useToast();
  const updateProfileMutation = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const handleSaveProfile = () => {
    if (!editedUser.name.trim() || !editedUser.email.trim()) {
      toast({
        title: "Validation error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    updateProfileMutation.mutate(
      {
        name: editedUser.name.trim(),
      },
      {
        onSuccess: () => {
          toast({
            title: "Profile updated",
            description: "Your profile has been updated successfully.",
          });
          setIsEditing(false);
          onUpdate?.();
        },
        onError: () => {
          toast({
            title: "Update failed",
            description: "Failed to update profile. Please try again.",
            variant: "destructive",
          });
        },
      },
    );
  };

  const handleCancelEdit = () => {
    setEditedUser({
      name: user?.name || "",
      email: user?.email || "",
    });
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setEditedUser({
      name: user?.name || "",
      email: user?.email || "",
    });
    setIsEditing(true);
  };

  return (
    <Card className="hologram-panel border-primary/20 bg-background/40 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-primary/20 border border-primary/30">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-primary">Profile Information</CardTitle>
              <CardDescription className="text-primary/60">Manage your account details</CardDescription>
            </div>
          </div>
          {!isEditing && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleStartEdit} 
              className="border-primary/30 text-primary hover:bg-primary/10"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-primary/80">
                Name
              </Label>
              <Input
                id="name"
                value={editedUser.name}
                onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                className="bg-background/60 border-primary/30 focus:border-primary/60 text-foreground"
                placeholder="Enter your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-primary/80">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={editedUser.email}
                onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                className="bg-background/60 border-primary/30 focus:border-primary/60 text-foreground"
                placeholder="Enter your email"
              />
            </div>
            <div className="flex space-x-3 pt-2">
              <Button
                onClick={handleSaveProfile}
                disabled={updateProfileMutation.isPending}
                className="bg-primary/20 border border-primary/30 hover:bg-primary/30 text-primary"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateProfileMutation.isPending ? "Saving..." : "Save"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                disabled={updateProfileMutation.isPending}
                className="border-primary/30 text-primary/60 hover:bg-primary/10"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-3">
              <div>
                <Label className="text-primary/60 text-sm">Name</Label>
                <p className="text-foreground font-medium">{user?.name || "Not set"}</p>
              </div>
              <div>
                <Label className="text-primary/60 text-sm">Email</Label>
                <p className="text-foreground font-medium">{user?.email}</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};