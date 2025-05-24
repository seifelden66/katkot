import { NextIntlClientProvider } from 'next-intl'
import Image from 'next/image'
import { getTranslations } from "next-intl/server";

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  // Await the params in Next.js 15
  const { locale } = await params;
  
  let messages
  try {
    messages = (await import(`@/messages/${locale}.json`)).default
  } catch {
    messages = {}
  }
  const t = await getTranslations("auth");

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
        <div className="flex w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-lg">
          <div className="relative hidden w-1/2 bg-gradient-to-br from-purple-600 to-indigo-500 md:block">
            <Image
              src="/logo1.png"
              alt="Welcome illustration"
              fill
              className="object-cover opacity-80"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="px-8 text-center text-3xl font-bold text-white">
                {t("welcome")}
              </h2>
            </div>
          </div>

          {/* Form side */}
          <div className="w-full p-8 md:w-1/2">
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-semibold text-gray-800">Katkot</h1>
            </div>
            <div className="space-y-6">{children}</div>
          </div>
        </div>
      </div>
    </NextIntlClientProvider>
  )
}