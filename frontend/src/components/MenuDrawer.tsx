import { useState } from 'react';
import { Link } from 'react-router-dom';

import { CheckSquare, Menu, MessageSquare, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface MenuDrawerProps {
  side?: 'left' | 'right';
  className?: string;
}

const MenuDrawer = ({ side = 'right', className }: MenuDrawerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      id: 'chat',
      label: 'Chat',
      icon: MessageSquare,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      link: '/',
    },
    {
      id: 'todo',
      label: 'Todo List',
      icon: CheckSquare,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      link: '/todo',
    },
    {
      id: 'user',
      label: 'User Profile',
      icon: User,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      link: '/profile',
    },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={className || 'fixed top-4 right-4 z-50 bg-background/80 backdrop-blur-sm border-primary/30 hover:bg-primary/10'}
        >
          <Menu className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side={side} className="w-80 bg-background/95 backdrop-blur-sm border-primary/20">
        <SheetHeader className="mb-6">
          <SheetTitle className="neon-text text-lg font-bold tracking-wider">MENU</SheetTitle>
        </SheetHeader>

        <div className="grid grid-cols-2 gap-4 auto-rows-fr">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const commonClasses = `
              group relative p-6 rounded-lg border transition-all duration-300
              ${item.bgColor} ${item.borderColor}
              hover:bg-opacity-20 hover:border-opacity-50
              hover:shadow-lg hover:shadow-primary/20
              hover:scale-105 transform
              focus:outline-none focus:ring-2 focus:ring-primary/50
              block w-full text-left
            `;

            const content = (
              <>
                <div className="flex flex-col items-center space-y-3">
                  <div
                    className={`
                    p-3 rounded-full ${item.bgColor} ${item.borderColor} border
                    group-hover:glow-sm transition-all duration-300
                  `}
                  >
                    <IconComponent className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <span
                    className={`
                    text-sm font-medium ${item.color}
                    group-hover:text-white transition-colors duration-300
                  `}
                  >
                    {item.label}
                  </span>
                </div>

                {/* Holographic effect overlay */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Holographic shimmer effect */}
                <div className="absolute inset-0 rounded-lg overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                </div>
              </>
            );

            return (
              <Link key={item.id} to={item.link || '#'} onClick={() => setIsOpen(false)} className={commonClasses}>
                {content}
              </Link>
            );
          })}
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="mt-3 text-center">
            <span className="text-xs text-primary/60 font-mono">v1.0.0 | GIORGIO SYSTEM</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MenuDrawer;
