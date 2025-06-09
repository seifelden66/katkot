'use client';

import '../../globals.css';
import { SessionProvider } from '@/contexts/SessionContext';
import { PointsProvider } from '@/contexts/PointsContext';
import { useState, useEffect, useRef } from 'react';
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
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) setDarkMode(saved === 'dark');
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    if (isRTL) {
      document.body.classList.add('rtl');
      document.dir = 'rtl';
    } else {
      document.body.classList.remove('rtl');
      document.dir = 'ltr';
    }
    
    if (isRTL) {
      document.documentElement.classList.add('rtl-layout');
    } else {
      document.documentElement.classList.remove('rtl-layout');
    }
  }, [isRTL]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobileMenuOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('button')
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside as EventListener);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside as EventListener);
    };
  }, [isMobileMenuOpen]);

  return (
        
      <div className="transition-colors duration-300" suppressHydrationWarning>
        <Provider store={store}>
          <QueryProvider>
            <SessionProvider>
              <PointsProvider>
                <div className={`min-h-screen flex flex-col ${isRTL ? 'rtl' : 'ltr'}`}>
                  <MobileHeader
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                    isMobileMenuOpen={isMobileMenuOpen}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                  />

                  <div className={`flex w-full pt-14 lg:pt-0 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div ref={sidebarRef} className={`${isRTL ? 'order-3 lg:order-3' : 'order-1 lg:order-1'}`}>
                      <LeftSidebar
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                        isMobileMenuOpen={isMobileMenuOpen}
                      />
                    </div>

                    <main className={`flex-1 w-full max-w-full lg:max-w-3xl mx-auto min-h-screen order-2 lg:order-2`}>
                      <div className="sticky top-14 lg:top-0 z-20 backdrop-blur-md px-4 py-4 bg-[hsl(var(--background))]">
                        <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">home</h1>
                      </div>
                      <div className="p-4">{children}</div>
                    </main>

                    <div className={`hidden xl:block xl:w-96 flex-shrink-0 ${isRTL ? 'order-1 lg:order-1' : 'order-3 lg:order-3'}`}>
                      <RightSidebar />
                    </div>
                  </div>

                  <MobileNavigation />
                  <div className="h-16 lg:hidden" />
                </div>
              </PointsProvider>
            </SessionProvider>
          </QueryProvider>
        </Provider>
      </div>
  );
}
