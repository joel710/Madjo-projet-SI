// voyage.service.ts
// Ce service Angular est responsable de la gestion des données des voyages.
// Il encapsule la logique de communication avec l'API backend pour toutes les opérations
// CRUD (Create, Read, Update, Delete) relatives aux voyages.

import { Injectable } from '@angular/core'; // Importe le décorateur Injectable pour marquer la classe comme un service.
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http'; // Modules HttpClient pour effectuer des requêtes HTTP et gérer les erreurs.
import { Observable, throwError, of } from 'rxjs'; // Éléments de RxJS pour la programmation réactive (Observables, gestion d'erreurs).
import { catchError, map } from 'rxjs/operators'; // Opérateurs RxJS pour manipuler les flux de données Observables (ex: intercepter les erreurs, transformer les données).

// Interface VoyageDTO (Data Transfer Object)
// Un DTO est un objet simple utilisé pour transférer des données structurées.
// Cette interface définit la "forme" des données d'un voyage.
// Le commentaire original indique qu'elle est basée sur VoyageData du modal et l'entité VOYAGE du backend.
export interface VoyageDTO {
  idVoyage?: number; // Identifiant unique du voyage. Optionnel car un voyage non encore créé n'a pas d'ID.
  departVoyage: string; // Lieu de départ du voyage (ex: nom de ville, aéroport). Requis.
  arriveVoyage: string; // Lieu d'arrivée du voyage. Requis.
  heureDepart?: string; // Heure de départ prévue (format attendu: HH:mm). Optionnel.
  heureArrivee?: string; // Heure d'arrivée prévue (format attendu: HH:mm). Optionnel.
  dateVoyage: string; // Date du voyage. Le commentaire précise "Expected as yyyy-MM-dd string for API". Requis.
  prix?: number; // Prix du voyage. Optionnel.
  placesDisponibles?: number; // Nombre de places disponibles pour ce voyage. Optionnel.
}

// Interface VoyageObjectDTO
// Semble être une autre représentation d'un voyage, peut-être pour des contextes spécifiques
// où seule une partie des informations est nécessaire ou pour des objets imbriqués.
// Pour ce service, VoyageDTO est principalement utilisé dans les signatures de méthodes.
export interface VoyageObjectDTO {
  idVoyage: number; // Identifiant unique du voyage. Requis.
  departVoyage?: string; // Lieu de départ. Optionnel.
  arriveVoyage?: string; // Lieu d'arrivée. Optionnel.
  dateVoyage?: string; // Date du voyage. Optionnel.
  prix?: number; // Prix. Optionnel.
  heureDepart?: string; // Heure de départ. Optionnel.
  heureArrivee?: string; // Heure d'arrivée. Optionnel.
}

// Le décorateur @Injectable marque cette classe comme un service qui peut être injecté
// ailleurs dans l'application (composants, autres services).
@Injectable({
  // providedIn: 'root' : Cette option de configuration signifie que le service VoyageService
  // sera fourni au niveau racine de l'application. Angular créera une seule instance (singleton)
  // de ce service, qui sera partagée et accessible par tous les composants et services
  // qui en ont besoin via l'injection de dépendances.
  providedIn: 'root'
})
// Déclaration de la classe VoyageService.
// Le mot-clé 'export' permet à cette classe d'être importée et utilisée dans d'autres parties de l'application.
export class VoyageService {
  // private baseUrl = '/api/voyage';
  // L'URL de base pour toutes les requêtes HTTP liées aux voyages.
  // Utiliser '/api' au début est une convention courante lorsque l'application Angular
  // utilise un proxy (configuré dans proxy.conf.json par exemple) pour rediriger
  // les appels API vers le serveur backend, surtout en environnement de développement
  // pour éviter les problèmes de CORS (Cross-Origin Resource Sharing).
  private baseUrl = '/api/voyage';

  // private httpOptions = { ... };
  // Un objet qui configure les en-têtes HTTP par défaut pour les requêtes,
  // particulièrement celles qui envoient des données au serveur (POST, PUT).
  private httpOptions = {
    headers: new HttpHeaders({
      // 'Content-Type': 'application/json' : Cet en-tête informe le serveur que
      // le corps de la requête est au format JSON.
      'Content-Type': 'application/json'
    })
  };

  // Le constructeur de la classe.
  // private http: HttpClient : C'est un exemple d'injection de dépendances.
  // Angular injecte une instance du service HttpClient (qui fait partie de @angular/common/http).
  // Le modificateur 'private' crée automatiquement une propriété 'http' dans cette classe.
  // Cette propriété 'http' sera utilisée pour effectuer les appels réseau (GET, POST, etc.).
  constructor(private http: HttpClient) { }

  // createVoyage(voyageData: VoyageDTO): Observable<VoyageDTO>
  // Envoie une requête au backend pour créer un nouveau voyage.
  // voyageData: VoyageDTO : Un objet contenant les informations du voyage à créer.
  //                         L'idVoyage n'est généralement pas fourni ici car il est auto-généré par le backend.
  // Retourne un Observable qui émettra le VoyageDTO du voyage nouvellement créé si la requête réussit.
  // Le commentaire original "Assuming response is VoyageDTO, API doc says VOYAGE or VoyageDTO"
  // indique une possible ambiguïté dans la documentation de l'API concernant le type exact retourné;
  // nous utilisons VoyageDTO ici pour la cohérence du frontend.
  createVoyage(voyageData: VoyageDTO): Observable<VoyageDTO> {
    // Effectue une requête HTTP POST à l'URL : baseUrl + '/create'.
    // voyageData est envoyé comme corps (payload) de la requête.
    // this.httpOptions (contenant 'Content-Type': 'application/json') sont utilisées.
    // On s'attend à ce que le backend retourne un objet de type VoyageDTO.
    return this.http.post<VoyageDTO>(`${this.baseUrl}/create`, voyageData, this.httpOptions)
      .pipe( // Utilisation de .pipe() pour enchaîner des opérateurs RxJS.
        // catchError intercepte les erreurs HTTP et les délègue à notre méthode handleError.
        // 'createVoyage' est passé comme contexte pour identifier l'origine de l'erreur.
        catchError(err => this.handleError(err, 'createVoyage'))
      );
  }

  // getAllVoyages(): Observable<VoyageDTO[]>
  // Récupère la liste de tous les voyages disponibles depuis le backend.
  // Ne prend aucun paramètre.
  // Retourne un Observable qui émettra un tableau d'objets VoyageDTO.
  // Cette méthode inclut une logique de transformation (avec l'opérateur 'map')
  // pour gérer des cas où l'API pourrait retourner des formats de réponse inattendus
  // (par exemple, un objet vide {} ou null au lieu d'un tableau vide []).
  getAllVoyages(): Observable<VoyageDTO[]> {
    // Effectue une requête HTTP GET à l'URL : baseUrl + '/getAll'.
    // Le type de retour de http.get est <any[]> pour permettre une inspection flexible
    // de la réponse dans l'opérateur 'map' avant de la caster en VoyageDTO[].
    return this.http.get<any[]>(`${this.baseUrl}/getAll`)
      .pipe( // Enchaînement d'opérateurs RxJS.
        map((response: any) => { // L'opérateur 'map' transforme la réponse brute du serveur.
          // Cas 1: La réponse est déjà un tableau. C'est le format attendu.
          // On la caste explicitement en VoyageDTO[] et on la retourne.
          if (Array.isArray(response)) {
            return response as VoyageDTO[];
          }
          // Cas 2: La réponse est null ou n'est pas un objet (ex: une chaîne, un nombre).
          // Ce n'est pas un format attendu pour une liste de voyages.
          if (response === null || typeof response !== 'object') {
            console.warn(`API returned null or non-object/non-array response for GET ${this.baseUrl}/getAll. Response: `, response, `. Transforming to []. Consider fixing the API.`);
            return [] as VoyageDTO[]; // On retourne un tableau vide par défaut pour éviter des erreurs.
          }
          // Cas 3: La réponse est un objet vide {} (certaines APIs peuvent retourner cela pour une liste vide).
          // On le traite comme une liste vide pour la cohérence du frontend.
          if (Object.keys(response).length === 0) {
            console.warn(`API returned an empty object {} for GET ${this.baseUrl}/getAll. Transforming to []. Consider fixing the API.`);
            return [] as VoyageDTO[]; // Transformation en tableau vide.
          }
          // Cas 4: La réponse est un objet non vide, mais n'est pas un tableau.
          // C'est une réponse inattendue pour une méthode censée retourner une liste.
          console.warn(`Unexpected response type for GET ${this.baseUrl}/getAll. Expected VoyageDTO[] or an empty object, got:`, response, `. Transforming to [].`);
          return [] as VoyageDTO[]; // On retourne un tableau vide par mesure de sécurité.
        }),
        // Gestion des erreurs HTTP via la méthode handleError.
        // 'getAllVoyages' est passé comme contexte pour aider au débogage.
        catchError(err => this.handleError(err, 'getAllVoyages'))
      );
  }

  // getVoyageById(idVoyage: number): Observable<VoyageDTO | null>
  // Récupère un voyage spécifique par son identifiant (idVoyage).
  // idVoyage: number : L'ID du voyage à récupérer.
  // Retourne un Observable qui émettra soit un objet VoyageDTO si le voyage est trouvé,
  // soit 'null' si le voyage n'est pas trouvé ou si la réponse de l'API est inattendue
  // (par exemple, un objet vide {} au lieu d'un 404 ou du DTO).
  getVoyageById(idVoyage: number): Observable<VoyageDTO | null> {
    // Requête HTTP GET vers l'URL : baseUrl + /get/ + idVoyage.
    // On utilise <any> pour le type de la réponse afin de permettre une inspection
    // plus fine dans l'opérateur 'map'.
    return this.http.get<any>(`${this.baseUrl}/get/${idVoyage}`)
      .pipe( // Enchaînement d'opérateurs RxJS.
        map((response: any) => { // L'opérateur 'map' permet de transformer la réponse brute.
          // Cas 1: La réponse est un objet vide {}.
          // Certaines APIs peuvent retourner cela avec un statut 200 OK si la ressource n'est pas trouvée,
          // bien qu'un statut 404 serait plus approprié.
          // On logue un avertissement et on interprète cela comme "non trouvé" en retournant null.
          if (response && typeof response === 'object' && Object.keys(response).length === 0) {
            console.warn(`API returned {} for GET ${this.baseUrl}/get/${idVoyage}. Transforming to null. Consider fixing the API to return 404.`);
            return null;
          }
          // Cas 2: La réponse est un objet et possède la propriété 'idVoyage'.
          // C'est une vérification basique pour s'assurer que l'objet ressemble à un VoyageDTO.
          if (response && typeof response === 'object' && response.idVoyage !== undefined) {
            return response as VoyageDTO; // On caste la réponse en VoyageDTO.
          }
          // Cas 3: L'API retourne explicitement 'null' (avec un statut 200 OK).
          if (response === null) {
            return null;
          }
          // Cas 4: La réponse est dans un format totalement inattendu.
          // Elle n'est ni un objet vide, ni un VoyageDTO identifiable, ni null.
          console.warn(`Unexpected response type for GET ${this.baseUrl}/get/${idVoyage}. Expected VoyageDTO or empty {}, got:`, response);
          return null; // On retourne 'null' par sécurité.
        }),
        // Gestion des erreurs HTTP via la méthode handleError.
        // 'getVoyageById' est fourni comme contexte.
        catchError(err => this.handleError(err, 'getVoyageById'))
      );
  }

  // updateVoyage(idVoyage: number, voyageData: VoyageDTO): Observable<VoyageDTO>
  // Met à jour les informations d'un voyage existant sur le serveur.
  // idVoyage: number : L'identifiant unique du voyage à mettre à jour. Ce paramètre est utilisé dans l'URL de l'endpoint.
  // voyageData: VoyageDTO : Un objet contenant les nouvelles données pour le voyage.
  //                         L'idVoyage à l'intérieur de cet objet devrait correspondre à celui dans l'URL.
  // Retourne un Observable qui, en cas de succès, émettra le VoyageDTO mis à jour (tel que retourné par le backend).
  // Le commentaire original "Assuming response is VoyageDTO" est pertinent.
  updateVoyage(idVoyage: number, voyageData: VoyageDTO): Observable<VoyageDTO> {
    // Requête HTTP PUT vers l'URL : baseUrl + /update/ + idVoyage.
    // Le verbe PUT est typiquement utilisé pour remplacer intégralement une ressource existante.
    // voyageData est envoyé comme corps (payload) de la requête.
    // httpOptions (avec Content-Type: application/json) sont appliquées.
    // On s'attend à ce que le backend retourne un objet VoyageDTO représentant l'entité mise à jour.
    return this.http.put<VoyageDTO>(`${this.baseUrl}/update/${idVoyage}`, voyageData, this.httpOptions)
      .pipe( // Enchaînement d'opérateurs RxJS.
        // Gestion des erreurs via la méthode handleError, avec 'updateVoyage' comme contexte.
        catchError(err => this.handleError(err, 'updateVoyage'))
      );
  }

  // deleteVoyage(idVoyage: number): Observable<any>
  // Supprime un voyage existant, identifié par son idVoyage.
  // idVoyage: number : L'identifiant unique du voyage à supprimer.
  // Retourne un Observable<any> car la réponse du backend pour une opération DELETE
  // peut varier (parfois aucun contenu, parfois un message de succès, parfois un booléen).
  // Le type 'any' offre de la flexibilité pour gérer ces différents cas.
  // Il est courant qu'une suppression réussie retourne un statut HTTP 204 (No Content).
  deleteVoyage(idVoyage: number): Observable<any> {
    // Requête HTTP DELETE vers l'URL : baseUrl + /delete/ + idVoyage.
    // httpOptions est inclus, bien que souvent non critique pour les requêtes DELETE simples
    // (sauf si des en-têtes spécifiques comme l'authentification sont requis).
    return this.http.delete<any>(`${this.baseUrl}/delete/${idVoyage}`, this.httpOptions)
      .pipe( // Enchaînement d'opérateurs RxJS.
        // Gestion des erreurs via la méthode handleError, avec 'deleteVoyage' comme contexte.
        catchError(err => this.handleError(err, 'deleteVoyage'))
      );
  }

  // private handleError(...)
  // Méthode privée pour la gestion centralisée des erreurs HTTP survenant dans ce service.
  // error: HttpErrorResponse : L'objet d'erreur fourni par HttpClient, contenant des détails sur l'échec.
  // methodName: string : Nom de la méthode du service où l'erreur a été interceptée (pour le logging et le contexte).
  // Retourne un Observable qui propage une erreur (via throwError de RxJS).
  // Ceci permet au code qui a appelé la méthode du service (par exemple, un composant)
  // de recevoir l'erreur et de la gérer de manière appropriée (ex: afficher un message à l'utilisateur).
  private handleError(error: HttpErrorResponse, methodName: string = 'voyageOperation'): Observable<any> {
    // Cas spécifique : l'API retourne un statut 200 OK mais avec un corps de réponse vide {} (objet vide).
    // Cela peut arriver si l'API est mal conçue et ne retourne pas, par exemple, un 404 pour "non trouvé"
    // ou un tableau vide [] pour une liste vide, mais plutôt un objet vide avec un statut de succès.
    if (error.status === 200 && error.error && typeof error.error === 'object' && Object.keys(error.error).length === 0) {
      console.warn(`Backend returned 200 OK with an empty object for ${methodName}. Returning appropriate default empty value.`);
      // Selon la méthode d'origine, on retourne une valeur par défaut "vide" appropriée sous forme d'Observable.
      if (methodName === 'getVoyageById') {
        return of(null); // Pour une recherche par ID, null signifie "non trouvé".
      } else {
        return of([]); // Pour une liste (ex: getAllVoyages), un tableau vide.
      }
    } else {
      // Gestion des erreurs "standard".
      if (error.error instanceof ErrorEvent) {
        // Erreur côté client ou erreur réseau (ex: pas de connexion, DNS inaccessible).
        // error.error.message contient le message d'erreur de l'événement.
        console.error(`Client-side/network error in ${methodName}:`, error.error.message);
        return throwError(() => new Error(`Network error during ${methodName} in Voyage API; please check connection.`));
      } else {
        // Le backend a retourné un code d'erreur HTTP (ex: 400, 401, 403, 404, 500).
        // error.status contient le code de statut.
        // error.error peut contenir le corps de la réponse d'erreur du backend, donnant des détails.
        console.error(`Backend error in ${methodName} (Voyage API): returned code ${error.status}, body was: ${JSON.stringify(error.error)}`);
        // On propage une nouvelle erreur avec un message destiné à l'utilisateur.
        return throwError(() => new Error(`Something bad happened with Voyage API during ${methodName}; please try again later.`));
      }
    }
  }
}
