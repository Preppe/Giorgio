import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useHeaderStore } from "@/stores/headerStore";
import { useAuthStore } from "@/stores/authStore";
import { useLogout } from "@/hooks/auth";
import { ProfileInfo } from "@/components/pages/profile/ProfileInfo";
import { VoiceSettings } from "@/components/pages/profile/VoiceSettings";
import { AccountActions } from "@/components/pages/profile/AccountActions";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading } = useAuthStore();
  const { setTitle, resetTitle } = useHeaderStore();
  const logoutMutation = useLogout();

  useEffect(() => {
    setTitle("USER PROFILE");
    return () => resetTitle();
  }, [setTitle, resetTitle]);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: "Logged out successfully",
          description: "You have been logged out of Giorgio.",
        });
        navigate("/auth");
      },
      onError: () => {
        toast({
          title: "Logout failed",
          description: "An error occurred while logging out. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-background text-foreground p-4 flex items-center justify-center">
        <div className="ai-core w-16 h-16 rounded-full bg-primary/20 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-background text-foreground overflow-hidden flex flex-col">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto space-y-6 px-4">
        <ProfileInfo user={user} />
        <VoiceSettings user={user} />
        <AccountActions onLogout={handleLogout} />
      </div>

      {/* Decorative holographic overlay */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-50" />
      </div>
    </div>
  );
};

export default Profile;
