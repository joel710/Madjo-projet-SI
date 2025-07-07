// app.routes.ts
// Ce fichier est crucial pour la navigation dans notre application Angular.
// Il définit les "routes", c'est-à-dire les correspondances entre les URLs
// (ce que l'utilisateur voit dans la barre d'adresse de son navigateur)
// et les composants Angular qui doivent être affichés pour ces URLs.
// C'est un peu comme le plan d'un site web.

// On importe le type 'Routes' depuis '@angular/router'.
// 'Routes' est un type TypeScript qui représente un tableau d'objets de route.
// L'utilisation de ce type aide à s'assurer que la structure de nos routes est correcte
// et qu'elle sera bien comprise par Angular.
import { Routes } from '@angular/router';

// On importe les différents composants (qui agissent comme des "pages")
// que notre application va afficher en fonction de l'URL.
// Chaque composant importé ici sera associé à un chemin (path) spécifique.
import { HomePageComponent } from './pages/home/home'; // Le composant pour la page d'accueil.
import { LoginPageComponent } from './pages/login/login'; // Le composant pour la page de connexion.
import { RegisterPageComponent } from './pages/register/register'; // Le composant pour la page d'inscription.
import { AdminDashboardPageComponent } from './pages/admin-dashboard/admin-dashboard'; // Le composant pour le tableau de bord de l'administrateur.
import { ClientDashboardPageComponent } from './pages/client-dashboard/client-dashboard'; // Le composant pour le tableau de bord du client.
import { AgentDashboardPageComponent } from './pages/agent-dashboard-page'; // Le composant pour le tableau de bord de l'agent. (Chemin ajusté selon le fichier)

// 'routes' est une constante (un tableau) qui contient la définition de toutes les routes de l'application.
// Chaque élément du tableau est un objet qui configure une route.
export const routes: Routes = [
    // Route pour la page d'accueil.
    {
        // path: '' : Définit l'URL. Un chemin vide ('') correspond à la racine du site
        // (par exemple, http://localhost:4200/).
        path: '',
        // component: HomePageComponent : Si l'URL est la racine, Angular affichera le HomePageComponent.
        component: HomePageComponent,
        // pathMatch: 'full' : Cette option est importante pour la route racine.
        // Elle signifie que l'URL doit correspondre *exactement* au chemin vide.
        // Sans cela, cette route pourrait correspondre à d'autres URLs qui commencent par la racine,
        // ce qui pourrait entraîner des comportements inattendus.
        pathMatch: 'full'
    },
    // Route pour la page de connexion.
    {
        // path: 'login' : Correspond à une URL comme http://localhost:4200/login.
        path: 'login',
        // component: LoginPageComponent : Angular affichera LoginPageComponent pour cette URL.
        component: LoginPageComponent
    },
    // Route pour la page d'inscription.
    {
        // path: 'inscription' : Correspond à http://localhost:4200/inscription.
        path: 'inscription',
        // component: RegisterPageComponent : Angular affichera RegisterPageComponent.
        component: RegisterPageComponent
    },
    // Route de redirection pour la section administrateur.
    {
        // path: 'admin' : Si l'utilisateur navigue vers http://localhost:4200/admin.
        path: 'admin',
        // redirectTo: 'admin/dashboard' : L'utilisateur sera automatiquement redirigé
        // vers '/admin/dashboard'. C'est utile pour avoir une URL par défaut pour une section.
        redirectTo: 'admin/dashboard',
        // pathMatch: 'full' : La redirection ne s'applique que si l'URL est exactement '/admin'.
        pathMatch: 'full',
    },
    // Route pour les différentes sections du tableau de bord administrateur.
    {
        // path: 'admin/:section' : Ceci est une route avec un paramètre dynamique.
        // ':section' est un "paramètre de route". Angular remplacera ':section' par la valeur
        // présente dans l'URL (par exemple, '/admin/clients' ou '/admin/voyages').
        // La valeur de 'section' pourra être récupérée dans AdminDashboardPageComponent.
        path: 'admin/:section',
        // component: AdminDashboardPageComponent : Ce composant sera affiché et pourra utiliser
        // la valeur du paramètre 'section' pour afficher le contenu approprié.
        component: AdminDashboardPageComponent,
    },
    // Route pour le tableau de bord du client.
    {
        // path: 'client-dashboard' : Correspond à http://localhost:4200/client-dashboard.
        path: 'client-dashboard',
        // component: ClientDashboardPageComponent : Angular affichera ClientDashboardPageComponent.
        component: ClientDashboardPageComponent
    },
    // Route pour le tableau de bord de l'agent.
    {
        // path: 'agent/dashboard' : Correspond à http://localhost:4200/agent/dashboard.
        path: 'agent/dashboard', // Nouvelle route ajoutée.
        // component: AgentDashboardPageComponent : Angular affichera AgentDashboardPageComponent.
        component: AgentDashboardPageComponent
    },

    // Commentaire pour une future amélioration :
    // Il serait judicieux d'ajouter une route "wildcard" (ou joker) ici.
    // Une route wildcard intercepte toutes les URLs qui ne correspondent à aucune autre route définie.
    // Elle est typiquement utilisée pour afficher un composant "Page Non Trouvée" (erreur 404).
    // Exemple : { path: '**', component: PageNotFoundComponent },
    // Il faudrait alors créer un PageNotFoundComponent.
];
