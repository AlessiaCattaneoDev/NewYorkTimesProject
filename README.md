# NYT Clone

Clone della home page del New York Times, costruito come progetto di pratica personale con React, TypeScript e le NYT Developer API.

Non è affiliato al New York Times. I dati sono ottenuti dalle API pubbliche NYT (Top Stories, Most Popular).

Demo: https://alessiacattaneodev.github.io/NewYorkTimesProject/

## Stack

- React 19 + Vite + TypeScript
- React Router v7
- Axios
- Context API + `useReducer`
- Tailwind CSS v4

## Setup

1. Installa le dipendenze:

   ```bash
   npm install
   ```

2. Crea un file `.env` nella root (basato su `.env.example`) con due chiavi ottenute da [developer.nytimes.com](https://developer.nytimes.com/get-started): una per **Top Stories API**, una per **Most Popular API**.

   ```
   VITE_NYT_TOP_STORIES_KEY=la_tua_chiave
   VITE_NYT_MOST_POPULAR_KEY=la_tua_chiave
   ```

3. Avvia il server di sviluppo:

   ```bash
   npm run dev
   ```

## Funzionalità

- Home e 6 sezioni (World, U.S., Politics, Business, Technology, Arts) via Top Stories API.
- Sidebar "Più letti" via Most Popular API.
- Pagina di dettaglio interna per ogni articolo, con link all'articolo originale su nytimes.com. Al refresh o su un link condiviso (senza lo state di navigazione), l'articolo viene ricercato nella sezione indicata dalla query e tra i "più letti"; Top Stories e Most Popular sono istantanee, non un archivio, quindi se l'articolo è nel frattempo uscito da entrambe le liste la pagina lo segnala esplicitamente invece di un generico "non trovato".
- Dark/light mode con persistenza in `localStorage`.
- Design responsive.
