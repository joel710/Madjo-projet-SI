// Importations Angular nécessaires pour la création de composants, la gestion des événements,
// les propriétés d'entrée/sortie, et l'écoute des événements globaux.
import { Component, EventEmitter, Output, Input, HostListener, ElementRef } from '@angular/core';
// CommonModule fournit les directives Angular de base comme *ngIf, *ngFor.
import { CommonModule } from '@angular/common';
// RouterLink est utilisé pour la navigation déclarative via des liens.
import { RouterLink } from '@angular/router';

/**
 * @author VotreNomOuPseudo
 * @date YYYY-MM-DD
 * @description Composant AdminTopbarComponent.
 *              Ce composant représente la barre supérieure (topbar) de la section d'administration.
 *              Il affiche le titre de la page actuelle, des icônes pour les notifications (simulées),
 *              les informations de l'utilisateur connecté, et un menu déroulant pour l'utilisateur.
 *              Il gère également le bouton pour basculer la sidebar en mode mobile.
 */
@Component({
  selector: 'app-admin-topbar', // Sélecteur CSS pour utiliser ce composant (ex: <app-admin-topbar></app-admin-topbar>).
  standalone: true,             // Indique que le composant est autonome.
  imports: [                    // Modules et composants importés pour être utilisés dans le template de ce composant.
    CommonModule,               // Nécessaire pour les directives comme *ngIf, *ngFor.
    RouterLink                  // Pour utiliser [routerLink] dans le menu déroulant de l'utilisateur.
  ],
  templateUrl: './admin-topbar.html', // Chemin vers le fichier HTML du template.
  styleUrls: ['./admin-topbar.css']   // Chemin vers le fichier CSS spécifique à ce composant.
})
export class AdminTopbarComponent {
  /**
   * @description Propriété d'entrée (Input) pour le titre de la page actuelle.
   *              Affiché dans la topbar. Fourni par le composant parent (AdminDashboardPageComponent).
   *              Initialisé avec une valeur par défaut "Tableau de bord".
   */
  @Input() pageTitle: string = 'Tableau de bord';

  /**
   * @description Propriété d'entrée (Input) pour le nom de l'utilisateur connecté.
   *              Affiché dans la section utilisateur de la topbar.
   *              Initialisé avec une valeur par défaut "Admin".
   */
  @Input() userName: string = 'Admin';

  /**
   * @description Propriété d'entrée (Input) pour le rôle de l'utilisateur connecté.
   *              Affiché sous le nom de l'utilisateur.
   *              Initialisé avec une valeur par défaut "Administrateur".
   */
  @Input() userRole: string = 'Administrateur';

  /**
   * @description Propriété d'entrée (Input) pour l'URL de l'image de profil de l'utilisateur.
   *              Bien que le template HTML ait été modifié pour ne plus afficher directement cette image,
   *              la propriété existe toujours et pourrait être utilisée à l'avenir ou par des personnalisations.
   *              Initialisée avec une URL d'image placeholder.
   */
  @Input() userImageUrl: string = 'https://randomuser.me/api/portraits/men/32.jpg'; // Image par défaut

  /**
   * @description Événement de sortie (Output) émis lorsque l'utilisateur clique sur le bouton
   *              pour afficher/masquer la barre latérale en mode mobile (icône "burger").
   *              Le composant parent (AdminDashboardPageComponent) écoute cet événement.
   */
  @Output() mobileToggleClicked = new EventEmitter<void>();

  // Propriétés pour gérer l'état des menus déroulants (utilisateur et notifications).
  userMenuOpen = false;        // Booléen : true si le menu déroulant de l'utilisateur est ouvert, false sinon.
  notificationsOpen = false;   // Booléen : true si le menu déroulant des notifications est ouvert, false sinon.

  // Tableau de notifications simulées. Dans une application réelle, ces données proviendraient d'un service.
  notifications: string[] = ['Nouvel utilisateur enregistré', 'Maintenance du serveur bientôt'];
  // Booléen indiquant s'il y a des notifications non lues (basé sur la longueur du tableau).
  hasNotifications = this.notifications.length > 0;

  /**
   * @author VotreNomOuPseudo
   * @date YYYY-MM-DD
   * @description Méthode pour basculer l'état d'ouverture/fermeture du menu déroulant de l'utilisateur.
   *              Si le menu utilisateur s'ouvre, elle s'assure que le menu des notifications est fermé.
   */
  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
    if (this.userMenuOpen) {
      this.notificationsOpen = false; // Ferme l'autre menu déroulant s'il est ouvert.
    }
  }

  /**
   * @author VotreNomOuPseudo
   * @date YYYY-MM-DD
   * @description Méthode pour basculer l'état d'ouverture/fermeture du menu déroulant des notifications.
   *              Si le menu des notifications s'ouvre, elle s'assure que le menu utilisateur est fermé.
   */
  toggleNotifications() {
    this.notificationsOpen = !this.notificationsOpen;
    if (this.notificationsOpen) {
      this.userMenuOpen = false; // Ferme l'autre menu déroulant s'il est ouvert.
    }
  }

  /**
   * @author VotreNomOuPseudo
   * @date YYYY-MM-DD
   * @description Écouteur d'événement global (`HostListener`) pour les clics sur l'ensemble du document.
   *              Utilisé pour fermer les menus déroulants (utilisateur, notifications) si l'utilisateur
   *              clique en dehors de ces menus.
   * @param event L'objet MouseEvent du clic.
   *
   * La logique de fermeture vérifie si la cible du clic (`event.target`) n'est pas
   * à l'intérieur de l'élément qui ouvre le menu ou du menu déroulant lui-même.
   * `target.closest('.relative ...')` est une tentative de cibler les conteneurs des menus.
   * Note : La robustesse de `target.closest(...)` dépend de la structure HTML exacte et des classes utilisées.
   * Une approche plus robuste pourrait impliquer l'utilisation de `@ViewChild` pour obtenir des références
   * directes aux éléments du menu et vérifier si le clic est à l'intérieur de ceux-ci.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // Logique pour fermer le menu utilisateur s'il est ouvert et que le clic est en dehors.
    // '.relative img' et '.relative div[class*="absolute"]' sont des sélecteurs qui tentent d'identifier
    // l'icône utilisateur et le conteneur du menu déroulant.
    // Cette partie pourrait nécessiter un ajustement si la structure HTML change.
    // Une référence directe à l'élément du menu via @ViewChild et .contains(target) serait plus sûre.
    if (this.userMenuOpen && !target.closest('.user-menu-trigger') && !target.closest('.user-menu-dropdown')) {
      this.userMenuOpen = false;
    }

    // Logique pour fermer le menu des notifications s'il est ouvert et que le clic est en dehors.
    // '.notifications-trigger' et '.notifications-dropdown' sont des classes hypothétiques pour les éléments.
    // À adapter avec les classes réelles ou, mieux, des références @ViewChild.
    if (this.notificationsOpen && !target.closest('.notifications-trigger') && !target.closest('.notifications-dropdown')) {
      this.notificationsOpen = false;
    }
  }
}
