import { useState, useEffect, useRef, useCallback } from "react";
import { Trash2, Edit3 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface SwipeableItemProps {
  id: string;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  swipeThreshold?: number; // default 0.7
  showOptions?: boolean; // default true 
  onEdit?: (id: string) => void;
  onToggle?: (id: string) => void;
  isToggling?: boolean;
  children: React.ReactNode;
}

export const SwipeableItem = ({ 
  id,
  onDelete, 
  isDeleting,
  swipeThreshold = 0.7,
  showOptions = true,
  onEdit,
  onToggle,
  isToggling = false,
  children 
}: SwipeableItemProps) => {
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showOptionsPanel, setShowOptionsPanel] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const OPTIONS_THRESHOLD = 0.3;
  const OPTIONS_OPEN_WIDTH = showOptions && onEdit ? 140 : 80; // 140 per edit+delete, 80 per solo delete
  const MIN_SWIPE_DISTANCE = 10;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isToggling || isDeleting) return;

    const touch = e.touches[0];
    setStartX(touch.clientX);
    setStartY(touch.clientY);
    setIsDragging(false);

    const target = e.currentTarget as HTMLElement;
    setCardWidth(target.offsetWidth);
  };

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (isToggling || isDeleting) return;

      const touch = e.touches[0];
      const deltaX = startX - touch.clientX;
      const deltaY = Math.abs(startY - touch.clientY);

      if (Math.abs(deltaX) > MIN_SWIPE_DISTANCE && Math.abs(deltaX) > deltaY) {
        if (!isDragging) {
          setIsDragging(true);
        }
      }

      if (isDragging && deltaX > 0 && cardWidth > 0) {
        const progress = Math.min(deltaX / cardWidth, 1);
        setSwipeProgress(progress);
      }
    },
    [isToggling, isDeleting, startX, startY, isDragging, cardWidth],
  );

  const handleTouchEnd = () => {
    if (!isDragging) return;

    setIsDragging(false);

    if (swipeProgress >= swipeThreshold) {
      onDelete(id);
      setSwipeProgress(0);
      setShowOptionsPanel(false);
    } else if (showOptions && swipeProgress >= OPTIONS_THRESHOLD) {
      setShowOptionsPanel(true);
      const optionsProgress = OPTIONS_OPEN_WIDTH / cardWidth;
      setSwipeProgress(optionsProgress);
    } else {
      setSwipeProgress(0);
      setShowOptionsPanel(false);
    }
  };

  const handleDelete = () => {
    onDelete(id);
    setShowOptionsPanel(false);
    setSwipeProgress(0);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(id);
    }
    setShowOptionsPanel(false);
    setSwipeProgress(0);
  };

  const handleCloseOptions = () => {
    setShowOptionsPanel(false);
    setSwipeProgress(0);
  };

  useEffect(() => {
    if (!isDragging && !showOptionsPanel) {
      setSwipeProgress(0);
    }
  }, [id, isDragging, showOptionsPanel]);

  useEffect(() => {
    const cardElement = cardRef.current;
    if (!cardElement) return;

    cardElement.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      cardElement.removeEventListener("touchmove", handleTouchMove);
    };
  }, [handleTouchMove]);

  useEffect(() => {
    if (!showOptionsPanel) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-swipeable-item]")) {
        handleCloseOptions();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showOptionsPanel]);

  const transformX = swipeProgress * cardWidth;

  const handleCardClick = (e: React.MouseEvent) => {
    if (showOptionsPanel && !e.defaultPrevented) {
      e.preventDefault();
      e.stopPropagation();
      handleCloseOptions();
    } else if (!showOptionsPanel && !e.defaultPrevented && onToggle) {
      onToggle(id);
    }
  };

  return (
    <div className="relative overflow-hidden" data-swipeable-item>
      {(isDragging && swipeProgress > 0) || showOptionsPanel ? (
        <div className="absolute inset-y-0 right-0 flex items-center bg-gradient-to-l from-red-500/20 to-amber-500/20">
          {showOptions && onEdit && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (showOptionsPanel) handleEdit();
              }}
              disabled={isDragging || isToggling || isDeleting}
              className={`flex items-center justify-center w-16 h-full bg-amber-500/30 border-r border-amber-500/50 transition-all ${
                showOptionsPanel ? "hover:bg-amber-500/40 cursor-pointer" : "cursor-default"
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-amber-400 font-medium">Edit</span>
              </div>
            </button>
          )}

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (showOptionsPanel) handleDelete();
            }}
            disabled={isDragging || isToggling || isDeleting}
            className={`flex items-center justify-center ${showOptions && onEdit ? 'w-16' : 'w-full'} h-full bg-red-500/30 transition-all ${
              showOptionsPanel ? "hover:bg-red-500/40 cursor-pointer" : "cursor-default"
            }`}
          >
            <div className="flex flex-col items-center space-y-1">
              <Trash2 className="w-4 h-4 text-red-400" />
              <span className="text-xs text-red-400 font-medium">Delete</span>
            </div>
          </button>
        </div>
      ) : null}

      <Card
        ref={cardRef}
        className={`relative z-10 transition-all duration-300 ${
          isDragging ? "cursor-grabbing" : showOptionsPanel ? "cursor-pointer" : "cursor-grab"
        } ${isDeleting || isToggling ? "opacity-50" : ""}`}
        style={{
          transform: `translateX(-${transformX}px)`,
          transition: isDragging ? "none" : "all 0.3s ease-out",
          touchAction: "pan-y",
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onClick={handleCardClick}
      >
        {children}
      </Card>

      {isDragging && swipeProgress >= swipeThreshold && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500/40 backdrop-blur-sm z-20 pointer-events-none">
          <div className="flex items-center space-x-2 text-white">
            <Trash2 className="w-6 h-6" />
            <span className="text-lg font-semibold">Release to delete</span>
          </div>
        </div>
      )}
    </div>
  );
};