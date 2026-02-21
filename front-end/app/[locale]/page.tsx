import { getTranslations } from 'next-intl/server';

export default async function Home() {
  const t = await getTranslations();

  return (
    <main>
      <h1 className="pageTitle">{t("home.title")}</h1>
      <p>{t("home.description")}</p>
    </main>
  );
}