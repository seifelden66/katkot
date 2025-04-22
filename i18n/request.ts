import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  const actualLocale = locale ?? 'en';
  return {
    locale: actualLocale,
    messages: (await import(`../messages/${actualLocale}.json`)).default
  };
});
