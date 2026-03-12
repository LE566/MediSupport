import { Component, signal, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonInput, IonButton, IonIcon,
  IonModal, ToastController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  mailOutline, lockClosedOutline, personOutline, medkitOutline, 
  idCardOutline, peopleOutline, chevronDownOutline, checkmarkCircle,
  medkit, pulse 
} from 'ionicons/icons';

// Tu servicio de autenticación
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: true,
  // 👇 Cero rastro de CommonModule, solo lo estrictamente necesario
  imports: [
    IonContent, IonInput, IonButton, IonIcon, 
    IonModal, FormsModule 
  ],
})
export class AuthPage {
  // Inyección de dependencias moderna (Angular 14+)
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);

  // Signals para el estado de la UI (Angular 17+)
  isLoginMode = signal<boolean>(true);
  userRole = signal<'patient' | 'doctor'>('patient');
  isRoleModalOpen = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  // Variables del formulario
  email = '';
  password = '';
  fullName = '';
  medicalLicense = '';

  constructor() {
    addIcons({ 
    medkitOutline, mailOutline, lockClosedOutline, personOutline, 
    idCardOutline, peopleOutline, chevronDownOutline, checkmarkCircle,
    medkit, pulse
  });
  }

  toggleAuthMode() {
    this.isLoginMode.update(mode => !mode);
    this.email = '';
    this.password = '';
    this.fullName = '';
    this.medicalLicense = '';
  }

  openRoleModal() {
    this.isRoleModalOpen.set(true);
  }

  selectRole(role: 'patient' | 'doctor') {
    this.userRole.set(role);
    this.isRoleModalOpen.set(false);
  }

  doLogin() {
    if (!this.email || !this.password) {
      this.showToast('Please enter your email and password.', 'warning');
      return;
    }

    this.isLoading.set(true);

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.isLoading.set(false);

        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.showToast(err.error?.error || 'Invalid credentials.', 'danger');
      }
    });
  }

  doRegister() {
    if (!this.email || !this.password || !this.fullName) {
      this.showToast('Please fill in all required fields.', 'warning');
      return;
    }

    if (this.userRole() === 'doctor' && !this.medicalLicense) {
      this.showToast('Medical license is required for doctors.', 'warning');
      return;
    }

    this.isLoading.set(true);

    const newUserData = {
      fullName: this.fullName,
      email: this.email,
      password: this.password,
      role: this.userRole(),
      medicalLicense: this.userRole() === 'doctor' ? this.medicalLicense : null 
    };

    this.authService.register(newUserData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.showToast('Account created successfully! Please login.', 'success');
        this.toggleAuthMode(); 
      },
      error: (err) => {
        this.isLoading.set(false);
        this.showToast(err.error?.error || 'Error creating account.', 'danger');
      }
    });
  }

  async showToast(message: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  @HostListener('window:focusout', ['$event'])
  onFocusOut(event: any) {
    setTimeout(() => {
      const activeElement = document.activeElement;
      const isInput = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.closest('ion-input'));
      
      if (!isInput) {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
        document.body.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => {
          window.scrollTo(0, 0);
          document.body.scrollIntoView({ block: 'start' });
        }, 300);
      }
    }, 150);
  }
}