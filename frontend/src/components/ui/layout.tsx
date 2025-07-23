import { ReactNode } from 'react';

import Header from '../Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen-safe  text-white flex flex-col px-safe pb-safe">
      <Header />
      <main className="flex-1 overflow-hidden pt-6">{children}</main>
    </div>
  );
};

export default Layout;
