## Back-End 1: Layered Back-End with Spring Boot
- Alle lagen van de back-end zijn geïmplementeerd volgens de principes van layered architectuur:
  - Controllers
    - Afhandelen van HTTP requests en opstellen antwoorden
    - DTO's worden gebruikt voor binnenkomende requestbody's
    - Input validatie wordt toegevoegd op deze DTO's 
  - Services
     - Afhandelen van business regels die niet in het model kunnen gecodeerd worden
     - Aansturen van repositories
  - Repositories
    - Interactie met de databank
    - Er wordt gebruik gemaakt van Spring Data repositories
  - Model
    - Representatie van de concepten waarmee je applicatie werkt
    - Geannoteerd met JPA annotaties
    - Alle logica die in het domein gecodeerd kan worden is ook in het domein gecodeerd en niet in een andere laag
- Je back-end bevat de volgende testen
  - Unit Testen
    - Model
      - Alle happy-paths zijn getest
      - Minstens één unhappy-path is getest
    - Service
      - Alle happy-paths zijn getest
  - Integratie Testen
    - Je hebt ten minste 1 integratie test

## Back-End 2: Database Access
- Er wordt een lokale PostgreSQL database geïnstalleerd en gebruikt.
- Je werkt niet met hard-coded data in de repositories maar met PostgreSQL als database.
- Je database schema wordt aangemaakt via een 'schema.sql' file.
- Initiële data wordt toegevoegd via de 'DBInitializer' klasse.
- Je gebruikt Spring Data JPA om met de databank te communiceren:
  - Je domein model bestaat uit geannoteerde entities.
  - Alle communicatie met je databank verloopt via Spring Data repositories.
  - JDBC en JPQL mogen enkel gebruikt worden om custom SELECT queries aan je Spring Data Repository toe te voegen.

## Back-End 3: JPA Advanced
- Alle operaties verlopen vanaf je service-laag volledig in transacties.
- Je service methodes zijn zo opgebouwd dat de functionaliteit logisch past in de scope van een transactie.
- Transacties maken gebruik van de default isolatie- en propagatie-instellingen.
- Je mag vrij gebruik maken van cascade, fetchType en orphanRemoval instellingen.

## Back-End 4: Security
### User Sign-Up
- Paswoorden worden nooit in plain-text opgeslagen in de database.
- User input wordt steeds gevalideerd (in back-end en front-end).
### Authenticatie
- Je gebruikt JWT token based authenticatie.
- Behalve voor login, register, status, de Swagger documentatie en eventueel een beperkt aantal andere routes afhankelijk van de context van je project.
### Autorisatie
- Je hebt minstens 3 verschillende rollen in je domein.
- Minstens 1 route in je back-end heeft een ander gedrag afhankelijk van de rol.
### Testing
- Je service-testen gebruiken @WithUserMock waar nodig.
- Je integratietesten gebruiken ook een token.