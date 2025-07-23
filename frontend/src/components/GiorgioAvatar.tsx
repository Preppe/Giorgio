import React, { useRef } from 'react';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Mic, MicOff } from 'lucide-react';

interface GiorgioAvatarProps {
  isActive: boolean;
  isRecording?: boolean;
  isTranscribing?: boolean;
  error?: string;
  onToggleListening?: () => void;
  disabled?: boolean;
}

gsap.registerPlugin(useGSAP);

const GiorgioAvatar: React.FC<GiorgioAvatarProps> = ({
  isActive,
  isRecording = false,
  isTranscribing = false,
  error,
  onToggleListening,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const scanLinesRef = useRef<HTMLDivElement[]>([]);
  const micButtonRef = useRef<HTMLButtonElement>(null);
  const waveformRef = useRef<HTMLDivElement[]>([]);
  const statusTextRef = useRef<HTMLDivElement>(null);

  // GSAP animations
  useGSAP(
    () => {
      if (!containerRef.current) return;

      // Create master timeline
      const masterTimeline = gsap.timeline({ repeat: -1 });

      // Core morphing animation
      if (coreRef.current) {
        const coreTimeline = gsap.timeline({ repeat: -1, yoyo: true });
        coreTimeline
          .to(coreRef.current, {
            scale: 1.1,
            rotation: 90,
            duration: 3,
            ease: 'power2.inOut',
          })
          .to(coreRef.current, {
            scale: 0.9,
            rotation: 180,
            duration: 2,
            ease: 'power2.inOut',
          })
          .to(coreRef.current, {
            scale: 1,
            rotation: 360,
            duration: 3,
            ease: 'power2.inOut',
          });

        masterTimeline.add(coreTimeline, 0);
      }

      // Advanced scanning lines
      scanLinesRef.current.forEach((line, index) => {
        if (line) {
          gsap.fromTo(
            line,
            {
              y: -100,
              opacity: 0,
              scaleX: 0.1,
            },
            {
              y: 100,
              opacity: 1,
              scaleX: 1,
              duration: 2,
              repeat: -1,
              delay: index * 0.3,
              ease: 'power2.inOut',
            }
          );
        }
      });

      // Glitch effect (random interference)
      if (isActive) {
        const glitchTimeline = gsap.timeline({ repeat: -1, repeatDelay: 8 });
        glitchTimeline
          .to(coreRef.current, {
            skewX: 5,
            duration: 0.1,
            ease: 'power2.inOut',
          })
          .to(coreRef.current, {
            skewX: -3,
            x: 2,
            duration: 0.1,
            ease: 'power2.inOut',
          })
          .to(coreRef.current, {
            skewX: 0,
            x: 0,
            duration: 0.1,
            ease: 'power2.inOut',
          });

        masterTimeline.add(glitchTimeline, 0);
      }

      // Animazione waveform circolare
      if (isRecording && waveformRef.current.length > 0) {
        waveformRef.current.forEach((wave, index) => {
          if (wave) {
            const radius = 70; // Ridotto per centrare meglio sul cerchio
            const angle = (index / waveformRef.current.length) * 360;
            const delay = index * 0.05;

            // Posizionamento circolare centrato
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;

            gsap.set(wave, {
              left: '50%',
              top: '50%',
              x: x,
              y: y,
              xPercent: -50,
              yPercent: -50,
              rotation: angle + 90, // Orientamento radiale
            });

            // Animazione pulsing intelligente
            gsap.to(wave, {
              scaleY: () => 0.4 + Math.random() * 1.2,
              duration: 0.15 + Math.random() * 0.25,
              repeat: -1,
              yoyo: true,
              ease: 'power2.inOut',
              delay: delay,
            });

            // Rotazione lenta delle onde intorno al centro
            gsap.to(wave, {
              rotation: angle + 450, // 360 + 90 per mantenere orientamento
              duration: 25,
              repeat: -1,
              ease: 'none',
            });
          }
        });
      }

      // Animazione bottone microfono
      if (micButtonRef.current) {
        if (isRecording) {
          gsap.to(micButtonRef.current, {
            scale: 1.1,
            duration: 0.3,
            ease: 'back.out(1.7)',
          });
        } else if (isTranscribing) {
          gsap.to(micButtonRef.current, {
            scale: 1.05,
            duration: 0.5,
            repeat: -1,
            yoyo: true,
            ease: 'power2.inOut',
          });
        } else {
          gsap.to(micButtonRef.current, {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out',
          });
        }
      }

      // State-based animations
      if (isActive || isRecording) {
        gsap.to(containerRef.current, {
          filter: 'brightness(1.2) saturate(1.3) contrast(1.1)',
          duration: 0.5,
          ease: 'power2.out',
        });
      } else {
        gsap.to(containerRef.current, {
          filter: 'brightness(1) saturate(1) contrast(1)',
          duration: 0.5,
          ease: 'power2.out',
        });
      }
    },
    {
      dependencies: [isActive, isRecording, isTranscribing],
      scope: containerRef,
    }
  );

  const getStatusText = () => {
    if (error) return error;
    if (isTranscribing) return 'Processing...';
    if (isRecording) return 'Listening...';
    return 'Tap to activate voice command';
  };

  const getStatusColor = () => {
    if (error) return 'text-red-500';
    if (isTranscribing) return 'text-accent';
    if (isRecording) return 'text-accent';
    return 'text-muted-foreground';
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div ref={containerRef} className="relative w-40 h-40">
        {/* Waveform circolare */}
        {isRecording && (
          <div className="absolute inset-0">
            {[...Array(24)].map((_, index) => (
              <div
                key={`wave-${index}`}
                ref={(el) => {
                  if (el) waveformRef.current[index] = el;
                }}
                className="absolute w-1 bg-gradient-to-t from-primary to-accent rounded-full"
                style={{
                  height: '8px',
                  filter: 'drop-shadow(0 0 3px currentColor)',
                }}
              />
            ))}
          </div>
        )}

        {/* Main AI Core */}
        <div
          ref={coreRef}
          className="ai-core absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          {/* Central Eye with enhanced morphing */}
          <div className="absolute inset-1/2 w-4 h-4 transform -translate-x-1/2 -translate-y-1/2">
            <div
              className={`w-full h-full rounded-full transition-all duration-300 ${
                isActive || isRecording
                  ? 'bg-accent shadow-lg shadow-accent/50'
                  : 'bg-primary shadow-lg shadow-primary/50'
              }`}
              style={{
                filter: 'drop-shadow(0 0 10px currentColor)',
              }}
            ></div>
          </div>

          {/* Advanced Scanning Lines */}
          {(isActive || isRecording) && (
            <div className="absolute inset-0 rounded-full overflow-hidden">
              {[...Array(5)].map((_, index) => (
                <div
                  key={`scanline-${index}`}
                  ref={(el) => {
                    if (el) scanLinesRef.current[index] = el;
                  }}
                  className="absolute left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent"
                  style={{
                    top: `${index * 25}%`,
                    filter: 'drop-shadow(0 0 5px currentColor)',
                  }}
                />
              ))}
            </div>
          )}

          {/* Geometric overlay for morphing */}
          <div
            className="absolute inset-2 border border-primary/30 rounded-full animate-pulse"
            style={{
              filter: 'drop-shadow(0 0 3px hsl(var(--primary)))',
            }}
          ></div>
        </div>

        {/* Microfono centrale integrato */}
        {onToggleListening && (
          <button
            ref={micButtonRef}
            onClick={onToggleListening}
            disabled={disabled || isTranscribing}
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border transition-all duration-300 z-20 ${
              isRecording
                ? 'border-accent/50 bg-accent/10 shadow-lg shadow-accent/30'
                : 'border-primary/50 bg-primary/10 hover:bg-primary/20'
            } ${disabled || isTranscribing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            style={{
              filter: 'drop-shadow(0 0 8px currentColor)',
            }}
          >
            {isRecording ? (
              <MicOff className="w-4 h-4 text-accent mx-auto" />
            ) : (
              <Mic className="w-4 h-4 text-primary mx-auto" />
            )}
          </button>
        )}

        {/* Glitch overlay effect */}
        {(isActive || isRecording) && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/10 to-transparent animate-pulse opacity-30"></div>
          </div>
        )}
      </div>

      {/* Testo di stato sotto l'avatar */}
      {(isRecording || isTranscribing || error) && (
        <div
          ref={statusTextRef}
          className={`text-xs ${getStatusColor()} font-mono tracking-wider text-center max-w-48`}
          style={{
            filter: 'drop-shadow(0 0 5px currentColor)',
          }}
        >
          {getStatusText()}
        </div>
      )}
    </div>
  );
};

export default GiorgioAvatar;
