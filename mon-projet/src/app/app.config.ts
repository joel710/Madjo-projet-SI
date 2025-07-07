// app.config.ts
// Ce fichier contient la configuration principale pour notre application Angular.
// Dans les applications Angular modernes utilisant des composants "standalone" (autonomes),
// c'est ici que l'on configure les fonctionnalités globales de l'application.
// On peut le voir comme le "panneau de configuration central" de notre projet.

// On importe 'ApplicationConfig' depuis '@angular/core'.
// 'ApplicationConfig' est une interface (un type TypeScript) qui définit la structure
// attendue pour un objet de configuration d'application. Utiliser ce type nous aide
// à nous assurer que notre configuration est correcte et reconnue par Angular.
import { ApplicationConfig } from '@angular/core';

// On importe 'provideRouter' depuis '@angular/router'.
// 'provideRouter' est une fonction essentielle pour configurer le système de routage d'Angular.
// Le routage permet de définir comment naviguer entre différentes vues (composants) de notre
// application en fonction de l'URL affichée dans le navigateur.
import { provideRouter } from '@angular/router';

// On importe notre tableau de routes, nommé 'routes', depuis le fichier './app.routes'.
// Ce fichier (souvent app.routes.ts) contient un tableau d'objets où chaque objet définit
// une "route", c'est-à-dire une association entre une URL (par exemple, '/accueil')
// et le composant Angular qui doit être affiché pour cette URL (par exemple, HomeComponent).
import { routes } from './app.routes'; // Assurez-vous que ce chemin pointe vers votre fichier de routes

// On importe 'provideHttpClient' et 'withFetch' depuis '@angular/common/http'.
// 'provideHttpClient' est une fonction qui configure le service HttpClient d'Angular.
// HttpClient est utilisé pour effectuer des requêtes HTTP, c'est-à-dire pour communiquer
// avec des serveurs distants (par exemple, pour récupérer des données d'une API backend).
// 'withFetch' est une option que l'on peut passer à provideHttpClient. Elle indique à Angular
// d'utiliser l'API 'fetch' native du navigateur pour les requêtes HTTP, ce qui est une approche moderne.
import { provideHttpClient, withFetch } from '@angular/common/http'; // Importation pour le client HTTP

// 'appConfig' est une constante qui exporte notre configuration d'application.
// Elle est de type 'ApplicationConfig', ce qui garantit qu'elle a la bonne structure.
// C'est cet objet 'appConfig' qui sera utilisé dans 'main.ts' lors du démarrage de l'application.
export const appConfig: ApplicationConfig = {
  // La propriété 'providers' est un tableau où l'on déclare les services et les configurations
  // qui doivent être disponibles pour toute l'application (au niveau racine).
  providers: [
    // provideRouter(routes) : Ici, on active et configure le routage pour notre application
    // en lui passant notre tableau 'routes'. Sans cette ligne, la navigation entre les pages
    // via les URLs ne fonctionnerait pas.
    provideRouter(routes),

    // provideHttpClient(withFetch()) : Ici, on enregistre le service HttpClient et on lui dit
    // d'utiliser l'API 'fetch'. Cela nous permettra d'injecter HttpClient dans nos
    // composants ou services pour faire des appels réseau (GET, POST, etc.).
    provideHttpClient(withFetch()) // Activation du client HTTP avec l'option fetch

    // Si notre application avait besoin d'autres services globaux ou de configurations
    // spécifiques (comme la gestion de l'état, l'internationalisation, les animations),
    // on les ajouterait également ici dans le tableau 'providers'.
    // Par exemple, si on utilisait la "Client Hydration" pour améliorer le SEO avec Angular Universal,
    // on pourrait avoir ici `provideClientHydration()`.
  ]
};
