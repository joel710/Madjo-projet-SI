// type-billet.service.ts
// Ce service Angular est dédié à la gestion des types de billets.
// Il centralise la logique pour interagir avec l'API backend concernant les types de billets,
// incluant les opérations CRUD (Create, Read, Update, Delete).

import { Injectable } from '@angular/core'; // Importe le décorateur Injectable pour définir un service.
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http'; // Modules pour la communication HTTP.
import { Observable, throwError, of } from 'rxjs'; // Éléments de RxJS pour la programmation réactive (Observables, gestion d'erreurs).
import { catchError, map } from 'rxjs/operators'; // Opérateurs RxJS pour manipuler les flux de données (Observables).

// Interface TypeBilletDTO (Data Transfer Object)
// Définit la structure des données pour un type de billet.
// Elle est utilisée pour typer les objets échangés avec le backend et au sein de l'application.
// Le commentaire original note une possible différence de nommage avec l'API (TYPE_BILLET vs TypeBilletDTO).
export interface TypeBilletDTO {
  idTypeBillet?: number; // Identifiant unique du type de billet. Optionnel (?) car un nouveau type non sauvegardé n'a pas d'ID.
  libelleTypeBillet: string; // Le nom ou la description du type de billet (ex: "Classe Économique", "Première Classe"). Requis.
  prixTypeBillet: number; // Le prix associé à ce type de billet. Requis.
}

// Le décorateur @Injectable marque cette classe comme un service qui peut être injecté.
@Injectable({
  // providedIn: 'root' : Cette configuration indique à Angular que le service
  // TypeBilletService doit être fourni au niveau racine de l'application.
  // Cela signifie qu'une seule instance de ce service (un singleton) sera créée
  // et sera disponible pour être injectée dans n'importe quel composant ou autre service
  // de l'application. C'est la méthode standard pour la plupart des services.
  providedIn: 'root'
})
// Déclaration de la classe TypeBilletService.
// Le mot-clé 'export' la rend accessible pour importation dans d'autres fichiers du projet.
export class TypeBilletService {
  // private baseUrl = '/api/ticket';
  // Définit l'URL de base pour toutes les requêtes HTTP relatives aux types de billets.
  // Le chemin '/api/ticket' suggère que les appels sont dirigés vers un backend,
  // possiblement via un proxy configuré dans le projet Angular (ex: proxy.conf.json)
  // pour éviter les problèmes de CORS (Cross-Origin Resource Sharing) en développement.
  private baseUrl = '/api/ticket';

  // private httpOptions = { ... };
  // Configure les en-têtes HTTP par défaut pour les requêtes qui modifient des données (POST, PUT).
  // 'Content-Type': 'application/json' indique au serveur que le corps de la requête est au format JSON.
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  // Le constructeur de la classe.
  // private http: HttpClient : C'est l'injection de dépendances. Angular va injecter
  // une instance du service HttpClient. Ce service est essentiel pour effectuer
  // des requêtes HTTP (GET, POST, PUT, DELETE, etc.) vers un serveur.
  // Le modificateur 'private' crée automatiquement une propriété 'http' dans cette classe.
  constructor(private http: HttpClient) { }

  // createTypeBillet(typeBilletData: TypeBilletDTO): Observable<TypeBilletDTO>
  // Envoie une requête pour créer un nouveau type de billet sur le serveur.
  // typeBilletData: TypeBilletDTO : L'objet contenant les informations (libellé, prix) du nouveau type de billet.
  //                                 L'idTypeBillet est généralement omis ici car il sera attribué par le backend.
  // Retourne un Observable qui, en cas de succès, émettra le TypeBilletDTO du type de billet nouvellement créé
  // (incluant l'idTypeBillet assigné par le serveur).
  // Le commentaire original indique que l'API attend et retourne un objet de type "TYPE_BILLET".
  createTypeBillet(typeBilletData: TypeBilletDTO): Observable<TypeBilletDTO> {
    // Requête HTTP POST vers l'URL : baseUrl + '/create'.
    // typeBilletData est envoyé comme corps (payload) de la requête.
    // httpOptions spécifie que le Content-Type est application/json.
    // On s'attend à ce que le backend retourne un objet TypeBilletDTO.
    return this.http.post<TypeBilletDTO>(`${this.baseUrl}/create`, typeBilletData, this.httpOptions)
      .pipe( // Utilisation de .pipe() pour enchaîner des opérateurs RxJS.
        // catchError intercepte les erreurs HTTP et les délègue à notre méthode handleError.
        // 'createTypeBillet' est passé pour donner un contexte à la gestion d'erreur.
        catchError(err => this.handleError(err, 'createTypeBillet'))
      );
  }

  // getAllTypesBillet(): Observable<TypeBilletDTO[]>
  // Récupère la liste de tous les types de billets disponibles.
  // Ne prend aucun paramètre.
  // Retourne un Observable qui émettra un tableau de TypeBilletDTO.
  // Comprend une logique de transformation (map) pour gérer des réponses API potentiellement non standard.
  // Le commentaire original indique que l'API retourne une List<TYPE_BILLET>.
  getAllTypesBillet(): Observable<TypeBilletDTO[]> {
    // Requête HTTP GET vers l'URL : baseUrl + '/getAll'.
    // On utilise <any[]> pour le typage de la réponse afin de pouvoir l'inspecter dans 'map'
    // avant de la caster en TypeBilletDTO[]. Cela offre plus de flexibilité si l'API
    // ne respecte pas toujours strictement le contrat (par exemple, en retournant {} au lieu de []).
    return this.http.get<any[]>(`${this.baseUrl}/getAll`)
      .pipe( // Enchaînement d'opérateurs RxJS.
        map((response: any) => { // L'opérateur 'map' transforme la réponse brute.
          // Si la réponse est déjà un tableau, c'est le format attendu.
          // On la caste explicitement en TypeBilletDTO[] et on la retourne.
          if (Array.isArray(response)) {
            return response as TypeBilletDTO[];
          }
          // Si la réponse est null ou n'est pas un objet (ex: une chaîne, un nombre),
          // c'est un format inattendu pour une liste.
          if (response === null || typeof response !== 'object') {
            console.warn(`API returned null or non-object/non-array response for GET ${this.baseUrl}/getAll. Response: `, response, `. Transforming to []. Consider fixing the API.`);
            return [] as TypeBilletDTO[]; // On retourne un tableau vide par défaut.
          }
          // Si la réponse est un objet vide {} (cas où certaines APIs retournent cela pour une liste vide).
          // On le traite comme une liste vide.
          if (Object.keys(response).length === 0) {
            console.warn(`API returned an empty object {} for GET ${this.baseUrl}/getAll. Transforming to []. Consider fixing the API.`);
            return [] as TypeBilletDTO[]; // Transformation en tableau vide.
          }
          // Si c'est un objet non vide mais pas un tableau, c'est une réponse inattendue.
          // Par exemple, si l'API retournait un seul objet TypeBilletDTO au lieu d'un tableau.
          console.warn(`Unexpected response type for GET ${this.baseUrl}/getAll. Expected TypeBilletDTO[] or an empty object, got:`, response, `. Transforming to [].`);
          return [] as TypeBilletDTO[]; // On retourne un tableau vide par mesure de sécurité.
        }),
        // Gestion des erreurs HTTP via la méthode handleError.
        catchError(err => this.handleError(err, 'getAllTypesBillet'))
      );
  }

  // getTypeBilletById(idTypeBillet: number): Observable<TypeBilletDTO | null>
  // Récupère un type de billet spécifique par son identifiant.
  // idTypeBillet: number : L'ID du type de billet à rechercher.
  // Retourne un Observable qui émettra soit un objet TypeBilletDTO, soit 'null' si le type de billet
  // n'est pas trouvé ou si la réponse de l'API est inattendue (par exemple, un objet vide {}).
  // Le commentaire original indique que l'API retourne un TypeBilletDTO.
  getTypeBilletById(idTypeBillet: number): Observable<TypeBilletDTO | null> {
    // Requête HTTP GET vers l'URL : baseUrl + /get/ + idTypeBillet.
    // Utilisation de <any> pour permettre une inspection détaillée de la réponse dans 'map'.
    return this.http.get<any>(`${this.baseUrl}/get/${idTypeBillet}`)
      .pipe( // Enchaînement d'opérateurs RxJS.
        map((response: any) => { // L'opérateur 'map' transforme la réponse brute.
          // Cas 1: L'API retourne un objet vide {} (peut-être pour indiquer "non trouvé" avec un statut 200 OK).
          // Idéalement, une API retournerait un statut 404 pour "non trouvé".
          if (response && typeof response === 'object' && Object.keys(response).length === 0) {
            console.warn(`API returned {} for GET ${this.baseUrl}/get/${idTypeBillet}. Transforming to null. Consider fixing the API to return 404.`);
            return null; // On interprète un objet vide comme "non trouvé".
          }
          // Cas 2: La réponse est un objet et possède la propriété 'idTypeBillet'.
          // On suppose alors que c'est un TypeBilletDTO valide. C'est une vérification basique.
          if (response && typeof response === 'object' && response.idTypeBillet !== undefined) {
            return response as TypeBilletDTO; // On caste la réponse en TypeBilletDTO.
          }
          // Cas 3: L'API retourne explicitement 'null' (avec un statut 200 OK, ce qui est possible).
          if (response === null) {
            return null;
          }
          // Cas 4: La réponse est dans un format totalement inattendu (ni objet vide, ni TypeBilletDTO identifiable, ni null).
          console.warn(`Unexpected response type for GET ${this.baseUrl}/get/${idTypeBillet}. Expected TypeBilletDTO or empty {}, got:`, response);
          return null; // On retourne 'null' par sécurité.
        }),
        // Gestion des erreurs HTTP via la méthode handleError.
        catchError(err => this.handleError(err, 'getTypeBilletById'))
      );
  }

  // updateTypeBillet(idTypeBillet: number, typeBilletData: TypeBilletDTO): Observable<TypeBilletDTO>
  // Met à jour un type de billet existant sur le serveur.
  // idTypeBillet: number : L'identifiant du type de billet à mettre à jour.
  // typeBilletData: TypeBilletDTO : L'objet contenant les nouvelles données (libellé, prix) pour le type de billet.
  //                                 L'idTypeBillet dans typeBilletData doit correspondre à celui dans l'URL.
  // Retourne un Observable qui, en cas de succès, émettra le TypeBilletDTO mis à jour.
  // Le commentaire original note une potentielle incohérence de nommage du paramètre d'ID dans l'URL de l'API ('idType' vs 'idTypeBillet').
  // Nous supposons ici que l'URL utilise bien l'ID du type de billet.
  updateTypeBillet(idTypeBillet: number, typeBilletData: TypeBilletDTO): Observable<TypeBilletDTO> {
    // Requête HTTP PUT vers l'URL : baseUrl + /update/ + idTypeBillet.
    // typeBilletData est envoyé comme corps (payload) de la requête.
    // httpOptions spécifie le Content-Type application/json.
    // On s'attend à ce que le backend retourne un objet TypeBilletDTO représentant l'entité mise à jour.
    return this.http.put<TypeBilletDTO>(`${this.baseUrl}/update/${idTypeBillet}`, typeBilletData, this.httpOptions)
      .pipe( // Utilisation de .pipe() pour enchaîner des opérateurs RxJS.
        // Gestion des erreurs via la méthode handleError, avec 'updateTypeBillet' comme contexte.
        catchError(err => this.handleError(err, 'updateTypeBillet'))
      );
  }

  // deleteTypeBillet(idTypeBillet: number): Observable<boolean>
  // Supprime un type de billet existant, identifié par son ID.
  // idTypeBillet: number : L'identifiant du type de billet à supprimer.
  // Retourne un Observable qui émettra 'true' si la suppression est considérée comme réussie,
  // et 'false' ou une erreur en cas d'échec ou de réponse inattendue.
  // La gestion de la réponse est spécifique car les API REST peuvent indiquer un succès
  // de suppression de plusieurs manières (ex: statut 204 sans contenu, ou statut 200 avec un corps).
  // Le commentaire original indique que l'API retourne un booléen.
  deleteTypeBillet(idTypeBillet: number): Observable<boolean> {
    // Requête HTTP DELETE vers l'URL : baseUrl + /delete/ + idTypeBillet.
    // L'option '{ observe: 'response' }' est cruciale ici : elle demande à HttpClient
    // de retourner l'objet HttpResponse complet, incluant le statut et les en-têtes,
    // et pas seulement le corps de la réponse. Cela permet d'inspecter le statut.
    return this.http.delete<any>(`${this.baseUrl}/delete/${idTypeBillet}`, { ...this.httpOptions, observe: 'response' })
      .pipe( // Enchaînement d'opérateurs RxJS.
        map(response => { // L'opérateur 'map' transforme la HttpResponse.
          // Cas 1: Statut 204 (No Content). C'est une réponse standard et réussie pour un DELETE.
          if (response.status === 204) {
            return true; // La suppression est réussie, il n'y a pas de contenu à analyser.
          }
          // Cas 2: Statut 200 (OK). Certaines APIs retournent ce statut avec un corps de réponse.
          if (response.status === 200) {
            const body = response.body; // On récupère le corps de la réponse.
            // Si le corps est explicitement un booléen (true/false).
            if (typeof body === 'boolean') {
              return body;
            }
            // Si le corps est un objet vide {} (parfois utilisé pour indiquer un succès générique).
            if (body && typeof body === 'object' && Object.keys(body).length === 0) {
              console.warn(`API returned {} for DELETE ${this.baseUrl}/delete/${idTypeBillet}. Interpreting as success (true).`);
              return true; // On interprète {} comme un succès.
            }
            // Si le corps est présent mais n'est ni un booléen ni un objet vide attendu.
            console.warn(`Unexpected body for 200 OK on DELETE ${this.baseUrl}/delete/${idTypeBillet}. Expected boolean or empty {}. Got:`, body);
            return false; // On considère cela comme un échec ou une réponse mal comprise.
          }
          // Cas 3: Autres statuts (non 200 et non 204).
          // Si on arrive ici, c'est que le statut n'est pas typique d'un succès de suppression
          // (normalement, les erreurs HTTP comme 404, 500 seraient interceptées par catchError).
          // Cependant, si un statut inattendu (ex: 201) arrivait ici, on le logue et on retourne false.
          console.warn('Unexpected response status for deleteTypeBillet:', response.status);
          return false;
        }),
        // Gestion des erreurs HTTP (ex: 404, 500) via la méthode handleError.
        catchError(err => this.handleError(err, 'deleteTypeBillet'))
      );
  }

  // private handleError(...)
  // Méthode privée pour une gestion centralisée des erreurs HTTP survenant dans ce service.
  // error: HttpErrorResponse : L'objet d'erreur fourni par HttpClient.
  // methodName: string : Nom de la méthode du service où l'erreur a été interceptée (pour logs).
  // Retourne un Observable qui propage une erreur formatée.
  private handleError(error: HttpErrorResponse, methodName: string = 'typeBilletOperation'): Observable<any> {
    // Cas spécifique : si le backend retourne un statut 200 OK mais avec un corps de réponse vide {},
    // cela peut être une manière pour l'API de signaler "non trouvé" ou "opération réussie sans données".
    // Ce service interprète cela différemment selon la méthode appelante.
    if (error.status === 200 && error.error && typeof error.error === 'object' && Object.keys(error.error).length === 0) {
      console.warn(`Backend returned 200 OK with an empty object for ${methodName} (TypeBillet API). Returning appropriate default value.`);
      if (methodName === 'getTypeBilletById') {
        return of(null); // Pour un getById, un objet vide avec 200 OK est traité comme "non trouvé".
      } else if (methodName === 'deleteTypeBillet') {
        return of(true); // Pour un delete, un objet vide avec 200 OK est interprété comme un succès.
      } else {
        return of([]); // Pour les listes (comme getAllTypesBillet), un objet vide avec 200 OK est traité comme une liste vide.
      }
    } else {
      // Gestion des erreurs "standard".
      if (error.error instanceof ErrorEvent) {
        // Erreur côté client ou réseau.
        console.error(`Client-side/network error in ${methodName} (TypeBillet API):`, error.error.message);
        return throwError(() => new Error(`Network error during ${methodName} in TypeBillet API; please check connection.`));
      } else {
        // Erreur renvoyée par le backend (statut 4xx ou 5xx).
        console.error(`Backend error in ${methodName} (TypeBillet API): returned code ${error.status}, body was: ${JSON.stringify(error.error)}`);
        // On propage une nouvelle erreur avec un message pour l'utilisateur.
        return throwError(() => new Error(`Something bad happened with TypeBillet API during ${methodName}; please try again later.`));
      }
    }
  }
}
