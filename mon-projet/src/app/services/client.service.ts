// client.service.ts
// Ce fichier définit un service Angular, ClientService, dédié à la gestion
// des données des clients. Il s'occupe de toutes les communications avec le backend
// (l'API) concernant les clients : création, lecture, mise à jour, suppression (CRUD),
// ainsi que la connexion et la recherche de clients.

// Importation des modules et classes nécessaires depuis Angular et RxJS.
import { Injectable } from '@angular/core'; // Permet de marquer la classe comme un service injectable.
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http'; // Pour faire des requêtes HTTP.
import { Observable, throwError, of } from 'rxjs'; // Pour la programmation réactive et la gestion des flux de données asynchrones.
import { catchError, map } from 'rxjs/operators'; // Opérateurs RxJS pour manipuler les Observables (gestion d'erreur, transformation de données).

// Interface ClientDTO (Data Transfer Object)
// Utilisée principalement pour les données reçues du backend (GET) ou pour les mises à jour (PUT).
// Un DTO est un objet simple qui sert à transférer des données.
export interface ClientDTO {
  idClient?: number; // ID du client, optionnel car non présent avant la création.
  nomClient: string; // Nom de famille du client.
  prenomClient: string; // Prénom du client.
  dateNaiss: string; // Date de naissance. Le commentaire original indique un format dd/mm/yyyy pour la création.
                     // Il est important de s'assurer de la cohérence du format attendu par le backend.
  mailClient: string; // Adresse e-mail du client.
  telClient: string; // Numéro de téléphone du client.
  sexeClient: 'Homme' | 'Femme' | 'Autre' | ''; // Sexe du client, avec des valeurs contraintes.
  login: string; // Identifiant de connexion du client.
  password?: string; // Mot de passe. Optionnel ici, car souvent non retourné dans les listes de clients.
}

// Interface Client
// Potentiellement utilisée pour la création (POST) d'un client.
// Peut avoir des contraintes différentes de ClientDTO, par exemple, le mot de passe peut être requis.
// Le commentaire original indique que POST /create attend un objet CLIENT.
export interface Client {
  idClient?: number; // ID du client.
  nomClient: string; // Nom de famille.
  prenomClient: string; // Prénom.
  dateNaiss: string; // Date de naissance. Le commentaire original indique un format yyyy-MM-dd pour l'API.
                     // La cohérence des formats de date entre frontend et backend est cruciale.
  mailClient: string; // Email.
  telClient: string; // Téléphone.
  sexeClient: 'Homme' | 'Femme' | 'Autre' | ''; // Sexe.
  login: string; // Login.
  password?: string; // Mot de passe, potentiellement requis pour la création.
}

// Interface LoginRequest
// Définit la structure des données pour une requête de connexion.
export interface LoginRequest {
  login: string; // Login de l'utilisateur (email ou nom d'utilisateur).
  password: string; // Mot de passe.
}

// Le décorateur @Injectable rend cette classe disponible pour l'injection de dépendances.
@Injectable({
  // providedIn: 'root' signifie que ce service est un singleton disponible
  // dans toute l'application sans avoir à l'ajouter aux providers d'un module spécifique.
  providedIn: 'root'
})
export class ClientService {
  // private baseUrl = '/api/client';
  // URL de base pour toutes les requêtes HTTP vers l'API des clients.
  // Le '/api' est souvent géré par un proxy en développement pour éviter les soucis de CORS.
  private baseUrl = '/api/client';

  // private httpOptions = { ... };
  // Options HTTP globales pour les requêtes POST et PUT, spécifiant que le corps est en JSON.
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  // Injection du service HttpClient d'Angular dans le constructeur.
  // this.http sera utilisé pour effectuer toutes les opérations réseau.
  constructor(private http: HttpClient) { }

  // createClient(clientData: Client): Observable<Client>
  // Envoie une requête POST pour créer un nouveau client.
  // clientData: Client : Les données du client à créer, conformes à l'interface Client.
  // Retourne un Observable qui émettra le client créé (tel que retourné par le backend, potentiellement avec un ID).
  createClient(clientData: Client): Observable<Client> {
    // Requête POST vers `${this.baseUrl}/create`.
    // Le backend s'attend à un objet 'Client' et devrait retourner un objet 'Client' (ou 'ClientDTO').
    // Le type de retour est spécifié comme Client ici.
    return this.http.post<Client>(`${this.baseUrl}/create`, clientData, this.httpOptions)
      .pipe( // Utilisation de .pipe() pour enchaîner des opérateurs RxJS.
        // catchError intercepte les erreurs HTTP et les délègue à this.handleError.
        catchError(err => this.handleError(err, 'createClient'))
      );
  }

  // loginClient(loginData: LoginRequest): Observable<ClientDTO>
  // Envoie une requête POST pour connecter un client.
  // loginData: LoginRequest : Les identifiants de connexion (login et mot de passe).
  // Retourne un Observable qui émettra les données du ClientDTO si la connexion réussit.
  loginClient(loginData: LoginRequest): Observable<ClientDTO> {
    return this.http.post<ClientDTO>(`${this.baseUrl}/login`, loginData, this.httpOptions)
      .pipe(
        catchError(err => this.handleError(err, 'loginClient'))
      );
  }

  // getAllClients(): Observable<ClientDTO[]>
  // Récupère la liste de tous les clients.
  // Retourne un Observable qui émettra un tableau de ClientDTO.
  getAllClients(): Observable<ClientDTO[]> {
    // Requête GET vers `${this.baseUrl}/getAll`.
    // Le <any[]> permet une inspection/transformation de la réponse dans l'opérateur map.
    return this.http.get<any[]>(`${this.baseUrl}/getAll`)
      .pipe(
        map((response: any) => { // L'opérateur map transforme la réponse brute.
          // Si la réponse est un tableau, on la considère valide.
          if (Array.isArray(response)) {
            return response as ClientDTO[];
          }
          // Gestion du cas où l'API retourne un objet vide {} pour une liste vide.
          if (response && typeof response === 'object' && Object.keys(response).length === 0) {
            console.warn(`API returned {} for GET ${this.baseUrl}/getAll. Transforming to []. Consider fixing the API.`);
            return [] as ClientDTO[]; // On retourne un tableau vide.
          }
          // Si la réponse est inattendue, on logue un avertissement et retourne un tableau vide.
          console.warn(`Unexpected response type for GET ${this.baseUrl}/getAll. Expected ClientDTO[], got:`, response);
          return [] as ClientDTO[];
        }),
        catchError(err => this.handleError(err, 'getAllClients')) // Gestion des erreurs.
      );
  }

  // getClientById(idClient: number): Observable<ClientDTO | null>
  // Récupère un client spécifique par son ID.
  // idClient: number : L'ID du client recherché.
  // Retourne un Observable qui émettra un ClientDTO ou null si non trouvé / erreur gérée.
  getClientById(idClient: number): Observable<ClientDTO | null> {
    return this.http.get<any>(`${this.baseUrl}/get/${idClient}`) // <any> pour l'inspection dans map.
      .pipe(
        map((response: any) => {
          // Gestion du cas où l'API retourne {} pour un client non trouvé (au lieu d'un 404).
          if (response && typeof response === 'object' && Object.keys(response).length === 0) {
            console.warn(`API returned {} for GET ${this.baseUrl}/get/${idClient}. Transforming to null. Consider fixing the API to return 404.`);
            return null;
          }
          // Vérification basique si l'objet retourné ressemble à un client (a un idClient).
          if (response && typeof response === 'object' && response.idClient !== undefined) {
            return response as ClientDTO;
          }
          // Si l'API retourne explicitement null (avec un statut 200 OK).
          if (response === null) return null;
          // Si la réponse est inattendue.
          console.warn(`Unexpected response type for GET ${this.baseUrl}/get/${idClient}. Expected ClientDTO or empty {}, got:`, response);
          return null;
        }),
        catchError(err => this.handleError(err, 'getClientById'))
      );
  }

  // updateClient(idClient: number, clientData: ClientDTO): Observable<ClientDTO>
  // Met à jour un client existant.
  // idClient: number : L'ID du client à mettre à jour.
  // clientData: ClientDTO : Les nouvelles données du client.
  // Retourne un Observable qui émettra le ClientDTO mis à jour.
  updateClient(idClient: number, clientData: ClientDTO): Observable<ClientDTO> {
    // Requête PUT vers `${this.baseUrl}/update/{idClient}`.
    return this.http.put<ClientDTO>(`${this.baseUrl}/update/${idClient}`, clientData, this.httpOptions)
      .pipe(
        catchError(err => this.handleError(err, 'updateClient'))
      );
  }

  // deleteClient(idClient: number): Observable<any>
  // Supprime un client par son ID.
  // idClient: number : L'ID du client à supprimer.
  // Retourne un Observable<any> car la réponse du backend pour un DELETE peut varier (souvent vide).
  deleteClient(idClient: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/delete/${idClient}`, this.httpOptions)
      .pipe(
        catchError(err => this.handleError(err, 'deleteClient'))
      );
  }

  // searchClients(searchCriteria: Partial<ClientDTO>): Observable<ClientDTO[]>
  // Recherche des clients basée sur des critères partiels.
  // searchCriteria: Partial<ClientDTO> : Un objet où certaines propriétés de ClientDTO peuvent être présentes pour la recherche.
  // 'Partial<ClientDTO>' signifie que toutes les propriétés de ClientDTO sont optionnelles dans searchCriteria.
  // Retourne un Observable qui émettra un tableau des ClientDTO correspondants aux critères.
  searchClients(searchCriteria: Partial<ClientDTO>): Observable<ClientDTO[]> {
    // Requête PUT vers `${this.baseUrl}/search`. L'utilisation de PUT pour une recherche est inhabituelle,
    // GET ou POST sont plus courants. Cela dépend des spécifications de l'API.
    return this.http.put<any[]>(`${this.baseUrl}/search`, searchCriteria, this.httpOptions) // <any[]> pour l'inspection.
      .pipe(
        map((response: any) => { // Transformation de la réponse.
          if (Array.isArray(response)) {
            return response as ClientDTO[];
          }
          // Gestion du cas où l'API retourne {} pour une recherche sans résultats.
          if (response && typeof response === 'object' && Object.keys(response).length === 0) {
            console.warn(`API returned {} for PUT ${this.baseUrl}/search. Transforming to []. Consider fixing the API.`);
            return [] as ClientDTO[];
          }
          console.warn(`Unexpected response type for PUT ${this.baseUrl}/search. Expected ClientDTO[], got:`, response);
          return [] as ClientDTO[];
        }),
        catchError(err => this.handleError(err, 'searchClients'))
      );
  }

  // private handleError(...)
  // Méthode privée pour une gestion centralisée et cohérente des erreurs HTTP.
  // error: HttpErrorResponse : L'objet d'erreur fourni par HttpClient.
  // methodName: string : Le nom de la méthode appelante, pour un message d'erreur plus contextuel.
  // Retourne un Observable qui émet une erreur (via throwError).
  private handleError(error: HttpErrorResponse, methodName: string = 'clientOperation'): Observable<any> {
    // Gestion spécifique si le backend retourne un statut 200 OK mais avec un corps de réponse vide {}
    // alors que le client s'attendait à des données (par exemple, pour getClientById).
    if (error.status === 200 && error.error && typeof error.error === 'object' && Object.keys(error.error).length === 0) {
      console.warn(`Backend returned 200 OK with an empty object for ${methodName}. Returning appropriate default empty value.`);
      if (methodName === 'getClientById') {
        return of(null); // Pour un getById, on peut interpréter cela comme "non trouvé".
      } else {
        return of([]); // Pour une liste, on retourne un tableau vide.
      }
    } else {
      // S'il s'agit d'une erreur côté client (ex: problème réseau) ou d'une erreur renvoyée par le backend.
      if (error.error instanceof ErrorEvent) {
        // Erreur de type client-side ou réseau.
        console.error('An error occurred:', error.error.message);
      } else {
        // Le backend a retourné un code d'erreur (4xx, 5xx).
        // Le corps de la réponse d'erreur peut contenir des indices.
        console.error(
          `Backend returned code ${error.status} for ${methodName}, ` +
          `body was: ${JSON.stringify(error.error)}`);
      }
      // Propage une nouvelle erreur sous forme d'Observable pour que le code appelant puisse la gérer.
      return throwError(() => new Error(`Something bad happened with Client API during ${methodName}; please try again later.`));
    }
  }
}
