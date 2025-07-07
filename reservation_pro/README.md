# Backend - Système de Gestion d'Agence de Voyage

## Aperçu Général
Ce système backend gère les opérations d'une agence de voyage. Il fournit des APIs RESTful permettant à une application frontend d'interagir avec lui, en gérant les données des clients, agents, voyages, réservations, paiements, et plus encore.

## Technologies Utilisées
-   **Java**: Version 17
-   **Spring Boot**: Version 3.2.5
-   **Spring Data JPA**: Pour la persistance des données et la couche repository.
-   **Maven**: Pour la gestion des dépendances et la construction du projet.
-   **Base de données**: PostgreSQL (configurée via Spring Data JPA dans `application.properties`).
-   **Lombok**: Pour réduire le code répétitif.
-   **MapStruct**: Pour le mappage entre Entités (Entities) et DTOs.

## Structure des Dossiers et Fichiers Clés

```
reservation_pro/
├── .gitattributes                  # Attributs Git pour la gestion des fins de ligne, etc.
├── .gitignore                      # Fichiers et dossiers ignorés par Git
├── .mvn/                           # Scripts wrapper Maven
│   └── wrapper/
│       └── maven-wrapper.properties
├── README.md                       # Ce fichier d'information
├── angular_integration_guide.md    # Guide pour l'intégration avec le frontend Angular (si existant)
├── api_and_entity_summary.md       # Documentation détaillée des APIs et entités (traduit)
├── class_diagram.puml              # Diagramme de classes PlantUML du backend (commentaires traduits)
├── mvnw                            # Script Maven wrapper pour Unix/Linux
├── mvnw.cmd                        # Script Maven wrapper pour Windows
├── pom.xml                         # Fichier de configuration Maven (dépendances, build)
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── tg/voyage_pro/reservation_pro/  # Racine du code source Java
│   │   │       ├── Model/          # Entités JPA (ex: AGENT.java, CLIENT.java)
│   │   │       ├── controllers/    # Contrôleurs REST (ex: AgentController.java)
│   │   │       ├── core/           # Services métier (ex: AgentService.java)
│   │   │       ├── database/       # Répertoires Spring Data JPA (ex: AgentRepository.java)
│   │   │       ├── dto/            # Objets de Transfert de Données (ex: AgentDTO.java)
│   │   │       ├── exceptions/     # Exceptions personnalisées et gestionnaire global
│   │   │       ├── mappers/        # Mappeurs (ex: MapStruct pour Entité <-> DTO)
│   │   │       └── ReservationProApplication.java  # Classe principale Spring Boot
│   │   └── resources/
│   │       ├── application.properties  # Fichier de configuration Spring Boot
│   │       └── static/             # Ressources statiques (si applicable)
│   └── test/                       # Tests unitaires et d'intégration
│       └── java/
│           └── tg/voyage_pro/reservation_pro/
└── use_case_diagram.puml           # Diagramme de cas d'utilisation PlantUML (traduit)
```

## Structure du Projet (Détaillée)
Le projet suit une architecture en couches standard :

-   `src/main/java/tg/voyage_pro/reservation_pro/`
    -   `Model/`: Contient les JPA Entities. Ce sont des POJOs (Plain Old Java Objects) annotés avec `@Entity` qui représentent les tables de la base de données. Spring Data JPA les utilise pour les opérations ORM (Object-Relational Mapping).
    -   `dto/` (Data Transfer Objects): Objets simples utilisés pour transférer des données entre les couches, en particulier entre les services et les contrôleurs, ainsi que pour les charges utiles (payloads) des requêtes et réponses API. Ils aident à découpler la structure de l'API de la structure des entités de la base de données.
    -   `controllers/`: Contient les RestControllers (annotés avec `@RestController`). Ils exposent les points de terminaison HTTP (API endpoints), reçoivent les requêtes entrantes, valident les entrées (souvent via des DTOs), appellent les méthodes de service appropriées, et retournent les réponses HTTP.
    -   `core/` (Services): Cette couche (souvent nommée `services/`) contient la logique métier principale de l'application. Les services (annotés avec `@Service`) orchestrent les appels aux repositories et peuvent implémenter des transactions et d'autres logiques spécifiques au domaine.
    -   `database/` (Repositories): Interfaces qui étendent `JpaRepository` de Spring Data JPA (ou d'autres interfaces de repository). Elles fournissent des méthodes CRUD standardisées et la possibilité de définir des requêtes personnalisées pour interagir avec la base de données sans écrire de code DAO (Data Access Object) explicite.
    -   `mappers/`: Contient les interfaces MapStruct (annotées avec `@Mapper`) utilisées pour la conversion automatique et sécurisée entre les Entités JPA et les DTOs, réduisant ainsi le code de conversion manuel.
    -   `exceptions/`: Définit des classes d'exceptions personnalisées spécifiques à l'application et potentiellement un gestionnaire d'exceptions global (par exemple, avec `@ControllerAdvice`) pour centraliser la manière dont les erreurs sont traitées et retournées aux clients API.
-   `src/main/resources/`
    -   `application.properties`: Fichier principal de configuration pour Spring Boot. Il contient les configurations de la source de données, les propriétés JPA/Hibernate, la configuration du serveur, et d'autres paramètres de l'application.

## Résumé des Points de Terminaison API
Le backend expose des APIs REST pour la gestion de diverses ressources, notamment :
-   Agents
-   Clients
-   Voyages (Vols)
-   Réservations
-   Paiements
-   TypeBillets (Types de Billets)

Pour une liste détaillée de tous les points de terminaison API, leurs DTOs de requête/réponse, les méthodes HTTP, et les structures complètes des entités, veuillez vous référer au document **`api_and_entity_summary.md`** (traduit en français sous le nom `Résumé des API et Entités Backend`) situé dans ce répertoire.

## Configuration et Exécution du Projet

### Prérequis
-   JDK 17 ou plus récent.
-   Apache Maven.

### Configuration de la Base de Données
1.  Assurez-vous d'avoir une instance PostgreSQL en cours d'exécution.
2.  Créez une base de données (ex: `agence_voyage` comme spécifié dans le profil `dev` du `pom.xml`).
3.  Configurez les propriétés de connexion à la base de données dans `src/main/resources/application.properties`. S'il n'est pas présent, créez-le et ajoutez ce qui suit (ajustez les valeurs selon votre configuration) :
    ```properties
    spring.datasource.url=jdbc:postgresql://localhost:5432/agence_voyage
    spring.datasource.username=your_postgres_user
    spring.datasource.password=your_postgres_password
    spring.jpa.hibernate.ddl-auto=update # Ou 'create' pour la configuration initiale, 'validate' pour la production
    spring.jpa.show-sql=true
    spring.jpa.properties.hibernate.format_sql=true
    # Pour le profil dev dans pom.xml, ces propriétés sont déjà définies.
    # Vous pouvez activer le profil dev ou surcharger les propriétés.
    ```

### Compilation (Build)
Pour compiler le projet et créer le package, exécutez la commande Maven suivante depuis le répertoire `reservation_pro` :
```bash
mvn clean install
```

### Exécution (Run)
Vous pouvez exécuter l'application de plusieurs manières :

1.  **En utilisant le plugin Maven Spring Boot**:
    ```bash
    mvn spring-boot:run
    ```
    (Cette commande pourrait nécessiter que vous spécifiez le profil `dev` si le fichier `application.properties` par défaut n'est pas configuré, ex: `mvn spring-boot:run -Pdev`)

2.  **En exécutant la classe d'application principale**:
    Exécutez la méthode `main` dans `tg.voyage_pro.reservation_pro.ReservationProApplication.java` depuis votre IDE.

L'application démarrera typiquement sur `http://localhost:8081` (ou le port configuré dans `application.properties`).

## Fonctionnalités Clés Implémentées
-   **Authentification des Utilisateurs**: Mécanismes de connexion séparés pour les Agents et les Clients.
    Ceci est géré par les méthodes `login` dans `AgentService` et `ClientService`. Ces services interrogent typiquement la base de données via leurs `Repositories` respectifs pour vérifier les informations d'identification.
    ```java
    // Exemple (conceptuel) dans AgentService.java
    public AGENT login(String mailAgent, String password) {
        // La logique réelle peut impliquer la recherche par email puis la vérification du mot de passe (hashé)
        AGENT agentTrouve = this.agentRepository.findByMailAgent(mailAgent);
        if (agentTrouve != null && passwordEncoder.matches(password, agentTrouve.getPassword())) {
            return agentTrouve;
        }
        return null; // Ou lever une exception
    }
    ```

-   **Opérations CRUD**: Opérations complètes de Création, Lecture, Mise à jour, Suppression (CRUD) pour toutes les entités majeures (Clients, Agents, Voyages, Types de Billets, Réservations, Paiements).
    L'architecture typique suit ce flux : un `Controller` reçoit la requête HTTP, la délègue à un `Service` pour la logique métier, qui à son tour utilise un `Repository` pour interagir avec la base de données. Les `Mappers` sont utilisés pour convertir les DTOs en Entités et vice-versa.
    ```java
    // Exemple (conceptuel) dans un Controller (ex: AgentController.java)
    @PostMapping("/create")
    public ResponseEntity<AgentDTO> create(@RequestBody AgentDTO agentDTO) {
        AGENT agentEntity = agentMapper.toEntity(agentDTO);
        AGENT savedAgent = agentService.create(agentEntity); // Appel au service
        AgentDTO savedAgentDTO = agentMapper.toDto(savedAgent);
        return new ResponseEntity<>(savedAgentDTO, HttpStatus.CREATED);
    }

    // Exemple (conceptuel) dans un Service (ex: AgentService.java)
    public AGENT create(AGENT agent) {
       // Ajouter ici la logique métier (validation, hashage de mot de passe, etc.)
       return this.agentRepository.save(agent); // Utilisation du repository
    }
    ```

-   **Gestion des Réservations**: Création de réservations, suivi du statut (En attente, Confirmée, Annulée), et historique.
-   **Traitement des Paiements**: Les paiements sont liés aux réservations, et leur historique peut être suivi.

## Axes d'Amélioration Potentiels / Notes Issues de l'Analyse
-   L'`AgentController` inclut actuellement les mots de passe dans les réponses API pour les méthodes `getAll` et `getById`. Ceci est un risque de sécurité et devrait être corrigé en excluant les champs de mot de passe des DTOs envoyés dans les réponses.
-   Le `ClientController` utilise `PUT` pour son point de terminaison `/search`. Ce n'est pas conventionnel car les opérations de recherche sont typiquement effectuées via des requêtes `GET` avec des paramètres de requête pour une meilleure adhésion à la sémantique HTTP et à la mise en cache.
-   Le point de terminaison `/update` du `ReservationController` est correctement implémenté en utilisant `PUT` (`@PutMapping(path = "/update")`). Assurez-vous que tous les services frontend interagissant avec ce point de terminaison s'alignent sur cette méthode.
-   La requête SQL native pour la recherche de clients dans `ClientRepository` (`searchClientWithComplexLogic`) est complexe. Il est recommandé de la réécrire en utilisant Criteria API de JPA ou des Spécifications Spring Data pour une meilleure maintenabilité et sécurité de type. La gestion actuelle des paramètres `NULL` et la concaténation pour les clauses `LIKE` sont sujettes aux erreurs et aux injections SQL si les paramètres ne sont pas correctement échappés (bien que Spring Data tente de gérer cela).
    ```sql
    -- Extrait de la requête problématique dans ClientRepository.java
    @Query(value = "SELECT * FROM client c_1 WHERE c_1.id_client IN (" +
    "SELECT c_2.id_client FROM client c_2 WHERE (:sexe IS NULL OR c_2.sexe_client = '%' || :sexe || '%') OR (:date_naissance IS NULL OR (TO_CHAR(c_2.date_naiss, 'YYYY-MM-DD') = '%' || :date_naissance || '%')) " +
    // ... reste de la requête ...
    ") ORDER BY c_1.id_client DESC", nativeQuery = true)
    List<CLIENT> searchClientWithComplexLogic(@Param("sexe") String sexe, @Param("date_naissance") String dateNaissance, /*...autres params...*/);
    ```
    De plus, la comparaison de dates sous forme de chaînes avec `LIKE` (`TO_CHAR(c_2.date_naiss, 'YYYY-MM-DD') = '%' || :date_naissance || '%'`) est incorrecte et inefficace. Une comparaison directe de dates ou une plage de dates serait plus appropriée.

-   La convention de nommage des classes pour les entités (ex: `AGENT`, `CLIENT`, `VOYAGE`) est actuellement en majuscules. La convention Java standard est PascalCase (ex: `Agent`, `Client`, `Voyage`). Envisagez de refactoriser ces noms pour la cohérence avec les meilleures pratiques Java si souhaité.
