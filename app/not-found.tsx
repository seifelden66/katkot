import { getTranslations, getLocale } from "next-intl/server";
import Link from "next/link";

export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations("NotFound");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[hsl(var(--background))] dark:bg-[hsl(var(--background-dark))] text-[hsl(var(--foreground))] dark:text-[hsl(var(--foreground-dark))] px-6">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-extrabold mb-6 animate-bounce text-[hsl(var(--primary))] dark:text-[hsl(var(--primary-dark))]">
          404
        </h1>
        <h2 className="text-3xl font-semibold mb-3">{t("title")}</h2>
        <p className="text-lg mb-8 text-[hsl(var(--muted-foreground))] dark:text-[hsl(var(--muted-foreground-dark))]">
          {t("description")}
        </p>
        <Link
          href={`/${locale}/`}
          className="inline-block bg-[hsl(var(--primary))] text-[hsl(var(--foreground))] px-6 py-3 rounded-xl shadow-md hover:bg-[hsl(var(--primary-hover))] dark:hover:bg-[hsl(var(--primary-dark-hover))] transition-transform transform hover:scale-105"
        >
          {t("goHome")}
        </Link>
      </div>
    </div>
  );
}