import { useHeaderStore } from '@/stores/headerStore';

import ConversationsList from './ConversationsList';
import MenuDrawer from './MenuDrawer';

const Header = () => {
  const title = useHeaderStore((state) => state.title);

  return (
    <>
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between pt-header-safe px-4 pb-4 bg-slate-900/95 backdrop-blur-sm border-b border-cyan-500/20">
        {/* Left: Chat List */}
        <ConversationsList />

        {/* Center: Title */}
        {title && <h1 className="neon-text text-xl font-bold tracking-wider">{title}</h1>}

        {/* Right: Burger Menu */}
        <MenuDrawer side="right" className="bg-background/80 backdrop-blur-sm border-primary/30 hover:bg-primary/10" />
      </div>

      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-header-safe" />
    </>
  );
};

export default Header;
