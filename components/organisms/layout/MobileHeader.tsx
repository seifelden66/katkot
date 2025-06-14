'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SunIcon, MoonIcon, MenuIcon, CloseIcon, SearchIcon } from '@/components/atoms/Icons'
import { useLocale, useTranslations } from 'next-intl';
import { useState, useEffect, useRef } from 'react';
import { useSearch } from '@/app/hooks/queries/usePostQueries';
import Image from 'next/image';

type MobileHeaderProps = {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
}

interface User {
  id: string;
  full_name: string;
  avatar_url?: string;
}

interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  author?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface SearchResults {
  users: User[];
  posts: Post[];
}

export default function MobileHeader({ 
  darkMode, 
  setDarkMode, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen 
}: MobileHeaderProps) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('sidebar.search');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: searchResults, isLoading: isSearching } = useSearch(debouncedQuery) as { 
    data: SearchResults | undefined; 
    isLoading: boolean 
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
        if (searchQuery.trim() === '') {
          setShowSearchInput(false);
        }
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [searchQuery]);

  const handleSearchClick = () => {
    setShowSearchInput(true);
  };

  const handleSearchFocus = () => {
    if (debouncedQuery.trim().length >= 2) setShowResults(true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      router.push(`/${locale}/search?q=${encodeURIComponent(searchQuery)}`);
      setShowResults(false);
      setShowSearchInput(false);
    }
  };

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-40 border-b border-[hsl(var(--border))] px-4 py-3 flex justify-between items-center bg-[hsl(var(--background))]">
      {!showSearchInput ? (
        <>
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <span className="text-xl font-bold text-[hsl(var(--primary))]">Katkot</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSearchClick}
              className="p-2 rounded-full bg-[hsl(var(--muted))]">
              <SearchIcon />
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full bg-[hsl(var(--muted))]">
              {darkMode ? <SunIcon /> : <MoonIcon />}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation(); 
                setIsMobileMenuOpen(!isMobileMenuOpen);
              }}
              className="p-2 rounded-full bg-[hsl(var(--muted))]">
              {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </>
      ) : (
        <div className="w-full" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder={t('placeholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={handleSearchFocus}
              autoFocus
              className="w-full pl-10 pr-4 py-3 border-none rounded-full bg-[hsl(var(--muted))] placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] transition-all text-[hsl(var(--foreground))]">
            </input>
            <button
              type="button"
              onClick={() => {
                setShowSearchInput(false);
                setShowResults(false);
                setSearchQuery('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-[hsl(var(--muted-foreground))] bg-opacity-20">
              <CloseIcon />
            </button>
          </form>

          {showResults && debouncedQuery.trim().length >= 2 && (
            <div className="absolute mt-2 left-4 right-4 bg-[hsl(var(--card))] rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-[hsl(var(--muted-foreground))]">{t('loading')}</div>
              ) : searchResults && (
                searchResults.users.length > 0 || searchResults.posts.length > 0
              ) ? (
                <>
                  {searchResults.users.length > 0 && (
                    <div className="p-2">
                      <h3 className="text-sm font-semibold text-[hsl(var(--muted-foreground))] px-3 py-1">
                        {t('users')}
                      </h3>
                      {searchResults.users.slice(0, 3).map(user => (
                        <Link
                          key={user.id}
                          href={`/${locale}/profile/${user.id}`}
                          onClick={() => {
                            setShowResults(false);
                            setShowSearchInput(false);
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-[hsl(var(--muted))] rounded-lg">
                          <div className="w-10 h-10 rounded-full overflow-hidden">
                            {user.avatar_url ? (
                              <Image
                                src={user.avatar_url}
                                alt={user.full_name + ' avatar'}
                                width={40}
                                height={40}
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                                {user.full_name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-[hsl(var(--foreground))]">{user.full_name}</p>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">
                              @{user.id.slice(0, 8)}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {searchResults.posts.length > 0 && (
                    <div className="p-2">
                      <h3 className="text-sm font-semibold text-[hsl(var(--muted-foreground))] px-3 py-1">
                        {t('posts')}
                      </h3>
                      {searchResults.posts.slice(0, 3).map(post => (
                        <Link
                          key={post.id}
                          href={`/${locale}/posts/${post.id}`}
                          onClick={() => {
                            setShowResults(false);
                            setShowSearchInput(false);
                          }}
                          className="block p-3 hover:bg-[hsl(var(--muted))] rounded-lg">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden">
                              {post.author && post.author.avatar_url ? (
                                <Image
                                  src={post.author.avatar_url}
                                  alt={post.author.full_name + ' avatar'}
                                  width={32}
                                  height={32}
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                                  {post.author?.full_name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <p className="font-medium text-[hsl(var(--foreground))]">{post.author?.full_name}</p>
                          </div>
                          <p className="text-sm line-clamp-2 text-[hsl(var(--foreground))]">{post.content}</p>
                        </Link>
                      ))}
                    </div>
                  )}
                  {(searchResults.users.length > 3 || searchResults.posts.length > 3) && (
                    <div className="p-3 text-center border-t border-[hsl(var(--border))]">
                      <Link
                        href={`/${locale}/search?q=${encodeURIComponent(debouncedQuery)}`}
                        onClick={() => {
                          setShowResults(false);
                          setShowSearchInput(false);
                        }}
                        className="text-[hsl(var(--primary))] hover:underline">
                        {t('viewAll')}
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 text-center text-[hsl(var(--muted-foreground))]">
                  {t('noResults')} &ldquo;{debouncedQuery}&rdquo;
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  )
}