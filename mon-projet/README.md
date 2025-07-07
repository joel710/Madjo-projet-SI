# Frontend - Interface Utilisateur de l'Agence de Voyage

## Aperçu Général
Cette application frontend fournit une interface utilisateur aux clients et administrateurs pour interagir avec le Système de Gestion d'Agence de Voyage. Elle permet aux utilisateurs de gérer les réservations, les clients, les voyages, et d'autres aspects de l'agence de voyage.

## Technologies Utilisées
-   **Angular**: Version 20
-   **TypeScript**: Pour la logique applicative et la sécurité des types.
-   **HTML & CSS**: Pour la structuration et la mise en style de l'interface utilisateur.
    -   **Tailwind CSS**: Utilisé pour la mise en style, comme indiqué par `tailwindcss` dans les `devDependencies` et les noms de classes typiques observés en HTML.
-   **Node.js et npm**: Pour l'environnement de développement, la gestion des paquets, et l'exécution des scripts de développement.
-   **Chart.js**: Pour l'affichage de graphiques dans le tableau de bord d'administration.

## Structure des Dossiers et Fichiers Clés
```
mon-projet/
├── .editorconfig                   # Configuration de style de code pour les éditeurs
├── .gitignore                      # Fichiers et dossiers ignorés par Git
├── .vscode/                        # Paramètres spécifiques à VS Code (si présents)
│   ├── extensions.json
│   ├── launch.json
│   └── tasks.json
├── README.md                       # Ce fichier d'information
├── angular.json                    # Configuration du CLI Angular (build, serve, test)
├── frontend_analysis.md            # Analyse détaillée du frontend (traduite)
├── package-lock.json               # Versions exactes des dépendances installées
├── package.json                    # Dépendances et scripts NPM
├── postcss.config.js               # Configuration pour PostCSS (souvent avec Tailwind CSS)
├── proxy.conf.json                 # Configuration du proxy pour les requêtes API en développement
├── public/                         # Ressources statiques publiques (ex: favicon.ico)
│   └── favicon.ico
├── src/                            # Code source de l'application Angular
│   ├── app/                        # Dossier principal du code de l'application
│   │   ├── components/             # Composants réutilisables
│   │   │   ├── admin/              # Composants spécifiques à l'admin
│   │   │   │   └── modals/         # Modales pour l'admin (ex: add-client-modal)
│   │   │   ├── admin-sidebar/      # Composant sidebar admin
│   │   │   ├── admin-topbar/       # Composant topbar admin
│   │   │   ├── client-header/      # En-tête pour les sections client
│   │   │   ├── footer/             # Pied de page global
│   │   │   └── header/             # En-tête global
│   │   ├── pages/                  # Composants principaux de page (vues routées)
│   │   │   ├── admin-dashboard/    # Tableau de bord admin
│   │   │   ├── agent-dashboard-page.ts # Tableau de bord agent (et .html, .css)
│   │   │   ├── client-dashboard/   # Tableau de bord client
│   │   │   ├── home/               # Page d'accueil
│   │   │   ├── login/              # Page de connexion
│   │   │   └── register/           # Page d'inscription
│   │   ├── services/               # Services Angular pour la logique métier et appels API
│   │   │   ├── agent.service.ts
│   │   │   ├── client.service.ts
│   │   │   ├── paiement.service.ts
│   │   │   ├── reservation.service.ts
│   │   │   ├── type-billet.service.ts
│   │   │   └── voyage.service.ts
│   │   ├── app.config.ts           # Configuration de l'application (ex: providers)
│   │   ├── app.css                 # Styles spécifiques au composant racine
│   │   ├── app.html                # Template HTML du composant racine
│   │   ├── app.routes.ts           # Définition des routes de l'application
│   │   └── app.ts                  # Logique du composant racine (souvent app.component.ts)
│   ├── index.html                  # Page HTML principale qui charge l'application
│   ├── main.ts                     # Point d'entrée principal de l'application (bootstrap Angular)
│   └── styles.css                  # Styles CSS globaux
├── tailwind.config.js              # Configuration de Tailwind CSS
├── tsconfig.app.json               # Configuration TypeScript spécifique à l'application
├── tsconfig.json                   # Configuration TypeScript de base du projet
└── tsconfig.spec.json              # Configuration TypeScript pour les tests
```

## Structure du Projet (Détaillée)
Le projet est organisé selon les conventions Angular standard au sein du répertoire `src/app/` :

-   `pages/`: Contient les principaux composants qui sont directement associés à une route URL. Chaque sous-dossier représente typiquement une page distincte de l'application, comme la page d'accueil (`home/`), la page de connexion (`login/`), ou les différents tableaux de bord (`admin-dashboard/`, `client-dashboard/`).
-   `components/`: Héberge des composants UI réutilisables. Ceux-ci sont conçus pour être intégrés dans les composants de `pages/` ou dans d'autres composants. Par exemple, un en-tête (`header/`) ou une modale spécifique (`admin/modals/add-client-modal/`) seraient placés ici. Cette organisation favorise la modularité et la réutilisation du code.
-   `services/`: Regroupe les services Angular. Ces services sont responsables de la logique métier qui n'est pas directement liée à une vue spécifique, comme la communication avec une API backend (par exemple, `ClientService` pour interagir avec l'API des clients), la gestion de l'état partagé, ou l'encapsulation de calculs complexes.

## Fonctionnalités Clés Implémentées
-   **Authentification des Utilisateurs**:
    -   Processus d'inscription pour les nouveaux clients.
    -   Fonctionnalité de connexion pour les clients, les agents, et un utilisateur admin codé en dur. La logique de connexion dans `LoginPageComponent` suit un flux spécifique :
        ```typescript
        // Extrait simplifié de LoginPageComponent.ts (pages/login/login.ts)
        onLoginSubmit() {
          // 1. Vérification des identifiants Admin codés en dur
          if (this.loginForm.login === 'admin@example.com' && this.loginForm.password === 'adminpassword') {
            this.router.navigate(['/admin']);
            return;
          }
          // 2. Tentative de connexion Agent via AgentService
          this.agentService.loginAgent({ login: this.loginForm.login, password: this.loginForm.password })
            .subscribe({
              next: (agent) => {
                if (agent && agent.idAgent) {
                  localStorage.setItem('loggedInAgentId', agent.idAgent.toString());
                  this.router.navigate(['/agent/dashboard']);
                } else {
                  // Si l'agent n'est pas trouvé ou n'a pas d'ID, tenter la connexion client
                  this.tryClientLogin();
                }
              },
              error: () => {
                // En cas d'erreur (ex: 401), tenter la connexion client
                this.tryClientLogin();
              }
            });
        }

        tryClientLogin() {
          // 3. Tentative de connexion Client via ClientService
          this.clientService.loginClient({ login: this.loginForm.login, password: this.loginForm.password })
            .subscribe({
              next: (client) => {
                if (client && client.idClient) {
                  localStorage.setItem('loggedInClientId', client.idClient.toString());
                  this.router.navigate(['/client']);
                } else {
                  alert('Identifiants incorrects ou rôle indéterminé !');
                }
              },
              error: () => {
                alert('Identifiants incorrects !');
              }
            });
        }
        ```
-   **Tableaux de Bord**:
    -   **Tableau de Bord Admin**: Un panneau complet pour gérer tous les aspects du système. Il utilise des paramètres de route pour afficher différentes sections (clients, agents, etc.) et charge dynamiquement les données correspondantes en appelant les services appropriés.
        ```typescript
        // Extrait conceptuel de AdminDashboardPageComponent.ts (pages/admin-dashboard/admin-dashboard.ts)

        // ngOnInit(): void {
        //   this.route.paramMap.subscribe(params => {
        //     const sectionParam = params.get('section');
        //     if (sectionParam) {
        //       this.currentSection = sectionParam;
        //       // Logique pour charger les données de la section
        //     }
        //   });
        // }

        // Exemple d'appel de service pour charger des données (clients)
        loadClients(): void {
          this.clientService.getAllClients().subscribe(data => {
            this.clientsList = data; // Stockage des données récupérées
            this.updatePaginatedClients(); // Mise à jour de la liste paginée pour l'affichage
          });
        }
        ```
        -   Opérations CRUD (Create, Read, Update, Delete) pour les Clients, Agents, Voyages, Types de Billets, Réservations, et Paiements, typiquement via des modales.
        -   Tableau de bord visuel avec des statistiques récapitulatives (nombre total de clients, réservations, revenus).
        -   Graphique affichant les réservations par mois.
        -   Pagination implémentée pour tous les tableaux de données afin de gérer de grands ensembles de données.
    -   **Tableau de Bord Client**: (Fonctionnalité basée sur les applications typiques d'agences de voyage et les services disponibles)
        -   Permet probablement aux clients de voir leur profil et l'historique de leurs réservations.
    -   **Tableau de Bord Agent**: Pour que les agents de voyage effectuent leurs tâches spécifiques.
-   **Fonctionnalités Destinées aux Clients**:
    -   Les utilisateurs peuvent (ou pourront, selon les capacités des services) :
        -   Rechercher et parcourir les voyages/destinations disponibles.
        -   Créer de nouvelles réservations.
        -   Voir l'historique de leurs réservations.
        -   Effectuer des paiements pour les réservations.

## Configuration et Exécution du Projet

### Prérequis
-   Node.js (dernière version LTS recommandée)
-   npm (fourni avec Node.js)

### Installation
1.  Naviguez vers le répertoire `mon-projet`.
2.  Installez les dépendances du projet :
    ```bash
    npm install
    ```

### Serveur de Développement
1.  Lancez le serveur de développement Angular :
    ```bash
    npm start
    ```
    Alternativement, vous pouvez utiliser la commande Angular CLI :
    ```bash
    ng serve
    ```
2.  Ouvrez votre navigateur et naviguez vers `http://localhost:4200/`. L'application se rechargera automatiquement si vous modifiez l'un des fichiers sources.

### Configuration du Proxy
Ce projet utilise une configuration de proxy définie dans `proxy.conf.json`. Cette configuration redirige les requêtes API faites depuis le frontend (par exemple, vers `/api/*`) vers le serveur backend.
```json
// Contenu de proxy.conf.json
{
  "/api": {
    "target": "http://localhost:8081/tg/voyage_pro/reservation/auth",
    "secure": false,
    "changeOrigin": true,
    "pathRewrite": {
      "^/api": "" // Réécrit /api en / sur la cible
    },
    "logLevel": "debug"
  }
}
```
Cela signifie qu'une requête frontend vers `/api/client/getAll` sera redirigée vers `http://localhost:8081/tg/voyage_pro/reservation/auth/client/getAll`.

**Important**: Pour que l'application frontend fonctionne correctement (en particulier pour la récupération de données et les opérations), assurez-vous que l'application backend Spring Boot est en cours d'exécution et accessible à l'adresse cible configurée.

## Interaction avec le Backend
-   L'application frontend est conçue pour communiquer avec une application backend Spring Boot distincte qui fournit les APIs nécessaires.
-   Toutes les requêtes HTTP vers le backend sont gérées par les services Angular situés dans le répertoire `src/app/services/`. Ces services encapsulent la logique d'appel API et rendent les données disponibles aux composants via des `Observables`.

## Points Clés Notés Durant l'Analyse / Problèmes Potentiels
-   **Problème Critique avec les Mises à Jour de Réservation**: Le `ReservationService` (dans `src/app/services/reservation.service.ts`) contient une méthode `updateReservation` qui tente d'utiliser une requête HTTP `GET` avec un corps de requête. Ceci est non standard et devrait être changé en une requête HTTP `PUT` pour s'aligner avec le `ReservationController` du backend (qui utilise `@PutMapping`) et les pratiques RESTful. L'implémentation actuelle échouera probablement ou sera traitée incorrectement par les serveurs/proxys.
    ```typescript
    // Dans src/app/services/reservation.service.ts - Méthode problématique
    updateReservation(reservationData: ReservationDTO): Observable<ReservationDTO> {
      // ...
      // HttpClient.get ne supporte pas de corps. Ceci devrait être this.http.put(...)
      // avec l'ID de la réservation dans l'URL si l'API backend est RESTful standard.
      // Actuellement, l'API backend pour la mise à jour est PUT /tg/voyage_pro/reservation/auth/reservation/update
      // et attend l'ID dans le corps, ce qui est acceptable pour PUT.
      return this.http.request<ReservationDTO>('GET', `${this.baseUrl}/update`, { // Devrait être 'PUT'
        body: payload, // Un corps avec GET est non standard
        headers: this.httpOptions.headers
      }).pipe(catchError(this.handleError));
    }
    ```
-   **Sécurité de la Connexion**: Le `LoginPageComponent` utilise actuellement `localStorage` pour stocker les identifiants de session utilisateur (par exemple, `loggedInClientId`, `loggedInAgentId`). Pour les environnements de production, il est fortement recommandé d'utiliser des méthodes plus sécurisées pour la gestion de session, telles que les cookies HttpOnly ou un flux d'authentification robuste basé sur des tokens (par exemple, JWT).
-   **Complexité du Tableau de Bord Admin**: Le composant principal de la section admin, `AdminDashboardPageComponent` (`src/app/pages/admin-dashboard/admin-dashboard.ts`), est assez volumineux et gère un état et une logique considérables pour diverses entités. À mesure que l'application grandit, envisagez de décomposer davantage ce composant en éléments plus petits et plus gérables ou d'adopter une bibliothèque de gestion d'état dédiée (comme NgRx ou NGXS) pour gérer plus efficacement l'état complexe de l'application.
-   **Cohérence du Format des Dates**: Une note dans `ClientService` concerne les formats de date (`dateNaiss` pour `ClientService.createClient` doit être `dd/mm/yyyy` pour le backend). Une gestion et une validation cohérentes des dates entre le frontend et le backend sont cruciales pour éviter les erreurs. Assurez-vous que toutes les saisies et transformations de dates sont correctement gérées.
