# NYT Clone — Design Spec

Data: 2026-08-16

## Obiettivo

Progetto di pratica personale: clone della home page del New York Times,
costruito consumando le API pubbliche di NYT Developer. Non è un progetto
commerciale né ufficiale NYT.

## Requisiti funzionali

- Replica della home NYT: hero article + griglia di articoli secondari.
- Navigazione tra sezioni: Home, World, US, Politics, Business, Technology, Arts.
- Sidebar "Most Popular" con i più letti.
- Pagina di dettaglio interna per ogni articolo (titolo, immagine, abstract,
  byline, sezione, link all'articolo originale su nytimes.com).
- Toggle dark/light mode.
- Design responsive (desktop, tablet, mobile).

## Stack tecnico

- React 18 + Vite + TypeScript
- React Router v6
- Axios
- Context API + `useReducer` per lo stato globale
- Tailwind CSS

## API NYT utilizzate

- **Top Stories API**: una chiamata per sezione (`home`, `world`, `us`,
  `politics`, `business`, `technology`, `arts`). Nessun testo integrale
  dell'articolo, solo titolo/abstract/immagine/metadati.
- **Most Popular API**: lista degli articoli più letti per la sidebar.

Chiavi API in `.env` (gitignored):
```
VITE_NYT_TOP_STORIES_KEY=...
VITE_NYT_MOST_POPULAR_KEY=...
```
Con `.env.example` come riferimento. Chiamate dirette dal client (nessun
backend proxy): scelta accettabile per un progetto di pratica con chiave
gratuita a basso rate limit, nessun dato sensibile coinvolto.

## Struttura progetto

```
src/
  api/            client axios + funzioni per Top Stories / Most Popular
  context/        AppContext (tema, cache articoli per sezione)
  hooks/          useSection(), useMostPopular()
  components/     Header, Nav, ArticleCard, ArticleGrid, HeroArticle,
                  MostPopularSidebar, ThemeToggle, Loader, ErrorBanner, Footer
  pages/          Home, Section, ArticleDetail, NotFound
  types/          interfacce TS per le risposte NYT
```

## Routing

- `/` → Home (sezione "home" di Top Stories)
- `/section/:sectionName` → pagina di sezione
- `/article/:id` → dettaglio interno
- `*` → 404

**Nota**: Top Stories API non espone un endpoint "singolo articolo per id".
La pagina dettaglio riceve l'articolo via `Link state` al momento del click
(navigazione interna). In caso di refresh diretto su `/article/:id`, l'app
rifà il fetch della sezione d'origine (ricavata dall'URL o da un parametro
di query) e recupera l'articolo cercandolo per id nella lista risultante.

## Stato globale (Context + useReducer)

`AppContext` gestisce:
- tema (dark/light), persistito in `localStorage`
- cache articoli per sezione (evita richieste ripetute su sezioni già visitate)
- stato loading/error per sezione
- lista most popular

Hook `useSection(sectionName)`: legge dalla cache nel context; se assente,
chiama l'API e fa dispatch del risultato.
Hook `useMostPopular()`: analogo per la sidebar.

## UI/UX

- **Header**: wordmark serif in stile NYT, data corrente, nav con le 7
  sezioni, hamburger menu su mobile, toggle dark/light.
- **Home**: hero article (card grande, prima storia) + griglia di card
  secondarie.
- **Sidebar Most Popular**: lista numerata.
- **Article card**: immagine, titolo serif, abstract, sezione, autore.
- **Footer**: minimale, con disclaimer "progetto di pratica non ufficiale,
  dati via NYT API".
- Responsive: griglia a colonna singola sotto ~768px.

## Error handling

- Skeleton/spinner durante il fetch.
- Banner di errore con pulsante "Riprova" se l'API fallisce (rate limit,
  chiave non valida).
- Stato vuoto se una sezione non ha risultati.

## Testing

Verifica manuale via dev server (ogni sezione, routing, dark mode,
responsive). Nessuna suite di test automatica in questa iterazione —
coerente con lo scope di progetto di pratica personale.

## Note sul repository

Il repository git viene inizializzato ma **nessun commit viene creato
dall'assistente** — l'utente gestirà i commit in autonomia per non
comparire come autore/collaboratore nel progetto.
