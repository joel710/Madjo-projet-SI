// reservation.service.ts
// Ce service Angular est responsable de la gestion des réservations.
// Il gère la communication avec l'API backend pour toutes les opérations
// relatives aux réservations (créer, lire, mettre à jour, supprimer, etc.).

import { Injectable } from '@angular/core'; // Nécessaire pour marquer la classe comme un service injectable.
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http'; // Pour les requêtes HTTP et la gestion des paramètres/en-têtes.
import { Observable, throwError, of } from 'rxjs'; // Types et fonctions pour la programmation réactive (Observables).
import { catchError, map } from 'rxjs/operators'; // Opérateurs RxJS pour manipuler les Observables.

// ClientObjectDTO: DTO minimal pour représenter un client dans une réponse de réservation.
// Contient uniquement les informations essentielles du client.
export interface ClientObjectDTO {
  idClient: number; // Identifiant unique du client.
  nomClient?: string; // Nom du client (optionnel ici, dépend de ce que le backend retourne).
  prenomClient?: string; // Prénom du client (optionnel).
}

// VoyageObjectDTO: DTO minimal pour un voyage dans une réponse de réservation.
export interface VoyageObjectDTO {
  idVoyage: number; // Identifiant unique du voyage.
  departVoyage?: string; // Ville de départ (optionnel).
  arriveVoyage?: string; // Ville d'arrivée (optionnel).
  dateVoyage?: string; // Date du voyage (optionnel).
  prix?: number; // Prix du voyage (optionnel).
}

// TypeBilletObjectDTO: DTO minimal pour un type de billet dans une réponse de réservation.
export interface TypeBilletObjectDTO {
  idTypeBillet: number; // Identifiant unique du type de billet.
  libelleTypeBillet?: string; // Libellé du type de billet (ex: "Économie", "Affaires"). Optionnel.
  prixTypeBillet?: number; // Prix additionnel pour ce type de billet (optionnel).
}

// ReservationDTO: Interface principale pour les données de réservation.
// Elle est "révisée" pour distinguer les champs utilisés dans les requêtes (souvent des ID)
// et les champs potentiellement populés dans les réponses (objets imbriqués).
export interface ReservationDTO {
  idReservation?: number; // Identifiant unique de la réservation. Optionnel (ex: pour une nouvelle réservation non encore sauvegardée).
  dateReservation: string; // Date à laquelle la réservation a été faite. Format attendu: "yyyy-MM-dd". Requis.

  // Champs pour les requêtes (payloads de création/mise à jour) :
  // On utilise les IDs des entités liées (client, voyage, typeBillet) pour créer ou mettre à jour une réservation.
  clientId?: number | null; // ID du client qui fait la réservation. Peut être null.
  voyageId?: number | null; // ID du voyage concerné. Peut être null.
  typeBilletId?: number | null; // ID du type de billet choisi. Peut être null.
  nombrePlacesReservees?: number; // Nombre de places à réserver pour ce voyage.

  // Champs pour les réponses (données populées par le backend lors d'une lecture) :
  // Le backend peut retourner les objets complets (ou partiels via les ObjectDTOs) pour les entités liées.
  client?: ClientObjectDTO; // Détails du client associé.
  voyage?: VoyageObjectDTO; // Détails du voyage associé.
  typeBillet?: TypeBilletObjectDTO; // Détails du type de billet.
  status?: string; // Statut actuel de la réservation (ex: "PENDING", "CONFIRMED", "CANCELLED").
  // Ajouté pour les besoins du tableau de bord admin.
}

// Le décorateur @Injectable marque cette classe comme un service Angular.
@Injectable({
  // providedIn: 'root' : Cette configuration signifie que le service ReservationService
  // sera un singleton à l'échelle de l'application. Angular crée une seule instance
  // de ce service et la partage entre tous les composants et services qui en dépendent.
  // C'est la méthode recommandée pour la plupart des services.
  providedIn: 'root'
})
// Déclaration de la classe ReservationService.
// Le mot-clé 'export' permet à cette classe d'être importée et utilisée ailleurs dans l'application.
export class ReservationService {
  // private baseUrl = '/api/reservation';
  // URL de base pour toutes les requêtes HTTP concernant les réservations.
  // Le '/api' est une convention souvent utilisée avec un proxy de développement (proxy.conf.json)
  // pour rediriger ces appels vers le serveur backend réel, évitant ainsi les problèmes de CORS.
  private baseUrl = '/api/reservation'; // Commentaire original "Adjusted to use the proxy" conservé.

  // private httpOptions = { ... };
  // Un objet contenant les options HTTP par défaut pour certaines requêtes (notamment POST et PUT).
  // Ici, on définit l'en-tête 'Content-Type' à 'application/json', ce qui indique au serveur
  // que le corps de la requête est au format JSON.
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  // Le constructeur de la classe.
  // private http: HttpClient : C'est l'injection de dépendances. Angular injecte (fournit)
  // une instance du service HttpClient. Le modificateur 'private' crée automatiquement
  // une propriété 'http' dans cette classe, utilisable pour faire des appels réseau.
  constructor(private http: HttpClient) { }

  // createReservation(reservationData: ReservationDTO): Observable<ReservationDTO>
  // Crée une nouvelle réservation dans le système.
  // reservationData: ReservationDTO : Un objet contenant les informations nécessaires pour la nouvelle réservation.
  //                                   Seuls les IDs (clientId, voyageId, typeBilletId) et dateReservation,
  //                                   nombrePlacesReservees sont généralement nécessaires pour la création.
  // Retourne un Observable qui émettra la ReservationDTO de la réservation nouvellement créée,
  // y compris son idReservation assigné par le backend.
  createReservation(reservationData: ReservationDTO): Observable<ReservationDTO> {
    // Préparation du 'payload' (corps de la requête) envoyé au backend.
    // On s'assure ici que le payload correspond à ce que le backend attend pour une création.
    // On n'inclut que les champs pertinents pour la création.
    const payload: ReservationDTO = {
      dateReservation: reservationData.dateReservation,
      clientId: reservationData.clientId,
      voyageId: reservationData.voyageId,
      typeBilletId: reservationData.typeBilletId,
      nombrePlacesReservees: reservationData.nombrePlacesReservees
    };

    // L'idReservation ne devrait normalement pas être envoyé lors d'une création,
    // car il est généré par le backend. Ce bloc conditionnel est un peu inhabituel
    // pour une opération de création standard, mais il est conservé du code original.
    if (reservationData.idReservation) {
      payload.idReservation = reservationData.idReservation;
    }

    // Requête HTTP POST vers l'endpoint de création (baseUrl + '/create').
    // Le 'payload' est le corps de la requête.
    // 'httpOptions' spécifie le Content-Type JSON.
    // On s'attend à ce que le backend retourne la ReservationDTO complète de l'entité créée.
    return this.http.post<ReservationDTO>(`${this.baseUrl}/create`, payload, this.httpOptions)
      .pipe( // Utilisation de .pipe() pour enchaîner des opérateurs RxJS.
        // catchError intercepte les erreurs HTTP et les délègue à la méthode handleError.
        catchError(err => this.handleError(err, 'createReservation'))
      );
  }

  // getAllReservations(): Observable<ReservationDTO[]>
  // Récupère la liste de toutes les réservations.
  // Ne prend pas de paramètres.
  // Retourne un Observable qui émettra un tableau de ReservationDTO.
  // Inclut une logique de transformation (map) pour gérer les cas où l'API
  // pourrait retourner une réponse non conforme (ex: un objet vide {} au lieu d'un tableau []).
  getAllReservations(): Observable<ReservationDTO[]> {
    // Requête HTTP GET vers l'endpoint baseUrl + '/all'.
    // On utilise get<any> pour pouvoir inspecter la réponse avant de la caster en ReservationDTO[].
    // Cela permet une gestion plus robuste des formats de réponse inattendus de l'API.
    return this.http.get<any>(`${this.baseUrl}/all`)
      .pipe( // Enchaînement d'opérateurs RxJS.
        map((response: any) => { // L'opérateur 'map' transforme la réponse reçue.
          // Si la réponse est déjà un tableau, on la retourne directement, castée en ReservationDTO[].
          if (Array.isArray(response)) {
            return response as ReservationDTO[];
          }
          // Si la réponse est null ou n'est pas un objet (ce qui inclut les types primitifs),
          // c'est un format inattendu pour une liste. On logue un avertissement et on retourne un tableau vide.
          if (response === null || typeof response !== 'object') {
            console.warn(`API returned null or non-object/non-array response for GET ${this.baseUrl}/all. Response: `, response, `. Transforming to []. Consider fixing the API.`);
            return [] as ReservationDTO[];
          }
          // Si la réponse est un objet vide {} (parfois retourné par certaines APIs pour une liste vide).
          // On logue un avertissement et on transforme cela en un tableau vide.
          if (Object.keys(response).length === 0) {
            console.warn(`API returned an empty object {} for GET ${this.baseUrl}/all. Transforming to []. Consider fixing the API.`);
            return [] as ReservationDTO[];
          }
          // Si c'est un objet non vide mais pas un tableau, c'est également inattendu pour une liste.
          // On logue un avertissement et on retourne un tableau vide par sécurité.
          console.warn(`Unexpected response type for GET ${this.baseUrl}/all. Expected ReservationDTO[] or an empty object, got:`, response, `. Transforming to [].`);
          return [] as ReservationDTO[];
        }),
        // Gestion des erreurs HTTP via la méthode handleError.
        catchError(err => this.handleError(err, 'getAllReservations'))
      );
  }

  // updateReservation(reservationData: ReservationDTO): Observable<ReservationDTO>
  // Met à jour une réservation existante.
  // reservationData: ReservationDTO : Les données de la réservation à mettre à jour. Doit contenir idReservation.
  // Retourne un Observable qui émettra la ReservationDTO mise à jour.
  //
  // ATTENTION : Cette méthode utilise une requête HTTP GET avec un corps (body),
  // ce qui est TRES INHABITUEL et non standard selon les spécifications HTTP.
  // Normalement, les mises à jour se font avec PUT ou PATCH.
  // Cette implémentation suit une documentation d'API qui spécifie GET /update avec un corps JSON.
  updateReservation(reservationData: ReservationDTO): Observable<ReservationDTO> {
    // Vérification préliminaire : idReservation est indispensable pour une mise à jour.
    if (!reservationData.idReservation) {
      // Si l'ID est manquant, on retourne un Observable qui émet immédiatement une erreur.
      // Cela évite de faire un appel HTTP inutile.
      return throwError(() => new Error('L\'ID de la réservation est requis pour la mise à jour.'));
    }

    // Préparation du 'payload' (corps de la requête).
    // Le backend s'attend ici à des objets imbriqués pour client, voyage, et typeBillet,
    // chacun contenant l'ID respectif.
    const payload: any = {
      idReservation: reservationData.idReservation,
      dateReservation: reservationData.dateReservation,
      client: { idClient: reservationData.clientId },
      voyage: { idVoyage: reservationData.voyageId },
      typeBillet: { idTypeBillet: reservationData.typeBilletId }
      // Si nombrePlacesReservees doit être mis à jour, il faudrait l'ajouter ici aussi.
      // payload.nombrePlacesReservees = reservationData.nombrePlacesReservees;
    };

    // Explication de la démarche non standard :
    // La méthode standard this.http.get() ne permet pas d'envoyer un corps de requête.
    // Pour se conformer à une API qui attendrait un corps sur une requête GET (ce qui est une mauvaise pratique de l'API),
    // on doit utiliser la méthode générique this.http.request().
    // this.http.request<ReservationDTO>('GET', ...) :
    //   - Le premier argument est la méthode HTTP (ici, 'GET').
    //   - Le deuxième est l'URL de l'endpoint.
    //   - Le troisième est un objet d'options où l'on peut spécifier 'body' et 'headers'.
    console.warn('Tentative de mise à jour via GET avec un corps de requête, ce qui est non standard. Si cela échoue, l\'API /update devrait être revue (idéalement utiliser PUT ou POST).');

    return this.http.request<ReservationDTO>('GET', `${this.baseUrl}/update`, {
      body: payload, // Le corps de la requête.
      headers: this.httpOptions.headers // Les en-têtes (ex: Content-Type).
    }).pipe( // Enchaînement d'opérateurs RxJS.
      // Gestion des erreurs via la méthode handleError.
      catchError(err => this.handleError(err, 'updateReservation'))
    );
  }

  // deleteReservation(id: number): Observable<boolean>
  // Supprime une réservation spécifique par son ID.
  // id: number : L'identifiant unique de la réservation à supprimer.
  // Retourne un Observable qui émettra un booléen 'true' si la suppression est réussie,
  // ou une erreur en cas d'échec. Le type de retour exact (boolean, void, etc.) dépend de l'API.
  deleteReservation(id: number): Observable<boolean> {
    // Requête HTTP DELETE vers l'URL : baseUrl + /delete/ + id.
    // httpOptions est inclus, bien que souvent non requis pour les requêtes DELETE simples.
    return this.http.delete<boolean>(`${this.baseUrl}/delete/${id}`, this.httpOptions)
      .pipe( // Enchaînement d'opérateurs RxJS.
        // Gestion des erreurs via la méthode handleError.
        catchError(err => this.handleError(err, 'deleteReservation'))
      );
  }

  // updateReservationStatus(idReservation: number, status: string): Observable<ReservationDTO>
  // Met à jour le statut d'une réservation spécifique (par exemple, de "PENDING" à "CONFIRMED" ou "CANCELLED").
  // idReservation: number : L'ID de la réservation dont le statut doit être mis à jour.
  // status: string : Le nouveau statut à appliquer à la réservation.
  // Retourne un Observable qui émettra la ReservationDTO mise à jour avec le nouveau statut.
  updateReservationStatus(idReservation: number, status: string): Observable<ReservationDTO> {
    // Vérification simple pour s'assurer que l'idReservation est bien fourni.
    if (!idReservation) {
      // Si l'ID est manquant, on retourne un Observable qui émet immédiatement une erreur.
      return throwError(() => new Error('L\'ID de la réservation est requis pour la mise à jour du statut.'));
    }
    // Construction de l'URL spécifique pour la mise à jour du statut : baseUrl + /{idReservation}/status.
    const url = `${this.baseUrl}/${idReservation}/status`;
    // Le corps de la requête (payload) contient uniquement le nouveau statut.
    // Le backend s'attend à un objet JSON comme { "status": "NOUVEAU_STATUT" }.
    const body = { status: status };

    // Requête HTTP PUT vers l'URL construite.
    // PUT est souvent utilisé pour des mises à jour complètes ou partielles d'une ressource.
    // Ici, on met à jour une sous-partie (le statut) de la ressource réservation.
    return this.http.put<ReservationDTO>(url, body, this.httpOptions)
      .pipe( // Enchaînement d'opérateurs RxJS.
        // Gestion des erreurs via la méthode handleError.
        catchError(err => this.handleError(err, 'updateReservationStatus'))
      );
  }

  // private handleError(...)
  // Méthode privée et générique pour la gestion centralisée des erreurs survenant lors des requêtes HTTP.
  // Cette méthode est similaire à celles utilisées dans d'autres services (AgentService, ClientService).
  // error: HttpErrorResponse : L'objet d'erreur fourni par HttpClient.
  // methodName: string : Le nom de la méthode du service où l'erreur a été interceptée (utile pour le logging).
  // Retourne un Observable qui émet une erreur (via throwError de RxJS), permettant au code appelant
  // de réagir à l'erreur (par exemple, afficher un message à l'utilisateur).
  private handleError(error: HttpErrorResponse, methodName: string = 'reservationOperation'): Observable<any> {
    // Vérifie s'il s'agit d'une erreur côté client (ex: problème de réseau) ou d'une erreur du backend.
    if (error.error instanceof ErrorEvent) {
      // Erreur de type client-side ou réseau.
      console.error(`Client-side/network error in ${methodName}:`, error.error.message);
      return throwError(() => new Error(`Network error during ${methodName} in Reservation API; please check connection.`));
    } else {
      // Le backend a retourné un code d'erreur (4xx ou 5xx).
      // error.status contient le code HTTP et error.error le corps de la réponse d'erreur.
      console.error(`Backend error in ${methodName} (Reservation API): returned code ${error.status}, body was: ${JSON.stringify(error.error)}`);
      // Tente de récupérer un message d'erreur plus explicite depuis la réponse du backend.
      const errorMsg = error.error?.message || error.statusText || `Something bad happened with Reservation API during ${methodName}; please try again later.`;
      return throwError(() => new Error(errorMsg));
    }
    // Note: La gestion spécifique des erreurs 200 OK avec corps vide, présente dans d'autres services,
    // n'est pas implémentée ici. Cela suppose que l'API de réservation ne présente pas ce comportement
    // ou que de telles réponses seraient gérées différemment si elles se produisaient.
  }
}
