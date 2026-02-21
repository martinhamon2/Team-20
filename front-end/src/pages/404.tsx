import Container from "@/components/layout/Container";

export default function NotFound() {
  return (
    <Container>
      <article>
        <h1>Het spijt ons, maar deze pagina bestaat niet…</h1>
        <p className="mt-8 text-xl">
          Onze excuses voor het ongemak, maar de pagina die u probeerde te
          bereiken bestaat niet. U kunt onderstaande links gebruiken om proberen
          te vinden wat u zocht.
        </p>
        <small className="mt-8 block text-sm">
          Indien u er zeker van bent dat u het webadres goed heeft, maar toch
          een foutmelding krijgt, neem dan contact op met Website beheer.
        </small>
        <p className="mt-8 text-xl">Bedankt.</p>
      </article>
    </Container>
  );
}
