// main.ts
// Ce fichier est le point d'entrée principal de notre application Angular.
// C'est ici que l'application commence son exécution. On peut le voir comme le "chef d'orchestre"
// qui lance la musique (notre application).

// On importe la fonction 'bootstrapApplication' depuis '@angular/platform-browser'.
// 'bootstrapApplication' est une fonction essentielle fournie par Angular pour démarrer
// une application Angular moderne et autonome (standalone). Elle prépare et lance le
// premier composant de notre application.
import { bootstrapApplication } from '@angular/platform-browser';

// On importe 'appConfig' depuis le fichier './app/app.config'.
// Ce fichier (app.config.ts) contient la configuration de notre application.
// Cela peut inclure la configuration des routes (pour la navigation entre les pages),
// des services (providers) globaux, et d'autres options de l'application.
import { appConfig } from './app/app.config';

// On importe notre composant racine, qui s'appelle 'AppComponent', depuis './app/app'.
// Conventionnellement, ce fichier pourrait être nommé 'app.component.ts'.
// 'AppComponent' est le composant principal de notre application. Il est le premier
// à être chargé et sert souvent de conteneur pour les autres composants et vues.
// Pensez-y comme la "coquille" principale de votre site web.
import { AppComponent } from './app/app'; // Note: Si le fichier est app.component.ts, l'import serait './app/app.component'

// Ici, on appelle la fonction 'bootstrapApplication'.
// C'est l'instruction magique qui dit à Angular : "Démarre l'application !"
// Elle prend deux arguments principaux :
// 1. AppComponent : Le composant racine à utiliser comme point de départ.
// 2. appConfig : L'objet de configuration que nous avons importé précédemment.
bootstrapApplication(AppComponent, appConfig)
  // La méthode '.catch()' est utilisée ici pour intercepter et gérer les erreurs
  // qui pourraient survenir pendant le processus de démarrage de l'application.
  // C'est une bonne pratique pour le débogage.
  .catch((err) => console.error(err)); // Si une erreur se produit, elle sera affichée dans la console du navigateur.
                                       // 'console.error(err)' est une façon standard d'afficher les erreurs en JavaScript.
