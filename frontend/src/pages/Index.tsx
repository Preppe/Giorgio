import GiorgioAvatar from "@/components/GiorgioAvatar";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { MessageSkeleton } from "@/components/MessageSkeleton";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { TypingIndicator } from "@/components/TypingIndicator";
import { Button } from "@/components/ui/button";
import { useConversationDetail, useSendMessage, useTextToSpeech as useServerTextToSpeech } from "@/hooks/conversation";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { useAuthStore } from "@/stores/authStore";
import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";
import { Send, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const Index = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();

  const isNativePlatform = Capacitor.isNativePlatform();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const { ttsEnabled, setTtsEnabled, user } = useAuthStore();

  const { data: conversationDetail, isLoading: isLoadingConversation, error: conversationError } = useConversationDetail(threadId);

  const sendMessageMutation = useSendMessage();
  const [conversationStarted, setConversationStarted] = useState<Date | null>(null);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputAreaRef = useRef<HTMLDivElement>(null);
  const [inputAreaHeight, setInputAreaHeight] = useState(96);

  // TTS state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [needsPermission, setNeedsPermission] = useState(false);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);

  const serverTTS = useServerTextToSpeech();

  const cleanText = (text: string) => text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/\n+/g, '. ')
    .trim();

  const requestPermission = async () => {
    try {
      await TextToSpeech.speak({ text: '', lang: 'it-IT', volume: 0.1 });
      await TextToSpeech.stop();
      setNeedsPermission(false);
    } catch (err: any) {
      if (err.error === 'not-allowed') {
        setNeedsPermission(true);
      }
    }
  };

  const stopTts = async () => {
    try {
      await TextToSpeech.stop();
    } catch (err: any) {
      console.warn('TTS Stop Warning:', err);
    }
    
    if (ttsAudioRef.current) {
      ttsAudioRef.current.pause();
      ttsAudioRef.current = null;
    }
    
    setIsSpeaking(false);
  };

  const speak = async (text: string) => {
    if (!text.trim()) return;

    if (isSpeaking) {
      await stopTts();
    }

    try {
      const cleanedText = cleanText(text);
      const voiceEngine = user?.preferences?.voice?.engine;

      if (voiceEngine === 'native' || !voiceEngine) {
        const ttsOptions = {
          text: cleanedText,
          lang: 'it-IT',
          rate: 0.9,
          pitch: 1.0,
          volume: 1.0,
        };

        await TextToSpeech.speak(ttsOptions);
        
        setIsSpeaking(true);
        setNeedsPermission(false);
      } else {
        const audioBlob = await serverTTS.mutateAsync(cleanedText);
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (ttsAudioRef.current) {
          ttsAudioRef.current.pause();
        }
        
        ttsAudioRef.current = new Audio(audioUrl);
        ttsAudioRef.current.onended = () => {
          setIsSpeaking(false);
          if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
        ttsAudioRef.current.onerror = () => {
          setIsSpeaking(false);
          if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
        
        await ttsAudioRef.current.play();
        setIsSpeaking(true);
      }
    } catch (err: any) {
      if (err.error === 'not-allowed') {
        setNeedsPermission(true);
      } else if (err.error !== 'interrupted' && !err.message?.includes('interrupted')) {
        console.error('TTS Error:', err);
      }
      setIsSpeaking(false);
    }
  };

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      // Ferma TTS quando l'utente invia un nuovo messaggio
      if (isSpeaking) {
        stopTts();
      }

      sendMessageMutation.mutate(
        { message: text, threadId },
        {
          onSuccess: (data) => {
            if (!threadId && data.threadId) {
              navigate(`/chat/${data.threadId}`);
            }
          },
        },
      );
    },
    [threadId, sendMessageMutation, navigate, isSpeaking],
  );

  const voiceRecording = useVoiceRecording({
    onTranscript: (text: string) => {
      sendMessage(text);
    },
  });

  const toggleListening = async () => {
    if (voiceRecording.isRecording) {
      voiceRecording.stopRecording();
    } else {
      voiceRecording.startRecording();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendInputMessage = () => {
    if (!inputText.trim() || sendMessageMutation.isPending || isLoadingConversation || sendMessageMutation.isAiResponding) return;
    sendMessage(inputText);
    setInputText("");
  };

  const toggleTts = async () => {
    if (isSpeaking) {
      stopTts();
    }

    if (!ttsEnabled && needsPermission) {
      // Se stiamo abilitando TTS e serve il permesso, richiediamolo
      await requestPermission();
    }

    setTtsEnabled(!ttsEnabled);
  };

  useEffect(() => {
    if (threadId && conversationDetail) {
      setConversationStarted(new Date(conversationDetail.lastUpdated));
    }
  }, [threadId, conversationDetail]);

  useEffect(() => {
    scrollToBottom();
  }, [conversationDetail?.messages, sendMessageMutation.isAiResponding]);

  // Auto-play TTS per le risposte di Giorgio
  useEffect(() => {
    if (!ttsEnabled || !conversationDetail?.messages || sendMessageMutation.isAiResponding) return;

    const lastMessage = conversationDetail.messages[conversationDetail.messages.length - 1];
    if (lastMessage && lastMessage.role === "assistant") {
      // Ritardo per permettere all'UI di aggiornarsi e evitare loop
      const timeoutId = setTimeout(() => {
        // Controlla di nuovo se TTS è ancora abilitato prima di parlare
        if (ttsEnabled && !sendMessageMutation.isAiResponding) {
          speak(lastMessage.content);
        }
      }, 800);

      return () => clearTimeout(timeoutId);
    }
  }, [conversationDetail?.messages?.length, sendMessageMutation.isAiResponding, ttsEnabled]);

  useEffect(() => {
    const updateInputAreaHeight = () => {
      if (inputAreaRef.current) {
        const height = inputAreaRef.current.offsetHeight;
        setInputAreaHeight(height);
      }
    };

    updateInputAreaHeight();
    const resizeObserver = new ResizeObserver(updateInputAreaHeight);
    if (inputAreaRef.current) {
      resizeObserver.observe(inputAreaRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [inputText]);

  useEffect(() => {
    if (!isNativePlatform) return;

    const keyboardWillShow = (event: any) => {
      setKeyboardHeight(event.keyboardHeight);
      document.documentElement.style.setProperty("--keyboard-height", `${event.keyboardHeight}px`);
    };

    const keyboardWillHide = () => {
      setKeyboardHeight(0);
      document.documentElement.style.setProperty("--keyboard-height", "0px");
    };

    Keyboard.addListener("keyboardWillShow", keyboardWillShow);
    Keyboard.addListener("keyboardWillHide", keyboardWillHide);

    return () => {
      Keyboard.removeAllListeners();
    };
  }, [isNativePlatform]);

  return (
    <div className="h-full bg-background text-foreground overflow-hidden flex flex-col -mt-6">
      {(conversationError || sendMessageMutation.error) && (
        <div className="fixed top-4 left-4 right-4 bg-destructive/10 border border-destructive/30 rounded-lg p-3 z-50">
          <p className="text-destructive text-sm">{conversationError?.message || sendMessageMutation.error?.message || "Errore nella conversazione"}</p>
        </div>
      )}

      {needsPermission && ttsEnabled && (
        <div className="fixed top-16 left-4 right-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 z-50">
          <p className="text-yellow-600 text-sm">TTS richiede permesso browser. Tocca il pulsante volume per abilitare.</p>
        </div>
      )}

      <div className="flex flex-col items-center mb-8 space-y-6 px-4">
        <GiorgioAvatar
          isActive={voiceRecording.isRecording || isSpeaking}
          isRecording={voiceRecording.isRecording}
          isTranscribing={voiceRecording.isTranscribing}
          error={voiceRecording.error}
          onToggleListening={toggleListening}
          disabled={voiceRecording.isTranscribing || isLoadingConversation || sendMessageMutation.isPending || sendMessageMutation.isAiResponding}
        />
      </div>

      <div className="flex-1 flex flex-col min-h-0" style={{ paddingBottom: `${inputAreaHeight}px` }}>
        {conversationStarted && (
          <div className="px-4 mb-2">
            <span className="text-xs text-muted-foreground font-medium">
              {conversationStarted.toLocaleDateString("it-IT")} -{" "}
              {conversationStarted.toLocaleTimeString("it-IT", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-muted/20 scrollbar-thumb-primary/50 space-y-4">
          {isLoadingConversation && threadId ? (
            <MessageSkeleton />
          ) : (
            (conversationDetail?.messages || []).map((message, index) => (
              <div key={index}>
                {message.role === "user" ? (
                  <div className="flex justify-end px-4">
                    <div className="bg-accent/10 border border-accent/30 text-accent text-sm px-4 py-3 rounded-lg max-w-xs leading-relaxed">
                      {message.content}
                    </div>
                  </div>
                ) : (
                  <div className="px-1">
                    <div className="bg-primary/5 border-l-2 border-primary/30 py-4 px-3">
                      <MarkdownRenderer content={message.content} />
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          {(sendMessageMutation.isAiResponding || (!threadId && sendMessageMutation.isPending)) && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div
        ref={inputAreaRef}
        className={`fixed bottom-0 left-0 right-0 z-40 px-4 pt-4 ${isNativePlatform ? "pb-safe-4" : "pb-4"} border-t border-primary/20 bg-background/95 backdrop-blur-xl shadow-2xl shadow-primary/10 transition-all duration-300`}
        style={{
          marginBottom: isNativePlatform && keyboardHeight > 0 ? `${keyboardHeight}px` : "0px",
        }}
      >
        <div className="flex items-end space-x-2">
          <Button
            onClick={toggleTts}
            size="sm"
            variant="outline"
            className={`${
              ttsEnabled
                ? "bg-primary/20 border-primary/50 text-primary hover:bg-primary/30"
                : needsPermission
                  ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-600 hover:bg-yellow-500/30"
                  : "bg-muted/50 border-muted text-muted-foreground hover:bg-muted/70"
            } h-10 shrink-0`}
            title={needsPermission ? "Tocca per abilitare TTS" : ttsEnabled ? "Disabilita TTS" : "Abilita TTS"}
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendInputMessage();
              }
            }}
            placeholder="Enter command..."
            disabled={sendMessageMutation.isPending || isLoadingConversation || sendMessageMutation.isAiResponding}
            rows={1}
            className="flex-1 min-h-[2.5rem] max-h-32 resize-none bg-muted/50 border border-primary/30 rounded-md px-3 py-2 text-primary placeholder:text-muted-foreground font-mono text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 overflow-y-auto"
            style={{
              height: "auto",
              minHeight: "2.5rem",
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = Math.min(target.scrollHeight, 128) + "px";
            }}
          />
          <Button
            onClick={handleSendInputMessage}
            size="sm"
            disabled={sendMessageMutation.isPending || isLoadingConversation || sendMessageMutation.isAiResponding || !inputText.trim()}
            className="bg-primary/20 border border-primary/50 hover:bg-primary/30 text-primary disabled:opacity-50 h-10"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <PWAInstallPrompt />
    </div>
  );
};

export default Index;
