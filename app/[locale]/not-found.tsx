import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { getLocale } from "next-intl/server";

export default async function NotFound() {
    const locale = await getLocale();
    const t = await getTranslations("NotFound");
    
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
            <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
            <p className="text-lg mb-6">{t("description")}</p>
            <Link href={`/${locale}/`} className="text-blue-500 underline">
                {t("goHome")}
            </Link>
        </div>
    );
}