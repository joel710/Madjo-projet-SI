// Importations nécessaires depuis Angular pour la création de composants, la gestion des événements et des propriétés.
import { Component, EventEmitter, Output, Input } from '@angular/core';
// CommonModule fournit les directives Angular de base comme *ngIf, *ngFor.
import { CommonModule } from '@angular/common';
// RouterLink est utilisé pour la navigation déclarative, RouterLinkActive pour styler le lien actif.
import { RouterLink, RouterLinkActive } from '@angular/router';

/**
 * @author VotreNomOuPseudo
 * @date YYYY-MM-DD
 * @description Interface NavItem.
 *              Définit la structure d'un objet représentant un élément de navigation
 *              dans la barre latérale (sidebar).
 */
export interface NavItem {
  label: string;        // Le texte à afficher pour l'élément de navigation (ex: "Clients").
  icon: string;         // La classe de l'icône à utiliser (ex: "fas fa-users" pour Font Awesome).
  route: string;        // Le chemin de navigation Angular (ex: "/admin/clients").
                        // Bien que le routeur ne soit pas directement utilisé pour la navigation principale
                        // du dashboard (qui utilise sectionId), 'route' peut être utile pour `routerLinkActive`.
  sectionId?: string;   // Un identifiant unique pour la section que cet élément de navigation représente.
                        // Utilisé par le composant parent (AdminDashboardPageComponent) pour afficher la section correspondante.
  exact?: boolean;      // Optionnel. Si true, indique que `routerLinkActive` doit appliquer la classe active
                        // uniquement si la route correspond exactement. Utile pour l'élément "Tableau de bord".
}

/**
 * @author VotreNomOuPseudo
 * @date YYYY-MM-DD
 * @description Composant AdminSidebarComponent.
 *              Ce composant représente la barre latérale de navigation de la section d'administration.
 *              Il affiche une liste d'éléments de navigation et permet à l'utilisateur de
 *              basculer son état (réduit/étendu) et de naviguer entre les différentes sections
 *              du tableau de bord d'administration.
 */
@Component({
  selector: 'app-admin-sidebar', // Sélecteur CSS pour utiliser ce composant dans un template HTML (ex: <app-admin-sidebar></app-admin-sidebar>).
  standalone: true,             // Indique que ce composant est autonome (ne nécessite pas d'être déclaré dans un NgModule Angular).
  imports: [                    // Tableau des modules et composants que ce composant utilise directement dans son template.
    CommonModule,               // Fournit *ngFor, *ngIf, etc.
    RouterLink,                 // Pour la directive [routerLink] (bien que la navigation principale ici soit gérée par des événements).
    RouterLinkActive            // Pour styler le lien actif via [routerLinkActive].
  ],
  templateUrl: './admin-sidebar.html', // Chemin vers le fichier HTML du template du composant.
  styleUrls: ['./admin-sidebar.css']   // Tableau de chemins vers les fichiers CSS spécifiques à ce composant.
})
export class AdminSidebarComponent {
  /**
   * @description Propriété d'entrée (Input) booléenne.
   *              Indique si la barre latérale est actuellement réduite (true) ou étendue (false).
   *              Cette valeur est fournie par le composant parent (AdminDashboardPageComponent).
   *              Exemple d'utilisation dans le parent : <app-admin-sidebar [isCollapsed]="valeurDuParent"></app-admin-sidebar>
   */
  @Input() isCollapsed = false;

  /**
   * @description Événement de sortie (Output) de type EventEmitter<void>.
   *              Émis lorsque l'utilisateur clique sur le bouton pour réduire ou étendre la barre latérale.
   *              Le composant parent peut s'abonner à cet événement pour mettre à jour l'état de 'isCollapsed'.
   *              Exemple d'utilisation dans le parent : <app-admin-sidebar (toggleCollapseClicked)="methodeDuParent()"></app-admin-sidebar>
   */
  @Output() toggleCollapseClicked = new EventEmitter<void>();

  /**
   * @description Événement de sortie (Output) de type EventEmitter<NavItem>.
   *              Émis lorsqu'un utilisateur clique sur un lien de navigation dans la barre latérale.
   *              Il transmet l'objet NavItem correspondant au lien cliqué, permettant au composant parent
   *              de savoir quelle section afficher.
   *              Exemple d'utilisation dans le parent : <app-admin-sidebar (navigate)="methodeDuParent($event)"></app-admin-sidebar>
   *              où $event sera l'objet NavItem émis.
   */
  @Output() navigate = new EventEmitter<NavItem>();

  /**
   * @description Tableau d'objets NavItem.
   *              Définit la liste des éléments de navigation à afficher dans la barre latérale.
   *              Chaque objet contient les informations nécessaires pour afficher un lien :
   *              libellé, icône, route (pour routerLinkActive) et sectionId (pour la logique de navigation du parent).
   */
  navItems: NavItem[] = [
    { label: 'Tableau de bord', icon: 'fas fa-tachometer-alt', route: '/admin/dashboard', sectionId: 'dashboard', exact: true },
    { label: 'Clients', icon: 'fas fa-users', route: '/admin/clients', sectionId: 'clients' },
    { label: 'Agents', icon: 'fas fa-user-tie', route: '/admin/agents', sectionId: 'agents' },
    { label: 'Voyages', icon: 'fas fa-plane-departure', route: '/admin/voyages', sectionId: 'voyages' },
    { label: 'Types de billet', icon: 'fas fa-ticket-alt', route: '/admin/billets', sectionId: 'billets' },
    { label: 'Réservations', icon: 'fas fa-calendar-check', route: '/admin/reservations', sectionId: 'reservations' },
    { label: 'Paiements', icon: 'fas fa-credit-card', route: '/admin/paiements', sectionId: 'paiements' }
  ];

  /**
   * @author VotreNomOuPseudo
   * @date YYYY-MM-DD
   * @description Méthode appelée lorsque l'utilisateur clique sur le bouton pour basculer l'état de la sidebar.
   *              Elle émet l'événement 'toggleCollapseClicked' pour informer le composant parent.
   */
  toggleCollapse() {
    this.toggleCollapseClicked.emit(); // Émission de l'événement.
  }

  /**
   * @author VotreNomOuPseudo
   * @date YYYY-MM-DD
   * @description Méthode appelée lorsqu'un utilisateur clique sur un lien de navigation.
   * @param item L'objet NavItem correspondant au lien sur lequel l'utilisateur a cliqué.
   *             Cet objet contient les informations de la section à afficher.
   *             Elle émet l'événement 'navigate' avec l'objet 'item' en payload.
   */
  onNavLinkClick(item: NavItem) {
    this.navigate.emit(item); // Émission de l'événement avec les données de l'item de navigation.
    // Note: La gestion de la fermeture de la sidebar en mode mobile après un clic
    // est généralement gérée par le composant parent qui contrôle l'état de la sidebar mobile.
  }
}
