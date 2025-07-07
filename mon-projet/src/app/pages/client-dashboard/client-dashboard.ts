import { Component, OnInit, ElementRef, ViewChild } from '@angular/core'; // Added ElementRef, ViewChild
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms'; // Added NgForm
import { ClientHeaderComponent } from '../../components/client-header/client-header';
import { PaymentModalComponent, PaymentData } from '../../components/payment-modal/payment-modal';
import { Router, ActivatedRoute } from '@angular/router'; // Import ActivatedRoute
import { ClientService, ClientDTO } from '../../services/client.service';
import { ReservationService, ReservationDTO } from '../../services/reservation.service';
import { PaiementService, PaiementDTO } from '../../services/paiement.service';
import { TypeBilletService, TypeBilletDTO } from '../../services/type-billet.service';
import { VoyageService, VoyageDTO } from '../../services/voyage.service';
import { forkJoin, Observable, throwError } from 'rxjs'; // Import forkJoin, Observable, throwError
import { tap, catchError } from 'rxjs/operators'; // Import tap, catchError
import { DeleteConfirmationModalComponent } from '../../components/admin/modals/delete-confirmation-modal/delete-confirmation-modal';
import { ConfirmationModalComponent } from '../../components/admin/modals/confirmation-modal/confirmation-modal';

// Interfaces (assuming they are defined as in the previous step for this component)
export interface Booking {
  idReservation: string; dateReservation: string; departVoyage: string; arriveVoyage: string;
  dateVoyage: string; typeBillet: 'economy' | 'business' | 'first';
  status: 'confirmed' | 'pending' | 'canceled'; price: number;
  statusText?: string; statusClass?: string; typeBilletText?: string;
  heureDepart?: string;
  heureArrivee?: string;
  nombrePlacesReservees?: number;
}
export interface InvoiceItem { description: string; quantity: number; unitPrice: number; total: number; }
export interface Invoice {
  invoiceId: string; date: string; reservationId: string; clientName: string; items: InvoiceItem[];
  subTotal: number; vat: number; totalAmount: number; status: 'Payée' | 'En attente' | 'Remboursée';
  statusClass?: string;
}
export interface Payment {
  codePaiement: string; datePaiement: string; idReservation: string; amount: number;
  status: 'Payée' | 'En attente' | 'Remboursé' | string;
  statusClass?: string;
  statusText?: string;
}

function formatDateToBackend(date: string | Date): string {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

@Component({
  selector: 'app-client-dashboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ClientHeaderComponent, PaymentModalComponent, DeleteConfirmationModalComponent, ConfirmationModalComponent],
  templateUrl: './client-dashboard.html', // Corrected
  styleUrls: ['./client-dashboard.css']  // Corrected
})
export class ClientDashboardPageComponent implements OnInit {
  @ViewChild('invoiceTemplateForPrint') invoiceTemplateForPrint!: ElementRef<HTMLDivElement>; // Added ! for definite assignment

  loggedInClient: ClientDTO | null = null; // To store the logged-in client's data
  clientUserName: string = 'Client'; // Default value
  currentTab: string = 'profile';

  profile = {
    idClient: 0,
    nom: '', prenom: '', dateNaissance: '',
    email: '', telephone: '',
    sexe: '', login: '', password: ''
  };
  passwordChange = { currentPassword: '', newPassword: '', confirmNewPassword: '' };
  searchCriteria = { departureCity: '', arrivalCity: '', travelDate: '', ticketType: '', numberOfSeats: 1 };

  bookings: Booking[] = [];
  invoices: Invoice[] = [];
  payments: Payment[] = [];
  typesBillet: TypeBilletDTO[] = [];
  voyages: VoyageDTO[] = [];

  // Modal de paiement
  showPaymentModal: boolean = false;
  selectedBookingForPayment: Booking | null = null;
  tempReservationData: any = null;

  // Ajout des moyens de paiement disponibles
  paymentMethods: string[] = ['Carte bancaire', 'Moov Money', 'Mixx by Yas'];
  selectedPaymentMethod: string = this.paymentMethods[0];
  paymentAmount: number = 0;
  paymentPhone: string = '';

  showSuccessModal: boolean = false;
  successMessage: string = "Votre réservation a bien été enregistrée et est en attente de validation.";

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clientService: ClientService,
    private reservationService: ReservationService,
    private paiementService: PaiementService,
    private typeBilletService: TypeBilletService,
    private voyageService: VoyageService
  ) { }

  ngOnInit(): void {
    this.loadLoggedInClient();
    this.loadSearchParamsFromURL();
  }

  loadSearchParamsFromURL(): void {
    // Récupérer les paramètres de recherche depuis l'URL
    this.route.queryParams.subscribe(params => {
      if (params['departureCity'] || params['arrivalCity'] || params['travelDate'] || params['ticketType'] || params['numberOfSeats']) {
        this.searchCriteria = {
          departureCity: params['departureCity'] || '',
          arrivalCity: params['arrivalCity'] || '',
          travelDate: params['travelDate'] || '',
          ticketType: params['ticketType'] || '',
          numberOfSeats: parseInt(params['numberOfSeats']) || 1
        };

        // Basculer vers l'onglet réservations si des paramètres de recherche sont présents
        this.currentTab = 'bookings';
      }
    });
  }

  loadLoggedInClient(): void {
    const storedClientId = localStorage.getItem('loggedInClientId');
    if (storedClientId) {
      this.clientService.getClientById(+storedClientId).subscribe({
        next: (client) => {
          if (client) {
            this.loggedInClient = client;
            this.clientUserName = `${client.prenomClient} ${client.nomClient}`;
            this.profile = {
              idClient: client.idClient || 0,
              nom: client.nomClient,
              prenom: client.prenomClient,
              dateNaissance: client.dateNaiss, // Assuming yyyy-MM-dd format
              email: client.mailClient,
              telephone: client.telClient,
              sexe: client.sexeClient,
              login: client.login,
              password: client.password || '' // Password might not be returned in DTO, handle accordingly
            };

            // Load dependent data (typesBillet, voyages) using forkJoin
            forkJoin({
              types: this.typeBilletService.getAllTypesBillet(),
              voyages: this.voyageService.getAllVoyages()
            }).subscribe({
              next: (results) => {
                this.typesBillet = results.types;
                this.voyages = results.voyages;
                this.loadClientReservations(); // Load reservations after types and voyages
                this.loadClientPayments();     // Load payments after types and voyages
              },
              error: (err) => {
                console.error('Failed to load types and voyages', err);
                // Decide how to handle this error, e.g., redirect or show a message
              }
            });
          }
        },
        error: (err) => {
          console.error('Failed to load logged in client', err);
          this.router.navigate(['/login']);
          return;
        }
      });
    } else {
      console.warn('No logged in client ID found. Redirecting to login.');
      this.router.navigate(['/login']);
      return;
    }
  }

  loadClientReservations(): void {
    this.reservationService.getAllReservations().subscribe({
      next: (reservations) => {
        const clientId = this.loggedInClient?.idClient;
        // Filtrer les réservations du client connecté
        const clientReservations = reservations.filter(r => r.clientId === clientId);
        this.bookings = clientReservations.map(r => {
          const voyage = (r.voyage || this.voyages.find(v => v.idVoyage === r.voyageId)) as VoyageDTO;
          const typeBillet = r.typeBillet || this.typesBillet.find(tb => tb.idTypeBillet === r.typeBilletId);
          const nbPlaces = r.nombrePlacesReservees || 1;

          return {
            idReservation: r.idReservation?.toString() || '',
            dateReservation: r.dateReservation || '',
            departVoyage: voyage?.departVoyage || '',
            arriveVoyage: voyage?.arriveVoyage || '',
            heureDepart: voyage?.heureDepart || '',
            heureArrivee: voyage?.heureArrivee || '',
            dateVoyage: voyage?.dateVoyage || '',
            typeBillet: typeBillet?.libelleTypeBillet as Booking['typeBillet'] || '',
            status: (r.status || '').toLowerCase() as Booking['status'] || 'pending',
            price: ((typeBillet?.prixTypeBillet || 0) + (voyage?.prix || 0)) * nbPlaces,
            nombrePlacesReservees: nbPlaces
          };
        });
        this.bookings = this.bookings.map(b => {
          const statusInfo = this.getStatusInfo(b.status);
          const typeBilletText = this.getTicketTypeText(b.typeBillet);
          return { ...b, statusText: statusInfo.text, statusClass: statusInfo.class, typeBilletText: typeBilletText };
        });
        this.generateInvoicesFromBookings();
      },
      error: (err) => console.error('Échec du chargement des réservations:', err)
    });
  }

  loadClientPayments(): void {
    this.paiementService.getAllPaiements().subscribe({
      next: (payments) => {
        this.payments = payments.map(p => {
          const statusInfo = this.getStatusInfo(p.status || '');
          return {
            codePaiement: p.codePaiement || '',
            datePaiement: p.datePaiement || '',
            idReservation: p.reservation?.idReservation?.toString() || '',
            amount: p.montantPaiement || 0,
            status: p.status as Payment['status'] || 'Payée',
            statusText: statusInfo.text,
            statusClass: statusInfo.class
          };
        });
      },
      error: (err) => console.error('Failed to load payments', err)
    });
  }

  // Changed to return Observable for use with forkJoin
  loadTypesBillet(): Observable<TypeBilletDTO[]> {
    return this.typeBilletService.getAllTypesBillet().pipe(
      tap(types => this.typesBillet = types),
      catchError(err => {
        console.error('Failed to load ticket types', err);
        return throwError(() => err);
      })
    );
  }

  // Changed to return Observable for use with forkJoin
  loadVoyages(): Observable<VoyageDTO[]> {
    return this.voyageService.getAllVoyages().pipe(
      tap(voyages => this.voyages = voyages),
      catchError(err => {
        console.error('Failed to load voyages', err);
        return throwError(() => err);
      })
    );
  }

  switchTab(tabId: string): void { this.currentTab = tabId; }
  onLogout(): void {
    console.log('Logout clicked');
    localStorage.removeItem('loggedInClientId');
    this.router.navigate(['/login']);
  }
  onUserProfileClicked(): void { this.switchTab('profile'); }

  saveProfileChanges(form: NgForm): void {
    if (form.invalid) { this.markFormGroupTouched(form); alert('Formulaire de profil invalide.'); return; }
    if (!this.loggedInClient || this.loggedInClient.idClient === undefined) { alert('Client non connecté ou ID manquant.'); return; }

    const updatedClient: ClientDTO = {
      idClient: this.loggedInClient.idClient,
      nomClient: this.profile.nom,
      prenomClient: this.profile.prenom,
      dateNaiss: formatDateToBackend(this.profile.dateNaissance),
      mailClient: this.profile.email,
      telClient: this.profile.telephone,
      sexeClient: this.profile.sexe as 'Homme' | 'Femme' | 'Autre' | '',
      login: this.profile.login,
      password: this.profile.password
    };

    this.clientService.updateClient(this.loggedInClient.idClient!, updatedClient).subscribe({
      next: (client) => {
        console.log('Profile updated successfully:', client);
        alert('Profil sauvegardé.');
        this.loggedInClient = client;
      },
      error: (err) => {
        console.error('Failed to update profile:', err);
        alert('Échec de la sauvegarde du profil.');
      }
    });
  }

  changePassword(form: NgForm): void {
    if (form.invalid) { this.markFormGroupTouched(form); alert('Formulaire de changement de mot de passe invalide.'); return; }
    if (this.passwordChange.newPassword !== this.passwordChange.confirmNewPassword) {
      alert('Les nouveaux mots de passe ne correspondent pas.'); return;
    }
    if (!this.loggedInClient || this.loggedInClient.idClient === undefined) { alert('Client non connecté ou ID manquant.'); return; }

    const updatedClient: ClientDTO = {
      idClient: this.loggedInClient.idClient,
      nomClient: this.loggedInClient.nomClient,
      prenomClient: this.loggedInClient.prenomClient,
      dateNaiss: formatDateToBackend(this.loggedInClient.dateNaiss),
      mailClient: this.loggedInClient.mailClient,
      telClient: this.loggedInClient.telClient,
      sexeClient: this.loggedInClient.sexeClient,
      login: this.loggedInClient.login,
      password: this.passwordChange.newPassword
    };

    this.clientService.updateClient(this.loggedInClient.idClient!, updatedClient).subscribe({
      next: (client) => {
        console.log('Password changed successfully:', client);
        alert('Mot de passe changé.');
        form.resetForm();
      },
      error: (err) => {
        console.error('Failed to change password:', err);
        alert('Échec du changement de mot de passe.');
      }
    });
  }

  addReservation(form: NgForm): void {
    if (form.invalid) {
      this.markFormGroupTouched(form);
      alert('Veuillez remplir tous les champs du formulaire de recherche de vol.');
      return;
    }

    if (!this.loggedInClient || this.loggedInClient.idClient === undefined) {
      alert('Client non connecté. Veuillez vous connecter pour faire une réservation.');
      this.router.navigate(['/login']);
      return;
    }

    const selectedVoyage = this.voyages.find(
      v => v.departVoyage === this.searchCriteria.departureCity &&
        v.arriveVoyage === this.searchCriteria.arrivalCity &&
        v.dateVoyage === this.searchCriteria.travelDate
    );

    const selectedTypeBillet = this.typesBillet.find(
      tb => tb.libelleTypeBillet === this.searchCriteria.ticketType
    );

    if (!selectedVoyage) {
      alert('Voyage non trouvé pour les critères sélectionnés.');
      return;
    }
    if (!selectedTypeBillet) {
      alert('Type de billet non trouvé.');
      return;
    }

    // Calcul du montant total à payer
    const unitPrice = (selectedTypeBillet.prixTypeBillet || 0) + (selectedVoyage.prix || 0);
    this.paymentAmount = unitPrice * this.searchCriteria.numberOfSeats;
    this.paymentPhone = this.profile.telephone || '';

    // Stocker les infos pour le modal
    this.tempReservationData = {
      voyage: selectedVoyage,
      typeBillet: selectedTypeBillet,
      searchCriteria: { ...this.searchCriteria }
    };
    this.selectedPaymentMethod = this.paymentMethods[0];
    this.showPaymentModal = true;
  }

  // Quand l'utilisateur valide le paiement dans le modal
  onPaymentModalValidated(): void {
    const newReservation: ReservationDTO = {
      clientId: this.loggedInClient?.idClient || 0,
      voyageId: this.tempReservationData.voyage.idVoyage,
      typeBilletId: this.tempReservationData.typeBillet.idTypeBillet,
      nombrePlacesReservees: this.tempReservationData.searchCriteria.numberOfSeats || 1,
      dateReservation: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    
    this.reservationService.createReservation(newReservation).subscribe({
      next: (reservation) => {
        if (!reservation || !reservation.idReservation || reservation.idReservation === 0) {
          this.successMessage = "Erreur : la réservation n'a pas été créée correctement.";
          this.showSuccessModal = true;
          return;
        }
        this.showPaymentModal = false;
        this.tempReservationData = null;
        this.successMessage = "Votre réservation a bien été enregistrée et est en attente de validation.";
        this.showSuccessModal = true;
        this.loadClientReservations();
      },
      error: (err) => {
        this.successMessage = 'Erreur lors de la création de la réservation : ' + (err?.message || '');
        this.showSuccessModal = true;
      }
    });
  }

  searchFlights(form: NgForm): void {
    console.log('Search button clicked, but addReservation handles the logic now.');
  }

  viewBookingDetails(booking: Booking): void {
    alert(`Détails réservation: ${booking.idReservation}`);
  }

  cancelBooking(bookingId: string): void {
    if (confirm(`Êtes-vous sûr de vouloir annuler la réservation ${bookingId} ?`)) {
      this.reservationService.deleteReservation(+bookingId).subscribe({
        next: (response) => {
          console.log(`Reservation ${bookingId} canceled:`, response);
          alert(`Réservation ${bookingId} annulée.`);
          this.loadClientReservations();
        },
        error: (err) => {
          console.error(`Failed to cancel reservation ${bookingId}:`, err);
          alert(`Échec de l'annulation de la réservation ${bookingId}.`);
        }
      });
    }
  }

  // Méthodes pour le modal de paiement
  openPaymentModal(booking: Booking): void {
    this.selectedBookingForPayment = booking;
    this.showPaymentModal = true;
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
    this.selectedBookingForPayment = null;
  }

  getReservationIdForPayment(): number {
    if (!this.selectedBookingForPayment?.idReservation) {
      return 0;
    }

    const id = this.selectedBookingForPayment.idReservation;
    if (typeof id === 'string' && id.startsWith('temp-')) {
      return 0;
    }

    return typeof id === 'string' ? +id : id;
  }

  onPaymentSubmitted(paymentData: PaymentData): void {
    // Affiche le modal de confirmation animé
    this.showSuccessModal = true;
    this.successMessage = "Votre réservation a bien été enregistrée et est en attente de validation.";
    this.loadClientReservations();
  }

  printInvoice(invoice: Invoice): void {
    if (!this.invoiceTemplateForPrint) {
      alert('Erreur: Modèle de facture non trouvé.'); return;
    }
    const templateEl = this.invoiceTemplateForPrint.nativeElement;

    let itemsHtml = '';
    invoice.items.forEach(item => {
      itemsHtml += `<tr>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: left;">${item.description}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${item.unitPrice.toFixed(0)} FCFA</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${item.total.toFixed(0)} FCFA</td>
      </tr>`;
    });

    templateEl.innerHTML = `
      <div style="max-width: 800px; margin: auto; background-color: white; padding: 30px; font-family: Arial, sans-serif; line-height: 1.6;">
        <table style="width: 100%; margin-bottom: 30px;">
          <tr>
            <td style="width: 50%;">
              <h1 style="font-size: 24px; font-weight: bold; color: #333; margin:0;">Facture</h1>
              <p style="color: #555; margin-top: 4px;">#${invoice.invoiceId}</p>
            </td>
            <td style="width: 50%; text-align: right;">
              <p style="color: #555; margin:0;">ma djo laa</p>
              <p style="color: #555; margin:0;">Zanguera</p>
            </td>
          </tr>
        </table>
        <table style="width: 100%; margin-bottom: 30px;">
          <tr>
            <td style="width: 50%;">
              <h3 style="font-size: 16px; font-weight: bold; color: #333; margin-bottom:8px;">Facturé à</h3>
              <p style="color: #555; margin:0;">${invoice.clientName}</p>
            </td>
            <td style="width: 50%; text-align: right;">
              <p style="color: #555; margin:0;">Date: <span style="font-weight:bold;">${invoice.date}</span></p>
              <p style="color: #555; margin:0;">Réservation: <span style="font-weight:bold;">${invoice.reservationId}</span></p>
            </td>
          </tr>
        </table>
        <div style="margin-bottom: 30px;">
          <table style="min-width: 100%; border-collapse: collapse;">
            <thead style="background-color: #f8f8f8;"><tr>
              <th style="padding: 12px; border: 1px solid #ddd; text-align: left; font-size: 12px; font-weight: bold; color: #333; text-transform: uppercase;">Description</th>
              <th style="padding: 12px; border: 1px solid #ddd; text-align: center; font-size: 12px; font-weight: bold; color: #333; text-transform: uppercase;">Quantité</th>
              <th style="padding: 12px; border: 1px solid #ddd; text-align: right; font-size: 12px; font-weight: bold; color: #333; text-transform: uppercase;">Prix unitaire</th>
              <th style="padding: 12px; border: 1px solid #ddd; text-align: right; font-size: 12px; font-weight: bold; color: #333; text-transform: uppercase;">Total</th>
            </tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>
        </div>
        <table style="width: 100%;"><tr><td style="width:60%;"></td><td style="width:40%;">
          <table style="width: 100%;">
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333; border-top: 2px solid #ddd;">Total</td><td style="padding: 8px 0; text-align: right; font-weight: bold; color: #333; border-top: 2px solid #ddd;">${invoice.totalAmount.toFixed(0)} FCFA</td></tr>
          </table>
        </td></tr></table>
      </div>`;

    const style = document.createElement('style');
    style.textContent = `
      @media print {
        body * { visibility: hidden !important; }
        .print-section, .print-section * { visibility: visible !important; }
        .print-section { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; }
        @page { size: auto; margin: 20mm; } /* Added some margin for printing */
      }
    `;
    document.head.appendChild(style);
    templateEl.classList.remove('hidden');

    window.print();

    templateEl.classList.add('hidden');
    document.head.removeChild(style);
    templateEl.innerHTML = '<p>Invoice template content here...</p>';
  }

  generateAllInvoicesPDF(): void {
    alert('Génération PDF de toutes les factures (simulation). Imprimerait la première facture pour exemple.');
    if (this.invoices.length > 0) {
      this.printInvoice(this.invoices[0]);
    }
  }

  private markFormGroupTouched(formGroup: NgForm) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  private getStatusInfo(status: Booking['status'] | Invoice['status'] | Payment['status'] | string): { text: string, class: string } {
    switch (status) {
      case 'confirmed': return { text: 'Confirmé', class: 'bg-green-100 text-green-800' };
      case 'pending': return { text: 'En attente', class: 'bg-yellow-100 text-yellow-800' };
      case 'canceled': return { text: 'Annulé', class: 'bg-red-100 text-red-800' };
      case 'Payée': return { text: 'Payée', class: 'bg-green-100 text-green-800' };
      case 'En attente': return { text: 'En attente', class: 'bg-yellow-100 text-yellow-800' };
      case 'Remboursée': return { text: 'Remboursée', class: 'bg-blue-100 text-blue-800' };
      case 'Remboursé': return { text: 'Remboursé', class: 'bg-blue-100 text-blue-800' };
      default: return { text: status as string, class: 'bg-gray-100 text-gray-800' };
    }
  }
  private getTicketTypeText(type: Booking['typeBillet'] | string): string {
    switch (type) {
      case 'economy': return 'Économique';
      case 'business': return 'Affaires';
      case 'first': return 'Première';
      case 'Economie': return 'Économique'; // Handle backend value
      case 'Affaire': return 'Affaires'; // Handle backend value
      case 'Premiere': return 'Première'; // Handle backend value
      default: return type;
    }
  }

  generateInvoicesFromBookings(): void {
    this.invoices = this.bookings
      .filter(b => b.status === 'confirmed')
      .map((b) => {
        const unitPrice = ((b.price || 0) / (b.nombrePlacesReservees || 1));
        const items = [{
          description: `Voyage ${b.departVoyage} → ${b.arriveVoyage} (${b.typeBilletText})`,
          quantity: b.nombrePlacesReservees || 1,
          unitPrice: unitPrice,
          total: b.price
        }];
        return {
          invoiceId: b.idReservation, // Référence unique basée sur la réservation
          date: b.dateReservation,
          reservationId: b.idReservation,
          clientName: this.clientUserName,
          items,
          subTotal: b.price, // This can be considered the total amount now
          vat: 0, // Set VAT to 0
          totalAmount: b.price, // Total amount is now just the original price
          status: 'Payée',
          statusClass: 'bg-green-100 text-green-800'
        };
      });
  }
}
