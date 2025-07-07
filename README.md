# Système de Gestion d'Agence de Voyage

## Aperçu Général
Ce projet est une application full-stack conçue pour gérer les opérations d'une agence de voyage. Il offre des fonctionnalités permettant aux clients de réserver des voyages et aux administrateurs/agents de gérer les offres de l'agence, les clients et les processus internes.

Le système se compose de deux parties principales :
-   Un **Backend** développé avec Spring Boot, gérant la logique métier, la persistance des données et exposant des APIs RESTful.
-   Un **Frontend** développé avec Angular, fournissant une interface utilisateur pour l'interaction avec le système.

## Composants du Projet

### Backend (`reservation_pro/`)
Le backend est responsable de la logique métier principale, de la gestion de la base de données et de la fourniture d'APIs pour le frontend. Il gère des entités telles que les clients, les agents, les voyages, les réservations et les paiements.
Son README dédié inclut la structure des dossiers, des détails techniques approfondis et des exemples de code. Pour des informations détaillées sur le backend, sa configuration, ses points de terminaison API et les technologies utilisées, veuillez consulter le [README Backend](reservation_pro/README.md).

### Frontend (`mon-projet/`)
Le frontend fournit une interface utilisateur interactive pour différents types d'utilisateurs, y compris les clients effectuant des réservations et les administrateurs/agents gérant le système. Il consomme les APIs exposées par le backend.
Son README dédié inclut la structure des dossiers, des détails techniques approfondis et des exemples de code. Pour des informations détaillées sur le frontend, sa configuration, sa structure et les technologies utilisées, veuillez consulter le [README Frontend](mon-projet/README.md).

## Documentation
Ce projet comprend plusieurs documents pour fournir une compréhension globale de sa conception et de ses fonctionnalités :

-   **Spécification des Exigences**:
    -   [Cahier des Charges](cahier_des_charges.md): Le document initial des exigences décrivant les objectifs, les règles et les fonctionnalités du projet.

-   **Documents d'Analyse**:
    -   [Résumé des API et Entités Backend](reservation_pro/api_and_entity_summary.md): Un résumé détaillé des entités backend, de leurs propriétés, relations, et des points de terminaison API fournis par les contrôleurs. (Document original en anglais, traduit en français)
    -   [Analyse du Frontend](mon-projet/frontend_analysis.md): Une analyse de la structure de l'application frontend, de ses composants clés, services et flux de données. (Document original en anglais, traduit en français)

-   **Diagrammes (PlantUML)**:
    -   [Diagramme de Classes Backend](reservation_pro/class_diagram.puml): Illustre la structure des entités backend et leurs relations. (Commentaires traduits en français)
    -   [Diagramme des Cas d'Utilisation](reservation_pro/use_case_diagram.puml): Décrit les interactions entre les utilisateurs (acteurs) et les principales fonctionnalités du système. (Étiquettes, commentaires et acteurs traduits/ajoutés en français)
    *Note: Les fichiers PlantUML (`.puml`) peuvent être visualisés avec des outils PlantUML, des plugins IDE (comme l'extension officielle PlantUML pour VS Code), ou des moteurs de rendu en ligne.*

## Configuration Générale
Les composants backend et frontend ont chacun leurs propres instructions spécifiques de configuration et d'exécution, qui sont détaillées dans leurs README respectifs (liens ci-dessus).

En règle générale :
1.  Configurez et démarrez d'abord le **serveur Backend**.
2.  Ensuite, configurez et démarrez l'**application Frontend**.

Cet ordre garantit que le frontend peut se connecter aux APIs du backend lors de son initialisation.
