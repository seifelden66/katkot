'use client';

import '../globals.css';
import { SessionProvider } from '@/contexts/SessionContext';
import { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/lib/store';
import MobileHeader from '@/components/layout/MobileHeader';
import LeftSidebar from '@/components/layout/LeftSidebar';
import RightSidebar from '@/components/layout/RightSidebar';
import MobileNavigation from '@/components/layout/MobileNavigation';
import { useLocale } from 'next-intl';
import QueryProvider from '@/app/providers/QueryProvider';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const locale = useLocale();
  const isRTL = locale === 'ar';
  
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) setDarkMode(saved === 'dark');
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <html>
      <body>
        
      <div className="transition-colors duration-300" suppressHydrationWarning>
        <Provider store={store}>
          <QueryProvider>
            <SessionProvider>
              <div className="min-h-screen flex flex-col">
                <MobileHeader
                  darkMode={darkMode}
                  setDarkMode={setDarkMode}
                  isMobileMenuOpen={isMobileMenuOpen}
                  setIsMobileMenuOpen={setIsMobileMenuOpen}
                />

                <div className={`flex flex-row w-full pt-14 lg:pt-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <LeftSidebar
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                    isMobileMenuOpen={isMobileMenuOpen}
                  />

                  <main className="flex-1 w-full max-w-full lg:max-w-3xl mx-auto min-h-screen">
                    <div className="sticky top-14 lg:top-0 z-20 backdrop-blur-md px-4 py-4">
                      <h1 className="text-xl font-bold text-gray-900 ">home</h1>
                    </div>
                    <div className="p-4">{children}</div>
                  </main>

                  <div className="hidden xl:block xl:w-96 flex-shrink-0">
                    <RightSidebar />
                  </div>
                </div>

                <MobileNavigation />
                <div className="h-16 lg:hidden" />
              </div>
            </SessionProvider>
          </QueryProvider>
        </Provider>
      </div>
      </body>
    </html>
  );
}
