import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { QueryClientProvider } from '@tanstack/react-query';

import Layout from '@/components/ui/layout';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

import PrivateRoute from './components/PrivateRoute';
import { queryClient } from './lib/queryClient';
import Auth from './pages/Auth';
import Index from './pages/Index';
import LandingPage from './pages/LandingPage';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import TodoList from './pages/TodoList';
import TodoLists from './pages/TodoLists';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout>
                  <Index />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/chat/:threadId"
            element={
              <PrivateRoute>
                <Layout>
                  <Index />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Layout>
                  <Profile />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/todo"
            element={
              <PrivateRoute>
                <Layout>
                  <TodoLists />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/todo/:listId"
            element={
              <PrivateRoute>
                <Layout>
                  <TodoList />
                </Layout>
              </PrivateRoute>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route
            path="*"
            element={
              <PrivateRoute>
                <Layout>
                  <NotFound />
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
