// paiement.service.ts
// Ce fichier définit le service Angular PaiementService.
// Son rôle est de gérer toutes les interactions avec l'API backend
// concernant les paiements (création, lecture, mise à jour, suppression).
// Il abstrait la logique de communication HTTP pour les composants qui l'utiliseront.

import { Injectable } from '@angular/core'; // Nécessaire pour définir un service injectable.
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http'; // Pour les requêtes HTTP.
import { Observable, throwError } from 'rxjs'; // Pour la gestion des opérations asynchrones.
import { catchError } from 'rxjs/operators'; // Pour la gestion des erreurs dans les flux Observables.

// Interfaces for related entities for PaiementDTO

// Interface ReservationObjectDTO
// Représente une version simplifiée ou un sous-ensemble des informations d'une réservation,
// utilisée lorsqu'une réservation est imbriquée dans un objet PaiementDTO reçu du backend.
export interface ReservationObjectDTO {
    idReservation: number; // Identifiant unique de la réservation.
    dateReservation?: string; // Date de la réservation, optionnelle ici.
    // D'autres champs pertinents de la réservation pourraient être ajoutés ici si nécessaire.
    // Add other relevant fields if needed from Reservation model
}

// Interface AgentObjectDTO
// Représente une version simplifiée des informations d'un agent,
// utilisée lorsqu'un agent est imbriqué dans un objet PaiementDTO reçu du backend.
export interface AgentObjectDTO {
    idAgent: number; // Identifiant unique de l'agent.
    nomAgent?: string; // Nom de l'agent, optionnel ici.
    prenomAgent?: string; // Prénom de l'agent, optionnel ici.
    // D'autres champs pertinents de l'agent pourraient être ajoutés ici.
    // Add other relevant fields if needed from Agent model
}

// Interface PaiementDTO (Data Transfer Object)
// Définit la structure des données d'un paiement.
// Elle est utilisée pour envoyer des données au backend et pour typer les données reçues.
export interface PaiementDTO {
    codePaiement?: string; // L'identifiant unique du paiement (peut être une chaîne de caractères). Optionnel car peut être généré par le backend.
    datePaiement: string; // Date du paiement, attendue au format "yyyy-MM-dd" par l'API. Requis.
    montantPaiement?: number; // Le montant du paiement. Optionnel, mais généralement présent.
    status?: string; // Le statut du paiement (ex: "Payé", "En attente", "Remboursé"). Optionnel.
    method?: string; // Mode de paiement (ex: "Carte bancaire", "Mobile Money", etc.)
    // Ces IDs sont utilisés pour envoyer les références lors de la création ou mise à jour d'un paiement.
    reservationId?: number; // ID de la réservation associée à ce paiement. Essentiel pour lier le paiement.
    agentId?: number; // ID de l'agent ayant traité ou enregistré ce paiement.
    // Ces objets sont potentiellement populés par le backend lors de la récupération d'un paiement (GET).
    // Ils contiendraient alors les détails de la réservation et de l'agent associés, plutôt que de simples IDs.
    reservation?: ReservationObjectDTO; // Objet réservation imbriqué, pour afficher des détails dans l'interface utilisateur.
    agent?: AgentObjectDTO; // Objet agent imbriqué.
}

// Le décorateur @Injectable marque cette classe comme un service Angular.
@Injectable({
    // providedIn: 'root' enregistre le service au niveau racine de l'application.
    // Cela signifie qu'une seule instance de PaiementService (singleton) sera créée
    // et partagée à travers toute l'application.
    providedIn: 'root'
})
// Déclaration de la classe PaiementService.
// Le mot-clé 'export' la rend disponible pour importation dans d'autres parties de l'application.
export class PaiementService {
    // private baseUrl = '/api/paiement';
    // L'URL de base pour toutes les requêtes HTTP vers l'API des paiements.
    // Le '/api' est typiquement géré par un proxy en développement (proxy.conf.json)
    // pour rediriger les requêtes vers le serveur backend réel et éviter les problèmes de CORS.
    private baseUrl = '/api/paiement'; // Note: le commentaire original "Assuming..." est conservé.

    // private httpOptions = { ... };
    // Options HTTP standard pour les requêtes POST et PUT, indiquant que le corps
    // de la requête est au format JSON. Ces options seront passées aux méthodes http.post et http.put.
    private httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json' // Informe le serveur que les données envoyées sont du JSON.
        })
    };

    // Injection de HttpClient dans le service via le constructeur.
    // Le modificateur 'private' devant 'http' crée automatiquement une propriété privée 'http' dans la classe.
    // HttpClient est le module d'Angular pour effectuer des requêtes HTTP.
    constructor(private http: HttpClient) { }

    // createPaiement(paiementData: PaiementDTO): Observable<PaiementDTO>
    // Envoie une requête pour créer un nouveau paiement.
    // paiementData: PaiementDTO : Contient les informations du paiement à créer.
    // Notez que reservationId et agentId sont extraits de paiementData pour construire le payload,
    // car le backend s'attend à une structure spécifique avec des objets imbriqués pour reservation et agent.
    // Retourne un Observable qui émettra le PaiementDTO du paiement créé (avec son codePaiement, etc.).
    createPaiement(paiementData: PaiementDTO): Observable<PaiementDTO> {
        // Préparation du payload selon la structure attendue par le backend.
        const payload: any = {
            codePaiement: paiementData.codePaiement,
            datePaiement: paiementData.datePaiement,
            montantPaiement: paiementData.montantPaiement,
            status: paiementData.status,
            method: paiementData.method,
            reservationId: paiementData.reservationId, // <-- c'est ce champ qui compte !
            agentId: paiementData.agentId              // <-- c'est ce champ qui compte !
        };
        return this.http.post<PaiementDTO>(`${this.baseUrl}/create`, payload, this.httpOptions)
            .pipe(
                catchError(err => this.handleError(err, 'createPaiement'))
            );
    }

    // getAllPaiements(): Observable<PaiementDTO[]>
    // Récupère la liste de tous les paiements enregistrés dans le système.
    // Cette méthode ne prend pas de paramètres.
    // Elle retourne un Observable qui, en cas de succès, émettra un tableau d'objets PaiementDTO.
    // Chaque PaiementDTO dans le tableau contiendra les détails d'un paiement,
    // y compris potentiellement les objets imbriqués 'reservation' et 'agent' si le backend les fournit.
    getAllPaiements(): Observable<PaiementDTO[]> {
        // Effectue une requête HTTP GET à l'URL construite à partir de baseUrl et du chemin '/getAll'.
        // Le type <PaiementDTO[]> indique à HttpClient que nous attendons un tableau de PaiementDTO comme réponse.
        return this.http.get<PaiementDTO[]>(`${this.baseUrl}/getAll`)
            .pipe( // On utilise .pipe() pour attacher des opérateurs RxJS.
                // catchError intercepte toute erreur survenant pendant la requête HTTP.
                // L'erreur est ensuite passée à notre méthode handleError pour un traitement standardisé.
                // 'getAllPaiements' est fourni comme contexte à handleError.
                catchError(err => this.handleError(err, 'getAllPaiements'))
            );
    }

    // getPaiementById(codePaiement: string): Observable<PaiementDTO>
    // Récupère les détails d'un paiement spécifique en utilisant son codePaiement.
    // codePaiement: string : Le code identifiant unique du paiement à rechercher.
    // Retourne un Observable qui émettra un seul objet PaiementDTO si le paiement est trouvé.
    // Si le paiement n'est pas trouvé, le backend devrait idéalement retourner une erreur 404,
    // qui sera alors interceptée par catchError et traitée par handleError.
    getPaiementById(codePaiement: string): Observable<PaiementDTO> {
        // Requête HTTP GET vers l'URL: baseUrl + /get/ + codePaiement.
        // On s'attend à ce que le backend retourne un objet PaiementDTO unique.
        return this.http.get<PaiementDTO>(`${this.baseUrl}/get/${codePaiement}`)
            .pipe( // Application des opérateurs RxJS.
                // Gestion des erreurs via handleError.
                // 'getPaiementById' est passé comme contexte.
                catchError(err => this.handleError(err, 'getPaiementById'))
            );
    }

    // updatePaiement(codePaiement: string, paiementData: PaiementDTO): Observable<PaiementDTO>
    // Met à jour les informations d'un paiement existant, identifié par son codePaiement.
    // codePaiement: string : Le code du paiement à modifier.
    // paiementData: PaiementDTO : Un objet contenant les nouvelles données pour le paiement.
    //                             Comme pour createPaiement, le backend s'attend à une structure de payload spécifique.
    // Retourne un Observable qui émettra le PaiementDTO mis à jour si l'opération réussit.
    updatePaiement(codePaiement: string, paiementData: PaiementDTO): Observable<PaiementDTO> {
        // Construction du payload. Il est important que paiementData.codePaiement corresponde
        // au codePaiement passé en paramètre de l'URL pour la cohérence.
        const payload: any = {
            codePaiement: paiementData.codePaiement, // Assurez-vous que ceci est bien le codePaiement de l'entité à jour.
            datePaiement: paiementData.datePaiement,
            reservation: { idReservation: paiementData.reservationId }, // ID de la réservation liée.
            agent: { idAgent: paiementData.agentId } // ID de l'agent lié.
        };
        // Requête HTTP PUT vers l'URL : baseUrl + /update/ + codePaiement.
        // Le 'payload' contient les données de mise à jour.
        // 'httpOptions' spécifie le Content-Type.
        return this.http.put<PaiementDTO>(`${this.baseUrl}/update/${codePaiement}`, payload, this.httpOptions)
            .pipe( // Application des opérateurs RxJS.
                // Gestion des erreurs via handleError, avec 'updatePaiement' comme contexte.
                catchError(err => this.handleError(err, 'updatePaiement'))
            );
    }

    // deletePaiement(codePaiement: string): Observable<boolean>
    // Supprime un paiement existant, identifié par son codePaiement.
    // codePaiement: string : Le code du paiement à supprimer.
    // Retourne un Observable qui émettra un booléen. Selon l'API, cela pourrait être 'true'
    // si la suppression a réussi. Certaines API retournent un corps vide avec un statut 204 (No Content)
    // pour une suppression réussie, auquel cas le type de retour effectif pourrait être Observable<void>
    // ou nécessiter une transformation si un booléen est attendu par le code appelant.
    // Ici, on s'attend à un booléen <boolean>.
    deletePaiement(codePaiement: string): Observable<boolean> {
        // Requête HTTP DELETE vers l'URL : baseUrl + /delete/ + codePaiement.
        // httpOptions (qui spécifie Content-Type) est inclus, bien que souvent non nécessaire pour DELETE.
        return this.http.delete<boolean>(`${this.baseUrl}/delete/${codePaiement}`, this.httpOptions)
            .pipe( // Application des opérateurs RxJS.
                // Gestion des erreurs via handleError, avec 'deletePaiement' comme contexte.
                catchError(err => this.handleError(err, 'deletePaiement'))
            );
    }

    // private handleError(...)
    // Méthode privée et générique pour la gestion centralisée des erreurs survenant lors des requêtes HTTP.
    // Elle est appelée par les opérateurs catchError dans chaque méthode du service.
    // error: HttpErrorResponse : L'objet d'erreur fourni par HttpClient, contenant des informations sur l'échec.
    // methodName: string : Le nom de la méthode du service où l'erreur a été interceptée (utile pour le logging).
    // Retourne un Observable qui émet une erreur (via throwError de RxJS). Cela permet au code
    // qui a souscrit à l'Observable original (par exemple, dans un composant) de gérer également l'erreur.
    private handleError(error: HttpErrorResponse, methodName: string = 'paiementOperation'): Observable<any> {
        if (error.error instanceof ErrorEvent) {
            // Il s'agit d'une erreur côté client ou d'une erreur réseau (par exemple, pas de connexion internet, DNS lookup failed).
            // error.error.message contiendra le message d'erreur.
            console.error(`Client-side/network error in ${methodName}:`, error.error.message);
            // Pour l'utilisateur, on retourne un message d'erreur générique et informatif.
            return throwError(() => new Error(`Network error during ${methodName} in Paiement API; please check connection.`));
        } else {
            // Le backend a retourné un code d'erreur (par exemple, 400, 401, 403, 404, 500).
            // error.status contient le code de statut HTTP.
            // error.error peut contenir le corps de la réponse d'erreur du backend, qui donne souvent plus de détails.
            console.error(
                `Backend error in ${methodName} (Paiement API): returned code ${error.status}, ` +
                `body was: ${JSON.stringify(error.error)}`);
            // On essaie de formuler un message d'erreur significatif pour l'utilisateur.
            // Si le backend fournit un message dans error.error.message, on l'utilise. Sinon, on utilise error.statusText.
            // En dernier recours, un message générique est utilisé.
            const errorMsg = error.error?.message || error.statusText || `Something bad happened with Paiement API during ${methodName}; please try again later.`;
            return throwError(() => new Error(errorMsg));
        }
        // Note : La gestion spécifique des erreurs 200 OK avec corps vide (comme dans ClientService)
        // n'est pas présente ici, ce qui est approprié si l'API de paiement ne retourne pas de telles réponses
        // ou si elles sont gérées différemment (par exemple, une suppression pourrait retourner 204 No Content,
        // ce qui n'est pas une erreur en soi mais pourrait être traité par `map` si une valeur spécifique est attendue).
    }
} 