import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router'; // Import ActivatedRoute
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { ClientService, LoginRequest, ClientDTO } from '../../services/client.service'; // Import ClientService and LoginRequest
import { AgentService, AgentLoginRequest, AgentDTO } from '../../services/agent.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './login.html', // Corrected filename
  styleUrls: ['./login.css']  // Corrected filename
})
export class LoginPageComponent implements OnInit {
  loginForm = {
    login: '',
    password: '',
    rememberMe: false
  };
  showPassword = false;
  currentYear = new Date().getFullYear();
  
  // Paramètres de redirection
  redirectParams: any = {};

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private clientService: ClientService, 
    private agentService: AgentService
  ) { }

  ngOnInit(): void {
    // Récupérer les paramètres de redirection depuis l'URL
    this.route.queryParams.subscribe(params => {
      this.redirectParams = {
        redirectTo: params['redirectTo'],
        departureCity: params['departureCity'],
        arrivalCity: params['arrivalCity'],
        travelDate: params['travelDate'],
        ticketType: params['ticketType'],
        numberOfSeats: params['numberOfSeats']
      };
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onLoginSubmit() {
    console.log('Login form submitted:', this.loginForm);
    // Cas admin
    if (this.loginForm.login === 'admin@example.com' && this.loginForm.password === 'adminpassword') {
      this.router.navigate(['/admin']);
      return;
    }
    // Tentative agent
    const agentLoginRequest: AgentLoginRequest = {
      login: this.loginForm.login,
      password: this.loginForm.password
    };
    this.agentService.loginAgent(agentLoginRequest).subscribe({
      next: (agent: AgentDTO) => {
        if (agent && agent.idAgent) {
          localStorage.setItem('loggedInAgentId', agent.idAgent.toString());
          this.handleSuccessfulLogin('agent');
        } else {
          this.tryClientLogin();
        }
      },
      error: (error) => {
        // Si erreur, on tente client
        this.tryClientLogin();
      }
    });
  }

  tryClientLogin() {
    const loginRequest: LoginRequest = {
      login: this.loginForm.login,
      password: this.loginForm.password
    };
    this.clientService.loginClient(loginRequest).subscribe({
      next: (client: ClientDTO) => {
        if (client && client.idClient) {
          localStorage.setItem('loggedInClientId', client.idClient.toString());
          this.handleSuccessfulLogin('client');
        } else {
          alert('Identifiants incorrects ou rôle indéterminé !');
        }
      },
      error: (error) => {
        alert('Identifiants incorrects !');
      }
    });
  }

  private handleSuccessfulLogin(userType: 'client' | 'agent'): void {
    // Vérifier s'il y a une redirection spécifique
    if (this.redirectParams.redirectTo === 'client-dashboard') {
      // Rediriger vers le dashboard client avec les paramètres de recherche
      this.router.navigate(['/client-dashboard'], { 
        queryParams: {
          departureCity: this.redirectParams.departureCity,
          arrivalCity: this.redirectParams.arrivalCity,
          travelDate: this.redirectParams.travelDate,
          ticketType: this.redirectParams.ticketType,
          numberOfSeats: this.redirectParams.numberOfSeats
        }
      });
    } else {
      // Redirection par défaut selon le type d'utilisateur
      if (userType === 'client') {
        this.router.navigate(['/client-dashboard']);
      } else {
        this.router.navigate(['/agent-dashboard']);
      }
    }
  }

  socialLogin(provider: string) {
    console.log('Social login with:', provider);
  }
}
