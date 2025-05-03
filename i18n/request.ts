import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  let actualLocale = locale ?? 'en';
  
  const validLocales = ['en', 'ar'];
  if (!validLocales.includes(actualLocale)) {
    actualLocale = 'en'; 
  }
  
  return {
    locale: actualLocale,
    messages: (await import(`../messages/${actualLocale}.json`)).default
  };
});
