// agent.service.ts
// Ce fichier définit un service Angular pour gérer les opérations liées aux agents.
// Un service Angular est une classe qui encapsule une logique métier spécifique
// ou des interactions avec des données (comme appeler une API backend).
// L'objectif est de rendre cette logique réutilisable et de séparer les préoccupations.

// On importe Injectable pour pouvoir marquer notre classe comme un service injectable.
import { Injectable } from '@angular/core';
// On importe HttpClient, HttpHeaders, HttpErrorResponse pour pouvoir faire des requêtes HTTP
// et gérer les réponses et les erreurs.
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
// On importe Observable, throwError, et of de RxJS (Reactive Extensions for JavaScript).
// Observable est utilisé pour gérer les flux de données asynchrones (comme les réponses HTTP).
// throwError est utilisé pour créer un Observable qui émet immédiatement une erreur.
// of est utilisé pour créer un Observable qui émet une valeur fixe puis se complète.
import { Observable, throwError, of } from 'rxjs';
// On importe catchError et map de 'rxjs/operators'. Ce sont des opérateurs RxJS
// qui permettent de manipuler les Observables.
// catchError intercepte les erreurs dans un flux Observable.
// map transforme les valeurs émises par un Observable.
import { catchError, map } from 'rxjs/operators';

// Interface AgentDTO (Data Transfer Object)
// Une interface TypeScript définit la "forme" d'un objet. Elle spécifie les noms
// des propriétés et leurs types. C'est très utile pour la clarté du code et pour
// que TypeScript puisse vérifier les types.
// Cette interface représente les données d'un agent telles qu'elles sont transférées
// entre le frontend et le backend, ou utilisées dans les formulaires.
export interface AgentDTO {
  idAgent?: number; // L'identifiant unique de l'agent. Optionnel (?) car un nouvel agent n'a pas encore d'ID.
  nomAgent: string; // Le nom de famille de l'agent. Requis.
  prenomAgent: string; // Le prénom de l'agent. Requis.
  sexeAgent: 'Homme' | 'Femme' | 'Autre' | ''; // Le sexe de l'agent, avec des valeurs prédéfinies. Requis.
  dateNaiss?: string; // La date de naissance (format yyyy-MM-dd). Optionnel.
  telAgent?: string; // Le numéro de téléphone. Optionnel.
  mailAgent: string; // L'adresse e-mail. Requis.
  role: 'Agent' | 'Admin' | ''; // Le rôle de l'agent (Agent ou Admin). Requis.
  password: string; // Le mot de passe de l'agent. Requis (surtout pour la création/connexion).
}

// Interface AgentLoginRequest
// Définit la structure des données attendues par le backend pour une tentative de connexion d'agent.
export interface AgentLoginRequest {
  login: string; // Le login (souvent l'email ou un nom d'utilisateur) pour la connexion.
  password: string; // Le mot de passe pour la connexion.
}


// Le décorateur @Injectable marque la classe AgentService comme un service
// qui peut être injecté dans d'autres composants ou services.
@Injectable({
  // providedIn: 'root' signifie que ce service est enregistré au niveau racine de l'application.
  // Cela veut dire qu'Angular crée une seule instance de AgentService (un singleton)
  // et qu'elle est disponible pour être injectée n'importe où dans l'application.
  // C'est la manière recommandée de fournir des services globaux.
  providedIn: 'root'
})
export class AgentService {
  // private baseUrl = '/api/agent';
  // C'est l'URL de base pour toutes les requêtes HTTP liées aux agents.
  // Le préfixe '/api' suggère que les requêtes seront interceptées par un proxy
  // (configuré dans proxy.conf.json) qui les redirigera vers le serveur backend réel.
  // Cela évite les problèmes de CORS (Cross-Origin Resource Sharing) pendant le développement.
  private baseUrl = '/api/agent';

  // private httpOptions = { ... };
  // Cet objet configure les en-têtes HTTP qui seront envoyés avec certaines requêtes (POST, PUT).
  // 'Content-Type': 'application/json' indique au backend que le corps de la requête est au format JSON.
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  // Le constructeur de la classe.
  // private http: HttpClient : C'est l'injection de dépendances en action.
  // Angular va "injecter" (fournir) une instance de HttpClient dans ce service.
  // On peut ensuite utiliser this.http pour faire des requêtes HTTP.
  constructor(private http: HttpClient) { }

  // getAllAgents(): Observable<AgentDTO[]>
  // Cette méthode récupère la liste de tous les agents depuis le backend.
  // Elle retourne un Observable qui, si tout va bien, émettra un tableau d'objets AgentDTO.
  getAllAgents(): Observable<AgentDTO[]> {
    // this.http.get<AgentDTO[]>(...) : Fait une requête HTTP GET à l'URL ${this.baseUrl}.
    // Le <AgentDTO[]> indique à HttpClient qu'on s'attend à recevoir un tableau d'agents.
    // Note: L'URL ici est juste la baseUrl, ce qui est un peu inhabituel. Souvent, ce serait
    // quelque chose comme `${this.baseUrl}/all` ou simplement `${this.baseUrl}` si le backend
    // est configuré pour retourner tous les agents sur son endpoint racine pour GET.
    // Le type de retour est <any[]> pour permettre une inspection de la réponse dans map().
    return this.http.get<any[]>(`${this.baseUrl}`)
      .pipe( // .pipe() permet d'enchaîner des opérateurs RxJS.
        map((response: any) => { // L'opérateur map transforme la réponse reçue.
          // Si la réponse est bien un tableau, on la retourne telle quelle, castée en AgentDTO[].
          if (Array.isArray(response)) {
            return response as AgentDTO[];
          }
          // Si la réponse est un objet vide {} (ce qui peut arriver si l'API retourne ça pour une liste vide),
          // on affiche un avertissement et on transforme la réponse en un tableau vide [].
          // C'est une gestion spécifique pour une API qui pourrait avoir ce comportement.
          if (response && typeof response === 'object' && Object.keys(response).length === 0) {
            console.warn(`API returned {} for GET ${this.baseUrl}. Transforming to []. Consider fixing the API.`);
            return [] as AgentDTO[];
          }
          // Si la réponse n'est ni un tableau, ni un objet vide, c'est inattendu.
          // On affiche un avertissement et on retourne un tableau vide par sécurité.
          console.warn(`Unexpected response type for GET ${this.baseUrl}. Expected AgentDTO[], got:`, response);
          return [] as AgentDTO[]; // On pourrait aussi choisir de lever une erreur ici.
        }),
        // catchError intercepte les erreurs HTTP (par exemple, erreur 404, 500, ou problème réseau).
        // Il appelle notre méthode privée handleError pour un traitement centralisé.
        // Le deuxième argument 'getAllAgents' aide à contextualiser l'erreur dans handleError.
        catchError(err => this.handleError(err, 'getAllAgents'))
      );
  }

  // getAgentById(idAgent: number): Observable<AgentDTO | null>
  // Récupère un agent spécifique par son ID.
  // idAgent: number : Le numéro identifiant l'agent à récupérer.
  // Retourne un Observable qui émettra un seul AgentDTO, ou null si non trouvé ou en cas d'erreur gérée.
  getAgentById(idAgent: number): Observable<AgentDTO | null> {
    // Requête HTTP GET vers l'URL ${this.baseUrl}/{idAgent}.
    // Le type de retour est <any> pour permettre une inspection dans map().
    return this.http.get<any>(`${this.baseUrl}/${idAgent}`)
      .pipe(
        map((response: any) => { // Transformation de la réponse.
          // Si l'API retourne un objet vide {} (par exemple, si l'agent n'est pas trouvé mais l'API ne retourne pas 404),
          // on le transforme en 'null'.
          if (response && typeof response === 'object' && Object.keys(response).length === 0) {
            console.warn(`API returned {} for GET ${this.baseUrl}/${idAgent}. Transforming to null. Consider fixing the API to return 404.`);
            return null;
          }
          // Si la réponse a une propriété 'idAgent', on suppose que c'est un AgentDTO valide.
          // C'est une vérification basique.
          if (response && typeof response === 'object' && response.idAgent !== undefined) {
            return response as AgentDTO;
          }
          // Si l'API retourne explicitement 'null' (avec un statut 200 OK, ce qui est rare mais possible).
          if (response === null) return null;
          // Si la réponse n'est pas un AgentDTO reconnaissable ni un objet vide, c'est inattendu.
          console.warn(`Unexpected response type for GET ${this.baseUrl}/${idAgent}. Expected AgentDTO or empty {}, got:`, response);
          return null; // On retourne null par défaut dans ce cas inattendu.
        }),
        catchError(err => this.handleError(err, 'getAgentById')) // Gestion des erreurs.
      );
  }

  // createAgent(agentData: AgentDTO): Observable<AgentDTO>
  // Crée un nouvel agent sur le serveur.
  // agentData: AgentDTO : L'objet contenant les informations du nouvel agent à créer.
  // Retourne un Observable qui émettra l'AgentDTO créé par le backend (souvent avec son nouvel idAgent).
  createAgent(agentData: AgentDTO): Observable<AgentDTO> {
    // Requête HTTP POST vers l'URL ${this.baseUrl}/create.
    // agentData est envoyé comme corps de la requête (payload).
    // this.httpOptions spécifie que le corps est en JSON.
    return this.http.post<AgentDTO>(`${this.baseUrl}/create`, agentData, this.httpOptions)
      .pipe(
        catchError(err => this.handleError(err, 'createAgent')) // Gestion des erreurs.
      );
  }

  // updateAgent(idAgent: number, agentData: AgentDTO): Observable<AgentDTO>
  // Met à jour les informations d'un agent existant.
  // idAgent: number : L'ID de l'agent à mettre à jour.
  // agentData: AgentDTO : Les nouvelles informations de l'agent.
  // Retourne un Observable qui émettra l'AgentDTO mis à jour.
  updateAgent(idAgent: number, agentData: AgentDTO): Observable<AgentDTO> {
    // Requête HTTP PUT vers l'URL ${this.baseUrl}/{idAgent}.
    // agentData est le corps de la requête.
    return this.http.put<AgentDTO>(`${this.baseUrl}/${idAgent}`, agentData, this.httpOptions)
      .pipe(
        catchError(err => this.handleError(err, 'updateAgent')) // Gestion des erreurs.
      );
  }

  // deleteAgent(idAgent: number): Observable<any>
  // Supprime un agent par son ID.
  // idAgent: number : L'ID de l'agent à supprimer.
  // Retourne un Observable<any> car la réponse d'une suppression réussie peut varier
  // (parfois un corps vide, parfois un message de succès, parfois un statut 204 No Content).
  // Le type 'any' est utilisé ici pour plus de flexibilité.
  deleteAgent(idAgent: number): Observable<any> {
    // Requête HTTP DELETE vers l'URL ${this.baseUrl}/{idAgent}.
    return this.http.delete<any>(`${this.baseUrl}/${idAgent}`, this.httpOptions)
      .pipe(
        catchError(err => this.handleError(err, 'deleteAgent')) // Gestion des erreurs.
      );
  }

  // loginAgent(loginData: AgentLoginRequest): Observable<AgentDTO>
  // Tente de connecter un agent.
  // loginData: AgentLoginRequest : Contient le login et le mot de passe de l'agent.
  // Retourne un Observable qui émettra l'AgentDTO de l'agent connecté si la connexion réussit.
  // En cas d'échec (mauvais identifiants, etc.), une erreur sera émise et gérée par handleError.
  loginAgent(loginData: AgentLoginRequest): Observable<AgentDTO> {
    // Requête HTTP POST vers l'URL ${this.baseUrl}/login.
    // loginData est le corps de la requête.
    return this.http.post<AgentDTO>(`${this.baseUrl}/login`, loginData, this.httpOptions)
      .pipe(
        catchError(err => this.handleError(err, 'loginAgent')) // Gestion des erreurs.
      );
  }

  // private handleError(error: HttpErrorResponse, methodName: string = 'agentOperation'): Observable<any>
  // Méthode privée pour gérer de manière centralisée les erreurs des requêtes HTTP.
  // error: HttpErrorResponse : L'objet d'erreur retourné par HttpClient.
  // methodName: string : Le nom de la méthode où l'erreur s'est produite (pour le contexte du log).
  // Retourne un Observable qui propage une erreur (via throwError).
  private handleError(error: HttpErrorResponse, methodName: string = 'agentOperation'): Observable<any> {
    // Cas spécial : si le backend retourne un statut 200 OK mais avec un corps vide {}
    // alors que le service s'attendait à des données (comme pour getAgentById ou getAllAgents).
    // Ce bloc tente de gérer cette situation en retournant une valeur par défaut appropriée.
    if (error.status === 200 && error.error && typeof error.error === 'object' && Object.keys(error.error).length === 0) {
      console.warn(`Backend returned 200 OK with an empty object for ${methodName}. Returning appropriate default empty value.`);
      if (methodName === 'getAgentById') {
        // Pour getAgentById, retourner un Observable de 'null' est une façon de signaler "non trouvé" sans erreur.
        return of(null);
      } else {
        // Pour des listes comme getAllAgents, retourner un Observable d'un tableau vide.
        return of([]);
      }
    } else {
      // Gestion des erreurs "normales".
      // error.error instanceof ErrorEvent : Vérifie si c'est une erreur côté client
      // (par exemple, un problème de réseau, une erreur JavaScript avant la requête).
      if (error.error instanceof ErrorEvent) {
        // Erreur côté client ou erreur réseau.
        console.error(`An error occurred during ${methodName}:`, error.error.message);
      } else {
        // Erreur retournée par le backend (par exemple, statut 404, 500, 401, etc.).
        // error.status contient le code de statut HTTP.
        // error.error contient le corps de la réponse d'erreur du backend (s'il y en a un).
        console.error(
          `Backend returned code ${error.status} for ${methodName}, ` +
          `body was: ${JSON.stringify(error.error)}`);
      }
      // throwError(() => new Error(...)) : Crée et retourne un nouvel Observable qui émet immédiatement
      // une erreur avec un message convivial pour l'utilisateur ou pour un traitement d'erreur ultérieur.
      // L'abonné à la méthode originale (par exemple, getAllAgents().subscribe(...)) recevra cette erreur.
      return throwError(() => new Error(`Something bad happened with Agent API during ${methodName}; please try again later.`));
    }
  }
}
