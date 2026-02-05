
# Connect Your Tribe - Visitekaartje

## Visitekaartje met NodeJS

Elke frontender bij FDND stelt zichzelf binnen de tribe voor door middel van een visitekaartje. Redesign je visitekaartje uit sprint 1 met NodeJS en data uit de [whois.fdnd.nl](https://whois.fdnd.nl) API.


## Aanpak

In de opdracht hieronder bouw je eerst jouw visitekaartje in NodeJS. Daarvoor moet je NodeJS installeren en ga je bestanden op je NodeJS server plaatsen. Omdat dit de eerste keer is dat we NodeJS gebruiken, en dat net even anders werkt dan statische HTML, gaan we zo snel mogelijk naar Integreren. Ontwerpen laten we voor deze iteratie achterwege.

In een iteratie daarna ga je je visitekaartje met een REST API en JSON (her)ontwerpen, bouwen en opnieuw publiceren.

## Visitekaartje in NodeJS

In deze eerste ronde bouw je op basis van een voorbeeld jouw visitekaartje uit Sprint 1 exact na, maar dan op een NodeJS server. Je besteedt dus geen aandacht aan een herontwerp, dat komt later.

NodeJS is server-side software waarmee je dynamische websites kunt maken.

Voor je kan beginnen, moet je NodeJS installeren zodat je op je laptop aan de slag kunt.

### Inrichten ontwikkelomgeving

Navigeer naar [https://nodejs.org/](https://nodejs.org/en/download) en installeer de NodeJS ontwikkelomgeving. Kies voor _NodeJS 24.13.0_ (LTS, long-term support), download de benodigde bestanden en doorloop het installatieproces.

Fork daarna deze leertaak van [connect-your-tribe-profile-card](https://github.com/fdnd-task/connect-your-tribe-profile-card) en *clone* deze op jouw computer.

Open deze leertaak in VSCodium.

Open de _Terminal_ in VSCodium door de toetscombinatie `` ^` `` (control + `) te gebruiken. Er opent een terminalscherm in de hoofdmap van jouw project.

Voer in de terminal het commando `npm install` uit, door het in te typen en op enter te drukken. Je gebruikt _NPM_, de _NodeJS Package Manager_ om alle _afhankelijkheden_ voor dit project te installeren. NPM is een veelgebruikte package manager in frontend land. Voor dit project gebruiken we _Express_ (om een _server_ te maken) en _Liquid_ (om HTML te _renderen_).

Na de installatie is de map `node_modules` aangemaakt, en gevuld met allerlei _packages_. Scroll eens door deze map heen; vele honderden *open source* ontwikkelaars hebben de packages die je ziet gebouwd en die mag je gratis gebruiken.

Start het voorbeeld visitekaartje op door in de terminal het commando `npm start` uit te voeren. Als het goed is, komt hier een melding te staan over het opstarten van de server: Application started on http://localhost:8000 — Open deze URL in je browser.

Als het werkt, zet je je server weer uit door in de terminal de toetscombinatie `^c` (control + c) in te voeren. Deze toetsencombinatie wordt in de terminal gebruikt om de huidige taak te stoppen en *controle* (vandaar de c) terug te krijgen van het programma.

  - Optioneel: Volg het [NodeJS ‘Hello World’ voorbeeld](https://medium.com/@mohammedijas/hello-world-in-node-js-b333275ddc89)
  - Optioneel, iets technischer: Lees de eerste vijf delen van [Introduction to Node](https://nodejs.dev/en/learn/) als je een meer in-depth introductie wilt met de NodeJS ontwikkelomgeving.



#### Bronnen

- [Nodejs.org](https://nodejs.org/en/), voor de installatie van NodeJS op jouw systeem, kies voor NodeJS 24.13.0 (LTS, Long Term Support). Dit is de meest stabiele versie van NodeJS, welke ondersteund wordt met goede documentatie.
- [How To Open Terminal](https://www.youtube.com/watch?v=OmQhOnBzg_k), om iemand de terminal te zien openen en gebruiken op Youtube.
- [Introduction to NodeJS](https://nodejs.dev/en/learn/), voor een in depth introductie met de NodeJS ontwikkelomgeving. Let op: dit is best een technisch verhaal. De eerste zes pagina’s zijn interessant.


### Overzetten van jouw visitekaartje naar NodeJS en Liquid

Kopieer de CSS bestanden en alle afbeeldingen van jouw visitekaartje uit Sprint 1 naar de `/public` map. Bestanden in de `/public` map kunnen door de browser geladen worden; dit zijn statische bestanden, net als in Semester 1. Als je straks vanuit jouw HTML verwijst naar bestanden, dan doe je dat dus naar de `/public` map. Verwijs je in je HTML bijvoorbeeld naar `/style/style.css`, dan wordt dat bestand in `/public/style/style.css` gezocht.

Je gaat jouw HTML broncode uit elkaar halen en in drie delen opsplitsen: De hele `<head>` sectie, inclusief de `<body>` open-tag komen in `/views/partials/head.liquid` te staan. De `</body>` en `</html>` tags komen in `/views/partials/foot.liquid` te staan. Deze delen zetten we apart neer, omdat ze vaak op elke pagina in een site hetzelfde zijn. Met *Liquid* kunnen we deze delen *renderen* (aan elkaar knopen) en hoeven we onszelf minder te herhalen. In je visitekaartje is dit voordeel misschien nog niet zo duidelijk, maar dat komt vanzelf.

Zet de rest van de HTML van jouw visitekaartje in `/views/index.liquid`. Let op: overschrijf bij het kopiëren de eerste en laatste regel niet! De opdracht die je hier ziet is de Liquid manier om bestanden te *renderen*: `{% render 'partials/head.liquid' %}` zegt zoveel als, neem de inhoud van het `head.liquid` bestand en plaats dat hier.

Zet op de plek waar jouw naam in de HTML staat `{{ person.name }}` neer. Dit is de dynamische data die uit de API komt en door Liquid wordt ingevuld tijdens het opbouwen van de pagina.


#### Bronnen

- [The Liquid Template Language](https://liquidjs.com/tutorials/intro-to-liquid.html)
- [Client-Server Overview](https://developer.mozilla.org/en-US/docs/Learn/Server-side/First_steps/Client-Server_overview), voor als je het verhaal over client-server systemen eens rustig wilt nalezen op MDN.
- [Introduction to the server side](https://developer.mozilla.org/en-US/docs/Learn/Server-side/First_steps/Introduction), voor als je het verhaal over server-side programming eens rustig wilt nalezen op MDN.
- [Express/NodeJS introduction](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/Introduction), voor als je het verhaal over NodeJS en Express eens rustig wilt nalezen op MDN.


### Lokaal Testen

Start je visitekaartje op door in de terminal het commando `npm start` uit te voeren. Als het goed is, komt hier een melding te staan over het opstarten van de server: Application started on http://localhost:8000, open deze URL in je browser.

Laat als het werkt met gepaste trots jouw oude visitekaartje zien aan een klasgenoot. Geef ook even een seintje aan je docent.

Als alles werkt, zet je je server weer uit door in de terminal de toetscombinatie `^c` (control + c) in te voeren.

Besef dat je net de eerste stappen in NodeJS, Express en Liquid hebt gezet. Hier begint jouw server-side avontuur!

Als je je afvraagt waarom jouw naam niet meer in je kaartje staat: dat komt doordat op regel 10 in `server.js` waarschijnlijk nog niet jouw eigen ID staat. De server laadt dus de verkeerde data in! Later gaan we deze code aanpassen met jouw eigen ID, maar voor nu willen we vooral eerst zeker weten dat we kunnen Integreren. We slaan dus weer een stap over, en maken bewust de keuze om iets dat nog niet af is live te zetten.


### Visitekaartje Integreren en Live Testen

Als alles zonder fouten lokaal werkt, ga je verder met het publiceren van jouw project op Internet. Omdat we met NodeJS werken, is dit iets ingewikkelder dan voorheen met GitHub Pages. Er moet namelijk een server omgeving opgestart worden. Wij gebruiken _Render_ als hostingpartij (gratis voor studenten), maar je mag natuurlijk je eigen voorkeur volgen als die anders is.

Check nog een laatste keer of alles lokaal werkt door je server op te starten (zie hierboven hoe).

*Commit* en *Push* jouw project naar GitHub.

Meld je met behulp van je GitHub account aan bij [Render](https://render.com/).

Klik in het Dashboard op [+ New -> Web Service](https://dashboard.render.com/web/new).

Zoek de juiste repository (*connect-your-tribe-profile-card* als je niets hernoemd hebt) en volg de stappen om je project te _Deployen_. Render importeert jouw code vanaf GitHub, installeert de _dependencies_ via `npm install`, en voert `npm start` uit. Deze _deploy_ kan even duren (net als dat het bij GitHub Pages soms even duurde voordat jouw wijzigingen online kwamen).

Er wordt een unieke URL voor jouw project door Render gegenereerd.

Open die URL in je browser, check of alles werkt en voer daarna deze URL in bij de About van jouw repository op GitHub.

Omdat het hosten van NodeJS projecten complexer en duurder is dan het hosten van statische projecten, en we de gratis variant van Render gebruiken, “pauzeert” Render soms na een tijdje jouw project. Het kan daarna even duren voordat je NodeJS project weer opgestart is, soms wel 60 seconden.


#### Bronnen

- [Render](https://render.com/)


### De server code analyseren

Open het `server.js` bestand; dit is het bestand dat door NodeJS wordt uitgevoerd zodra je `npm start` uitvoert. Lees de comments, en probeer alle regels in eigen woorden uit te leggen voor jezelf. Stel vragen aan docenten, medestudenten en mentoren als je iets niet begrijpt of onduidelijk vindt.

Zoals je inmiddels wel doorhebt, draait het bij FDND om het stellen van vragen en het geven van feedback aan elkaar. Er zijn dus geen verkeerde vragen.

Er zijn wel verkeerde antwoorden, dus pas op met vertrouwen van (verouderde) online tutorials of het blind naleven van wat ChadGPT aan elkaar verzint. Blijf kritisch.


## Visitekaartje herontwerpen met NodeJS en een REST API

Het doel en uiteindelijke resultaat van dit project is het opnieuw ontwerpen en ontwikkelen van jouw visitekaartje. Aan de ene kant leer je nieuwe technieken inzetten; je maakt jouw visitekaartje met NodeJS, Express en Liquid, gebaseerd op een REST API met JSON. En aan de andere kant maak je na een half jaar oefenen een visitekaartje wat beter laat zien wie jij bent als frontender.

### Visitekaartje ontwerpen

Maak een nieuw issue aan op je repository, genaamd “Redesign visitekaartje”.

Maak een schets voor jouw visitekaartje nieuwe stijl, en voeg die toe aan je issue. Voeg bronnen die je denkt nodig te hebben ook toe, zodat je goed grip krijgt op je nieuwe ontwerp. Denk aan alle lessen uit *Semester 1: The Static Web*.

Maak een *breakdown* met goede HTML tags, wat hints over CSS en eventueel JS voor interactie. Geef met een afwijkende kleur aan welke gegevens op jouw kaartje uit de database komen. Voeg deze schets ook toe aan het issue, zodat je je voortgang documenteert op de plek waar het werk zich afspeelt.


### Visitekaartje Bouwen

Pas op regel 10 van _server.js_ jouw eigen ID aan (zie het whiteboard), en start je server (opnieuw) op. Als het goed is (en je gebruikt `{{ person.name }}` ergens in de Liquid view template), verschijnt nu jouw eigen naam.

Maak de nieuwe HTML versie van jouw visitekaartje door de `.liquid` bestanden in `/views/` en misschien`/views/partials` aan te passen. Voor wijzigingen in de _view templates_ en je CSS, hoef je je server niet te herstarten. Voor wijzigingen in _server.js_ wél.

🕵️ Tip voor als je wilt weten wat er in een variabele zit (zoals in `person`): toon de data in je browser door het `json` _Liquid filter_ te gebruiken:

```liquid
<p>{{ person|json }}</p>
```

Maak de nieuwe CSS versie van jouw visitekaartje door de `.css` bestanden aan te passen en check of je wijzigingen goed doorgevoerd zijn.

Voer stap voor stap de gegevens uit de FDND JSON API door in jouw visitekaartje, check na elke stap of alles nog werkt. Voeg eventueel extra data toe in [de database](https://whois.fdnd.nl/admin), als jouw ontwerp dat nodig heeft. En gebruik de Liquid Template language om je HTML dynamisch te maken.

Blijf stap voor stap werken, stel vragen aan klasgenoten, op Teams, op Discord of aan een docent als je er niet uit komt.

💪 Tip voor als je het `custom` object ook wilt gebruiken: [`JSON.parse()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse).

Push je werk regelmatig naar GitHub, en vermeld in je commit messages het relevante issue nummer. Kijk ook eens goed naar hoe je [_Partial Commits_](https://github.blog/news-insights/product-news/partial-commits-in-github-for-windows/) in kunt zetten om je werk meer te structureren.

#### Bronnen

- [The Liquid Template Language](https://liquidjs.com/tutorials/intro-to-liquid.html)
- [Liquid Filters](https://liquidjs.com/filters/overview.html)
- [Express documentatie](https://expressjs.com/en/5x/api.html) (geavanceerd)


### Integreren: je nieuwe werk online zetten

Een ander verschil tussen Render en GitHub Pages, is dat je bij Render handmatige _deploys_ moet maken. Nadat je je werk naar GitHub hebt gepusht, komt dat niet automatisch live. Je kunt dit wel instellen, maar dat is aan jou. Vergeet voor nu niet een handmatige deploy te doen als je je nieuwe werk aan de wereld wilt laten zien.

#### Bronnen

- [How Deploys Work](https://render.com/docs/deploys)
- [Skipping an auto-deploy](https://render.com/docs/deploys#skipping-an-auto-deploy)
- [Troubleshooting Your Deploy @ Render](https://render.com/docs/troubleshooting-deploys)
