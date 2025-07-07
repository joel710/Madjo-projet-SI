import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReservationService, ReservationDTO } from '../services/reservation.service'; // Adjust path if needed
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ClientService, ClientDTO } from '../services/client.service';
import { VoyageService, VoyageDTO } from '../services/voyage.service';
import { TypeBilletService, TypeBilletDTO } from '../services/type-billet.service';

@Component({
  selector: 'app-agent-dashboard-page',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './agent-dashboard-page.html',
  styleUrls: ['./agent-dashboard-page.css'],
  providers: [DatePipe]
})
export class AgentDashboardPageComponent implements OnInit {
  reservations: ReservationDTO[] = [];
  clients: ClientDTO[] = [];
  voyages: VoyageDTO[] = [];
  typesBillet: TypeBilletDTO[] = [];
  isLoading = true;
  isProcessingAction: { [key: string]: boolean } = {}; // Changed key to string to match idReservation type from DTO if it's string

  constructor(
    private reservationService: ReservationService,
    private clientService: ClientService,
    private voyageService: VoyageService,
    private typeBilletService: TypeBilletService
  ) { }

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.isLoading = true;
    Promise.all([
      this.clientService.getAllClients().toPromise(),
      this.voyageService.getAllVoyages().toPromise(),
      this.typeBilletService.getAllTypesBillet().toPromise(),
      this.reservationService.getAllReservations().toPromise()
    ]).then(([clients, voyages, typesBillet, reservations]) => {
      this.clients = clients ?? [];
      this.voyages = voyages ?? [];
      this.typesBillet = typesBillet ?? [];
      this.reservations = reservations as ReservationDTO[];
        this.isLoading = false;
    }).catch(err => {
      console.error('Erreur lors du chargement des données:', err);
      this.showNotification('Erreur lors du chargement des données.', true);
        this.isLoading = false;
    });
  }

  getStatusClass(status?: string): string {
    if (status === 'CONFIRMED') {
      return 'bg-green-100 text-green-800';
    } else if (status === 'CANCELLED') {
      return 'bg-red-100 text-red-800';
    } else if (status === 'PENDING') {
      return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-gray-100 text-gray-800';
  }

  confirmReservation(idReservation: number): void {
    if (!idReservation) return; // Guard against undefined ID

    this.isProcessingAction[idReservation.toString()] = true;
    // Assuming updateReservationStatus will be added to ReservationService
    // and will take (id: number, status: string)
    this.reservationService.updateReservationStatus(idReservation, 'CONFIRMED').subscribe({
      next: (updatedReservation: ReservationDTO) => {
        this.updateReservationInList(updatedReservation);
        this.showNotification(`Réservation ${idReservation} confirmée avec succès.`);
        this.isProcessingAction[idReservation.toString()] = false;
      },
      error: (err: any) => {
        console.error('Error confirming reservation:', err);
        this.showNotification(`Erreur lors de la confirmation de la réservation ${idReservation}.`, true);
        this.isProcessingAction[idReservation.toString()] = false;
      }
    });
  }

  cancelReservation(idReservation: number): void {
    if (!idReservation) return; // Guard against undefined ID

    this.isProcessingAction[idReservation.toString()] = true;
    // Assuming updateReservationStatus will be added to ReservationService
    this.reservationService.updateReservationStatus(idReservation, 'CANCELLED').subscribe({
      next: (updatedReservation: ReservationDTO) => {
        this.updateReservationInList(updatedReservation);
        this.showNotification(`Réservation ${idReservation} annulée.`);
        this.isProcessingAction[idReservation.toString()] = false;
      },
      error: (err: any) => {
        console.error('Error cancelling reservation:', err);
        this.showNotification(`Erreur lors de l'annulation de la réservation ${idReservation}.`, true);
        this.isProcessingAction[idReservation.toString()] = false;
      }
    });
  }

  private updateReservationInList(updatedReservation: ReservationDTO): void {
    const index = this.reservations.findIndex(r => r.idReservation === updatedReservation.idReservation);
    if (index !== -1) {
      this.reservations[index] = updatedReservation;
      // Trigger change detection if needed, or re-sort
      this.reservations = [...this.reservations].sort((a, b) => {
        const dateA = a.dateReservation ? new Date(a.dateReservation).getTime() : 0;
        const dateB = b.dateReservation ? new Date(b.dateReservation).getTime() : 0;
        const dateComparison = dateB - dateA;
        if (dateComparison !== 0) return dateComparison;
        if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
        if (b.status === 'PENDING' && a.status !== 'PENDING') return 1;
        return 0;
      });
    } else {
      this.loadAllData(); // Fallback to reload all if not found, though it should be.
    }
  }

  showNotification(message: string, isError: boolean = false): void {
    const notificationElement = document.getElementById(isError ? 'agentErrorNotification' : 'agentNotification');
    const messageElement = document.getElementById(isError ? 'agentErrorNotificationMessage' : 'agentNotificationMessage');

    if (notificationElement && messageElement) {
      messageElement.textContent = message;
      notificationElement.classList.remove('hidden');
      setTimeout(() => {
        notificationElement.classList.add('hidden');
      }, 3000);
    } else {
      console.log('Notification elements not found. Message:', message);
    }
  }

  deleteReservation(idReservation: number): void {
    if (!idReservation) return;
    this.isProcessingAction[idReservation.toString()] = true;
    this.reservationService.deleteReservation(idReservation).subscribe({
      next: () => {
        this.reservations = this.reservations.filter(r => r.idReservation !== idReservation);
        this.showNotification(`Réservation ${idReservation} supprimée.`);
        this.isProcessingAction[idReservation.toString()] = false;
      },
      error: (err: any) => {
        console.error('Erreur lors de la suppression de la réservation:', err);
        this.showNotification(`Erreur lors de la suppression de la réservation ${idReservation}.`, true);
        this.isProcessingAction[idReservation.toString()] = false;
      }
    });
  }

  logout(): void {
    localStorage.removeItem('loggedInAgentId');
    window.location.href = '/login';
  }

  getClientName(reservation: ReservationDTO): string {
    return reservation.client?.prenomClient && reservation.client?.nomClient
      ? reservation.client.prenomClient + ' ' + reservation.client.nomClient
      : 'N/A';
  }

  getVoyageLabel(reservation: ReservationDTO): string {
    return reservation.voyage?.departVoyage && reservation.voyage?.arriveVoyage
      ? reservation.voyage.departVoyage + ' - ' + reservation.voyage.arriveVoyage
      : 'N/A';
  }

  getTypeBilletLabel(reservation: ReservationDTO): string {
    return reservation.typeBillet?.libelleTypeBillet || 'N/A';
  }
}
