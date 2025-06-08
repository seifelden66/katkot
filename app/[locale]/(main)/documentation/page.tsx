'use client'
import { useTranslations } from 'next-intl'

export default function DocumentationPage() {
  const t = useTranslations('documentation');

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold sm:text-5xl sm:tracking-tight lg:text-6xl">
          {t('title')}
        </h1>
        <p className="mt-5 max-w-xl mx-auto text-xl text-[hsl(var(--muted-foreground))]">
          {t('subtitle')}
        </p>
      </div>
      
      <div className="bg-[hsl(var(--card))] shadow-xl rounded-2xl overflow-hidden mb-12">
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-4">{t('gettingStarted.title')}</h2>
          <p className="mb-6">{t('gettingStarted.description')}</p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-6">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-800/30 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('steps.createAccount.title')}</h3>
              <p>{t('steps.createAccount.description')}</p>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800/30 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('steps.createPosts.title')}</h3>
              <p>{t('steps.createPosts.description')}</p>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-4 mt-8">{t('earningPoints.title')}</h2>
          <p className="mb-6">{t('earningPoints.description')}</p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="border border-[hsl(var(--border))] p-4 rounded-lg">
              <h3 className="font-semibold mb-2">{t('earningPoints.methods.posting.title')}</h3>
              <p className="text-sm">{t('earningPoints.methods.posting.description')}</p>
              <p className="text-purple-600 dark:text-purple-400 font-bold mt-2">{t('earningPoints.methods.posting.points')}</p>
            </div>
            
            <div className="border border-[hsl(var(--border))] p-4 rounded-lg">
              <h3 className="font-semibold mb-2">{t('earningPoints.methods.commenting.title')}</h3>
              <p className="text-sm">{t('earningPoints.methods.commenting.description')}</p>
              <p className="text-purple-600 dark:text-purple-400 font-bold mt-2">{t('earningPoints.methods.commenting.points')}</p>
            </div>
            
            <div className="border border-[hsl(var(--border))] p-4 rounded-lg">
              <h3 className="font-semibold mb-2">{t('earningPoints.methods.reactions.title')}</h3>
              <p className="text-sm">{t('earningPoints.methods.reactions.description')}</p>
              <p className="text-purple-600 dark:text-purple-400 font-bold mt-2">{t('earningPoints.methods.reactions.points')}</p>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-4 mt-8">{t('tips.title')}</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>{t('tips.list.regular')}</li>
            <li>{t('tips.list.quality')}</li>
            <li>{t('tips.list.engage')}</li>
            <li>{t('tips.list.complete')}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}