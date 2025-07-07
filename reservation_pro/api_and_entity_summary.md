# Résumé des API et Entités Backend

## Entités (Entities)

### AGENT
-   **Propriétés (Properties):**
    -   `idAgent`: Long (ID, GeneratedValue)
    -   `nomAgent`: String
    -   `prenomAgent`: String
    -   `sexeAgent`: String
    -   `dateNaiss`: Date
    -   `telAgent`: String
    -   `mailAgent`: String
    -   `password`: String
-   **Relations (Relationships):**
    -   `paiementList`: List<PAIEMENT> (OneToMany, mappedBy="agent")

### CLIENT
-   **Propriétés (Properties):**
    -   `idClient`: Long (ID, GeneratedValue)
    -   `nomClient`: String
    -   `prenomClient`: String
    -   `dateNaiss`: Date
    -   `mailClient`: String
    -   `telClient`: String
    -   `sexeClient`: String
    -   `login`: String
    -   `password`: String
-   **Relations (Relationships):**
    -   `reservations`: List<RESERVATION> (OneToMany, mappedBy="client")

### PAIEMENT
-   **Propriétés (Properties):**
    -   `codePaiement`: String (ID)
    -   `datePaiement`: Date
-   **Relations (Relationships):**
    -   `reservation`: RESERVATION (ManyToOne)
    -   `agent`: AGENT (ManyToOne)

### RESERVATION
-   **Propriétés (Properties):**
    -   `idReservation`: Long (ID, GeneratedValue)
    -   `nombrePlacesReservees`: Integer
    -   `dateReservation`: Date
    -   `status`: String (Défaut: "PENDING")
-   **Relations (Relationships):**
    -   `client`: CLIENT (ManyToOne)
    -   `voyage`: VOYAGE (ManyToOne)
    -   `typeBillet`: TYPE_BILLET (ManyToOne)
    -   `paiementList`: List<PAIEMENT> (OneToMany, mappedBy="reservation")

### TYPE_BILLET
-   **Propriétés (Properties):**
    -   `idTypeBillet`: Long (ID, GeneratedValue)
    -   `libelleTypeBillet`: String
    -   `prixTypeBillet`: Double
-   **Relations (Relationships):**
    -   `reservations`: List<RESERVATION> (OneToMany, mappedBy="typeBillet")

### VOYAGE
-   **Propriétés (Properties):**
    -   `idVoyage`: Long (ID, GeneratedValue)
    -   `departVoyage`: String
    -   `arriveVoyage`: String
    -   `heureDepart`: String
    -   `heureArrivee`: String
    -   `dateVoyage`: Date
    -   `prix`: Double
-   **Relations (Relationships):**
    -   `reservations`: List<RESERVATION> (OneToMany, mappedBy="voyage")

## Points de Terminaison API (API Endpoints)

### AgentController
-   **Chemin de base (Base Path):** `/tg/voyage_pro/reservation/auth/agent`
-   **Points de terminaison (Endpoints):**
    -   **POST /create**
        -   Description: Crée un nouvel agent.
        -   Corps de la requête (Request Body): `AgentDTO`
        -   Corps de la réponse (Response Body): `AgentDTO`
    -   **GET /getAll (ou /)**
        -   Description: Récupère tous les agents.
        -   Corps de la réponse (Response Body): `List<AgentDTO>`
    -   **GET /get/{idAgent}**
        -   Description: Récupère un agent par son ID.
        -   Variable de chemin (Path Variable): `idAgent` (Long)
        -   Corps de la réponse (Response Body): `AgentDTO`
    -   **PUT /update/{idAgent}**
        -   Description: Met à jour un agent existant.
        -   Variable de chemin (Path Variable): `idAgent` (Long)
        -   Corps de la requête (Request Body): `AgentDTO`
        -   Corps de la réponse (Response Body): `AgentDTO`
    -   **DELETE /delete/{idAgent}**
        -   Description: Supprime un agent par son ID.
        -   Variable de chemin (Path Variable): `idAgent` (Long)
        -   Corps de la réponse (Response Body): Aucun (HttpStatus.NO_CONTENT ou HttpStatus.NOT_FOUND)
    -   **POST /login**
        -   Description: Connecte un agent.
        -   Corps de la requête (Request Body): `LoginRequest`
        -   Corps de la réponse (Response Body): `AgentDTO` (ou message d'erreur String)

### ClientController
-   **Chemin de base (Base Path):** `/tg/voyage_pro/reservation/auth/client`
-   **Points de terminaison (Endpoints):**
    -   **POST /create**
        -   Description: Crée un nouveau client.
        -   Corps de la requête (Request Body): `CLIENT` (Entity)
        -   Corps de la réponse (Response Body): `CLIENT` (Entity)
    -   **POST /login**
        -   Description: Connecte un client.
        -   Corps de la requête (Request Body): `LoginRequest`
        -   Corps de la réponse (Response Body): `ClientDTO` (ou message d'erreur String)
    -   **GET /getAll**
        -   Description: Récupère tous les clients.
        -   Corps de la réponse (Response Body): `List<ClientDTO>`
    -   **GET /get/{idClient}**
        -   Description: Récupère un client par son ID.
        -   Variable de chemin (Path Variable): `idClient` (Long)
        -   Corps de la réponse (Response Body): `ClientDTO`
    -   **PUT /update/{idClient}**
        -   Description: Met à jour un client existant.
        -   Variable de chemin (Path Variable): `idClient` (Long)
        -   Corps de la requête (Request Body): `ClientDTO`
        -   Corps de la réponse (Response Body): `ClientDTO`
    -   **DELETE /delete/{idClient}**
        -   Description: Supprime un client par son ID.
        -   Variable de chemin (Path Variable): `idClient` (Long)
        -   Corps de la réponse (Response Body): (Semble être une réponse personnalisée, probablement booléenne ou message de statut)
    -   **PUT /search**
        -   Description: Recherche des clients en fonction de critères dans le corps de la requête.
        -   Corps de la requête (Request Body): `ClientDTO`
        -   Corps de la réponse (Response Body): `List<ClientDTO>`
    -   **GET /refresh**
        -   Description: Rafraîchit la liste des clients (fonctionnalité exacte peu claire sans détails d'implémentation du service).
        -   Corps de la réponse (Response Body): `List<ClientDTO>`

### PaiementController
-   **Chemin de base (Base Path):** `/tg/voyage_pro/reservation/auth/paiement`
-   **Points de terminaison (Endpoints):**
    -   **POST /create**
        -   Description: Crée un nouveau paiement.
        -   Corps de la requête (Request Body): `PaiementDTO`
        -   Corps de la réponse (Response Body): `PaiementDTO`
    -   **GET /getAll (ou /)**
        -   Description: Récupère tous les paiements.
        -   Corps de la réponse (Response Body): `List<PaiementDTO>`
    -   **GET /get/{codePaiement}**
        -   Description: Récupère un paiement par son code.
        -   Variable de chemin (Path Variable): `codePaiement` (String)
        -   Corps de la réponse (Response Body): `PaiementDTO`
    -   **PUT /update/{codePaiement}**
        -   Description: Met à jour un paiement existant.
        -   Variable de chemin (Path Variable): `codePaiement` (String)
        -   Corps de la requête (Request Body): `PaiementDTO`
        -   Corps de la réponse (Response Body): `PaiementDTO`
    -   **DELETE /delete/{codePaiement}**
        -   Description: Supprime un paiement par son code.
        -   Variable de chemin (Path Variable): `codePaiement` (String)
        -   Corps de la réponse (Response Body): Aucun (HttpStatus.NO_CONTENT ou HttpStatus.NOT_FOUND)

### ReservationController
-   **Chemin de base (Base Path):** `/tg/voyage_pro/reservation/auth/reservation`
-   **Points de terminaison (Endpoints):**
    -   **POST /create**
        -   Description: Crée une nouvelle réservation.
        -   Corps de la requête (Request Body): `ReservationDTO`
        -   Corps de la réponse (Response Body): `RESERVATION` (Entity)
    -   **GET /all**
        -   Description: Récupère toutes les réservations.
        -   Corps de la réponse (Response Body): `List<ReservationDTO>`
    -   **PUT /update**
        -   Description: Met à jour une réservation existante.
        -   Corps de la requête (Request Body): `ReservationDTO`
        -   Corps de la réponse (Response Body): `ReservationDTO`
    -   **PUT /{id}/status**
        -   Description: Met à jour le statut d'une réservation.
        -   Variable de chemin (Path Variable): `id` (Long)
        -   Corps de la requête (Request Body): `Map<String, String>` (ex: `{"status": "CONFIRMED"}`)
        -   Corps de la réponse (Response Body): `ReservationDTO`
    -   **DELETE /delete/{id}**
        -   Description: Supprime une réservation par son ID.
        -   Variable de chemin (Path Variable): `id` (Long)
        -   Corps de la réponse (Response Body): `boolean`

### TypeBilletController
-   **Chemin de base (Base Path):** `/tg/voyage_pro/reservation/auth/ticket`
-   **Points de terminaison (Endpoints):**
    -   **POST /create**
        -   Description: Crée un nouveau type de billet.
        -   Corps de la requête (Request Body): `TypeBilletDTO`
        -   Corps de la réponse (Response Body): `TypeBilletDTO`
    -   **GET /getAll**
        -   Description: Récupère tous les types de billets.
        -   Corps de la réponse (Response Body): `List<TypeBilletDTO>`
    -   **GET /get/{id}**
        -   Description: Récupère un type de billet par son ID.
        -   Variable de chemin (Path Variable): `id` (Long)
        -   Corps de la réponse (Response Body): `TypeBilletDTO`
    -   **PUT /update/{idType}**
        -   Description: Met à jour un type de billet existant.
        -   Variable de chemin (Path Variable): `idType` (Long)
        -   Corps de la requête (Request Body): `TypeBilletDTO`
        -   Corps de la réponse (Response Body): `TypeBilletDTO`
    -   **DELETE /delete/{id}**
        -   Description: Supprime un type de billet par son ID.
        -   Variable de chemin (Path Variable): `id` (Long)
        -   Corps de la réponse (Response Body): `boolean`

### VoyageController
-   **Chemin de base (Base Path):** `/tg/voyage_pro/reservation/auth/voyage`
-   **Points de terminaison (Endpoints):**
    -   **POST /create**
        -   Description: Crée un nouveau voyage.
        -   Corps de la requête (Request Body): `VoyageDTO`
        -   Corps de la réponse (Response Body): `VoyageDTO`
    -   **GET /getAll**
        -   Description: Récupère tous les voyages.
        -   Corps de la réponse (Response Body): `List<VoyageDTO>`
    -   **GET /get/{idVoyage}**
        -   Description: Récupère un voyage par son ID.
        -   Variable de chemin (Path Variable): `idVoyage` (Long)
        -   Corps de la réponse (Response Body): `VoyageDTO`
    -   **DELETE /delete/{idVoyage}**
        -   Description: Supprime un voyage par son ID.
        -   Variable de chemin (Path Variable): `idVoyage` (Long)
        -   Corps de la réponse (Response Body): (Semble être une réponse personnalisée, probablement booléenne ou message de statut)
    -   **PUT /update/{idVoyage}**
        -   Description: Met à jour un voyage existant.
        -   Variable de chemin (Path Variable): `idVoyage` (Long)
        -   Corps de la requête (Request Body): `VoyageDTO`
        -   Corps de la réponse (Response Body): `VoyageDTO`

## Problèmes Observés/Incohérences (Observed Issues/Inconsistencies)

1.  **Mots de passe dans les DTOs (Password in DTOs):**
    *   `AgentDTO` et `ClientDTO` incluent un champ `password`. C'est un problème de sécurité car les mots de passe ne devraient pas être exposés dans les réponses. Bien que nécessaire pour la création/mise à jour, cela devrait être géré avec soin (par exemple, en écriture seule, ou DTOs séparés pour l'entrée et la sortie).
    *   Dans `AgentController`, le mot de passe est explicitement réinséré dans le DTO avant d'envoyer la réponse dans `getAgentById` et `getAllAgents`. Cela devrait être évité.

2.  **Types de Requête/Réponse Incohérents (Inconsistent Request/Response Types):**
    *   Le point de terminaison `create` de `ClientController` prend `CLIENT` (Entity) comme corps de requête et retourne `CLIENT` (Entity), tandis que les autres contrôleurs utilisent généralement des DTOs pour les requêtes et les réponses. C'est incohérent.
    *   Le point de terminaison `create` de `ReservationController` prend `ReservationDTO` mais retourne `RESERVATION` (Entity). Il est généralement préférable de s'en tenir aux DTOs pour les contrats API.

3.  **Conception d'API Non Conventionnelle (Unconventional API Design):**
    *   `ClientController` a un point de terminaison `PUT /search`. Typiquement, les opérations de recherche sont effectuées via des requêtes GET avec des paramètres de requête. Utiliser PUT pour la recherche n'est pas conventionnel.
    *   Le point de terminaison `refresh` de `ClientController` (`GET /refresh`) n'est pas clair dans son objectif sans contexte supplémentaire.
    *   Le point de terminaison `update` de `ReservationController` est `PUT /update` sans ID dans le chemin. Cela implique que l'ID est dans le corps de `ReservationDTO`, ce qui est acceptable mais moins courant que `PUT /update/{id}`.
    *   Les opérations de suppression dans `ClientController`, `ReservationController`, `TypeBilletController`, et `VoyageController` retournent des réponses personnalisées (booléens ou autres types) au lieu de codes de statut HTTP standard comme 204 No Content pour une suppression réussie ou 404 Not Found. `AgentController` et `PaiementController` utilisent `ResponseEntity<Void>` ce qui est plus standard.

4.  **Points de Terminaison Redondants dans AgentController (Redundant Endpoints in AgentController):**
    *   `AgentController` a `getAll` et un chemin vide `""` mappés à la même méthode `getAllAgents`. Bien que fonctionnel, définir explicitement un point de terminaison préféré (par exemple, `/getAll`) est plus propre.

5.  **Formatage des Dates (Date Formatting):**
    *   Le formatage des dates est spécifié dans les Entités (`AGENT`, `CLIENT`, `PAIEMENT`, `RESERVATION`, `VOYAGE`) et les DTOs (`ClientDTO`, `PaiementDTO`, `VoyageDTO`). Assurez la cohérence et que les formats choisis (`dd/mm/yyyy`, `yyyy-MM-dd`) sont appropriés pour les besoins de l'application.

6.  **CascadeType.ALL:**
    *   L'utilisation de `CascadeType.ALL` dans les relations (par exemple, `AGENT.paiementList`, `CLIENT.reservations`, `PAIEMENT.reservation`, `PAIEMENT.agent`, `RESERVATION.paiementList`, `TYPE_BILLET.reservations`, `VOYAGE.reservations`) devrait être examinée. Bien que pratique, cela peut entraîner des suppressions ou des mises à jour de données involontaires si ce n'est pas géré avec soin. Par exemple, la suppression d'un Agent pourrait entraîner la suppression en cascade de tous ses Paiements. Cela pourrait être souhaité, mais doit être confirmé.

7.  **Champs Nullables vs. Validation DTO (Nullable Fields vs. DTO Validation):**
    *   Les entités ont des contraintes `nullable = false`. Les DTOs correspondants devraient idéalement avoir des annotations de validation (par exemple, `@NotNull`, `@NotBlank`) pour assurer l'intégrité des données au niveau de l'entrée API avant d'atteindre la base de données.

8.  **LoginRequest DTO:**
    *   Le `LoginRequest` DTO est simple (login, password), ce qui est bien.

9.  **Gestion des Erreurs dans les Contrôleurs (Error Handling in Controllers):**
    *   La méthode de connexion de `ClientController` a un bloc try-catch pour `ClientNotFoundException` retournant un message et `HttpStatus.UNAUTHORIZED`. D'autres contrôleurs pourraient bénéficier d'une gestion des exceptions spécifique similaire ou d'un gestionnaire d'exceptions global (`HandleController.java` semble exister, ce qui est bien, mais son utilisation dans tous les contrôleurs devrait être cohérente).
    *   Certains contrôleurs retournent `HttpStatus.OK` même pour des opérations comme la suppression (`ClientController`, `VoyageController`), ce qui pourrait ne pas être la réponse la plus sémantiquement correcte (204 No Content est souvent préféré pour les suppressions réussies sans corps de réponse).

10. **PaiementDTO inclut les entités AGENT et RESERVATION (PaiementDTO includes AGENT and RESERVATION entities):**
    *   `PaiementDTO` inclut directement les objets entités `AGENT` et `RESERVATION`. Il devrait idéalement utiliser leurs DTOs respectifs (par exemple, `AgentDTO`, `ReservationDTO`) ou simplement des IDs si les objets complets ne sont pas nécessaires, pour maintenir la cohérence et éviter d'exposer directement les détails des entités.

Ce résumé devrait fournir un bon aperçu de la structure backend et mettre en évidence les domaines d'amélioration potentielle ou d'investigation plus approfondie.
