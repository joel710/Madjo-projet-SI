import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms'; // Removed AbstractControl, ValidationErrors, ValidatorFn if matchPasswordValidator is not used here yet
import { RouterLink, Router } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { ClientService, Client } from '../../services/client.service';

// matchPasswordValidator removed for now, will be addressed in form validation step if needed as a directive

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './register.html', // Corrected filename
  styleUrls: ['./register.css']  // Corrected filename
})
export class RegisterPageComponent {
  registerForm = {
    prenomClient: '',
    nomClient: '',
    dateNaiss: '',
    sexeClient: '',
    mailClient: '',
    telClient: '',
    login: '',
    password: '',
    confirmPassword: '',
    terms: false,
    newsletter: true
  };
  showPassword = false;
  showConfirmPassword = false;
  currentYear = new Date().getFullYear();


  constructor(private clientService: ClientService, private router: Router) { }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onRegisterSubmit(form?: NgForm) {
    if (form && form.invalid) {
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      // Check for password mismatch manually if not using a directive yet
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        // Manually set an error on the form or specific control for mismatch
        // This is a simplified approach. A directive is better.
        console.error('Passwords do not match!');
        // Optionally, find the confirmPassword control and set an error
        const confirmPasswordControl = form.controls['confirmPassword'];
        if (confirmPasswordControl) {
          confirmPasswordControl.setErrors({ ...confirmPasswordControl.errors, passwordMismatch: true });
        }
      }
      // It's important to check form.invalid again if errors were added manually
      if (form.invalid) {
        console.log('Register form is invalid or passwords mismatch');
        return;
      }
    }

    // Handle registration logic here
    console.log('Register form submitted:', this.registerForm);

    const newClient: Client = {
      nomClient: this.registerForm.nomClient,
      prenomClient: this.registerForm.prenomClient,
      // Format date to yyyy-MM-dd as expected by backend
      dateNaiss: new Date(this.registerForm.dateNaiss).toISOString().split('T')[0],
      sexeClient: this.registerForm.sexeClient as 'Homme' | 'Femme' | 'Autre' | '',
      mailClient: this.registerForm.mailClient,
      telClient: this.registerForm.telClient,
      login: this.registerForm.login,
      password: this.registerForm.password
    };

    this.clientService.createClient(newClient).subscribe({
      next: (client) => {
        console.log('Registration successful:', client);
        alert('Inscription réussie !');
        this.router.navigate(['/login']); // Redirect to login page after successful registration
      },
      error: (error) => {
        console.error('Registration failed:', error);
        alert('Échec de l\'inscription. Veuillez réessayer.');
      }
    });
  }
}
