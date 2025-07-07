// admin-dashboard.ts (ou admin-dashboard.component.ts)
// Ce fichier TypeScript définit la logique du composant AdminDashboardPageComponent.
// C'est le "cerveau" de la page du tableau de bord de l'administration.
// Il gère l'état de la page, les interactions utilisateur, la récupération des données
// depuis les services, et la communication avec les composants enfants (comme les modales).

// Importations de modules et de fonctionnalités Angular essentiels.
import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
// - Component: Décorateur pour marquer une classe comme composant Angular.
// - OnInit, OnDestroy, AfterViewInit: Interfaces pour les "hooks de cycle de vie" des composants (méthodes appelées à des moments spécifiques).
// - HostListener: Décorateur pour écouter les événements de l'élément hôte du composant (ici, la fenêtre du navigateur).
// - ChangeDetectorRef: Service pour contrôler la détection de changements d'Angular (utile dans certains cas avancés).
// - ElementRef: Wrapper autour d'un élément natif du DOM, pour y accéder directement.
// - ViewChild: Décorateur pour accéder à un élément enfant dans le template du composant.
import { CommonModule } from '@angular/common'; // Fournit les directives Angular de base comme *ngIf, *ngFor, et le pipe 'date'.
import { AdminSidebarComponent, NavItem } from '../../components/admin-sidebar/admin-sidebar'; // Composant de la barre latérale d'administration et son interface NavItem.
import { AdminTopbarComponent } from '../../components/admin-topbar/admin-topbar'; // Composant de la barre supérieure d'administration.
import Chart from 'chart.js/auto'; // Importation de la bibliothèque Chart.js pour afficher des graphiques. 'auto' inclut tous les types de graphiques.

// Importation des composants Modales utilisés dans ce tableau de bord.
// Chaque modale est un composant Angular autonome avec sa propre logique et son propre template.
// Les interfaces (ClientData, AgentData, etc.) définissent la structure des données attendues ou émises par ces modales.
import { AddClientModalComponent, ClientData as AddClientModalClientData } from '../../components/admin/modals/add-client-modal/add-client-modal';
import { AddAgentModalComponent, AgentData as AddAgentModalAgentData } from '../../components/admin/modals/add-agent-modal/add-agent-modal';
import { AddVoyageModalComponent, VoyageData as AddVoyageModalVoyageData } from '../../components/admin/modals/add-voyage-modal/add-voyage-modal';
import { AddTypeBilletModalComponent, TypeBilletData as AddTypeBilletModalTypeBilletData } from '../../components/admin/modals/add-type-billet-modal/add-type-billet-modal';
import { AddReservationModalComponent, ReservationData, BasicClientInfo, BasicVoyageInfo, BasicTypeBilletInfo } from '../../components/admin/modals/add-reservation-modal/add-reservation-modal';
import { AddPaiementModalComponent, PaiementData, BasicReservationInfo, BasicAgentInfo } from '../../components/admin/modals/add-paiement-modal/add-paiement-modal';
import { DeleteConfirmationModalComponent } from '../../components/admin/modals/delete-confirmation-modal/delete-confirmation-modal'; // Modale de confirmation de suppression.

// Importation des Services Angular.
// Les services sont utilisés pour encapsuler la logique métier, la récupération de données, etc.
// Ils sont injectés dans le composant via le constructeur.
import { ReservationService, ReservationDTO } from '../../services/reservation.service';
import { ClientService, ClientDTO, Client } from '../../services/client.service';
import { AgentService, AgentDTO } from '../../services/agent.service';
import { VoyageService, VoyageDTO } from '../../services/voyage.service';
import { TypeBilletService, TypeBilletDTO } from '../../services/type-billet.service';
import { PaiementService, PaiementDTO } from '../../services/paiement.service';

import { ActivatedRoute } from '@angular/router'; // Service pour accéder aux informations de la route active (ex: paramètres d'URL).
import { forkJoin } from 'rxjs'; // Fonction de RxJS pour exécuter plusieurs Observables en parallèle et attendre qu'ils soient tous complétés.

// Interface LatestReservation
// Définit la structure d'un objet représentant une réservation récente,
// potentiellement enrichie ou formatée pour l'affichage dans le tableau de bord.
export interface LatestReservation {
  idReservation?: string; // ID de la réservation (chaîne, peut-être formatée).
  clientName: string; // Nom complet du client.
  clientEmail: string; // Email du client.
  clientImage: string; // URL de l'image du client (actuellement une placeholder).
  departVoyage?: string; // Ville de départ.
  arriveVoyage?: string; // Ville d'arrivée.
  dateVoyage?: string; // Date du voyage.
  heureDepart?: string; // Heure de départ.
  heureArrivee?: string; // Heure d'arrivée.
  typeBilletText?: string; // Libellé du type de billet (formaté pour affichage).
  nombrePlacesReservees?: number; // Nombre de places.
  prixVoyage?: number; // Prix du voyage seul.
  prixTypeBillet?: number; // Prix du type de billet seul.
  total?: number; // Montant total de la réservation.
  price?: number; // Autre champ de prix (à clarifier, peut-être redondant avec 'total' ou prixTypeBillet).
  dateReservation?: string; // Date à laquelle la réservation a été effectuée.
  statusText?: string; // Libellé du statut (formaté pour affichage, ex: "Confirmée").
  statusClass: string; // Classe CSS pour styliser le statut (ex: 'bg-green-100 text-green-800').
  status: string; // Statut brut de la réservation (ex: "CONFIRMED").
}

// Le décorateur @Component définit les métadonnées pour AdminDashboardPageComponent.
@Component({
  selector: 'app-admin-dashboard-page', // Sélecteur CSS pour utiliser ce composant dans un template HTML (<app-admin-dashboard-page></app-admin-dashboard-page>).
  standalone: true, // Indique que c'est un composant autonome (ne nécessite pas d'être déclaré dans un NgModule).
  imports: [ // Tableau des dépendances que ce composant utilise directement dans son template.
    CommonModule, // Modules Angular de base (ngIf, ngFor, etc.).
    AdminSidebarComponent, // Composant de la barre latérale.
    AdminTopbarComponent, // Composant de la barre supérieure.
    // Toutes les modales importées précédemment sont listées ici pour pouvoir être utilisées dans le template.
    AddClientModalComponent, AddAgentModalComponent, AddVoyageModalComponent, AddTypeBilletModalComponent,
    AddReservationModalComponent, AddPaiementModalComponent, DeleteConfirmationModalComponent
  ],
  templateUrl: './admin-dashboard.html', // Chemin vers le fichier HTML du template du composant.
  styleUrls: ['./admin-dashboard.css']  // Tableau de chemins vers les fichiers CSS spécifiques à ce composant.
})
// Déclaration de la classe AdminDashboardPageComponent.
// Elle implémente OnInit, OnDestroy, et AfterViewInit, qui sont des hooks de cycle de vie.
export class AdminDashboardPageComponent implements OnInit, OnDestroy, AfterViewInit {
  // Propriétés pour gérer l'état de l'interface utilisateur (UI).
  isSidebarCollapsed = false; // État de la barre latérale (réduite/complète) en vue desktop.
  isMobileSidebarOpen = false; // État de la barre latérale en vue mobile (ouverte/fermée).
  isMobileView = false; // Booléen indiquant si la vue actuelle est considérée comme mobile (basée sur la largeur de la fenêtre).
  currentPageTitle: string = 'Tableau de bord'; // Titre affiché dans la barre supérieure (topbar), initialisé à 'Tableau de bord'.
  adminUserName: string = 'Admin User'; // Nom de l'administrateur (placeholder, devrait être chargé dynamiquement).
  adminUserRole: string = 'Administrator'; // Rôle de l'administrateur (placeholder).
  currentSection: string = 'dashboard'; // Section actuellement affichée dans le tableau de bord (par défaut 'dashboard').

  // Propriétés liées au graphique Chart.js.
  private chart: Chart | undefined; // Instance du graphique Chart.js. 'undefined' car initialisé plus tard.
  // @ViewChild permet d'accéder à l'élément <canvas> dans le template HTML qui a la variable de référence #reservationsChartCanvas.
  // 'static: false' (par défaut) signifie que la requête est résolue après la détection de changement.
  // ElementRef<HTMLCanvasElement> type l'élément comme un canvas HTML.
  @ViewChild('reservationsChartCanvas') reservationsChartCanvas: ElementRef<HTMLCanvasElement> | undefined;

  // États pour contrôler l'ouverture/fermeture des différentes modales.
  // Chaque booléen correspond à une modale spécifique.
  isAddClientModalOpen = false;
  isAddAgentModalOpen = false;
  isAddVoyageModalOpen = false;
  isAddTypeBilletModalOpen = false;
  isAddReservationModalOpen = false;
  isAddPaiementModalOpen = false;
  isDeleteModalOpen = false; // État pour la modale de confirmation de suppression générique.

  // Modèles de données pour l'édition.
  // Ces propriétés stockent l'objet en cours d'édition dans une modale.
  // 'null' signifie quaucune entité n'est en cours d'édition (donc la modale serait en mode "ajout").
  clientToEdit: ClientDTO | null = null; // Client en cours d'édition.
  agentToEdit: AgentDTO | null = null; // Agent en cours d'édition.
  voyageToEdit: VoyageDTO | null = null; // Voyage en cours d'édition.
  typeBilletToEdit: TypeBilletDTO | null = null; // Type de billet en cours d'édition.
  reservationToEdit: ReservationData | null = null; // Réservation en cours d'édition (utilise l'interface ReservationData de la modale).
  paiementToEdit: PaiementData | null = null; // Paiement en cours d'édition.

  // Propriétés pour la modale de confirmation de suppression.
  itemToDeleteId: string | number | null = null; // ID de l'élément à supprimer (peut être string ou number).
  itemToDeleteName: string = ''; // Nom/description de l'élément à supprimer (pour affichage dans la modale).
  deleteAction: (() => void) | null = null; // Fonction à exécuter si l'utilisateur confirme la suppression.

  // Listes de données simplifiées pour peupler les sélecteurs dans les modales d'ajout/édition.
  // Par exemple, pour lier une réservation à un client existant.
  sampleClientsForModal: BasicClientInfo[] = [];
  sampleVoyagesForModal: BasicVoyageInfo[] = [];
  sampleBilletsForModal: BasicTypeBilletInfo[] = [];
  sampleReservationsForModal: BasicReservationInfo[] = [];
  sampleAgentsForModal: BasicAgentInfo[] = [];

  // Listes principales de données (DTOs complets) récupérées depuis les services.
  latestReservations: LatestReservation[] = []; // Liste des dernières réservations formatées pour le tableau de bord.
  clientsList: ClientDTO[] = []; // Liste complète de tous les clients.
  agentsList: AgentDTO[] = []; // Liste complète de tous les agents.
  agentsLoadingError: string | null = null; // Message d'erreur si le chargement des agents échoue.
  voyagesList: VoyageDTO[] = []; // Liste complète de tous les voyages.
  typesBilletList: TypeBilletDTO[] = []; // Liste complète de tous les types de billets.
  reservationsList: ReservationDTO[] = []; // Liste complète de toutes les réservations.
  paiementsList: PaiementDTO[] = []; // Liste complète de tous les paiements.

  // Propriétés pour la pagination de la liste des Clients.
  clientsCurrentPage: number = 1; // Page actuellement affichée.
  clientsPageSize: number = 10; // Nombre d'éléments par page.
  paginatedClientsList: ClientDTO[] = []; // La tranche de clientsList à afficher pour la page courante.
  totalClientPages: number = 1; // Nombre total de pages pour les clients.

  // Propriétés pour la pagination de la liste des Agents.
  agentsCurrentPage: number = 1;
  agentsPageSize: number = 10;
  paginatedAgentsList: AgentDTO[] = [];
  totalAgentPages: number = 1;

  // Propriétés pour la pagination de la liste des Voyages.
  voyagesCurrentPage: number = 1;
  voyagesPageSize: number = 10;
  paginatedVoyagesList: VoyageDTO[] = [];
  totalVoyagePages: number = 1;

  // Propriétés pour la pagination de la liste des Types de Billet.
  typesBilletCurrentPage: number = 1;
  typesBilletPageSize: number = 10;
  paginatedTypesBilletList: TypeBilletDTO[] = [];
  totalTypeBilletPages: number = 1;

  // Propriétés pour la pagination de la liste principale des Réservations.
  reservationsCurrentPage: number = 1;
  reservationsPageSize: number = 10;
  paginatedReservationsList: ReservationDTO[] = [];
  totalReservationPages: number = 1;

  // Propriétés pour la pagination de la liste des Dernières Réservations (sur le tableau de bord).
  latestReservationsCurrentPage: number = 1;
  latestReservationsPageSize: number = 5; // Généralement moins d'éléments pour un aperçu.
  paginatedLatestReservationsList: LatestReservation[] = [];
  totalLatestReservationPages: number = 1;

  // Propriétés pour la pagination de la liste des Paiements.
  paiementsCurrentPage: number = 1;
  paiementsPageSize: number = 10;
  paginatedPaiementsList: PaiementDTO[] = [];
  totalPaiementPages: number = 1;

  // Propriétés pour la mise en cache (mémoïsation) des calculs de statistiques.
  // Utilisées pour éviter de recalculer des valeurs coûteuses si les données sources n'ont pas changé.
  private _totalRevenus: number = 0; // Stocke le total des revenus calculé.
  // Les propriétés suivantes stockent les références des listes utilisées pour le dernier calcul de _totalRevenus.
  private _totalRevenus_reservationsListCache: ReservationDTO[] | undefined;
  private _totalRevenus_voyagesListCache: VoyageDTO[] | undefined;
  private _totalRevenus_typesBilletListCache: TypeBilletDTO[] | undefined;

  // Cache pour les top destinations.
  private _topDestinations: { destination: string, count: number, percent: number }[] = [];
  private _topDestinations_reservationsListCache: ReservationDTO[] | undefined;
  private _topDestinations_voyagesListCache: VoyageDTO[] | undefined;

  // Cache pour les réservations par mois (pour le graphique).
  private _reservationsPerMonth: number[] = Array(12).fill(0); // Initialise un tableau de 12 zéros.
  private _reservationsPerMonth_reservationsListCache: ReservationDTO[] | undefined;

  // Indicateurs de chargement pour gérer l'affichage des spinners/loaders.
  isLoadingCritical = true; // True lorsque les données essentielles au premier affichage sont en cours de chargement.
  isLoadingSecondary = true; // True lorsque des données secondaires (moins prioritaires) sont en cours de chargement.

  // Constructeur de la classe AdminDashboardPageComponent.
  // Angular utilise l'injection de dépendances pour fournir des instances des services requis.
  // Les services sont déclarés comme 'private' pour les rendre accessibles uniquement au sein de cette classe.
  constructor(
    private cdr: ChangeDetectorRef, // ChangeDetectorRef: Permet de déclencher manuellement la détection de changements si nécessaire.
    private clientService: ClientService, // Service pour gérer les données des clients.
    private agentService: AgentService, // Service pour gérer les données des agents.
    private voyageService: VoyageService, // Service pour gérer les données des voyages.
    private typeBilletService: TypeBilletService, // Service pour les types de billets.
    private reservationService: ReservationService, // Service pour les réservations.
    private paiementService: PaiementService, // Service pour les paiements.
    private route: ActivatedRoute // Service pour accéder aux informations de la route active, comme les paramètres d'URL.
  ) {
    // Le constructeur est généralement utilisé pour l'initialisation simple des membres de la classe
    // et pour l'injection de dépendances. Les initialisations plus complexes (comme les appels de service)
    // se font souvent dans ngOnInit.
  }

  // ngOnInit est un hook de cycle de vie d'Angular.
  // Il est appelé une fois après que le composant a été initialisé et que ses
  // propriétés liées aux données (@Input) ont été vérifiées.
  // C'est un endroit idéal pour la logique d'initialisation, comme le chargement de données initiales.
  ngOnInit(): void {
    this.checkIfMobileView(); // Vérifie si la vue est mobile au démarrage.
    this.loadCriticalData(); // Lance le chargement des données critiques (clients, voyages, etc.).

    // S'abonne aux changements des paramètres de la route (ex: /admin/clients -> section = 'clients').
    // ActivatedRoute.paramMap est un Observable qui émet une nouvelle carte de paramètres lorsque l'URL change.
    this.route.paramMap.subscribe(params => {
      const sectionParam = params.get('section'); // Récupère le paramètre 'section' de l'URL.
      if (sectionParam) { // Si un paramètre 'section' est présent dans l'URL.
        this.currentSection = sectionParam; // Met à jour la section courante.
        this.currentPageTitle = this.getSectionTitle(sectionParam); // Met à jour le titre de la page.

        // Gestion spécifique pour le graphique du tableau de bord.
        if (this.currentSection === 'dashboard') {
          // setTimeout est utilisé pour s'assurer que le DOM est prêt avant d'initialiser le graphique.
          setTimeout(() => this.initChart(), 0);
        } else {
          this.destroyChart(); // Détruit le graphique si on quitte la section dashboard.
        }
        // this.cdr.detectChanges(); // Commenté : Appel manuel de détection de changement, souvent pas nécessaire
        // si les mises à jour de propriétés sont bien gérées par Angular.
      }
    });
  }

  // loadCriticalData(): void
  // Charge les données considérées comme essentielles pour l'affichage initial du tableau de bord.
  // Cela inclut les clients, les voyages, les types de billets et les réservations.
  // Utilise forkJoin pour exécuter plusieurs appels de service en parallèle.
  loadCriticalData(): void {
    this.isLoadingCritical = true; // Active l'indicateur de chargement principal.

    // forkJoin permet de lancer plusieurs Observables (appels de service) simultanément
    // et d'attendre que toutes les requêtes soient terminées avant de traiter les résultats.
    // L'objet passé à forkJoin a des clés (clients, voyages, etc.) qui correspondront
    // aux clés dans l'objet 'results' de la callback 'next'.
    forkJoin({
      clients: this.clientService.getAllClients(), // Appel pour récupérer tous les clients.
      voyages: this.voyageService.getAllVoyages(), // Appel pour récupérer tous les voyages.
      typesBillet: this.typeBilletService.getAllTypesBillet(), // Appel pour tous les types de billets.
      reservations: this.reservationService.getAllReservations(), // Appel pour toutes les réservations.
    }).subscribe({ // S'abonne à l'Observable retourné par forkJoin.
      // La callback 'next' est exécutée lorsque toutes les requêtes de forkJoin ont réussi.
      // 'results' est un objet contenant les données de chaque Observable, avec les mêmes clés.
      next: (results) => {
        // Assignation des données récupérées aux propriétés du composant.
        this.clientsList = results.clients;
        // Crée une version simplifiée des données clients pour les modales (ex: sélecteurs).
        this.sampleClientsForModal = results.clients.map(c => ({ id: c.idClient!.toString(), name: `${c.prenomClient} ${c.nomClient}` }));
        this.clientsCurrentPage = 1; // Réinitialise la pagination pour les clients.
        this.updatePaginatedClients(); // Met à jour la liste paginée des clients.

        this.voyagesList = results.voyages;
        this.sampleVoyagesForModal = results.voyages.map(v => ({ id: v.idVoyage!.toString(), label: `${v.departVoyage} -> ${v.arriveVoyage} (${new Date(v.dateVoyage).toLocaleDateString()})` }));
        this.voyagesCurrentPage = 1;
        this.updatePaginatedVoyages();

        this.typesBilletList = results.typesBillet;
        this.sampleBilletsForModal = results.typesBillet.map(tb => ({ id: tb.idTypeBillet!.toString(), libelle: tb.libelleTypeBillet }));
        this.typesBilletCurrentPage = 1;
        this.updatePaginatedTypesBillet();

        this.reservationsList = results.reservations;
        this.reservationsCurrentPage = 1;
        this.updatePaginatedReservations();
        this.sampleReservationsForModal = this.reservationsList.map(r => ({ id: r.idReservation!.toString(), label: `RES${r.idReservation} - ${r.client?.nomClient || 'N/A'} - ${r.dateReservation}` }));

        // Création de Maps pour un accès rapide aux détails des clients, voyages, et types de billets
        // lors de la transformation des données de réservations pour l'affichage.
        const clientsMap = new Map<number, ClientDTO>(this.clientsList.map(c => [c.idClient!, c]));
        const voyagesMap = new Map<number, VoyageDTO>(this.voyagesList.map(v => [v.idVoyage!, v]));
        const typesBilletMap = new Map<number, TypeBilletDTO>(this.typesBilletList.map(tb => [tb.idTypeBillet!, tb]));

        // Transformation des données de réservations pour créer la liste 'latestReservations'.
        // Cette liste est formatée spécifiquement pour l'affichage dans le tableau de bord.
        this.latestReservations = this.reservationsList.map(r => {
          const client = clientsMap.get(r.client?.idClient!); // Recherche le client par ID.
          const voyage = voyagesMap.get(r.voyage?.idVoyage!); // Recherche le voyage par ID.
          const typeBillet = typesBilletMap.get(r.typeBillet?.idTypeBillet!); // Recherche le type de billet par ID.
          const statusInfo = this.getStatusInfo(r.status || ''); // Obtient le texte et la classe CSS pour le statut.
          const typeBilletText = this.getTicketTypeText(typeBillet?.libelleTypeBillet || ''); // Formate le libellé du type de billet.
          const prixVoyage = voyage?.prix || 0;
          const prixTypeBillet = typeBillet?.prixTypeBillet || 0;
          const total = (prixTypeBillet + prixVoyage) * (r.nombrePlacesReservees || 0); // Calcul du total.
          // Construction de l'objet LatestReservation.
          return {
            idReservation: r.idReservation?.toString() || '',
            clientName: `${client?.prenomClient || ''} ${client?.nomClient || ''}`.trim(),
            clientEmail: client?.mailClient || '',
            clientImage: 'https://via.placeholder.com/40', // Image placeholder.
            departVoyage: voyage?.departVoyage || '',
            arriveVoyage: voyage?.arriveVoyage || '',
            dateVoyage: voyage?.dateVoyage || '',
            heureDepart: voyage?.heureDepart || '',
            heureArrivee: voyage?.heureArrivee || '',
            typeBilletText: typeBilletText,
            nombrePlacesReservees: r.nombrePlacesReservees || 0,
            prixVoyage: prixVoyage,
            prixTypeBillet: prixTypeBillet,
            total: total,
            price: prixTypeBillet, // À clarifier: 'price' semble redondant ou mal nommé.
            dateReservation: r.dateReservation || '',
            statusText: statusInfo.text,
            statusClass: statusInfo.class,
            status: r.status || ''
          };
        });
        this.latestReservationsCurrentPage = 1; // Réinitialise la pagination pour les dernières réservations.
        this.updatePaginatedLatestReservations(); // Met à jour la liste paginée.

        this.isLoadingCritical = false; // Désactive l'indicateur de chargement principal.
        // this.cdr.detectChanges(); // Commenté : généralement pas nécessaire ici.

        // Une fois les données critiques chargées, on lance le chargement des données secondaires.
        this.loadSecondaryData();
        // Et on initialise le graphique du tableau de bord.
        this.initChart();
      },
      // La callback 'error' est exécutée si une des requêtes de forkJoin échoue.
      error: (err) => {
        this.isLoadingCritical = false; // Désactive l'indicateur de chargement.
        this.showNotification('Erreur lors du chargement des données critiques.'); // Affiche une notification d'erreur.
        // Gérer l'erreur plus en détail si nécessaire (ex: logger l'erreur complète).
      }
    });
  }

  // loadSecondaryData(): void
  // Charge les données considérées comme secondaires (moins prioritaires pour l'affichage initial).
  // Actuellement, cela inclut les agents et les paiements.
  // Utilise également forkJoin pour des appels parallèles.
  loadSecondaryData(): void {
    this.isLoadingSecondary = true; // Active l'indicateur de chargement secondaire.
    forkJoin({
      agents: this.agentService.getAllAgents(), // Appel pour récupérer tous les agents.
      paiements: this.paiementService.getAllPaiements(), // Appel pour tous les paiements.
    }).subscribe({
      next: (results) => {
        // Traitement des résultats pour les agents.
        this.agentsList = results.agents;
        this.sampleAgentsForModal = results.agents.map(a => ({ id: a.idAgent!.toString(), name: `${a.prenomAgent} ${a.nomAgent}` }));
        this.agentsCurrentPage = 1;
        this.updatePaginatedAgents();

        // Traitement des résultats pour les paiements.
        this.paiementsList = results.paiements;
        this.paiementsCurrentPage = 1;
        this.updatePaginatedPaiements();

        this.isLoadingSecondary = false; // Désactive l'indicateur de chargement secondaire.
        // this.cdr.detectChanges(); // Commenté.
      },
      error: (err) => {
        this.isLoadingSecondary = false;
        this.showNotification('Erreur lors du chargement des données secondaires.');
        // Gérer l'erreur plus en détail si nécessaire.
      }
    });
  }

  // getSectionTitle(section: string): string
  // Méthode utilitaire pour obtenir le titre de la page en fonction de l'ID de la section.
  // Utilisée pour mettre à jour `currentPageTitle` lors de la navigation.
  // section: string - L'identifiant de la section (ex: 'clients', 'voyages').
  // Retourne une chaîne de caractères représentant le titre de la section.
  getSectionTitle(section: string): string {
    switch (section) {
      case 'clients': return 'Gestion des clients';
      case 'agents': return 'Gestion des agents';
      case 'voyages': return 'Gestion des voyages';
      case 'billets': return 'Types de billets';
      case 'reservations': return 'Gestion des réservations';
      case 'paiements': return 'Gestion des paiements';
      default: return 'Tableau de bord'; // Titre par défaut si la section n'est pas reconnue.
    }
  }

  // ngAfterViewInit est un autre hook de cycle de vie.
  // Il est appelé une fois après qu'Angular a complètement initialisé la vue du composant
  // et les vues de ses enfants (y compris les éléments marqués avec @ViewChild).
  // C'est ici qu'on peut interagir avec les éléments du DOM de manière sûre,
  // par exemple, pour initialiser des bibliothèques tierces comme Chart.js qui dépendent du canvas.
  ngAfterViewInit(): void {
    // On vérifie si la section actuelle est 'dashboard' au moment où la vue est initialisée.
    // Si oui, et si le graphique n'a pas déjà été initialisé par ngOnInit (via setTimeout),
    // on l'initialise ici. Cela assure que le canvas est disponible dans le DOM.
    if (this.currentSection === 'dashboard') {
      this.initChart();
    }
  }

  // ngOnDestroy est un hook de cycle de vie appelé juste avant qu'Angular ne détruise le composant.
  // C'est l'endroit idéal pour effectuer des nettoyages afin d'éviter les fuites de mémoire :
  // - Se désabonner des Observables pour éviter des actions sur des composants détruits.
  // - Détacher les écouteurs d'événements.
  // - Annuler les timers (setTimeout, setInterval).
  // - Libérer les ressources créées manuellement (comme une instance de Chart.js).
  ngOnDestroy(): void {
    this.destroyChart(); // S'assure que le graphique est détruit pour libérer les ressources.
  }

  // @HostListener permet de déclarer un écouteur d'événements sur l'élément hôte du composant.
  // Ici, on écoute l'événement 'resize' sur l'objet 'window'.
  // '$event' passe l'objet Event à la méthode onResize.
  @HostListener('window:resize', ['$event'])
  onResize(event?: Event): void { // La méthode appelée lorsque la fenêtre est redimensionnée.
    this.checkIfMobileView(); // Appelle checkIfMobileView pour mettre à jour l'état de la vue mobile.
  }

  // checkIfMobileView(): void
  // Vérifie la largeur de la fenêtre pour déterminer si la vue doit être considérée comme mobile.
  // Met à jour la propriété `isMobileView` et ajuste l'état de la sidebar si nécessaire.
  checkIfMobileView(): void {
    const wasMobile = this.isMobileView; // Sauvegarde l'état précédent.
    this.isMobileView = window.innerWidth < 768; // Met à jour isMobileView (768px est un seuil courant pour mobile).

    // Si l'état de la vue mobile a changé (passé de mobile à desktop ou inversement).
    if (wasMobile !== this.isMobileView) {
      // Si on passe en vue mobile ET que la sidebar était réduite (mode desktop) ET que la sidebar mobile n'est pas ouverte.
      if (this.isMobileView && this.isSidebarCollapsed && !this.isMobileSidebarOpen) {
        this.isSidebarCollapsed = false; // On "dé-réduit" la sidebar (car ce mode n'a de sens qu'en desktop).
      } else if (!this.isMobileView) { // Si on passe en vue desktop.
        this.isMobileSidebarOpen = false; // On s'assure que la sidebar mobile est fermée.
      }
    }
    // Le commentaire original mentionnait cdr.detectChanges(). C'est parfois utile si Angular
    // ne détecte pas un changement qui affecte le template, mais ici, la modification
    // directe des propriétés du composant devrait être suffisante pour qu'Angular mette à jour la vue.
  }

  // toggleSidebar(): void
  // Gère le basculement de l'état de la barre latérale (sidebar).
  // Le comportement dépend si on est en vue mobile ou desktop.
  toggleSidebar(): void {
    if (this.isMobileView) { // Si on est en vue mobile.
      this.isMobileSidebarOpen = !this.isMobileSidebarOpen; // Ouvre/ferme la sidebar mobile.
    } else { // Si on est en vue desktop.
      this.isSidebarCollapsed = !this.isSidebarCollapsed; // Réduit/étend la sidebar desktop.
    }
  }

  // toggleMobileSidebar(): void
  // Gère spécifiquement l'ouverture/fermeture de la sidebar en mode mobile.
  // Cette méthode est probablement appelée par un bouton dédié à la sidebar mobile (burger icon).
  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
    // Si la sidebar mobile est ouverte en vue desktop (ce qui ne devrait pas arriver
    // si la logique est correcte), on s'assure que la sidebar principale n'est pas réduite.
    if (this.isMobileSidebarOpen && !this.isMobileView) {
      this.isSidebarCollapsed = false;
    }
  }

  // onSectionNavigate(item: NavItem): void
  // Gère la navigation entre les différentes sections du tableau de bord.
  // Appelée lorsqu'un utilisateur clique sur un élément de navigation dans la sidebar.
  // item: NavItem - L'objet représentant l'élément de menu cliqué (contient label, sectionId, etc.).
  onSectionNavigate(item: NavItem): void {
    this.currentPageTitle = item.label; // Met à jour le titre de la page affiché dans la topbar.
    const newSection = item.sectionId || 'dashboard'; // Récupère l'ID de la section, ou 'dashboard' par défaut.

    // Si on quitte la section 'dashboard' pour une autre section, on détruit le graphique
    // pour éviter qu'il ne reste en mémoire ou ne tente de se mettre à jour inutilement.
    if (this.currentSection !== newSection && this.currentSection === 'dashboard') {
      this.destroyChart();
    }
    this.currentSection = newSection; // Met à jour la section actuellement active.

    // Si on est en vue mobile, on ferme la sidebar après la navigation.
    if (this.isMobileView) {
      this.isMobileSidebarOpen = false;
    }
    // Si la nouvelle section est 'dashboard', on initialise le graphique (avec un léger délai).
    if (this.currentSection === 'dashboard') {
      setTimeout(() => this.initChart(), 0);
    }
  }

  openAddClientModal(): void { this.clientToEdit = null; this.isAddClientModalOpen = true; }
  // Parameter is ClientDTO. clientToEdit is ClientDTO | null.
  // The modal's @Input() clientToEdit expects AddClientModalClientData.
  // Since AddClientModalClientData (modal) and ClientDTO (service) are now structurally similar
  // (idClient, nomClient etc.), direct assignment should largely work.
  openEditClientModal(client: ClientDTO): void {
    this.clientToEdit = client; // clientToEdit is now ClientDTO | null
    this.isAddClientModalOpen = true;
  }
  closeClientModal(): void { this.isAddClientModalOpen = false; this.clientToEdit = null; }
  handleSaveClient(clientFormData: AddClientModalClientData): void {
    // Map AddClientModalClientData from modal to ClientDTO or Client for the service
    const clientPayload: Client = { // Use Client interface for create
      idClient: clientFormData.idClient,
      nomClient: clientFormData.nomClient,
      prenomClient: clientFormData.prenomClient,
      mailClient: clientFormData.mailClient,
      telClient: clientFormData.telClient || '',
      sexeClient: clientFormData.sexeClient || '',
      dateNaiss: clientFormData.dateNaiss || '',
      login: clientFormData.login,
    };
    if (clientFormData.password) {
      clientPayload.password = clientFormData.password;
    }

    if (clientFormData.idClient) { // Update existing client
      const updatePayload: ClientDTO = { ...clientPayload };
      delete updatePayload.password;

      // Correction ici :
      updatePayload.dateNaiss = formatDateToBackend(updatePayload.dateNaiss);

      this.clientService.updateClient(clientFormData.idClient, updatePayload).subscribe({
        next: () => {
          this.showNotification(`Client ${clientPayload.prenomClient} ${clientPayload.nomClient} mis à jour.`);
          this.loadClients(); // Refresh list
        },
        error: (err) => {
          console.error('Error updating client:', err);
          this.showNotification('Erreur lors de la mise à jour du client.');
        },
        complete: () => this.closeClientModal()
      });
    } else { // Create new client
      // Correction ici :
      clientPayload.dateNaiss = formatDateToBackend(clientPayload.dateNaiss);
      this.clientService.createClient(clientPayload).subscribe({
        next: () => {
          this.showNotification(`Client ${clientPayload.prenomClient} ${clientPayload.nomClient} créé.`);
          this.loadClients(); // Refresh list
        },
        error: (err) => {
          console.error('Error creating client:', err);
          this.showNotification('Erreur lors de la création du client.');
        },
        complete: () => this.closeClientModal()
      });
    }
  }

  openAddAgentModal(): void { this.agentToEdit = null; this.isAddAgentModalOpen = true; }
  openEditAgentModal(agent: AgentDTO): void {
    this.agentToEdit = { ...agent, password: agent.password ?? '' };
    this.isAddAgentModalOpen = true;
  }
  closeAgentModal(): void { this.isAddAgentModalOpen = false; this.agentToEdit = null; }
  handleSaveAgent(agentFormData: AddAgentModalAgentData): void {
    // Map AgentData from modal to AgentDTO for the service
    const agentPayload: AgentDTO = {
      idAgent: agentFormData.idAgent,
      nomAgent: agentFormData.nomAgent,
      prenomAgent: agentFormData.prenomAgent,
      mailAgent: agentFormData.mailAgent,
      telAgent: agentFormData.telAgent || undefined,
      sexeAgent: agentFormData.sexeAgent,
      dateNaiss: agentFormData.dateNaiss || undefined,
      role: agentFormData.role, // Added role assignment
      password: agentFormData.password // Ajout du champ password
    };

    if (agentPayload.idAgent) { // Update existing agent
      this.agentService.updateAgent(agentPayload.idAgent, agentPayload).subscribe({
        next: () => {
          this.showNotification(`Agent ${agentPayload.prenomAgent} ${agentPayload.nomAgent} mis à jour.`);
          this.loadAgents(); // Refresh list
        },
        error: (err) => {
          console.error('Error updating agent:', err);
          this.showNotification('Erreur lors de la mise à jour de l\'agent.');
        },
        complete: () => this.closeAgentModal()
      });
    } else { // Create new agent
      this.agentService.createAgent(agentPayload).subscribe({
        next: (createdAgent) => {
          this.showNotification(`Agent ${createdAgent.prenomAgent} ${createdAgent.nomAgent} créé.`);
          this.loadAgents(); // Refresh list
        },
        error: (err) => {
          console.error('Error creating agent:', err);
          this.showNotification('Erreur lors de la création de l\'agent.');
        },
        complete: () => this.closeAgentModal()
      });
    }
  }

  openAddVoyageModal(): void { this.voyageToEdit = null; this.isAddVoyageModalOpen = true; }
  openEditVoyageModal(voyage: VoyageDTO): void {
    this.voyageToEdit = voyage;
    this.isAddVoyageModalOpen = true;
  }
  closeVoyageModal(): void { this.isAddVoyageModalOpen = false; this.voyageToEdit = null; }
  handleSaveVoyage(voyageFormData: AddVoyageModalVoyageData): void {
    const voyagePayload: VoyageDTO = {
      idVoyage: voyageFormData.idVoyage,
      departVoyage: voyageFormData.departVoyage,
      arriveVoyage: voyageFormData.arriveVoyage,
      dateVoyage: voyageFormData.dateVoyage, // Ensure format is yyyy-MM-dd
      prix: voyageFormData.prix,
      placesDisponibles: voyageFormData.placesDisponibles
    };

    if (voyagePayload.idVoyage) { // Update existing voyage
      this.voyageService.updateVoyage(voyagePayload.idVoyage, voyagePayload).subscribe({
        next: () => {
          this.showNotification(`Voyage vers ${voyagePayload.arriveVoyage} mis à jour.`);
          this.loadVoyages(); // Refresh list
        },
        error: (err) => {
          console.error('Error updating voyage:', err);
          this.showNotification('Erreur lors de la mise à jour du voyage.');
        },
        complete: () => this.closeVoyageModal()
      });
    } else { // Create new voyage
      this.voyageService.createVoyage(voyagePayload).subscribe({
        next: (createdVoyage) => {
          this.showNotification(`Voyage vers ${createdVoyage.arriveVoyage} créé.`);
          this.loadVoyages(); // Refresh list
        },
        error: (err) => {
          console.error('Error creating voyage:', err);
          this.showNotification('Erreur lors de la création du voyage.');
        },
        complete: () => this.closeVoyageModal()
      });
    }
  }

  openAddTypeBilletModal(): void { this.typeBilletToEdit = null; this.isAddTypeBilletModalOpen = true; }
  openEditTypeBilletModal(billet: TypeBilletDTO): void {
    this.typeBilletToEdit = billet;
    this.isAddTypeBilletModalOpen = true;
  }
  closeTypeBilletModal(): void { this.isAddTypeBilletModalOpen = false; this.typeBilletToEdit = null; }
  handleSaveTypeBillet(formData: AddTypeBilletModalTypeBilletData): void {
    const payload: TypeBilletDTO = {
      idTypeBillet: formData.idTypeBillet,
      libelleTypeBillet: formData.libelleTypeBillet,
      prixTypeBillet: formData.prixTypeBillet
    };

    if (payload.idTypeBillet) { // Update existing
      this.typeBilletService.updateTypeBillet(payload.idTypeBillet, payload).subscribe({
        next: () => {
          this.showNotification(`Type de billet '${payload.libelleTypeBillet}' mis à jour.`);
          this.loadTypesBillet();
        },
        error: (err) => {
          console.error('Error updating type billet:', err);
          this.showNotification('Erreur lors de la mise à jour du type de billet.');
        },
        complete: () => this.closeTypeBilletModal()
      });
    } else { // Create new
      this.typeBilletService.createTypeBillet(payload).subscribe({
        next: (created) => {
          this.showNotification(`Type de billet '${created.libelleTypeBillet}' créé.`);
          this.loadTypesBillet();
        },
        error: (err) => {
          console.error('Error creating type billet:', err);
          this.showNotification('Erreur lors de la création du type de billet.');
        },
        complete: () => this.closeTypeBilletModal()
      });
    }
  }

  openAddReservationModal(): void { this.reservationToEdit = null; this.isAddReservationModalOpen = true; }
  openEditReservationModal(reservation: ReservationData): void {
    // Ensure IDs are numbers if coming from backend as such, or keep as string if that's what modal expects
    // For now, assuming reservationToEdit structure is compatible or handled by modal.
    this.reservationToEdit = { ...reservation }; // Create a copy to avoid direct mutation
    this.isAddReservationModalOpen = true;
  }
  closeReservationModal(): void { this.isAddReservationModalOpen = false; this.reservationToEdit = null; }
  handleSaveReservation(reservationData: ReservationData): void {
    const payload: ReservationDTO = {
      dateReservation: reservationData.dateReservation, // Already yyyy-MM-dd from modal
      clientId: reservationData.clientId ? Number(reservationData.clientId) : null, // Convert to number, or null if empty
      voyageId: reservationData.voyageId ? Number(reservationData.voyageId) : null,   // Convert to number, or null if empty
      typeBilletId: reservationData.typeBilletId ? Number(reservationData.typeBilletId) : null, // Convert to number, or null if empty
    };

    if (reservationData.id) {
      // Update existing reservation
      payload.idReservation = Number(reservationData.id); // Add ID for update
      this.reservationService.updateReservation(payload).subscribe({
        next: () => {
          this.showNotification(`Réservation ${reservationData.id} mise à jour.`);
          this.loadAllData(); // Refresh list after update
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour de la réservation:', err);
          this.showNotification('Erreur lors de la mise à jour de la réservation.');
        },
        complete: () => this.closeReservationModal()
      });
    } else {
      // Create new reservation
      this.reservationService.createReservation(payload).subscribe({
        next: () => {
          this.showNotification('Réservation créée avec succès.');
          this.loadAllData(); // Refresh list after creation
        },
        error: (err) => {
          console.error('Erreur lors de la création de la réservation:', err);
          this.showNotification('Erreur lors de la création de la réservation.');
        },
        complete: () => this.closeReservationModal()
      });
    }
  }

  openAddPaiementModal(): void { this.paiementToEdit = null; this.isAddPaiementModalOpen = true; }
  openEditPaiementModal(paiement: PaiementData): void {
    this.paiementToEdit = { ...paiement }; // Create a copy to avoid direct mutation
    this.isAddPaiementModalOpen = true;
  }
  closePaiementModal(): void { this.isAddPaiementModalOpen = false; this.paiementToEdit = null; }
  handleSavePaiement(paiementData: PaiementData): void {
    // Suppression de la création de paiement : aucune action n'est faite ici
    this.showNotification('La création de paiement est désactivée.');
    this.closePaiementModal();
  }

  openDeleteModal(id: string | number, name: string, deleteLogic: () => void): void {
    this.itemToDeleteId = id; this.itemToDeleteName = name; this.deleteAction = deleteLogic; this.isDeleteModalOpen = true;
  }
  closeDeleteModal(): void { this.isDeleteModalOpen = false; this.itemToDeleteId = null; this.itemToDeleteName = ''; this.deleteAction = null; }
  handleConfirmDelete(): void {
    if (this.deleteAction) { this.deleteAction(); this.showNotification(`${this.itemToDeleteName} supprimé.`); }
    this.closeDeleteModal();
  }
  deleteClientAction(clientId: number): void { // Parameter changed to number
    this.clientService.deleteClient(clientId).subscribe({
      next: () => {
        // Notification is handled by handleConfirmDelete
        this.loadClients(); // Refresh list
      },
      error: (err) => {
        console.error('Error deleting client:', err);
        this.showNotification('Erreur lors de la suppression du client.');
        this.closeDeleteModal(); // Close modal even on error, or handle differently
      }
    });
  }

  // showNotification(message: string): void
  // Affiche une notification temporaire à l'écran.
  // message: string - Le message à afficher dans la notification.
  // La notification est un simple élément HTML qui est rendu visible puis masqué après 3 secondes.
  showNotification(message: string): void {
    const notificationElement = document.getElementById('notification'); // Récupère l'élément de notification par son ID.
    const messageElement = document.getElementById('notificationMessage'); // Récupère l'élément pour le message.
    if (notificationElement && messageElement) { // Vérifie si les éléments existent.
      messageElement.textContent = message; // Définit le texte du message.
      notificationElement.classList.remove('hidden'); // Rend la notification visible.
      // Définit un timer pour masquer la notification après 3000 millisecondes (3 secondes).
      setTimeout(() => {
        notificationElement.classList.add('hidden');
      }, 3000);
    } else {
      // Si les éléments de notification ne sont pas trouvés dans le DOM, logue un message.
      // Cela peut arriver si le template HTML n'est pas correctement configuré.
      console.log('Notification elements not found. Message:', message);
    }
  }

  // initChart(): void
  // Initialise ou met à jour le graphique des réservations par mois.
  // Utilise la bibliothèque Chart.js et l'élément <canvas> référencé par `reservationsChartCanvas`.
  // S'assure que le canvas est disponible dans le DOM avant de tenter de dessiner ou mettre à jour le graphique.
  initChart(): void {
    // Vérifie que `reservationsChartCanvas` (obtenu via @ViewChild) et son `nativeElement` (l'élément DOM réel) existent.
    if (this.reservationsChartCanvas && this.reservationsChartCanvas.nativeElement) {
      const canvas = this.reservationsChartCanvas.nativeElement; // Récupère l'objet <canvas> du DOM.

      // Si une instance de Chart (this.chart) existe déjà, on met à jour ses données.
      if (this.chart) {
        this.chart.data.datasets[0].data = this.reservationsPerMonth; // Met à jour les données du premier dataset.
        // `reservationsPerMonth` est un getter qui calcule ces données.
        // Si les labels (ex: les mois) étaient dynamiques, ils seraient mis à jour ici aussi.
        // this.chart.data.labels = ['Jan', ...]; 
        this.chart.update(); // Demande à Chart.js de redessiner le graphique avec les nouvelles données.
      } else {
        // Si aucune instance de Chart n'existe, on en crée une nouvelle.
        this.chart = new Chart(canvas, { // Crée un nouveau graphique et l'associe au canvas.
          type: 'line', // Définit le type de graphique (graphique en lignes).
          data: { // Configure les données à afficher.
            labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'], // Labels pour l'axe X (les mois).
            datasets: [{ // Un tableau d'objets, chaque objet représentant un ensemble de données à tracer.
              label: 'Réservations', // Étiquette pour cet ensemble de données (utile pour la légende).
              data: this.reservationsPerMonth, // Les données numériques (nombre de réservations par mois).
              backgroundColor: 'rgba(14, 165, 233, 0.1)', // Couleur de remplissage sous la ligne.
              borderColor: 'rgba(14, 165, 233, 1)', // Couleur de la ligne elle-même.
              borderWidth: 2, // Épaisseur de la ligne.
              tension: 0.4, // Courbure de la ligne (0 = lignes droites).
              fill: true // Indique s'il faut remplir la zone sous la ligne.
            }]
          },
          options: { // Options de configuration pour l'apparence et le comportement du graphique.
            responsive: true, // Le graphique s'adapte à la taille de son conteneur.
            maintainAspectRatio: false, // Permet de définir hauteur/largeur indépendamment (utile si le conteneur a une hauteur fixe).
            plugins: { legend: { display: false } }, // Configuration des plugins, ici on masque la légende.
            scales: { // Configuration des axes du graphique.
              y: { beginAtZero: true, grid: { display: false } }, // Axe Y : commence à zéro, grille masquée.
              x: { grid: { display: false } } // Axe X : grille masquée.
            }
          }
        });
        // this.cdr.detectChanges(); // Le commentaire original mentionne son utilisation puis sa suppression.
        // ChangeDetectorRef.detectChanges() force Angular à exécuter une détection de changement.
        // Cela peut être utile si la création du graphique par une bibliothèque tierce
        // ne déclenche pas naturellement la mise à jour de la vue Angular.
        // À utiliser avec prudence pour éviter des problèmes de performance.
      }
    }
  }

  // destroyChart(): void
  // Détruit l'instance active du graphique Chart.js.
  // Crucial pour libérer les ressources et prévenir les fuites de mémoire,
  // notamment lorsque le composant est détruit (voir ngOnDestroy) ou que le graphique
  // doit être recréé (par exemple, si la section du tableau de bord change).
  destroyChart(): void {
    if (this.chart) { // Vérifie si une instance de graphique existe.
      this.chart.destroy(); // Appelle la méthode destroy() de Chart.js pour nettoyer.
      this.chart = undefined; // Réinitialise la propriété pour indiquer qu'il n'y a plus de graphique actif.
      // console.log('Chart destroyed'); // Message de débogage (peut être utile pendant le développement).
    }
  }

  loadClients(): void {
    this.clientService.getAllClients().subscribe({
      next: (data) => {
        this.clientsList = data;
        this.sampleClientsForModal = data.map(c => ({
          id: c.idClient!.toString(), // BasicClientInfo expects id as string
          name: `${c.prenomClient} ${c.nomClient}`
        }));
        this.clientsCurrentPage = 1; // Reset to first page
        this.updatePaginatedClients();
        console.log('Clients loaded:', this.clientsList);
        console.log('Paginated clients updated:', this.paginatedClientsList);
      },
      error: (err) => {
        console.error('Error loading clients:', err);
        this.showNotification('Erreur lors du chargement des clients.');
      }
    });
  }

  onDeleteClient(client: ClientDTO): void { // Parameter type is now ClientDTO
    if (client.idClient) { // Check idClient
      this.openDeleteModal(client.idClient, `${client.prenomClient} ${client.nomClient}`, () => this.deleteClientAction(client.idClient!));
    } else {
      console.error("Client ID is missing, cannot delete.");
      this.showNotification("Erreur: ID du client manquant.");
    }
  }

  // updatePaginatedClients(): void
  // Met à jour la liste des clients affichée (`paginatedClientsList`) en fonction de la page actuelle et de la taille de la page.
  // Est appelée après le chargement initial des clients ou lors d'un changement de page.
  updatePaginatedClients(): void {
    // Si la liste principale des clients (clientsList) n'existe pas ou est vide,
    // on initialise les propriétés de pagination à des valeurs par défaut.
    if (!this.clientsList) {
      this.paginatedClientsList = []; // Liste paginée vide.
      this.totalClientPages = 1; // Au moins une page (même vide).
      this.clientsCurrentPage = 1; // Se positionne sur la première page.
      return; // Sort de la fonction.
    }
    // Calcule l'index de début pour la tranche (slice) à extraire de clientsList.
    // Par exemple, page 1, taille 10 -> startIndex = 0. Page 2, taille 10 -> startIndex = 10.
    const startIndex = (this.clientsCurrentPage - 1) * this.clientsPageSize;
    // Calcule l'index de fin pour la tranche.
    const endIndex = startIndex + this.clientsPageSize;
    // Extrait la sous-partie de clientsList pour la page actuelle.
    this.paginatedClientsList = this.clientsList.slice(startIndex, endIndex);
    // Calcule le nombre total de pages nécessaires pour afficher tous les clients.
    // Math.ceil arrondit au nombre entier supérieur pour inclure la dernière page même si elle n'est pas pleine.
    this.totalClientPages = Math.ceil(this.clientsList.length / this.clientsPageSize);
  }

  // goToClientsPage(page: number): void
  // Permet de naviguer directement vers un numéro de page spécifique pour la liste des clients.
  // page: number - Le numéro de la page souhaitée.
  goToClientsPage(page: number): void {
    // Vérifie que le numéro de page demandé est valide (entre 1 et totalClientPages).
    if (page >= 1 && page <= this.totalClientPages) {
      this.clientsCurrentPage = page; // Met à jour la page actuelle.
      this.updatePaginatedClients(); // Rafraîchit la liste paginée.
    }
  }

  // nextClientsPage(): void
  // Navigue vers la page suivante dans la liste des clients.
  nextClientsPage(): void {
    // S'assure qu'on ne dépasse pas le nombre total de pages.
    if (this.clientsCurrentPage < this.totalClientPages) {
      this.clientsCurrentPage++; // Incrémente le numéro de la page actuelle.
      this.updatePaginatedClients(); // Rafraîchit la liste.
    }
  }

  // previousClientsPage(): void
  // Navigue vers la page précédente dans la liste des clients.
  previousClientsPage(): void {
    // S'assure qu'on ne va pas en dessous de la page 1.
    if (this.clientsCurrentPage > 1) {
      this.clientsCurrentPage--; // Décrémente le numéro de la page actuelle.
      this.updatePaginatedClients(); // Rafraîchit la liste.
    }
  }

  // Agent Delete Logic
  deleteAgentAction(agentId: number): void { // Parameter changed to number
    this.agentService.deleteAgent(agentId).subscribe({
      next: () => {
        this.loadAgents(); // Refresh list
        // Notification is handled by handleConfirmDelete
      },
      error: (err) => {
        console.error('Error deleting agent:', err);
        this.showNotification('Erreur lors de la suppression de l\'agent.');
        this.closeDeleteModal();
      }
    });
  }

  onDeleteAgent(agent: AgentDTO): void { // Parameter type is now AgentDTO
    if (agent.idAgent) {
      this.openDeleteModal(agent.idAgent, `${agent.prenomAgent} ${agent.nomAgent}`, () => this.deleteAgentAction(agent.idAgent!));
    } else {
      console.error("Agent ID is missing, cannot delete.");
      this.showNotification("Erreur: ID de l'agent manquant.");
    }
  }

  // Voyage Delete Logic
  deleteVoyageAction(voyageId: number): void { // Parameter changed to number
    this.voyageService.deleteVoyage(voyageId).subscribe({
      next: () => {
        this.loadVoyages(); // Refresh list
        // Notification handled by handleConfirmDelete
      },
      error: (err) => {
        console.error('Error deleting voyage:', err);
        this.showNotification('Erreur lors de la suppression du voyage.');
        this.closeDeleteModal();
      }
    });
  }

  onDeleteVoyage(voyage: VoyageDTO): void { // Parameter type is now VoyageDTO
    if (voyage.idVoyage) {
      this.openDeleteModal(voyage.idVoyage, `Voyage ${voyage.departVoyage} -> ${voyage.arriveVoyage}`, () => this.deleteVoyageAction(voyage.idVoyage!));
    } else {
      console.error("Voyage ID is missing, cannot delete.");
      this.showNotification("Erreur: ID du voyage manquant.");
    }
  }

  loadAgents(): void {
    this.agentsLoadingError = null; // Reset error state
    this.agentsList = []; // Clear previous data
    this.agentService.getAllAgents().subscribe({
      next: (data) => {
        this.agentsList = data;
        this.sampleAgentsForModal = data.map(a => ({
          id: a.idAgent!.toString(),
          name: `${a.prenomAgent} ${a.nomAgent}`
        }));
        this.agentsCurrentPage = 1;
        this.updatePaginatedAgents();
        console.log('Agents loaded:', this.agentsList);
        if (data.length === 0) {
          // Optional: could show a specific notification for "no agents found" if desired,
          // but the table already handles displaying "Aucun agent trouvé."
        }
      },
      error: (err) => {
        console.error('Error loading agents:', err);
        this.agentsLoadingError = err.message || 'Une erreur est survenue lors du chargement des agents.';
        if (this.agentsLoadingError) {
          this.showNotification(this.agentsLoadingError);
        }
        this.agentsList = []; // Ensure list is empty on error
      }
    });
  }

  loadVoyages(): void {
    this.voyageService.getAllVoyages().subscribe({
      next: (data) => {
        this.voyagesList = data;
        this.sampleVoyagesForModal = data.map(v => ({
          id: v.idVoyage!.toString(),
          label: `${v.departVoyage} -> ${v.arriveVoyage} (${new Date(v.dateVoyage).toLocaleDateString()})`
        }));
        this.voyagesCurrentPage = 1;
        this.updatePaginatedVoyages();
        console.log('Voyages loaded:', this.voyagesList);
      },
      error: (err) => {
        console.error('Error loading voyages:', err);
        this.showNotification('Erreur lors du chargement des voyages.');
      }
    });
  }

  loadTypesBillet(): void {
    this.typeBilletService.getAllTypesBillet().subscribe({
      next: (data) => {
        this.typesBilletList = data;
        this.sampleBilletsForModal = data.map(tb => ({
          id: tb.idTypeBillet!.toString(),
          libelle: tb.libelleTypeBillet
        }));
        this.typesBilletCurrentPage = 1;
        this.updatePaginatedTypesBillet();
        console.log('Types Billet loaded:', this.typesBilletList);
      },
      error: (err) => {
        console.error('Error loading types billet:', err);
        this.showNotification('Erreur lors du chargement des types de billet.');
      }
    });
  }

  // deleteTypeBilletAction(idTypeBillet: number): void
  // Action spécifique pour supprimer un type de billet.
  // idTypeBillet: number - L'ID du type de billet à supprimer.
  deleteTypeBilletAction(idTypeBillet: number): void {
    this.typeBilletService.deleteTypeBillet(idTypeBillet).subscribe({
      next: (success) => {
        if (success) {
          this.loadTypesBillet(); // Recharge la liste.
        } else {
          // Ce cas peut arriver si le service deleteTypeBillet retourne false via son 'map'.
          console.error('Failed to delete type billet (backend returned false).');
          this.showNotification('La suppression du type de billet a échoué.');
        }
        this.closeDeleteModal();
      },
      error: (err) => {
        console.error('Error deleting type billet:', err);
        this.showNotification('Erreur lors de la suppression du type de billet.');
        this.closeDeleteModal();
      }
    });
  }

  // onDeleteTypeBillet(typeBillet: TypeBilletDTO): void
  // Ouvre la modale de confirmation avant de supprimer un type de billet.
  // typeBillet: TypeBilletDTO - L'objet type de billet à supprimer.
  onDeleteTypeBillet(typeBillet: TypeBilletDTO): void {
    if (typeBillet.idTypeBillet) {
      this.openDeleteModal(typeBillet.idTypeBillet, `Type Billet: ${typeBillet.libelleTypeBillet}`, () => this.deleteTypeBilletAction(typeBillet.idTypeBillet!));
    } else {
      console.error("TypeBillet ID is missing, cannot delete.");
      this.showNotification("Erreur: ID du type de billet manquant.");
    }
  }

  // loadPaiements(): void
  // Charge la liste des paiements et met à jour la pagination.
  // Similaire à loadClients.
  loadPaiements(): void {
    this.paiementService.getAllPaiements().subscribe({
      next: (data) => {
        this.paiementsList = data;
        this.paiementsCurrentPage = 1;
        this.updatePaginatedPaiements();
        console.log('Paiements loaded:', this.paiementsList);
      },
      error: (err) => {
        console.error('Error loading paiements:', err);
        this.showNotification('Erreur lors du chargement des paiements.');
      }
    });
  }

  // deletePaiementAction(codePaiement: string): void
  // Action spécifique pour supprimer un paiement.
  // codePaiement: string - Le code du paiement à supprimer.
  deletePaiementAction(codePaiement: string): void {
    this.paiementService.deletePaiement(codePaiement).subscribe({
      next: (success) => {
        if (success) {
          this.loadPaiements(); // Recharge la liste.
        } else {
          console.error('Failed to delete paiement (backend returned false).');
          this.showNotification('La suppression du paiement a échoué.');
        }
        this.closeDeleteModal();
      },
      error: (err) => {
        console.error('Error deleting paiement:', err);
        this.showNotification('Erreur lors de la suppression du paiement.');
        this.closeDeleteModal();
      }
    });
  }

  // onDeletePaiement(paiement: PaiementDTO): void
  // Ouvre la modale de confirmation avant de supprimer un paiement.
  // paiement: PaiementDTO - L'objet paiement à supprimer.
  onDeletePaiement(paiement: PaiementDTO): void {
    if (paiement.codePaiement) {
      this.openDeleteModal(paiement.codePaiement, `Paiement: ${paiement.codePaiement}`, () => this.deletePaiementAction(paiement.codePaiement!));
    } else {
      console.error("Paiement Code is missing, cannot delete.");
      this.showNotification("Erreur: Code du paiement manquant.");
    }
  }

  // viewReservationDetails(idReservation: string): void
  // Affiche les détails d'une réservation. Actuellement, une simple alerte.
  // Pourrait être étendue pour ouvrir une modale de détails ou naviguer vers une page dédiée.
  // idReservation: string - L'ID de la réservation à visualiser.
  viewReservationDetails(idReservation: string): void {
    alert(`Détails de la réservation ${idReservation} (à implémenter)`);
    // Logique future : ouvrir une modale ou naviguer.
  }

  // onDeleteReservation(idReservation: string): void
  // Gère la suppression d'une réservation à partir de la liste des "Dernières réservations".
  // Ouvre une modale de confirmation avant de procéder à la suppression.
  // idReservation: string - L'ID de la réservation à supprimer.
  onDeleteReservation(idReservation: string): void {
    // Trouve la réservation dans la liste paginée des dernières réservations pour obtenir le nom du client.
    const reservation = this.paginatedLatestReservationsList.find(r => r.idReservation === idReservation);
    if (reservation) {
      this.openDeleteModal(
        idReservation, // ID pour la suppression.
        `la réservation ${idReservation} du client ${reservation.clientName}`, // Nom pour affichage dans la modale.
        () => this.deleteReservationAction(+idReservation) // Action à exécuter (convertit l'ID en nombre).
      );
    } else {
      // Si la réservation n'est pas trouvée (ne devrait pas arriver si l'UI est correcte).
      alert('Réservation non trouvée pour la suppression.');
    }
  }

  // deleteReservationAction(idReservation: number): void
  // Action spécifique pour supprimer une réservation.
  // idReservation: number - L'ID de la réservation à supprimer.
  deleteReservationAction(idReservation: number): void {
    this.reservationService.deleteReservation(idReservation).subscribe({
      next: (response) => { // Si la suppression réussit.
        // console.log('Reservation deleted successfully', response); // Log de succès.
        this.showNotification('Réservation supprimée avec succès !');
        this.loadAllData(); // Recharge toutes les données pour refléter le changement.
      },
      error: (error) => { // Si une erreur survient.
        console.error('Error deleting reservation', error);
        this.showNotification('Erreur lors de la suppression de la réservation.');
      }
    });
  }

  // getStatusInfo(status: string): { text: string; class: string }
  // Méthode utilitaire pour obtenir un texte descriptif et une classe CSS
  // en fonction du statut brut d'une réservation.
  // status: string - Le statut brut (ex: "CONFIRMED", "PENDING").
  // Retourne un objet avec 'text' (ex: "Confirmée") et 'class' (ex: "bg-green-100 text-green-800").
  getStatusInfo(status: string): { text: string; class: string } {
    switch (status) {
      case 'CONFIRMED': return { text: 'Confirmée', class: 'bg-green-100 text-green-800' };
      case 'PENDING': return { text: 'En attente', class: 'bg-yellow-100 text-yellow-800' };
      case 'CANCELLED': return { text: 'Annulée', class: 'bg-red-100 text-red-800' };
      default: return { text: 'Inconnu', class: 'bg-gray-100 text-gray-800' }; // Cas par défaut.
    }
  }

  // getTicketTypeText(type: string): string
  // Méthode utilitaire pour traduire un code de type de billet en un libellé lisible.
  // type: string - Le code du type de billet (ex: "ECONOMY").
  // Retourne le libellé correspondant (ex: "Économie").
  getTicketTypeText(type: string): string {
    switch (type) {
      case 'ECONOMY': return 'Économie';
      case 'BUSINESS': return 'Affaires';
      case 'FIRST_CLASS': return 'Première Classe';
      default: return 'Standard'; // Valeur par défaut si le type n'est pas reconnu.
    }
  }

  // loadAllData(): void
  // Méthode complète pour recharger toutes les données principales du tableau de bord.
  // Utile après des opérations de création, mise à jour ou suppression pour rafraîchir l'affichage.
  // Similaire à loadCriticalData mais charge aussi les agents et paiements en une seule fois.
  loadAllData(): void {
    this.isLoadingCritical = true;
    forkJoin({
      clients: this.clientService.getAllClients(),
      agents: this.agentService.getAllAgents(),
      voyages: this.voyageService.getAllVoyages(),
      typesBillet: this.typeBilletService.getAllTypesBillet(),
      reservations: this.reservationService.getAllReservations(),
      paiements: this.paiementService.getAllPaiements()
    }).subscribe({
      next: (results) => {
        // Assignation des données clients et mise à jour de la pagination.
        this.clientsList = results.clients;
        this.sampleClientsForModal = results.clients.map(c => ({ id: c.idClient!.toString(), name: `${c.prenomClient} ${c.nomClient}` }));
        this.clientsCurrentPage = 1;
        this.updatePaginatedClients();

        // Assignation des données agents et mise à jour de la pagination.
        this.agentsList = results.agents;
        this.sampleAgentsForModal = results.agents.map(a => ({ id: a.idAgent!.toString(), name: `${a.prenomAgent} ${a.nomAgent}` }));
        this.agentsCurrentPage = 1;
        this.updatePaginatedAgents();

        // Assignation des données voyages et mise à jour de la pagination.
        this.voyagesList = results.voyages;
        this.sampleVoyagesForModal = results.voyages.map(v => ({
          id: v.idVoyage!.toString(),
          label: `${v.departVoyage} -> ${v.arriveVoyage} (${new Date(v.dateVoyage).toLocaleDateString()})`
        }));
        this.voyagesCurrentPage = 1;
        this.updatePaginatedVoyages();

        // Assignation des données types de billets et mise à jour de la pagination.
        this.typesBilletList = results.typesBillet;
        this.sampleBilletsForModal = results.typesBillet.map(tb => ({ id: tb.idTypeBillet!.toString(), libelle: tb.libelleTypeBillet }));
        this.typesBilletCurrentPage = 1;
        this.updatePaginatedTypesBillet();

        // Assignation des données réservations et mise à jour de la pagination.
        this.reservationsList = results.reservations;
        this.reservationsCurrentPage = 1;
        this.updatePaginatedReservations();
        // console.log('Données brutes des réservations reçues:', results.reservations); // Log pour débogage.
        // console.log('reservationsList après assignation:', this.reservationsList); // Log pour débogage.

        // Préparation des données simplifiées pour les modales de réservation.
        this.sampleReservationsForModal = this.reservationsList.map(r => ({ id: r.idReservation!.toString(), label: `RES${r.idReservation} - ${r.client?.nomClient || 'N/A'} - ${r.dateReservation}` }));

        // Création de Maps pour un accès optimisé aux données liées lors du formatage des 'latestReservations'.
        const clientsMap = new Map<number, ClientDTO>(this.clientsList.map(c => [c.idClient!, c]));
        const voyagesMap = new Map<number, VoyageDTO>(this.voyagesList.map(v => [v.idVoyage!, v]));
        const typesBilletMap = new Map<number, TypeBilletDTO>(this.typesBilletList.map(tb => [tb.idTypeBillet!, tb]));

        // Transformation des réservations pour l'affichage dans la section "Dernières réservations".
        this.latestReservations = this.reservationsList.map(r => {
          const client = clientsMap.get(r.client?.idClient!);
          const voyage = voyagesMap.get(r.voyage?.idVoyage!);
          const typeBillet = typesBilletMap.get(r.typeBillet?.idTypeBillet!);

          const statusInfo = this.getStatusInfo(r.status || ''); // Formatage du statut.
          const typeBilletText = this.getTicketTypeText(typeBillet?.libelleTypeBillet || ''); // Formatage du type de billet.
          const prixVoyage = voyage?.prix || 0;
          const prixTypeBillet = typeBillet?.prixTypeBillet || 0;
          const total = (prixTypeBillet + prixVoyage) * (r.nombrePlacesReservees || 0); // Calcul du total.

          // Construction de l'objet final pour 'latestReservations'.
          return {
            idReservation: r.idReservation?.toString() || '',
            clientName: `${client?.prenomClient || ''} ${client?.nomClient || ''}`.trim(),
            clientEmail: client?.mailClient || '',
            clientImage: 'https://via.placeholder.com/40', // Placeholder pour l'image client.
            departVoyage: voyage?.departVoyage || '',
            arriveVoyage: voyage?.arriveVoyage || '',
            dateVoyage: voyage?.dateVoyage || '',
            heureDepart: voyage?.heureDepart || '',
            heureArrivee: voyage?.heureArrivee || '',
            typeBilletText: typeBilletText,
            nombrePlacesReservees: r.nombrePlacesReservees || 0,
            prixVoyage: prixVoyage,
            prixTypeBillet: prixTypeBillet,
            total: total,
            price: prixTypeBillet, // À clarifier: 'price' ici semble être le prix du type de billet.
            dateReservation: r.dateReservation || '',
            statusText: statusInfo.text,
            statusClass: statusInfo.class,
            status: r.status || ''
          };
        });
        // console.log('latestReservations après mappage:', this.latestReservations); // Log pour débogage.
        this.latestReservationsCurrentPage = 1; // Réinitialisation de la pagination pour les dernières réservations.
        this.updatePaginatedLatestReservations(); // Mise à jour de la liste paginée.

        // Assignation des données paiements et mise à jour de la pagination.
        this.paiementsList = results.paiements;
        this.paiementsCurrentPage = 1;
        this.updatePaginatedPaiements();

        // console.log('All data loaded successfully.'); // Log de succès.
        this.initChart(); // Initialisation du graphique une fois les données chargées.
        this.isLoadingCritical = false; // Désactivation de l'indicateur de chargement principal.
      },
      error: (err) => { // Gestion des erreurs pour forkJoin.
        // console.error('Error loading all data:', err); // Log de l'erreur.
        this.showNotification('Erreur lors du chargement des données.'); // Notification à l'utilisateur.
        this.isLoadingCritical = false; // Désactivation de l'indicateur de chargement.
      }
    });
  }

  confirmReservation(idReservation: string): void {
    const id = Number(idReservation);
    this.reservationService.updateReservationStatus(id, 'CONFIRMED').subscribe({
      next: (updatedReservation) => {
        this.showNotification('Réservation confirmée avec succès !');
        this.loadAllData();
      },
      error: (err) => {
        this.showNotification('Erreur lors de la confirmation de la réservation.');
      }
    });
  }

  cancelReservation(idReservation: string): void {
    const id = Number(idReservation);
    this.reservationService.updateReservationStatus(id, 'CANCELLED').subscribe({
      next: (updatedReservation) => {
        this.showNotification('Réservation annulée.');
        this.loadAllData();
      },
      error: (err) => {
        this.showNotification("Erreur lors de l'annulation de la réservation.");
      }
    });
  }

  // Getters dynamiques pour les tuiles du dashboard
  get totalClients(): number {
    return this.clientsList.length;
  }
  get totalReservations(): number {
    return this.reservationsList.length;
  }
  get totalVoyages(): number {
    return this.voyagesList.length;
  }
  get totalRevenus(): number {
    if (
      this._totalRevenus_reservationsListCache === this.reservationsList &&
      this._totalRevenus_voyagesListCache === this.voyagesList &&
      this._totalRevenus_typesBilletListCache === this.typesBilletList &&
      this._totalRevenus_reservationsListCache !== undefined // Check if it was calculated at least once
    ) {
      return this._totalRevenus;
    }

    let sum = 0;
    this.reservationsList
      .filter(r => (r.status || '').toUpperCase() === 'CONFIRMED')
      .forEach(r => {
        const voyage = r.voyage || this.voyagesList.find(v => v.idVoyage === r.voyageId);
        const typeBillet = r.typeBillet || this.typesBilletList.find(tb => tb.idTypeBillet === r.typeBilletId);
        const nbPlaces = r.nombrePlacesReservees || 1;
        const prix = ((typeBillet?.prixTypeBillet || 0) + (voyage?.prix || 0)) * nbPlaces;
        sum += prix;
      });

    this._totalRevenus = sum;
    this._totalRevenus_reservationsListCache = this.reservationsList;
    this._totalRevenus_voyagesListCache = this.voyagesList;
    this._totalRevenus_typesBilletListCache = this.typesBilletList;
    return this._totalRevenus;
  }

  // Top destinations dynamiques
  get topDestinations(): { destination: string, count: number, percent: number }[] {
    if (
      this._topDestinations_reservationsListCache === this.reservationsList &&
      this._topDestinations_voyagesListCache === this.voyagesList &&
      this._topDestinations_reservationsListCache !== undefined
    ) {
      if (this.reservationsList.length === 0 && this._topDestinations.length === 0) {
        return this._topDestinations;
      }
      if (this._topDestinations.length > 0 || (this.reservationsList.length > 0 && this._topDestinations.length === 0 && Object.keys(this._topDestinations_reservationsListCache!).length > 0)) { // Ensure cache was actually set
        return this._topDestinations;
      }
    }

    const destCount: { [key: string]: number } = {};
    let total = 0;
    this.reservationsList.forEach(r => {
      const voyage = r.voyage || this.voyagesList.find(v => v.idVoyage === r.voyageId);
      if (voyage && voyage.arriveVoyage) {
        destCount[voyage.arriveVoyage] = (destCount[voyage.arriveVoyage] || 0) + 1;
        total++;
      }
    });

    const arr = Object.entries(destCount)
      .map(([destination, count]) => ({ destination, count, percent: total ? Math.round((count / total) * 100) : 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    this._topDestinations = arr;
    this._topDestinations_reservationsListCache = this.reservationsList;
    this._topDestinations_voyagesListCache = this.voyagesList;
    return this._topDestinations;
  }

  // Génération dynamique des données du graphique "Réservations par mois"
  get reservationsPerMonth(): number[] {
    if (
      this._reservationsPerMonth_reservationsListCache === this.reservationsList &&
      this._reservationsPerMonth_reservationsListCache !== undefined
    ) {
      // If reservationsList is empty and the cache is the default Array(12).fill(0), it's valid.
      if (this.reservationsList.length === 0 && this._reservationsPerMonth.every(m => m === 0) && this._reservationsPerMonth.length === 12) {
        return this._reservationsPerMonth;
      }
      // If it's not the initial state (empty list but calculated) and caches match, return.
      if (this._reservationsPerMonth.some(m => m > 0) || (this.reservationsList.length > 0 && this._reservationsPerMonth.every(m => m === 0))) {
        return this._reservationsPerMonth;
      }
    }

    const months = Array(12).fill(0);
    this.reservationsList.forEach(r => {
      if (r.dateReservation) {
        const month = new Date(r.dateReservation).getMonth();
        if (month >= 0 && month < 12) {
          months[month]++;
        }
      }
    });

    this._reservationsPerMonth = months;
    this._reservationsPerMonth_reservationsListCache = this.reservationsList;
    return this._reservationsPerMonth;
  }

  // Méthodes de pagination pour la liste des Agents.
  // Le pattern est le même que pour les clients :
  // - updatePaginatedXxx : Met à jour la liste affichée pour la page courante.
  // - goToXxxPage : Va à une page spécifique.
  // - nextXxxPage : Va à la page suivante.
  // - previousXxxPage : Va à la page précédente.

  /**
   * @author VotreNomOuPseudo
   * @date YYYY-MM-DD
   * @description Met à jour la liste des agents affichée (`paginatedAgentsList`)
   *              en fonction de la page actuelle (`agentsCurrentPage`) et de la taille de la page (`agentsPageSize`).
   *              Cette méthode est appelée après le chargement initial des agents ou lors d'un changement de page.
   *              Elle calcule également le nombre total de pages (`totalAgentPages`).
   */
  updatePaginatedAgents(): void {
    // Si la liste principale des agents (agentsList) n'est pas définie ou est vide,
    // on initialise les propriétés de pagination à des valeurs par défaut (liste vide, une seule page).
    if (!this.agentsList) {
      this.paginatedAgentsList = []; // Liste paginée vide.
      this.totalAgentPages = 1; // Au moins une page (même si vide).
      this.agentsCurrentPage = 1; // Se positionne sur la première page.
      return; // Sort de la fonction car il n'y a rien à paginer.
    }
    // Calcule l'index de début pour la tranche (slice) à extraire de agentsList.
    // La page est basée sur un index de 1, donc on soustrait 1 pour le calcul de l'index (base 0).
    const startIndex = (this.agentsCurrentPage - 1) * this.agentsPageSize;
    // Extrait la sous-partie de agentsList pour la page actuelle.
    this.paginatedAgentsList = this.agentsList.slice(startIndex, startIndex + this.agentsPageSize);
    // Calcule le nombre total de pages nécessaires pour afficher tous les agents.
    // Math.ceil arrondit au nombre entier supérieur pour inclure la dernière page même si elle n'est pas pleine.
    this.totalAgentPages = Math.ceil(this.agentsList.length / this.agentsPageSize);
  }

  /**
   * @author VotreNomOuPseudo
   * @date YYYY-MM-DD
   * @description Permet de naviguer directement vers un numéro de page spécifique pour la liste des agents.
   * @param page - Le numéro de la page souhaitée (commençant à 1).
   */
  goToAgentsPage(page: number): void {
    // Vérifie que le numéro de page demandé est valide (entre 1 et totalAgentPages).
    if (page >= 1 && page <= this.totalAgentPages) {
      this.agentsCurrentPage = page; // Met à jour la page actuelle.
      this.updatePaginatedAgents(); // Rafraîchit la liste paginée.
    }
  }

  /**
   * @author VotreNomOuPseudo
   * @date YYYY-MM-DD
   * @description Navigue vers la page suivante dans la liste des agents.
   *              Ne fait rien si l'utilisateur est déjà sur la dernière page.
   */
  nextAgentsPage(): void {
    // S'assure qu'on ne dépasse pas le nombre total de pages.
    if (this.agentsCurrentPage < this.totalAgentPages) {
      this.agentsCurrentPage++; // Incrémente le numéro de la page actuelle.
      this.updatePaginatedAgents(); // Rafraîchit la liste.
    }
  }

  /**
   * @author VotreNomOuPseudo
   * @date YYYY-MM-DD
   * @description Navigue vers la page précédente dans la liste des agents.
   *              Ne fait rien si l'utilisateur est déjà sur la première page.
   */
  previousAgentsPage(): void {
    // S'assure qu'on ne va pas en dessous de la page 1.
    if (this.agentsCurrentPage > 1) {
      this.agentsCurrentPage--; // Décrémente le numéro de la page actuelle.
      this.updatePaginatedAgents(); // Rafraîchit la liste.
    }
  }

  // Méthodes de pagination pour la liste des Voyages.
  /**
   * @author VotreNomOuPseudo
   * @date YYYY-MM-DD
   * @description Met à jour la liste des voyages affichée (`paginatedVoyagesList`)
   *              en fonction de la page actuelle (`voyagesCurrentPage`) et de la taille de la page (`voyagesPageSize`).
   *              Appelée après le chargement des voyages ou lors d'un changement de page/taille de page.
   *              Calcule également le nombre total de pages (`totalVoyagePages`).
   */
  updatePaginatedVoyages(): void {
    // Si la liste principale des voyages (voyagesList) est indéfinie ou vide,
    // initialise les propriétés de pagination à des valeurs par défaut.
    if (!this.voyagesList) {
      this.paginatedVoyagesList = []; // Liste paginée vide.
      this.totalVoyagePages = 1; // Au moins une page (même si vide).
      this.voyagesCurrentPage = 1; // Se positionne sur la première page.
      return; // Sort de la fonction.
    }
    // Calcule l'index de début pour la tranche de la liste des voyages.
    // (page actuelle - 1) car les pages sont indexées à partir de 1, mais les tableaux à partir de 0.
    const startIndex = (this.voyagesCurrentPage - 1) * this.voyagesPageSize;
    // Extrait la portion de voyagesList correspondant à la page actuelle.
    this.paginatedVoyagesList = this.voyagesList.slice(startIndex, startIndex + this.voyagesPageSize);
    // Calcule le nombre total de pages.
    this.totalVoyagePages = Math.ceil(this.voyagesList.length / this.voyagesPageSize);
  }

  /**
   * @author VotreNomOuPseudo
   * @date YYYY-MM-DD
   * @description Navigue vers une page spécifique de la liste des voyages.
   * @param page - Le numéro de la page à afficher (commençant à 1).
   */
  goToVoyagesPage(page: number): void {
    // Vérifie si la page demandée est dans les limites valides.
    if (page >= 1 && page <= this.totalVoyagePages) {
      this.voyagesCurrentPage = page; // Met à jour la page actuelle.
      this.updatePaginatedVoyages(); // Rafraîchit la liste des voyages affichée.
    }
  }

  /**
   * @author VotreNomOuPseudo
   * @date YYYY-MM-DD
   * @description Navigue vers la page suivante de la liste des voyages.
   *              Si déjà sur la dernière page, ne fait rien.
   */
  nextVoyagesPage(): void {
    // Vérifie qu'il y a une page suivante.
    if (this.voyagesCurrentPage < this.totalVoyagePages) {
      this.voyagesCurrentPage++; // Incrémente la page actuelle.
      this.updatePaginatedVoyages(); // Rafraîchit la liste.
    }
  }

  /**
   * @author VotreNomOuPseudo
   * @date YYYY-MM-DD
   * @description Navigue vers la page précédente de la liste des voyages.
   *              Si déjà sur la première page, ne fait rien.
   */
  previousVoyagesPage(): void {
    // Vérifie qu'il y a une page précédente.
    if (this.voyagesCurrentPage > 1) {
      this.voyagesCurrentPage--; // Décrémente la page actuelle.
      this.updatePaginatedVoyages(); // Rafraîchit la liste.
    }
  }

  // Méthodes de pagination pour la liste des Types de Billet.
  /**
   * @author VotreNomOuPseudo
   * @date YYYY-MM-DD
   * @description Met à jour la liste des types de billet affichée (`paginatedTypesBilletList`)
   *              en fonction de la page actuelle (`typesBilletCurrentPage`) et de la taille de la page (`typesBilletPageSize`).
   *              Appelée après le chargement des types de billet ou lors d'un changement de page/taille.
   *              Calcule également le nombre total de pages (`totalTypeBilletPages`).
   */
  updatePaginatedTypesBillet(): void {
    // Si la liste principale des types de billet (typesBilletList) est indéfinie ou vide,
    // initialise les propriétés de pagination à des valeurs par défaut.
    if (!this.typesBilletList) {
      this.paginatedTypesBilletList = []; // Liste paginée vide.
      this.totalTypeBilletPages = 1; // Au moins une page.
      this.typesBilletCurrentPage = 1; // Première page.
      return; // Sortie.
    }
    // Calcule l'index de début pour la tranche.
    const startIndex = (this.typesBilletCurrentPage - 1) * this.typesBilletPageSize;
    // Extrait la portion de typesBilletList pour la page actuelle.
    this.paginatedTypesBilletList = this.typesBilletList.slice(startIndex, startIndex + this.typesBilletPageSize);
    // Calcule le nombre total de pages.
    this.totalTypeBilletPages = Math.ceil(this.typesBilletList.length / this.typesBilletPageSize);
  }

  /**
   * @author VotreNomOuPseudo
   * @date YYYY-MM-DD
   * @description Navigue vers une page spécifique de la liste des types de billet.
   * @param page - Le numéro de la page à afficher (commençant à 1).
   */
  goToTypesBilletPage(page: number): void {
    // Vérifie la validité de la page demandée.
    if (page >= 1 && page <= this.totalTypeBilletPages) {
      this.typesBilletCurrentPage = page; // Met à jour la page actuelle.
      this.updatePaginatedTypesBillet(); // Rafraîchit la liste affichée.
    }
  }

  /**
   * @author VotreNomOuPseudo
   * @date YYYY-MM-DD
   * @description Navigue vers la page suivante de la liste des types de billet.
   */
  nextTypesBilletPage(): void {
    // Vérifie s'il existe une page suivante.
    if (this.typesBilletCurrentPage < this.totalTypeBilletPages) {
      this.typesBilletCurrentPage++; // Incrémente la page.
      this.updatePaginatedTypesBillet(); // Rafraîchit.
    }
  }

  /**
   * @author VotreNomOuPseudo
   * @date YYYY-MM-DD
   * @description Navigue vers la page précédente de la liste des types de billet.
   */
  previousTypesBilletPage(): void {
    // Vérifie s'il existe une page précédente.
    if (this.typesBilletCurrentPage > 1) {
      this.typesBilletCurrentPage--; // Décrémente la page.
      this.updatePaginatedTypesBillet(); // Rafraîchit.
    }
  }

  // Méthodes de pagination pour la liste principale des Réservations.
  /**
   * @author VotreNomOuPseudo
   * @date YYYY-MM-DD
   * @description Met à jour la liste des réservations affichée (`paginatedReservationsList`)
   *              en fonction de la page actuelle (`reservationsCurrentPage`) et de la taille de la page (`reservationsPageSize`).
   *              Appelée après le chargement des réservations ou lors d'un changement de page/taille.
   *              Calcule également le nombre total de pages (`totalReservationPages`).
   */
  updatePaginatedReservations(): void {
    // Si la liste principale des réservations (reservationsList) est indéfinie ou vide,
    // initialise les propriétés de pagination à des valeurs par défaut.
    if (!this.reservationsList) {
      this.paginatedReservationsList = []; // Liste paginée vide.
      this.totalReservationPages = 1; // Au moins une page.
      this.reservationsCurrentPage = 1; // Première page.
      return; // Sortie.
    }
    // Calcule l'index de début pour la tranche.
    const startIndex = (this.reservationsCurrentPage - 1) * this.reservationsPageSize;
    // Extrait la portion de reservationsList pour la page actuelle.
    this.paginatedReservationsList = this.reservationsList.slice(startIndex, startIndex + this.reservationsPageSize);
    // Calcule le nombre total de pages.
    this.totalReservationPages = Math.ceil(this.reservationsList.length / this.reservationsPageSize);
  }

  /**
   * @author VotreNomOuPseudo
   * @date YYYY-MM-DD
   * @description Navigue vers une page spécifique de la liste principale des réservations.
   * @param page - Le numéro de la page à afficher (commençant à 1).
   */
  goToReservationsPage(page: number): void {
    // Vérifie la validité de la page demandée.
    if (page >= 1 && page <= this.totalReservationPages) {
      this.reservationsCurrentPage = page; // Met à jour la page actuelle.
      this.updatePaginatedReservations(); // Rafraîchit la liste affichée.
    }
  }

  /**
   * @author VotreNomOuPseudo
   * @date YYYY-MM-DD
   * @description Navigue vers la page suivante de la liste principale des réservations.
   */
  nextReservationsPage(): void {
    // Vérifie s'il existe une page suivante.
    if (this.reservationsCurrentPage < this.totalReservationPages) {
      this.reservationsCurrentPage++; // Incrémente la page.
      this.updatePaginatedReservations(); // Rafraîchit.
    }
  }

  /**
   * @author VotreNomOuPseudo
   * @date YYYY-MM-DD
   * @description Navigue vers la page précédente de la liste principale des réservations.
   */
  previousReservationsPage(): void {
    // Vérifie s'il existe une page précédente.
    if (this.reservationsCurrentPage > 1) {
      this.reservationsCurrentPage--; // Décrémente la page.
      this.updatePaginatedReservations(); // Rafraîchit.
    }
  }

  // Méthodes de pagination pour la liste des Dernières Réservations (affichée sur le tableau de bord).
  /**
   * @author VotreNomOuPseudo
   * @date YYYY-MM-DD
   * @description Met à jour la liste des dernières réservations affichée (`paginatedLatestReservationsList`)
   *              en fonction de la page actuelle (`latestReservationsCurrentPage`) et de la taille de la page (`latestReservationsPageSize`).
   *              Utilisée pour la section "Dernières Réservations" du tableau de bord.
   *              Calcule également le nombre total de pages (`totalLatestReservationPages`).
   */
  updatePaginatedLatestReservations(): void {
    // Si la liste des dernières réservations (latestReservations) est indéfinie ou vide,
    // initialise les propriétés de pagination à des valeurs par défaut.
    if (!this.latestReservations) {
      this.paginatedLatestReservationsList = []; // Liste paginée vide.
      this.totalLatestReservationPages = 1; // Au moins une page.
      this.latestReservationsCurrentPage = 1; // Première page.
      return; // Sortie.
    }
    // Calcule l'index de début pour la tranche.
    const startIndex = (this.latestReservationsCurrentPage - 1) * this.latestReservationsPageSize;
    // Extrait la portion de latestReservations pour la page actuelle.
    this.paginatedLatestReservationsList = this.latestReservations.slice(startIndex, startIndex + this.latestReservationsPageSize);
    // Calcule le nombre total de pages.
    this.totalLatestReservationPages = Math.ceil(this.latestReservations.length / this.latestReservationsPageSize);
  }

  /**
   * @author VotreNomOuPseudo
   * @date YYYY-MM-DD
   * @description Navigue vers une page spécifique de la liste des dernières réservations.
   * @param page - Le numéro de la page à afficher (commençant à 1).
   */
  goToLatestReservationsPage(page: number): void {
    // Vérifie la validité de la page demandée.
    if (page >= 1 && page <= this.totalLatestReservationPages) {
      this.latestReservationsCurrentPage = page; // Met à jour la page actuelle.
      this.updatePaginatedLatestReservations(); // Rafraîchit la liste affichée.
    }
  }

  /**
   * @author VotreNomOuPseudo
   * @date YYYY-MM-DD
   * @description Navigue vers la page suivante de la liste des dernières réservations.
   */
  nextLatestReservationsPage(): void {
    // Vérifie s'il existe une page suivante.
    if (this.latestReservationsCurrentPage < this.totalLatestReservationPages) {
      this.latestReservationsCurrentPage++; // Incrémente la page.
      this.updatePaginatedLatestReservations(); // Rafraîchit.
    }
  }

  /**
   * @author VotreNomOuPseudo
   * @date YYYY-MM-DD
   * @description Navigue vers la page précédente de la liste des dernières réservations.
   */
  previousLatestReservationsPage(): void {
    // Vérifie s'il existe une page précédente.
    if (this.latestReservationsCurrentPage > 1) {
      this.latestReservationsCurrentPage--; // Décrémente la page.
      this.updatePaginatedLatestReservations(); // Rafraîchit.
    }
  }

  // Méthodes de pagination pour la liste des Paiements.
  /**
   * @author VotreNomOuPseudo
   * @date YYYY-MM-DD
   * @description Met à jour la liste des paiements affichée (`paginatedPaiementsList`)
   *              en fonction de la page actuelle (`paiementsCurrentPage`) et de la taille de la page (`paiementsPageSize`).
   *              Appelée après le chargement des paiements ou lors d'un changement de page/taille.
   *              Calcule également le nombre total de pages (`totalPaiementPages`).
   */
  updatePaginatedPaiements(): void {
    // Si la liste principale des paiements (paiementsList) est indéfinie ou vide,
    // initialise les propriétés de pagination à des valeurs par défaut.
    if (!this.paiementsList) {
      this.paginatedPaiementsList = []; // Liste paginée vide.
      this.totalPaiementPages = 1; // Au moins une page.
      this.paiementsCurrentPage = 1; // Première page.
      return; // Sortie.
    }
    // Calcule l'index de début pour la tranche.
    const startIndex = (this.paiementsCurrentPage - 1) * this.paiementsPageSize;
    // Extrait la portion de paiementsList pour la page actuelle.
    this.paginatedPaiementsList = this.paiementsList.slice(startIndex, startIndex + this.paiementsPageSize);
    // Calcule le nombre total de pages.
    this.totalPaiementPages = Math.ceil(this.paiementsList.length / this.paiementsPageSize);
  }

  /**
   * @author VotreNomOuPseudo
   * @date YYYY-MM-DD
   * @description Navigue vers une page spécifique de la liste des paiements.
   * @param page - Le numéro de la page à afficher (commençant à 1).
   */
  goToPaiementsPage(page: number): void {
    // Vérifie la validité de la page demandée.
    if (page >= 1 && page <= this.totalPaiementPages) {
      this.paiementsCurrentPage = page; // Met à jour la page actuelle.
      this.updatePaginatedPaiements(); // Rafraîchit la liste affichée.
    }
  }

  /**
   * @author VotreNomOuPseudo
   * @date YYYY-MM-DD
   * @description Navigue vers la page suivante de la liste des paiements.
   */
  nextPaiementsPage(): void {
    // Vérifie s'il existe une page suivante.
    if (this.paiementsCurrentPage < this.totalPaiementPages) {
      this.paiementsCurrentPage++; // Incrémente la page.
      this.updatePaginatedPaiements(); // Rafraîchit.
    }
  }

  /**
   * @author VotreNomOuPseudo
   * @date YYYY-MM-DD
   * @description Navigue vers la page précédente de la liste des paiements.
   */
  previousPaiementsPage(): void {
    // Vérifie s'il existe une page précédente.
    if (this.paiementsCurrentPage > 1) {
      this.paiementsCurrentPage--; // Décrémente la page.
      this.updatePaginatedPaiements(); // Rafraîchit.
    }
  }
}

// Ajout de la fonction utilitaire en haut du fichier (après les imports)
function formatDateToBackend(date: string | Date): string {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
