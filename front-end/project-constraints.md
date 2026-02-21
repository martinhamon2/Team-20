## Front-End 2: Introductie tot React & NextJs
- Pagina's worden opgebouwd uit verschillende herbruikbare componenten die in de map “components” zijn geplaatst.
- Bovenliggende componenten geven gegevens door aan onderliggende componenten via 'props'.
- De 'state' van een component wordt gebruikt om zijn data te beheren.
- Ten minste één onderliggende component communiceert terug naar de bovenliggende component met behulp van een callback-functie.
- Ten minste één component wordt voorwaardelijk weergegeven op basis van de status van de applicatie.
- Data mag nu nog een hard-coded JS-array in de services zijn.

## Front-End 3: Next.js Dynamic Routing, Server Components, Forms, Hooks & Client Storage
- Er is nagedacht over het gebruik van client- en server-side rendering:
  - Elke pagina wordt door gebruik van server-side rendering in een onmiddellijk bruikbare toestand aan de gebruiker getoond.
  - Client-side rendering wordt gebruikt om nadien interactiviteit toe te voegen.
- Het aanroepen van een REST API gebeurt in afzonderlijke, herbruikbare services.
- Bij client-side rendering worden de juiste hooks gebruikt:
  - De hook useSWR wordt gebruikt voor client-side API-requests.
  - De hook useEffect wordt gebruikt voor interactie met een extern systeem (bijv. browser storage).
- Dynamische routering wordt gebruikt waar nodig.
- De applicatie bevat minstens 2 formulieren met validatie, foutafhandeling en integratie met de back-end:
  - 1 loginformulier.
  - Minstens 1 functioneel formulier (dus een formulier dat betrekking heeft op het domein van je applicatie).
- Er wordt minstens 1 waarde opgeslagen in browser storage en gebruikt in de applicatie.
- Styling is toegepast in de mate dat je applicatie bruikbaar en leesbaar is. De styling op zich wordt niet beoordeeld. Je mag je eigen styling framework kiezen.


## Front-End 4: Security
  ### Security in front-end
  - De applicatie moet login en logout ondersteunen.
  - De front-end moet de secure cookie-based authenticatie flow van de back-end correct implementeren.
  - De client-side applicatiestatus (weten dat een gebruiker is ingelogd en wie het is) moet globaal beheerd worden (via React Context).
  - De UI moet op minimum 1 plek dynamisch reageren op de authenticatie-status (bv. het tonen van "Welkom, [naam]" in de header).
  - De client-side sessiestatus moet persistent zijn en een pagina-refresh overleven.
  - De logout-functionaliteit moet compleet zijn: het moet zowel de client-side (UI) sessie beëindigen als een verzoek naar de back-end sturen om de server-side sessie te vernietigen.
  - Minstens één server-side gerenderde pagina moet beveiligde data ophalen door de authenticatiestatus van de gebruiker correct door te geven aan de back-end API.
  - Indien een niet-geauthenticeerde gebruiker beveiligde data of een beveiligde pagina probeert te benaderen, moet een   - - duidelijke foutmelding aan de gebruiker getoond worden.
  - Autorisatie moet geïmplementeerd zijn: de UI moet zich op minimum 1 plek zichtbaar aanpassen op basis van de rol van de gebruiker.
  ### React Context
  - Naast client-side user data maak je minstens nog één maal gebruik van React Context om globale state toe te passen.
 
## Front-End 5: Custom Hooks, Rendering & Internationalisation
  ### i18n
  - Je kan minstens 1 pagina van je project in minstens 2 talen/locales tonen.
  - Je kan op een gebruiksvriendelijke manier de taal switchen.
  ### Custom hook
  - Je hebt 1 custom hook die niet dezelfde is als degene die we in de les gezien hebben.