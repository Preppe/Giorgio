import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useConversations, useDeleteConversation } from '@/hooks/conversation';
import { SwipeableItem } from '@/components/ui/SwipeableItem';
import type { ConversationSummary } from '@/services/types';

const ConversationsList: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  // TanStack Query hook per le conversazioni
  const { 
    data: conversations = [], 
    isLoading, 
    error, 
    refetch: refreshConversations 
  } = useConversations();

  // Hook per eliminare conversazioni
  const deleteConversation = useDeleteConversation();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm border-primary/30 hover:bg-primary/10">
          <MessageSquare className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 bg-background/95 backdrop-blur-sm border-primary/20">
        <SheetHeader className="mb-6 px-3">
          <div className="flex items-center justify-between">
            <SheetTitle className="neon-text text-lg font-bold tracking-wider">CONVERSAZIONI</SheetTitle>
            <Link to="/" onClick={() => setIsOpen(false)}>
              <Button variant="outline" size="sm" className="bg-primary/10 border-primary/30 hover:bg-primary/20 -mr-2">
                <Plus className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </SheetHeader>

        <div className="h-full flex flex-col">
          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {error && (
              <div className="p-4">
                <Card className="bg-destructive/10 border-destructive/30 p-3">
                  <p className="text-destructive text-sm">{error.message || 'Errore nel caricamento delle conversazioni'}</p>
                  <Button onClick={() => refreshConversations()} size="sm" variant="outline" className="mt-2 text-destructive border-destructive/30">
                    Riprova
                  </Button>
                </Card>
              </div>
            )}

            <ScrollArea className="h-full">
              <div className="space-y-4 p-2">
                {isLoading ? (
                  // Loading skeletons
                  Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i} className="p-3 space-y-2 bg-background/40 border-muted/40 shadow-md backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </Card>
                  ))
                ) : conversations.length === 0 ? (
                  // Empty state
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">Nessuna conversazione trovata</p>
                  </div>
                ) : (
                  // Conversations list
                  conversations.map((conversation) => (
                    <SwipeableItem
                      key={conversation.threadId}
                      id={conversation.threadId}
                      onDelete={(threadId) => deleteConversation.mutate(threadId)}
                      isDeleting={deleteConversation.isPending}
                      swipeThreshold={0.5}
                      showOptions={false}
                    >
                      <Link
                        to={`/chat/${conversation.threadId}`}
                        onClick={() => setIsOpen(false)}
                        className="block p-3 bg-background/60 border-primary/40 shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-primary/20 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/20"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-primary line-clamp-3 leading-5">
                            {conversation.description || `${conversation.threadId.substring(0, 8)}...`}
                          </span>
                        </div>
                      </Link>
                    </SwipeableItem>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ConversationsList;
