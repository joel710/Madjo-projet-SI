# Analyse du Frontend

## 1. Structure Générale

La structure de l'application frontend est définie par les conventions Angular et les configurations trouvées dans `app.routes.ts`.

-   **`app.routes.ts`**: Définit le routage de l'application. Les routes clés incluent :
    -   `/` (HomePageComponent)
    -   `/login` (LoginPageComponent)
    -   `/inscription` (RegisterPageComponent)
    -   `/admin/:section` (AdminDashboardPageComponent, gérant diverses sections admin comme 'dashboard', 'clients', 'agents', etc.)
    -   `/client` (ClientDashboardPageComponent)
    -   `/agent/dashboard` (AgentDashboardPageComponent)

-   **Répertoire `pages/`**: Contient les composants de haut niveau pour différentes vues/pages de l'application.
    -   `admin-dashboard/`: Pour l'interface utilisateur de l'administrateur.
    -   `agent-dashboard-page.ts/html/css`: Pour l'interface utilisateur de l'agent.
    -   `client-dashboard/`: Pour l'interface utilisateur du client.
    -   `home/`: Pour la page d'accueil.
    -   `login/`: Pour la page de connexion.
    -   `register/`: Pour la page d'inscription.

-   **Répertoire `components/`**: Contient les composants UI réutilisables.
    -   `admin/modals/`: Modales spécifiques utilisées dans le tableau de bord d'administration pour les opérations CRUD (AddClientModal, AddAgentModal, AddVoyageModal, AddTypeBilletModal, AddReservationModal, AddPaiementModal, DeleteConfirmationModal).
    -   `admin-sidebar/`: Barre latérale de navigation pour le tableau de bord d'administration.
    -   `admin-topbar/`: Barre de navigation supérieure pour le tableau de bord d'administration.
    -   `client-header/`: En-tête pour les parties de l'application destinées aux clients.
    -   `footer/`: Pied de page global de l'application.
    -   `header/`: En-tête général de l'application.

-   **Répertoire `services/`**: Contient les services Angular responsables de la logique métier et des interactions API. Chaque service correspond généralement à une entité/contrôleur backend.

## 2. Composants/Pages Clés

### `LoginPageComponent` (`pages/login/login.ts`)

-   **Flux de Connexion (Login Flow)**:
    1.  Présente un formulaire de connexion unifié pour le nom d'utilisateur et le mot de passe.
    2.  **Connexion Admin**: Vérification codée en dur pour `admin@example.com` et `adminpassword`. Si correspondance, navigue vers `/admin`.
    3.  **Connexion Agent**: Si ce n'est pas admin, tente de se connecter en tant qu'agent en utilisant `AgentService.loginAgent()`.
        -   En cas de succès (agent trouvé avec `idAgent`), stocke `loggedInAgentId` dans `localStorage` et navigue vers `/agent/dashboard`.
    4.  **Connexion Client**: Si la connexion de l'agent échoue (erreur ou pas d'`idAgent` dans la réponse), tente alors de se connecter en tant que client en utilisant `ClientService.loginClient()`.
        -   En cas de succès (client trouvé avec `idClient`), stocke `loggedInClientId` dans `localStorage` et navigue vers `/client`.
    5.  **Échec**: Si toutes les tentatives échouent, une alerte "Identifiants incorrects !" ou "Identifiants incorrects ou rôle indéterminé !" est affichée.
-   **Utilisation des Services (Service Usage)**:
    -   `ClientService`: Utilisé pour la connexion client (méthode `loginClient`).
    -   `AgentService`: Utilisé pour la connexion agent (méthode `loginAgent`).

### `AdminDashboardPageComponent` (`pages/admin-dashboard/admin-dashboard.ts`)

-   **Responsabilités (Responsibilities)**:
    -   Agit comme conteneur principal pour toutes les fonctionnalités liées à l'administration.
    -   Affiche différentes vues (statistiques du tableau de bord, tableaux pour clients, agents, voyages, types de billets, réservations, paiements) en fonction du paramètre de route `:section`.
    -   Gère l'ouverture et la fermeture de diverses modales pour l'ajout et la modification d'entités.
    -   Gère la confirmation de suppression pour les entités.
    -   Récupère et affiche les données de divers services.

-   **Gestion des Sections (Section Management)**:
    -   Utilise `ActivatedRoute` pour lire le paramètre `:section` de l'URL.
    -   Change dynamiquement `currentPageTitle` et `currentSection` en fonction de la route.
    -   Charge les données pertinentes pour la section actuelle (par exemple, `loadClients()` lorsque `currentSection` est 'clients').
    -   Les méthodes `loadCriticalData()` et `loadSecondaryData()` utilisant `forkJoin` pour charger des ensembles initiaux de données (clients, voyages, typesBillet, réservations d'abord, puis agents, paiements). `loadAllData()` récupère tout.

-   **Utilisation des Services & Opérations CRUD (Service Usage & CRUD Operations)**:
    -   `ClientService`: `getAllClients`, `createClient`, `updateClient`, `deleteClient`.
    -   `AgentService`: `getAllAgents`, `createAgent`, `updateAgent`, `deleteAgent`.
    -   `VoyageService`: `getAllVoyages`, `createVoyage`, `updateVoyage`, `deleteVoyage`.
    -   `TypeBilletService`: `getAllTypesBillet`, `createTypeBillet`, `updateTypeBillet`, `deleteTypeBillet`.
    -   `ReservationService`: `getAllReservations`, `createReservation`, `updateReservation` (pour les mises à jour générales), `updateReservationStatus` (pour 'CONFIRMED', 'CANCELLED'), `deleteReservation`.
    -   `PaiementService`: `getAllPaiements`, `createPaiement`, `updatePaiement`, `deletePaiement`.
    -   Les opérations CRUD sont généralement déclenchées par les méthodes `handleSave...` après la soumission d'un formulaire modal ou les méthodes `onDelete...`.

-   **Affichage des Données (Data Display)**:
    -   **Pagination**: Implémente la pagination pour toutes les listes (clients, agents, voyages, typesBillet, réservations, latestReservations, paiements). Chaque type d'entité a ses propres propriétés `currentPage`, `pageSize`, `paginated...List`, et `total...Pages`, ainsi que des méthodes comme `updatePaginated...`, `goTo...Page`, `next...Page`, `previous...Page`.
    -   **Statistiques du Tableau de Bord (Dashboard Stats)**:
        -   `totalClients`, `totalReservations`, `totalVoyages`: Calculés à partir de la longueur des listes respectives.
        -   `totalRevenus`: Calculé en additionnant les prix des réservations confirmées (prix du voyage + prix du type de billet). Utilise la mémoïsation (`_totalRevenus_...Cache`) pour éviter le recalcul si les données sous-jacentes n'ont pas changé.
        -   `topDestinations`: Calcule les 5 premières destinations d'arrivée à partir des réservations. Utilise également la mémoïsation.
    -   **Graphique (Chart)**:
        -   Utilise `Chart.js` pour afficher un graphique linéaire des "Réservations par mois".
        -   Le getter `reservationsPerMonth` calcule dynamiquement les données pour le graphique, également mémoïsé.
        -   Les méthodes `initChart()` et `destroyChart()` gèrent le cycle de vie du graphique.

-   **Modales Utilisées (Modals Used)**:
    -   `AddClientModalComponent`
    -   `AddAgentModalComponent`
    -   `AddVoyageModalComponent`
    -   `AddTypeBilletModalComponent`
    -   `AddReservationModalComponent`
    -   `AddPaiementModalComponent`
    -   `DeleteConfirmationModalComponent`
    -   Gère les drapeaux `is...ModalOpen` et les propriétés `...ToEdit` pour contrôler la visibilité des modales et passer des données pour l'édition.
    -   Les tableaux `sample...ForModal` sont préparés pour remplir les listes déroulantes dans les modales (par exemple, sélectionner un client pour une réservation).

## 3. Services

-   **`AgentService` (`services/agent.service.ts`)**:
    -   Objectif: Gère les données des agents et l'authentification.
    -   Entité Backend: `AGENT`.
    -   Méthodes: `getAllAgents`, `getAgentById`, `createAgent`, `updateAgent`, `deleteAgent`, `loginAgent`.
-   **`ClientService` (`services/client.service.ts`)**:
    -   Objectif: Gère les données des clients et l'authentification.
    -   Entité Backend: `CLIENT`.
    -   Méthodes: `createClient`, `loginClient`, `getAllClients`, `getClientById`, `updateClient`, `deleteClient`, `searchClients`.
-   **`PaiementService` (`services/paiement.service.ts`)**:
    -   Objectif: Gère les données de paiement.
    -   Entité Backend: `PAIEMENT`.
    -   Méthodes: `createPaiement`, `getAllPaiements`, `getPaiementById`, `updatePaiement`, `deletePaiement`.
-   **`ReservationService` (`services/reservation.service.ts`)**:
    -   Objectif: Gère les données de réservation.
    -   Entité Backend: `RESERVATION`.
    -   Méthodes: `createReservation`, `getAllReservations`, `updateReservation`, `deleteReservation`, `updateReservationStatus`.
    -   **Problème Critique (Critical Issue)**: La méthode `updateReservation` utilise `http.request<ReservationDTO>('GET', ..., { body: payload })`. C'est hautement non conventionnel car **les requêtes GET ne devraient pas avoir de corps**. La pratique standard est d'utiliser `PUT` ou `POST` pour les opérations qui modifient les données et incluent un corps. Cela causera probablement des problèmes avec de nombreux serveurs HTTP ou proxys qui pourraient supprimer le corps des requêtes GET. Le point de terminaison API backend `/tg/voyage_pro/reservation/auth/reservation/update` est également défini comme `GetMapping` mais attend un `@RequestBody`, ce qui est également non standard.
-   **`TypeBilletService` (`services/type-billet.service.ts`)**:
    -   Objectif: Gère les données des types de billets.
    -   Entité Backend: `TYPE_BILLET`.
    -   Méthodes: `createTypeBillet`, `getAllTypesBillet`, `getTypeBilletById`, `updateTypeBillet`, `deleteTypeBillet`.
-   **`VoyageService` (`services/voyage.service.ts`)**:
    -   Objectif: Gère les données des voyages.
    -   Entité Backend: `VOYAGE`.
    -   Méthodes: `createVoyage`, `getAllVoyages`, `getVoyageById`, `updateVoyage`, `deleteVoyage`.

-   **Configuration du Proxy (`proxy.conf.json`)**:
    -   Tous les services utilisent des chemins relatifs comme `/api/agent`.
    -   Le fichier `proxy.conf.json` configure les requêtes vers `/api` pour qu'elles soient transférées à `http://localhost:8081/tg/voyage_pro/reservation/auth`, avec `/api` étant supprimé du chemin. C'est une manière standard de gérer le Cross-Origin Resource Sharing (CORS) pendant le développement.

## 4. Flux de Données (Data Flow)

1.  **Interaction Utilisateur**: Un utilisateur interagit avec un composant (par exemple, clique sur un bouton dans `AdminDashboardPageComponent`).
2.  **Méthode du Composant**: L'interaction déclenche une méthode dans le composant (par exemple, `openAddClientModal` ou `handleSaveClient`).
3.  **Appel de Service**: La méthode du composant appelle une méthode de service pertinente (par exemple, `clientService.createClient(clientPayload)`).
4.  **Requête HTTP**: La méthode de service effectue une requête HTTP vers l'API backend (via le proxy).
    -   Les données de requête (charges utiles) sont généralement des DTOs définis dans les fichiers de service.
5.  **Traitement Backend**: L'API backend (application Spring Boot) traite la requête.
6.  **Réponse HTTP**: Le backend envoie une réponse HTTP (par exemple, entité créée, liste d'entités, statut).
7.  **Le Service Gère la Réponse**: Le service reçoit la réponse (par exemple, via le callback `next` d'un `Observable`). Il peut effectuer un certain mappage ou une gestion des erreurs.
8.  **Le Composant Reçoit les Données**: Le composant, abonné à l'Observable du service, reçoit les données (ou l'erreur).
9.  **Mise à Jour de l'UI**: Le composant met à jour ses propriétés, ce qui met à jour le modèle HTML, reflétant les changements pour l'utilisateur (par exemple, nouveau client ajouté au tableau, notification affichée).

## 5. Gestion de l'État (State Management)

-   **Propriétés des Composants**: La plupart de l'état de l'application semble être géré au sein des propriétés des composants.
    -   `AdminDashboardPageComponent` détient un état étendu pour les listes de toutes les entités (`clientsList`, `agentsList`, etc.), les données de pagination, les éléments actuellement édités (`clientToEdit`), les indicateurs de visibilité des modales (`isAddClientModalOpen`), et les statistiques calculées du tableau de bord.
-   **`localStorage`**: Utilisé pour un état persistant simple :
    -   `LoginPageComponent` stocke `loggedInAgentId` ou `loggedInClientId` dans `localStorage` après une connexion réussie. Ceci est probablement utilisé ailleurs (par exemple, dans les pages de tableau de bord ou les en-têtes) pour identifier l'utilisateur actuel, bien que le mécanisme de récupération et d'utilisation de cet ID stocké ne soit pas détaillé dans les fichiers fournis pour `AdminDashboardPageComponent`.
-   **Aucune Bibliothèque de Gestion d'État Centralisée**: Il n'y a aucune indication d'une bibliothèque de gestion d'état dédiée comme NgRx ou NGXS. L'état est principalement local aux composants ou partagé via les sorties de service et `localStorage`.
-   **Rechargement des Données**: L'état lié aux données récupérées est souvent rafraîchi en appelant explicitement des méthodes de chargement (par exemple, `loadClients()`, `loadAllData()`) après les opérations CRUD pour s'assurer que l'UI reflète les dernières données du backend.
