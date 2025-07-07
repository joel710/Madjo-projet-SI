# Cahier De Charge : Gestion d’une agence de voyage

## I / Objectifs
Développer une application web qui permet de gérer une agence de voyage :
- Gérer les réservations en ligne
- Gérer les clients
- Gérer le paiement
- Gérer les vols
- Gérer les agents (ex : administrateur, comptable, etc.)
- Gérer les destinations

## II / Les Règles de gestion
- Un client peut faire un ou plusieurs réservations
- Dans un vol il y a un ou plusieurs clients
- Un vol fait objet d’un ou plusieurs types de billets
- Dans une réservation, un client peut réserver une ou plusieurs places.
- Un agent peut gérer une ou plusieurs
- Un vol concerne une et une seule destination

## III / Les Fonctionnalités

### Gestion des clients
- Enregistrement/modification/suppression/affichage d’un client (nom, prénom, coordonnées, historique de voyage)
- Rechercher un client

### Réservation
- Création d’une réservation (client, destination, date, nombre de places)
- Suivi du statut de réservation (en cours, en attente, confirmé, annulé)
- Historique de réservation (par client ou l’ensemble des clients)

### Gestion des destinations
- Ajout/Modification/suppression de destination

### Gestion des paiements
- Génération automatique des factures après validation de la réservation
- Historique des paiements (par clients/ générale / par agents à intervalle de temps)

## IV / Contraintes Techniques
- Multiutilisateur
- Accès par Navigateur
- Base de données Relationnelle
- Document technique
- Guide d’utilisateur
