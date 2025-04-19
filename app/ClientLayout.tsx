'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { SessionProvider, useSession } from '@/contexts/SessionContext';
import { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/lib/store';
import MobileHeader from '@/components/layout/MobileHeader';
import LeftSidebar from '@/components/layout/LeftSidebar';
import RightSidebar from '@/components/layout/RightSidebar';
import MobileNavigation from '@/components/layout/MobileNavigation';

const inter = Inter({ subsets: ['latin'] });

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { session, logout } = useSession();
  const [darkMode, setDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // load theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) setDarkMode(saved === 'dark');
  }, []);

  // apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <html lang="en">
      <head />
      <body className={`${inter.className} transition-colors duration-300`} suppressHydrationWarning>
        <Provider store={store}>
          <SessionProvider>
            <div className="min-h-screen flex flex-col">
              <MobileHeader
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
              />

              <div className="flex flex-row w-full pt-14 lg:pt-0">
                <LeftSidebar
                  session={session}
                  logout={logout}
                  darkMode={darkMode}
                  setDarkMode={setDarkMode}
                  isMobileMenuOpen={isMobileMenuOpen}
                />

                <main className="flex-1 w-full max-w-full lg:max-w-3xl mx-auto min-h-screen">
                  <div className="sticky top-14 lg:top-0 z-20 backdrop-blur-md px-4 py-4">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Home</h1>
                  </div>
                  <div className="p-4">{children}</div>
                </main>

                <div className="hidden xl:block xl:w-96 flex-shrink-0">
                  <RightSidebar />
                </div>
              </div>

              <MobileNavigation session={session} />
              <div className="h-16 lg:hidden" />
            </div>
          </SessionProvider>
        </Provider>
      </body>
    </html>
  );
}
