export interface SendMessageRequest {
  message: string;
  threadId?: string;
}

export interface SendMessageResponse {
  reply: string;
  threadId?: string;
}

export interface TranscribeAudioResponse {
  text: string;
}

export interface ConversationSummary {
  threadId: string;
  messages: Array<{
    content: string;
    role: "user" | "assistant";
  }>;
  lastUpdated: string;
  messageCount: number;
  description?: string;
}

export interface ConversationDetail {
  threadId: string;
  messages: Array<{
    content: string;
    role: "user" | "assistant";
  }>;
  lastUpdated: string;
  step: number;
  description?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  preferences?: {
    voice?: VoicePreferences;
  };
}

export interface UpdateProfileRequest {
  name?: string;
}

export enum VoiceEngine {
  GOOGLE = "google",
  ELEVENLABS = "elevenlabs",
  NATIVE = "native",
}

export const VOICE_MODELS: Record<VoiceEngine, string[]> = {
  [VoiceEngine.GOOGLE]: ["gemini-2.5-flash-preview-tts"],
  [VoiceEngine.ELEVENLABS]: ["eleven_flash_v2_5", "eleven_turbo_v2_5", "eleven_multilingual_v2"],
  [VoiceEngine.NATIVE]: [], // Native doesn't use modelId
};

export interface VoicePreferences {
  engine?: VoiceEngine;
  voice?: string;
  apikey?: string;
  language?: string;
  modelId?: string;
}

export interface UserSettings {
  voice: VoicePreferences;
}

export interface UpdateUserSettingsRequest {
  preferences?: {
    voice?: VoicePreferences;
  };
}
