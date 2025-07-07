// app.ts (ou app.component.ts si c'est le nom conventionnel du fichier pour le composant)
// Ce fichier définit notre composant racine, nommé AppComponent.
// C'est le composant principal qui sert de "conteneur" ou de "coquille"
// pour toute notre application Angular.

// On importe les décorateurs et modules nécessaires depuis les bibliothèques Angular.
import { Component } from '@angular/core'; // 'Component' est le décorateur essentiel pour définir un composant Angular.
import { CommonModule } from '@angular/common'; // 'CommonModule' fournit des directives de base d'Angular comme *ngIf, *ngFor, etc.
                                             // Utile si le template de AppComponent utilise de telles directives.
import { RouterOutlet } from '@angular/router'; // 'RouterOutlet' est une directive qui marque l'endroit dans le template
                                             // où Angular affichera les composants correspondant aux routes actives.

// Les lignes suivantes sont des exemples d'importations de composants (Header, Footer).
// Elles sont commentées car, dans notre cas, ces composants ne sont pas directement
// utilisés dans le template de AppComponent (app.html) pour le moment.
// Si on voulait un en-tête ou un pied de page global visible sur toutes les pages
// et géré par AppComponent, on les décommenterait et les ajouterait aux 'imports' ci-dessous.
// import { HeaderComponent } from './components/header/header.component';
// import { FooterComponent } from './components/footer/footer.component';

// Le décorateur '@Component' est utilisé pour transformer une simple classe TypeScript
// en un composant Angular. Il prend un objet de métadonnées qui décrit comment
// le composant doit être traité, instancié et utilisé.
@Component({
  // selector: 'app-root' : C'est le sélecteur CSS (comme un nom de balise HTML personnalisée)
  // que nous utiliserons pour insérer ce composant AppComponent dans notre fichier HTML principal
  // (généralement index.html). Par exemple : <app-root></app-root>.
  selector: 'app-root', // Sélecteur par défaut pour le composant racine.

  // standalone: true : Cette propriété indique que AppComponent est un composant autonome.
  // Les composants autonomes n'ont pas besoin d'être déclarés dans un NgModule.
  // Ils gèrent leurs propres dépendances via la propriété 'imports'. C'est une approche
  // encouragée dans les versions récentes d'Angular pour simplifier l'architecture.
  standalone: true,

  // imports: [...] : Pour un composant autonome, cet tableau liste les autres modules
  // ou composants autonomes dont CE composant (AppComponent) dépend directement pour son template.
  imports: [
    CommonModule,   // Nécessaire pour les directives comme *ngIf, *ngFor si utilisées dans app.html.
    RouterOutlet, // Essentiel pour que le routage fonctionne et affiche les composants de page.
    // HeaderComponent, // À décommenter et ajouter si <app-header> est utilisé dans app.html.
    // FooterComponent  // À décommenter et ajouter si <app-footer> est utilisé dans app.html.
  ],

  // templateUrl: './app.html' : Spécifie le chemin vers le fichier HTML (template)
  // qui définit la structure visuelle (la vue) de ce composant.
  templateUrl: './app.html', // Référence au template HTML de AppComponent.

  // styleUrls: ['./app.css'] : Spécifie un tableau de chemins vers les fichiers CSS
  // qui contiennent les styles s'appliquant spécifiquement à ce composant.
  // Les styles définis ici sont encapsulés et n'affectent pas les autres composants,
  // sauf si des techniques spécifiques (comme ::ng-deep) sont utilisées.
  styleUrls: ['./app.css']   // Référence au fichier CSS de AppComponent.
})
// La classe 'AppComponent' contient la logique (le code TypeScript) associée à notre composant racine.
export class AppComponent {
  // 'title' est une propriété de la classe AppComponent.
  // Par défaut, les projets Angular créent souvent cette propriété.
  // Elle pourrait être utilisée dans le template (app.html) via l'interpolation : {{ title }}.
  title = 'mon-projet'; // Propriété simple du composant.

  // Le constructeur est une méthode spéciale appelée lors de la création d'une instance de la classe.
  // On l'utilise souvent pour l'injection de dépendances (par exemple, injecter des services).
  constructor() {
    // Pour l'instant, notre constructeur ne fait rien de spécial, mais il pourrait
    // être utilisé pour des initialisations ou pour injecter des services globaux.
  }

  // ngOnInit est un "hook de cycle de vie" d'Angular.
  // C'est une méthode qu'Angular appelle automatiquement après avoir créé le composant,
  // initialisé ses propriétés liées aux données (celles marquées avec @Input par exemple),
  // et avant de l'afficher pour la première fois.
  // C'est un endroit courant pour effectuer des initialisations complexes,
  // comme récupérer des données depuis un service.
  // Exemple :
  // ngOnInit(): void {
  //   console.log('AppComponent a été initialisé et est prêt à être affiché !');
  // }
}
