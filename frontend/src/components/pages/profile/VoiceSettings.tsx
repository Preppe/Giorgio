import { useState, useEffect } from "react";
import { Edit3, Save, Settings, X } from "lucide-react";
import { TextToSpeech } from "@capacitor-community/text-to-speech";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useUpdateUserSettings } from "@/hooks/auth";
import type { User as UserType, VoiceEngine } from "@/services/types";
import { VOICE_MODELS } from "@/services/types";

interface VoiceSettingsProps {
  user: UserType | null;
  onUpdate?: () => void;
}

export const VoiceSettings = ({ user, onUpdate }: VoiceSettingsProps) => {
  const { toast } = useToast();
  const updateSettingsMutation = useUpdateUserSettings();

  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [editedSettings, setEditedSettings] = useState({
    voiceEngine: user?.preferences?.voice?.engine || "google",
    voice: user?.preferences?.voice?.voice || "",
    apikey: user?.preferences?.voice?.apikey || "",
    language: user?.preferences?.voice?.language || "it-IT",
    modelId: user?.preferences?.voice?.modelId || "",
  });

  // Native TTS states
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);

  // Update edited settings when user changes
  useEffect(() => {
    if (user) {
      setEditedSettings({
        voiceEngine: user?.preferences?.voice?.engine || "google",
        voice: user?.preferences?.voice?.voice || "",
        apikey: user?.preferences?.voice?.apikey || "",
        language: user?.preferences?.voice?.language || "it-IT",
        modelId: user?.preferences?.voice?.modelId || "",
      });
    }
  }, [user]);

  // Load native TTS voices when native engine is selected
  useEffect(() => {
    if (editedSettings.voiceEngine === 'native') {
      loadNativeVoices();
    }
  }, [editedSettings.voiceEngine]);

  // Reset modelId when engine changes and set default if available
  useEffect(() => {
    const availableModels = VOICE_MODELS[editedSettings.voiceEngine as VoiceEngine] || [];
    if (editedSettings.voiceEngine === 'native') {
      setEditedSettings(prev => ({ ...prev, modelId: "" })); // Native doesn't use modelId
    } else if (availableModels.length > 0) {
      // Always set the first model as default for non-native engines
      if (!editedSettings.modelId || !availableModels.includes(editedSettings.modelId)) {
        setEditedSettings(prev => ({ ...prev, modelId: availableModels[0] }));
      }
    }
  }, [editedSettings.voiceEngine]);

  const loadNativeVoices = async () => {
    setIsLoadingVoices(true);
    try {
      const [voicesResult, languagesResult] = await Promise.all([
        TextToSpeech.getSupportedVoices(),
        TextToSpeech.getSupportedLanguages(),
      ]);
      setAvailableVoices(voicesResult.voices);
      setAvailableLanguages(languagesResult.languages);
    } catch (error) {
      console.error('Error loading native TTS voices:', error);
    } finally {
      setIsLoadingVoices(false);
    }
  };

  // Filter voices by selected language
  const filteredVoices = availableVoices.filter(voice => 
    voice.lang.startsWith(editedSettings.language.split('-')[0])
  );

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(
      {
        preferences: {
          voice: {
            engine: editedSettings.voiceEngine as VoiceEngine,
            voice: editedSettings.voice || undefined,
            apikey: editedSettings.apikey || undefined,
            language: editedSettings.language || undefined,
            modelId: editedSettings.voiceEngine === 'native' ? undefined : (editedSettings.modelId || undefined),
          },
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "Settings updated",
            description: "Your voice settings have been updated successfully.",
          });
          setIsEditingSettings(false);
          onUpdate?.();
        },
        onError: () => {
          toast({
            title: "Update failed",
            description: "Failed to update settings. Please try again.",
            variant: "destructive",
          });
        },
      },
    );
  };

  const handleCancelEditSettings = () => {
    if (user?.preferences) {
      setEditedSettings({
        voiceEngine: user?.preferences?.voice?.engine || "google",
        voice: user?.preferences?.voice?.voice || "",
        apikey: user?.preferences?.voice?.apikey || "",
        language: user?.preferences?.voice?.language || "it-IT",
        modelId: user?.preferences?.voice?.modelId || "",
      });
    }
    setIsEditingSettings(false);
  };

  const handleStartEditSettings = () => {
    if (user?.preferences) {
      setEditedSettings({
        voiceEngine: user?.preferences?.voice?.engine || "google",
        voice: user?.preferences?.voice?.voice || "",
        apikey: user?.preferences?.voice?.apikey || "",
        language: user?.preferences?.voice?.language || "it-IT",
        modelId: user?.preferences?.voice?.modelId || "",
      });
    }
    setIsEditingSettings(true);
  };

  return (
    <Card className="hologram-panel border-primary/20 bg-background/40 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-primary/20 border border-primary/30">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-primary">Voice Settings</CardTitle>
              <CardDescription className="text-primary/60">Configure your voice preferences</CardDescription>
            </div>
          </div>
          {!isEditingSettings && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartEditSettings}
              className="border-primary/30 text-primary hover:bg-primary/10"
              disabled={!user?.preferences}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!user?.preferences ? (
          <div className="flex items-center justify-center py-4">
            <div className="ai-core w-8 h-8 rounded-full bg-primary/20 animate-pulse" />
          </div>
        ) : isEditingSettings ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="voiceEngine" className="text-primary/80">
                Voice Engine
              </Label>
              <Select value={editedSettings.voiceEngine} onValueChange={(value) => setEditedSettings({ ...editedSettings, voiceEngine: value })}>
                <SelectTrigger className="bg-background/60 border-primary/30 focus:border-primary/60 text-foreground">
                  <SelectValue placeholder="Select voice engine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                  <SelectItem value="native">Native TTS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Native TTS specific fields */}
            {editedSettings.voiceEngine === 'native' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="language" className="text-primary/80">
                    Language
                  </Label>
                  <Select value={editedSettings.language} onValueChange={(value) => setEditedSettings({ ...editedSettings, language: value })}>
                    <SelectTrigger className="bg-background/60 border-primary/30 focus:border-primary/60 text-foreground">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableLanguages.map((lang) => (
                        <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="voice" className="text-primary/80">
                    Voice
                  </Label>
                  <Select value={editedSettings.voice} onValueChange={(value) => setEditedSettings({ ...editedSettings, voice: value })}>
                    <SelectTrigger className="bg-background/60 border-primary/30 focus:border-primary/60 text-foreground" disabled={isLoadingVoices}>
                      <SelectValue placeholder={isLoadingVoices ? "Loading voices..." : "Select voice"} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredVoices.map((voice) => (
                        <SelectItem key={voice.voiceURI} value={voice.voiceURI}>
                          {voice.name} ({voice.lang})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                {/* Backend TTS fields (Google/ElevenLabs) */}
                <div className="space-y-2">
                  <Label htmlFor="modelId" className="text-primary/80">
                    Model
                  </Label>
                  <Select value={editedSettings.modelId} onValueChange={(value) => setEditedSettings({ ...editedSettings, modelId: value })}>
                    <SelectTrigger className="bg-background/60 border-primary/30 focus:border-primary/60 text-foreground">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {(VOICE_MODELS[editedSettings.voiceEngine as VoiceEngine] || []).map((model: string) => (
                        <SelectItem key={model} value={model}>{model}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="voice" className="text-primary/80">
                    Voice (Optional)
                  </Label>
                  <Input
                    id="voice"
                    value={editedSettings.voice}
                    onChange={(e) => setEditedSettings({ ...editedSettings, voice: e.target.value })}
                    className="bg-background/60 border-primary/30 focus:border-primary/60 text-foreground"
                    placeholder="Enter voice name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apikey" className="text-primary/80">
                    API Key (Optional)
                  </Label>
                  <Input
                    id="apikey"
                    type="password"
                    value={editedSettings.apikey}
                    onChange={(e) => setEditedSettings({ ...editedSettings, apikey: e.target.value })}
                    className="bg-background/60 border-primary/30 focus:border-primary/60 text-foreground"
                    placeholder="Enter API key"
                  />
                </div>
              </>
            )}
            <div className="flex space-x-3 pt-2">
              <Button
                onClick={handleSaveSettings}
                disabled={updateSettingsMutation.isPending}
                className="bg-primary/20 border border-primary/30 hover:bg-primary/30 text-primary"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateSettingsMutation.isPending ? "Saving..." : "Save"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelEditSettings}
                disabled={updateSettingsMutation.isPending}
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
                <Label className="text-primary/60 text-sm">Voice Engine</Label>
                <p className="text-foreground font-medium capitalize">{user?.preferences?.voice?.engine || "Google"}</p>
              </div>
              <div>
                <Label className="text-primary/60 text-sm">Voice</Label>
                <p className="text-foreground font-medium">{user?.preferences?.voice?.voice || "Not set"}</p>
              </div>
              {user?.preferences?.voice?.engine !== 'native' && (
                <div>
                  <Label className="text-primary/60 text-sm">Model</Label>
                  <p className="text-foreground font-medium">{user?.preferences?.voice?.modelId || "Not set"}</p>
                </div>
              )}
              <div>
                <Label className="text-primary/60 text-sm">API Key</Label>
                <p className="text-foreground font-medium">{user?.preferences?.voice?.apikey ? "••••••••••••" : "Not set"}</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};